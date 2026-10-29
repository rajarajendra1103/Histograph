import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "")

PROVIDERS: Dict[str, Dict[str, Any]] = {
    "gemini": {
        "name": "Google Gemini (Free & 1M TPM)",
        "chat_url": "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "models_url": "https://generativelanguage.googleapis.com/v1beta/openai/models",
        "default_model": "gemini-2.0-flash",
        "models": [
            "gemini-2.0-flash",
            "gemini-2.5-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        ],
        "key_prefix": "AIzaSy",
        "help_url": "https://aistudio.google.com/app/apikey"
    },
    "groq": {
        "name": "Groq (Free & Instant Llama 3.3 70B)",
        "chat_url": "https://api.groq.com/openai/v1/chat/completions",
        "models_url": "https://api.groq.com/openai/v1/models",
        "default_model": "llama-3.3-70b-versatile",
        "models": [
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "mixtral-8x7b-32768"
        ],
        "key_prefix": "gsk_",
        "help_url": "https://console.groq.com/keys"
    },
    "nvidia": {
        "name": "NVIDIA NIM",
        "chat_url": "https://integrate.api.nvidia.com/v1/chat/completions",
        "models_url": "https://integrate.api.nvidia.com/v1/models",
        "default_model": "meta/llama-3.2-11b-vision-instruct",
        "models": [
            "meta/llama-3.2-11b-vision-instruct",
            "meta/llama-3.2-90b-vision-instruct",
            "mistralai/mistral-7b-instruct-v0.3",
            "nvidia/llama-3.1-nemotron-70b-instruct",
            "mistralai/mistral-large-2-instruct",
            "nvidia/llama-3.1-nemotron-51b-instruct",
            "ai21labs/jamba-1.5-large-instruct",
        ],
        "key_prefix": "nvapi-",
        "help_url": "https://build.nvidia.com"
    },
    "openrouter": {
        "name": "OpenRouter (Free / Multi-Model)",
        "chat_url": "https://openrouter.ai/api/v1/chat/completions",
        "models_url": "https://openrouter.ai/api/v1/models",
        "default_model": "meta-llama/llama-3.3-70b-instruct:free",
        "models": [
            "meta-llama/llama-3.3-70b-instruct:free",
            "meta-llama/llama-3.3-70b-instruct",
            "deepseek/deepseek-r1:free",
            "google/gemini-2.0-flash-exp:free"
        ],
        "key_prefix": "sk-or-",
        "help_url": "https://openrouter.ai/keys"
    },
    "ollama": {
        "name": "Ollama (Local / Offline)",
        "chat_url": "http://localhost:11434/v1/chat/completions",
        "models_url": "http://localhost:11434/v1/models",
        "default_model": "llama3.3",
        "models": ["llama3.3", "llama3.1", "mistral", "qwen2.5"],
        "key_prefix": "ollama",
        "help_url": "https://ollama.ai"
    }
}

def detect_provider(key: Optional[str] = None, specified: Optional[str] = None) -> str:
    """Detect appropriate LLM provider from explicit selection or key prefix."""
    if specified and specified in PROVIDERS:
        return specified
    k = (key or "").strip()
    if k.startswith("AIza") or k.lower().startswith("aizasy"):
        return "gemini"
    if k.startswith("gsk_"):
        return "groq"
    if k.startswith("sk-or-"):
        return "openrouter"
    if k.startswith("nvapi-"):
        return "nvidia"
    if "ollama" in k.lower():
        return "ollama"
    return "nvidia"

SUPPORTED_MODELS: List[str] = PROVIDERS["nvidia"]["models"]
DEFAULT_MODEL: str = os.getenv("NVIDIA_MODEL", PROVIDERS["nvidia"]["default_model"])
NVIDIA_API_URL: str = PROVIDERS["nvidia"]["chat_url"]
NVIDIA_MODELS_URL: str = PROVIDERS["nvidia"]["models_url"]

OPENSERP_URL: str = (os.getenv("OPENSERP_URL") or os.getenv("SEARXNG_URL") or "").rstrip("/")
SEARXNG_URL: str = OPENSERP_URL
CORE_API_KEY: str = os.getenv("CORE_API_KEY", "")

USER_AGENT: Dict[str, str] = {
    "User-Agent": "Histograph/0.2 (Open-source historical research engine; https://github.com/histograph/histograph)"
}

# Concurrency & LLM Settings
LLM_SEMAPHORE_LIMIT: int = int(os.getenv("LLM_SEMAPHORE_LIMIT", "4"))
LLM_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "120.0"))
LLM_MAX_TOKENS: int = 3000
LLM_TEMPERATURE: float = 0.1

# Per-Source Timeouts (seconds)
SOURCE_TIMEOUTS: Dict[str, float] = {
    "wikipedia": 20.0,
    "openalex": 25.0,
    "crossref": 25.0,
    "semantic_scholar": 20.0,
    "core": 25.0,
    "internet_archive": 30.0,
    "loc": 25.0,
    "openserp": 20.0,
    "searxng": 20.0,
    "web_extract": 20.0,
    "web_render": 30.0,
    "rss": 15.0,
    "youtube": 20.0,
    "social": 15.0,
    "default": 20.0,
}

# Limits
MAX_SOURCES_PER_QUERY: int = 40
MAX_CLAIMS_EXTRACTED: int = 25
QUOTE_FUZZY_THRESHOLD: float = 0.85
QUOTE_MIN_LENGTH: int = 20
CACHE_TTL_SECONDS: int = 3600
