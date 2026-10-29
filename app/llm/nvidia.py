import re
import asyncio
from typing import Any, Union, Dict, List, Optional
import httpx
from app.config import (
    PROVIDERS,
    detect_provider,
    NVIDIA_API_KEY,
    NVIDIA_API_URL,
    NVIDIA_MODELS_URL,
    DEFAULT_MODEL,
    SUPPORTED_MODELS,
    LLM_SEMAPHORE_LIMIT,
    LLM_TIMEOUT,
    LLM_MAX_TOKENS,
    LLM_TEMPERATURE,
)
from app.llm.jsonutil import extract_json
from app.llm.tracker import tracker

SEM = asyncio.Semaphore(LLM_SEMAPHORE_LIMIT)

NON_CHAT_KEYWORDS = (
    "safeguard", "guard", "whisper", "embedding", "embed", "moderation",
    "tts", "clip", "audio", "vision-only", "rerank", "distilbert", "reward", "bge"
)

def is_chat_model(model_name: str) -> bool:
    """Check if model is suitable for conversational reasoning/JSON extraction."""
    if not model_name:
        return False
    m = model_name.lower()
    return not any(kw in m for kw in NON_CHAT_KEYWORDS)

def parse_error_response(response: httpx.Response) -> str:
    """Extract a human-friendly error message from an LLM API error response."""
    status = response.status_code
    body = response.text
    detail_str = body

    try:
        err_json = response.json()
        if isinstance(err_json, dict):
            if "error" in err_json and isinstance(err_json["error"], dict):
                detail_str = err_json["error"].get("message") or str(err_json["error"])
            elif "detail" in err_json:
                detail_str = str(err_json["detail"])
            elif "message" in err_json:
                detail_str = str(err_json["message"])
    except Exception:
        pass

    # Check for NVIDIA "Function not found for account" 404 error
    if "not found for account" in detail_str.lower() or "function" in detail_str.lower():
        acc_match = re.search(r"account\s+'([^']+)'", detail_str, re.IGNORECASE)
        account_id = acc_match.group(1) if acc_match else "your account"
        return (
            f"NVIDIA API Error (404 Not Found for Account):\n"
            f"Account ID: {account_id}\n"
            f"Your account is not provisioned with 'Public API Endpoints' for cloud inference on build.nvidia.com.\n"
            f"Fix: Request enablement on NVIDIA Developer Forums with Account ID '{account_id}', "
            f"or switch provider to Google Gemini (free 1M TPM at aistudio.google.com) or Groq (console.groq.com)."
        )

    if status == 413 or "request too large" in detail_str.lower() or "tokens per minute" in detail_str.lower() or "tpm" in detail_str.lower():
        return (
            f"API Rate/Size Limit (413 or TPM Limit): {detail_str[:220]}. "
            f"Recommendation: Switch provider to Google Gemini (free 1M tokens/min at https://aistudio.google.com/app/apikey) "
            f"or use Llama 3.3 70B Versatile on Groq."
        )

    if status == 410:
        return (
            "NVIDIA API Error (410 Gone): Your NVIDIA organization/account lacks "
            "'Public API Endpoints' permission, trial credits have expired, or the "
            "model reached end-of-life. Please verify your account at https://build.nvidia.com."
        )
    elif status in (401, 403):
        return f"API Authentication Error ({status} Unauthorized/Forbidden): Invalid API key or forbidden for provider. ({detail_str[:200]})"
    elif status == 404:
        return f"API Error (404 Not Found): Endpoint or model not found. ({detail_str[:250]})"
    elif status == 429:
        return f"API Error (429 Rate Limit Exceeded): Backing off... ({detail_str[:200]})"

    return f"API Error ({status}): {detail_str[:300]}"

async def call_nvidia_llm(
    key: Optional[str] = None,
    system_prompt: str = "",
    user_prompt: str = "",
    model: Optional[str] = None,
    provider: Optional[str] = None,
    max_tokens: int = LLM_MAX_TOKENS,
    temperature: float = LLM_TEMPERATURE,
    max_retries: int = 2
) -> Union[Dict[str, Any], List[Any]]:
    """Execute chat completion against configured provider (Gemini, Groq, NVIDIA, OpenRouter, Ollama) with fallback and retries."""
    actual_key = (key or "").strip() or NVIDIA_API_KEY
    if not actual_key:
        raise ValueError("Missing API Key. Please configure NVIDIA_API_KEY on the server.")

    active_provider = detect_provider(key=actual_key, specified=provider)
    provider_config = PROVIDERS.get(active_provider, PROVIDERS["nvidia"])
    chat_url = provider_config["chat_url"]

    target_model = model or provider_config["default_model"]
    if not is_chat_model(target_model):
        target_model = provider_config["default_model"]

    models_to_try = [target_model]
    if active_provider == "nvidia" and "meta/llama-3.2-11b-vision-instruct" not in models_to_try:
        models_to_try.append("meta/llama-3.2-11b-vision-instruct")

    for m in provider_config.get("models", []):
        if is_chat_model(m) and m not in models_to_try:
            models_to_try.append(m)

    last_error: Optional[Exception] = None
    curr_user_prompt = user_prompt
    curr_max_tokens = max_tokens

    for active_model in models_to_try[:3]:
        for attempt in range(max_retries + 1):
            try:
                headers = {
                    "Authorization": f"Bearer {actual_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
                if active_provider == "openrouter":
                    headers["HTTP-Referer"] = "https://github.com/histograph"
                    headers["X-Title"] = "Histograph"

                async with SEM, httpx.AsyncClient(timeout=LLM_TIMEOUT) as client:
                    r = await client.post(
                        chat_url,
                        headers=headers,
                        json={
                            "model": active_model,
                            "temperature": temperature,
                            "max_tokens": curr_max_tokens,
                            "messages": [
                                {"role": "system", "content": system_prompt},
                                {"role": "user", "content": curr_user_prompt}
                            ]
                        }
                    )

                if r.status_code == 200:
                    r_data = r.json()
                    content = r_data["choices"][0]["message"]["content"]
                    usage = r_data.get("usage", {})
                    p_tok = usage.get("prompt_tokens") or max(1, len(curr_user_prompt) // 4)
                    c_tok = usage.get("completion_tokens") or max(1, len(content) // 4)
                    tracker.record_usage(p_tok, c_tok, active_model)
                    return extract_json(content)

                resp_lower = r.text.lower()
                is_size_or_tpm = (
                    r.status_code == 413 or
                    (r.status_code in (400, 429) and ("too large" in resp_lower or "tpm" in resp_lower or "tokens per minute" in resp_lower))
                )

                if is_size_or_tpm and attempt < max_retries:
                    # Dynamically budget prompt & tokens down to fit provider quota
                    cut_point = max(1000, len(curr_user_prompt) * 6 // 10)
                    curr_user_prompt = curr_user_prompt[:cut_point] + "\n...[truncated for token rate limits]"
                    curr_max_tokens = min(curr_max_tokens, 1200)
                    await asyncio.sleep(2.0 * (attempt + 1))
                    continue

                if r.status_code in (429, 502, 503, 504) and attempt < max_retries:
                    await asyncio.sleep(2.5 * (attempt + 1))
                    continue

                err_msg = parse_error_response(r)
                last_error = RuntimeError(f"[{active_provider}/{active_model}] {err_msg}")

                if r.status_code in (404, 410) and active_model != models_to_try[-1]:
                    break
                raise last_error

            except httpx.TimeoutException:
                last_error = TimeoutError(f"Request to {active_provider} timed out after {LLM_TIMEOUT}s on {active_model}.")
                if attempt < max_retries:
                    await asyncio.sleep(2.0)
                    continue
            except httpx.RequestError as exc:
                last_error = RuntimeError(f"Network error communicating with {active_provider}: {exc}")
                if attempt < max_retries:
                    await asyncio.sleep(1.5)
                    continue

    if last_error:
        raise last_error
    return {}

async def test_nvidia_key(
    key: str,
    model: Optional[str] = None,
    provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Validate that an API key is functioning across providers:
    1. Probes models endpoint.
    2. Tests inference completion.
    3. Detects NVIDIA account entitlement / Public Endpoints restrictions.
    4. Auto-identifies functional models.
    """
    clean_key = (key or "").strip() or NVIDIA_API_KEY
    if not clean_key:
        return {
            "valid": False,
            "status": "missing_key",
            "message": "NVIDIA API key not configured on server.",
            "models_available": []
        }
    active_provider = detect_provider(key=clean_key, specified=provider)
    p_info = PROVIDERS.get(active_provider, PROVIDERS["nvidia"])
    chat_url = p_info["chat_url"]
    models_url = p_info["models_url"]

    headers = {
        "Authorization": f"Bearer {clean_key}",
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    if active_provider == "openrouter":
        headers["HTTP-Referer"] = "https://github.com/histograph"
        headers["X-Title"] = "Histograph"

    # Step 1: Probe GET /models
    available_models: List[str] = []
    auth_ok = False
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            mr = await client.get(models_url, headers=headers)
            if mr.status_code == 200:
                auth_ok = True
                m_data = mr.json()
                raw_list = m_data.get("data", []) if isinstance(m_data, dict) else []
                # Strictly filter out safeguard, audio, embedding, and non-chat models
                available_models = [
                    m["id"] for m in raw_list
                    if isinstance(m, dict) and "id" in m and is_chat_model(m["id"])
                ]
            elif mr.status_code == 401 or (mr.status_code == 400 and "valid api key" in mr.text.lower()):
                return {
                    "valid": False,
                    "status": "unauthorized",
                    "status_code": mr.status_code,
                    "provider": active_provider,
                    "message": f"Invalid API key for {p_info['name']}. Please check your token at {p_info.get('help_url')}.",
                    "models_available": []
                }
    except Exception:
        pass

    # Build candidates prioritizing robust chat models
    target_model = model or p_info["default_model"]
    if not is_chat_model(target_model):
        target_model = p_info["default_model"]

    test_candidates = [target_model]
    for mc in (p_info.get("models", []) + available_models):
        if is_chat_model(mc) and mc not in test_candidates:
            test_candidates.append(mc)

    first_error_msg = ""
    had_404_account = False
    account_id = None
    had_410 = False
    had_413 = False

    async with httpx.AsyncClient(timeout=20.0) as client:
        for cand in test_candidates[:6]:
            try:
                r = await client.post(
                    chat_url,
                    headers=headers,
                    json={
                        "model": cand,
                        "temperature": 0.1,
                        "max_tokens": 25,
                        "messages": [
                            {"role": "system", "content": "Return JSON: {\"ping\": \"pong\"}"},
                            {"role": "user", "content": "ping"}
                        ]
                    }
                )
                if r.status_code == 200:
                    return {
                        "valid": True,
                        "status": "active",
                        "status_code": 200,
                        "provider": active_provider,
                        "model": cand,
                        "working_model": cand,
                        "message": f"Key is active! Inference succeeded with model '{cand}' on {p_info['name']}.",
                        "models_available": (available_models or p_info.get("models", []))[:15]
                    }
                
                resp_text = r.text
                if r.status_code in (401, 403) or "valid api key" in resp_text.lower() or "api_key_invalid" in resp_text.lower():
                    return {
                        "valid": False,
                        "status": "unauthorized",
                        "status_code": r.status_code,
                        "provider": active_provider,
                        "message": f"Invalid or forbidden API key for {p_info['name']}. Please verify your key at {p_info.get('help_url')}.",
                        "models_available": (available_models or p_info.get("models", []))[:15]
                    }

                if "not found for account" in resp_text.lower():
                    had_404_account = True
                    acc_match = re.search(r"account\s+'([^']+)'", resp_text, re.IGNORECASE)
                    if acc_match:
                        account_id = acc_match.group(1)
                    if not first_error_msg:
                        first_error_msg = resp_text
                elif r.status_code == 410:
                    had_410 = True
                    if not first_error_msg:
                        first_error_msg = resp_text
                elif r.status_code == 413 or "tokens per minute" in resp_text.lower() or "tpm" in resp_text.lower():
                    had_413 = True
                    if not first_error_msg:
                        first_error_msg = resp_text
                elif not first_error_msg:
                    first_error_msg = f"{r.status_code}: {resp_text[:200]}"
            except Exception as ex:
                if not first_error_msg:
                    first_error_msg = str(ex)

    if had_404_account:
        acc_str = f"'{account_id}'" if account_id else "your account"
        return {
            "valid": False,
            "status": "nvidia_unentitled",
            "status_code": 404,
            "provider": active_provider,
            "account_id": account_id,
            "auth_ok": auth_ok,
            "message": (
                f"NVIDIA Account Unentitled: Function not found for account {acc_str}.\n"
                f"Your API key authenticated successfully, but NVIDIA's backend blocks hosted inference "
                f"because your organization lacks 'Public API Endpoints' permission."
            ),
            "solutions": [
                "1. Switch Provider to Google Gemini: Get a free API key with 1M tokens/min at https://aistudio.google.com/app/apikey (instant access).",
                "2. Switch Provider to Groq: Get an instant 100% free key at https://console.groq.com/keys for ultra-fast Llama 3.3 70B.",
                f"3. Or request enablement on the NVIDIA Developer Forum for Account ID: {account_id or 'your account ID'}."
            ],
            "detail": first_error_msg,
            "models_available": (available_models or p_info.get("models", []))[:15]
        }

    if had_413:
        return {
            "valid": False,
            "status": "rate_limited_tpm",
            "status_code": 413,
            "provider": active_provider,
            "message": (
                f"API Rate Limit (TPM exceeded or model safeguard quota reached): {first_error_msg[:200]}.\n"
                f"Tip: Select 'llama-3.3-70b-versatile' or switch provider to Google Gemini (free 1M tokens/min)."
            ),
            "models_available": (available_models or p_info.get("models", []))[:15]
        }

    if had_410:
        return {
            "valid": False,
            "status": "410_gone",
            "status_code": 410,
            "provider": active_provider,
            "auth_ok": auth_ok,
            "message": (
                "NVIDIA API returned 410 Gone for inference. "
                "Your account/organization may lack the 'Public API Endpoints' permission, "
                "or trial credits may have expired. Please verify your organization at https://build.nvidia.com."
            ),
            "detail": first_error_msg,
            "models_available": (available_models or p_info.get("models", []))[:15]
        }

    return {
        "valid": False,
        "status": "failed",
        "provider": active_provider,
        "message": f"Inference test failed: {first_error_msg}",
        "models_available": (available_models or p_info.get("models", []))[:15]
    }
