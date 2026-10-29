import os
import json
from typing import Dict, Any
from pathlib import Path

USAGE_FILE = Path(__file__).parent.parent.parent / "token_usage.json"

class TokenTracker:
    """Tracks token consumption and estimated credits against NVIDIA NIM allowance."""

    def __init__(self, total_credits: float = 1000.0, tokens_per_credit: int = 1000, persist: bool = False):
        self.total_credits = total_credits
        self.tokens_per_credit = tokens_per_credit
        self.total_budget_tokens = int(total_credits * tokens_per_credit)
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.total_tokens = 0
        self.total_requests = 0
        self.last_model = "meta/llama-3.2-11b-vision-instruct"
        self.persist = persist
        if self.persist:
            self._load()

    def _load(self):
        try:
            if USAGE_FILE.exists():
                with open(USAGE_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.prompt_tokens = data.get("prompt_tokens", 0)
                    self.completion_tokens = data.get("completion_tokens", 0)
                    self.total_tokens = data.get("total_tokens", self.prompt_tokens + self.completion_tokens)
                    self.total_requests = data.get("total_requests", 0)
                    self.last_model = data.get("last_model", self.last_model)
        except Exception:
            pass

    def _save(self):
        if not self.persist:
            return
        try:
            with open(USAGE_FILE, "w", encoding="utf-8") as f:
                json.dump({
                    "prompt_tokens": self.prompt_tokens,
                    "completion_tokens": self.completion_tokens,
                    "total_tokens": self.total_tokens,
                    "total_requests": self.total_requests,
                    "last_model": self.last_model
                }, f, indent=2)
        except Exception:
            pass

    def record_usage(self, prompt: int, completion: int, model: str = ""):
        self.prompt_tokens += max(0, prompt)
        self.completion_tokens += max(0, completion)
        self.total_tokens = self.prompt_tokens + self.completion_tokens
        self.total_requests += 1
        if model:
            self.last_model = model
        self._save()

    def get_stats(self) -> Dict[str, Any]:
        credits_used = self.total_tokens / self.tokens_per_credit
        credits_remaining = max(0.0, self.total_credits - credits_used)
        pct_used = min(100.0, (self.total_tokens / max(1, self.total_budget_tokens)) * 100.0)

        # Key preview from env or default
        key = os.getenv("NVIDIA_API_KEY", "")
        key_preview = f"{key[:8]}...{key[-4:]}" if len(key) > 12 else "Not configured"

        return {
            "key_configured": bool(key),
            "key_preview": key_preview,
            "provider": "NVIDIA NIM",
            "model": self.last_model,
            "total_budget_tokens": self.total_budget_tokens,
            "total_credits": self.total_credits,
            "credits_used": round(credits_used, 3),
            "credits_remaining": round(credits_remaining, 3),
            "total_tokens_used": self.total_tokens,
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_requests": self.total_requests,
            "percentage_used": round(pct_used, 2),
        }

    def reset(self):
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.total_tokens = 0
        self.total_requests = 0
        self._save()

tracker = TokenTracker(total_credits=1000.0, tokens_per_credit=1000, persist=True)

