"""Histograph - Entrypoint for uvicorn app:app or python app.py.
Refactored into modular package structure under app/.
"""
import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
