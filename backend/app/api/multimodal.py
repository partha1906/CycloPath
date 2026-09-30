from fastapi import APIRouter
from ..schemas.schemas import MultimodalAnalysisRequest, MultimodalAnalysisResponse
from ..services.gemini_service import gemini_service

router = APIRouter(prefix="/multimodal", tags=["Multimodal AI"])

@router.post("/analyze", response_model=MultimodalAnalysisResponse)
async def analyze_image(req: MultimodalAnalysisRequest):
    """Analyzes an uploaded infrastructure photograph or satellite frame using Gemini multimodal vision."""
    result = await gemini_service.analyze_infrastructure_image(
        image_base64=req.image_base64,
        asset_id=req.asset_id,
        context_notes=req.context_notes
    )
    return result
