from fastapi import APIRouter, Request, Response
from app.reports.pdf import generate_pdf_report

router = APIRouter(prefix="/api", tags=["export"])

@router.post("/pdf")
async def export_pdf(req: Request):
    """Generate and download ReportLab PDF document."""
    data = await req.json()
    pdf_bytes = generate_pdf_report(data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=histograph.pdf"}
    )
