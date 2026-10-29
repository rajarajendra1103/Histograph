import json
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.agents.orchestrator import run_research_pipeline
from app.config import NVIDIA_API_KEY

router = APIRouter(prefix="/api", tags=["research"])

@router.post("/research")
async def start_research(req: Request):
    """Execute historical research pipeline and stream progress as NDJSON."""
    key = req.headers.get("x-nvidia-key", "").strip() or req.headers.get("x-api-key", "").strip() or NVIDIA_API_KEY
    model = req.headers.get("x-nvidia-model", "").strip() or None
    provider = req.headers.get("x-provider", "").strip() or "nvidia"
    body = await req.json()
    query = body.get("query", "").strip()

    async def event_generator():
        try:
            if not key:
                yield json.dumps({"type": "error", "msg": "NVIDIA API key not configured on server."}) + "\n"
                return
            if not query:
                yield json.dumps({"type": "error", "msg": "Please provide a valid research question."}) + "\n"
                return

            async for event in run_research_pipeline(key=key, query=query, model=model, provider=provider):
                yield json.dumps(event) + "\n"
        except Exception as ex:
            yield json.dumps({"type": "error", "msg": str(ex)}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")
