from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.config import PROVIDERS, DEFAULT_MODEL, NVIDIA_API_KEY
from app.llm.nvidia import test_nvidia_key
from app.llm.tracker import tracker

router = APIRouter(prefix="/api", tags=["models"])

class TestKeyRequest(BaseModel):
    key: Optional[str] = None
    model: Optional[str] = None
    provider: Optional[str] = None

@router.get("/models")
async def get_models(provider: Optional[str] = None):
    """Return available providers and models."""
    p_key = provider if provider in PROVIDERS else "nvidia"
    p_info = PROVIDERS[p_key]
    return {
        "provider": p_key,
        "default": p_info["default_model"],
        "models": p_info["models"],
        "providers": {k: {"name": v["name"], "default_model": v["default_model"], "models": v["models"], "help_url": v.get("help_url")} for k, v in PROVIDERS.items()}
    }

@router.get("/tokens")
async def get_tokens():
    """Return current token consumption and remaining credits dashboard stats."""
    return tracker.get_stats()

@router.post("/tokens/reset")
async def reset_tokens():
    """Reset token usage counters."""
    tracker.reset()
    return {"status": "ok", "stats": tracker.get_stats()}

@router.post("/test-key")
async def check_key(req: TestKeyRequest):
    """Test validity and inference capability of configured NVIDIA API key."""
    key_to_test = req.key or NVIDIA_API_KEY
    result = await test_nvidia_key(key_to_test, req.model, req.provider or "nvidia")
    return result
