import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.api.research import router as research_router
from app.api.models import router as models_router
from app.api.export import router as export_router

app = FastAPI(
    title="Histograph",
    description="Agentic Graph-RAG historical research engine with in-memory NetworkX graph and Laya verification.",
    version="0.2.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(research_router)
app.include_router(models_router)
app.include_router(export_router)

# Static files
STATIC_DIR = Path(__file__).parent / "static"
DIST_DIR = STATIC_DIR / "dist"
if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")
if (DIST_DIR / "images").exists():
    app.mount("/images", StaticFiles(directory=str(DIST_DIR / "images")), name="images")
if (DIST_DIR / "logos").exists():
    app.mount("/logos", StaticFiles(directory=str(DIST_DIR / "logos")), name="logos")
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/", include_in_schema=False)
async def serve_index():
    if (DIST_DIR / "index.html").exists():
        return FileResponse(str(DIST_DIR / "index.html"))
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Histograph backend active. static/index.html not found."}

@app.get("/favicon.ico", include_in_schema=False)
@app.get("/favicon.png", include_in_schema=False)
@app.get("/favicon.svg", include_in_schema=False)
async def serve_favicon():
    for f in ["favicon.png", "logo.jpg", "favicon.svg", "favicon.ico"]:
        fav = DIST_DIR / f
        if fav.exists():
            return FileResponse(str(fav))
    return {"message": "favicon not found"}

@app.get("/logo.jpg", include_in_schema=False)
async def serve_logo():
    logo = DIST_DIR / "logo.jpg"
    if logo.exists():
        return FileResponse(str(logo))
    return {"message": "logo not found"}
