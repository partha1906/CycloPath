import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from ..core.config import settings
from ..schemas.schemas import MultimodalAnalysisResponse

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    async def analyze_infrastructure_image(
        self,
        image_base64: Optional[str] = None,
        asset_id: Optional[str] = None,
        context_notes: Optional[str] = None
    ) -> MultimodalAnalysisResponse:
        """Analyzes an uploaded infrastructure or satellite image for damage and flood indicators."""
        if self.api_key and image_base64:
            try:
                prompt = (
                    "You are a disaster infrastructure structural engineering AI assistant. "
                    "Analyze this image of coastal infrastructure facing cyclone/flood hazard. "
                    "Return ONLY valid JSON matching this schema: "
                    "{"
                    '  "structural_integrity_concern": "Critical" | "Elevated" | "Moderate" | "Low",'
                    '  "visible_flooding": string,'
                    '  "road_accessibility_status": string,'
                    '  "damage_indicators": [string],'
                    '  "inspection_priority": "Tier 1 (Immediate)" | "Tier 2 (Within 6h)" | "Tier 3 (Routine)",'
                    '  "reasoning": string,'
                    '  "confidence": float'
                    "}"
                )
                headers = {"Content-Type": "application/json"}
                body = {
                    "contents": [{
                        "parts": [
                            {"text": prompt + f" Context: {context_notes or 'Coastal facility'}"},
                            {"inline_data": {"mime_type": "image/jpeg", "data": image_base64}}
                        ]
                    }]
                }
                async with httpx.AsyncClient(timeout=15.0) as client:
                    resp = await client.post(f"{self.endpoint}?key={self.api_key}", json=body, headers=headers)
                    if resp.status_code == 200:
                        data = resp.json()
                        text = data["candidates"][0]["content"]["parts"][0]["text"]
                        # Extract JSON from response
                        clean_text = text.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        parsed = json.loads(clean_text.strip())
                        return MultimodalAnalysisResponse(
                            asset_id=asset_id,
                            structural_integrity_concern=parsed.get("structural_integrity_concern", "Elevated"),
                            visible_flooding=parsed.get("visible_flooding", "Moderate surface water pooling detected near foundations."),
                            road_accessibility_status=parsed.get("road_accessibility_status", "Single lane access compromised by debris."),
                            damage_indicators=parsed.get("damage_indicators", ["Roof sheeting displacement", "Perimeter boundary wall scour"]),
                            inspection_priority=parsed.get("inspection_priority", "Tier 1 (Immediate)"),
                            reasoning=parsed.get("reasoning", "Live Gemini Multimodal assessment complete."),
                            confidence=float(parsed.get("confidence", 0.88))
                        )
            except Exception as e:
                logger.warning(f"Gemini API request failed ({e}); falling back to local disaster inspection engine.")

        # Robust, high-fidelity domain fallback
        return self._fallback_image_analysis(asset_id, context_notes)

    def analyze_infrastructure_image_sync(
        self,
        image_base64: Optional[str] = None,
        asset_id: Optional[str] = None,
        context_notes: Optional[str] = None
    ) -> MultimodalAnalysisResponse:
        """Synchronous version for thread-based servers (avoids Windows asyncio issues)."""
        if self.api_key and image_base64:
            try:
                import requests
                prompt = (
                    "You are a disaster infrastructure structural engineering AI assistant. "
                    "Analyze this image of coastal infrastructure facing cyclone/flood hazard. "
                    "Return ONLY valid JSON matching this schema: "
                    "{"
                    '  "structural_integrity_concern": "Critical" | "Elevated" | "Moderate" | "Low",'
                    '  "visible_flooding": string,'
                    '  "road_accessibility_status": string,'
                    '  "damage_indicators": [string],'
                    '  "inspection_priority": "Tier 1 (Immediate)" | "Tier 2 (Within 6h)" | "Tier 3 (Routine)",'
                    '  "reasoning": string,'
                    '  "confidence": float'
                    "}"
                )
                headers = {"Content-Type": "application/json"}
                body = {
                    "contents": [{
                        "parts": [
                            {"text": prompt + f" Context: {context_notes or 'Coastal facility'}"},
                            {"inline_data": {"mime_type": "image/jpeg", "data": image_base64}}
                        ]
                    }]
                }
                resp = requests.post(f"{self.endpoint}?key={self.api_key}", json=body, headers=headers, timeout=15.0)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    clean_text = text.strip()
                    if clean_text.startswith("```json"):
                        clean_text = clean_text[7:]
                    if clean_text.endswith("```"):
                        clean_text = clean_text[:-3]
                    parsed = json.loads(clean_text.strip())
                    return MultimodalAnalysisResponse(
                        asset_id=asset_id,
                        structural_integrity_concern=parsed.get("structural_integrity_concern", "Elevated"),
                        visible_flooding=parsed.get("visible_flooding", "Moderate surface water pooling detected near foundations."),
                        road_accessibility_status=parsed.get("road_accessibility_status", "Single lane access compromised by debris."),
                        damage_indicators=parsed.get("damage_indicators", ["Roof sheeting displacement", "Perimeter boundary wall scour"]),
                        inspection_priority=parsed.get("inspection_priority", "Tier 1 (Immediate)"),
                        reasoning=parsed.get("reasoning", "Live Gemini Multimodal assessment complete."),
                        confidence=float(parsed.get("confidence", 0.88))
                    )
            except Exception as e:
                logger.warning(f"Gemini API request failed ({e}); falling back to local disaster inspection engine.")

        return self._fallback_image_analysis(asset_id, context_notes)

    def _fallback_image_analysis(self, asset_id: Optional[str], context_notes: Optional[str]) -> MultimodalAnalysisResponse:
        """Returns an explicit unavailable result; never invents visual evidence."""
        return MultimodalAnalysisResponse(
            asset_id=asset_id,
            structural_integrity_concern="Not assessed",
            visible_flooding="Not assessed: no image-based observation is available.",
            road_accessibility_status="Not assessed: no image-based observation is available.",
            damage_indicators=[],
            inspection_priority="Unassigned",
            reasoning=(
                "No image assessment was performed. Configure Gemini access and submit an image, "
                "then verify any findings with an on-site qualified inspector."
            ),
            confidence=0.0,
            disclaimer=(
                "Analysis unavailable or demo fallback. This response contains no image-derived findings "
                "and must not be used for operational decisions."
            )
        )

    def generate_multilingual_citizen_alert(
        self,
        district: str,
        risk_level: str,
        cyclone_name: str,
        language: str = "en"
    ) -> str:
        """Generates citizen-friendly emergency advisories in English, Hindi, and Marathi."""
        if language == "hi":
            return (
                f"⚠️ चक्रवात चेतावनी - {district}: {cyclone_name} के कारण आपके क्षेत्र में तेज़ हवाएं और भारी वर्षा की संभावना है। "
                f"तटीय और निचले इलाकों के निवासी कृपया सतर्क रहें। नजदीकी पक्के चक्रवात आश्रय (Shelter) की पहचान कर लें "
                f"और केवल आधिकारिक प्रशासनिक निर्देशों का पालन करें। किसी भी आपात स्थिति में 1077 पर संपर्क करें।"
            )
        elif language == "mr":
            return (
                f"⚠️ चक्रीवादळ सतर्कता इशारा - {district}: {cyclone_name} मुळे आपल्या भागात अतिमुसळधार पाऊस व वादळी वारे वाहण्याची शक्यता आहे. "
                f"सखल भागातील नागरिकांनी सुरक्षित ठिकाणी स्थलांतरित व्हावे. जवळच्या चक्रीवादळ निवारा केंद्राची माहिती ठेवा "
                f"आणि स्थानिक प्रशासनाच्या सूचनांचे पालन करा. आपत्कालीन मदतीसाठी नियंत्रण कक्षाशी संपर्क साधा."
            )
        else:
            return (
                f"⚠️ PUBLIC SAFETY ADVISORY - {district}: High winds and severe localized precipitation expected due to {cyclone_name}. "
                f"Residents in low-lying and coastal vulnerable zones should identify their nearest designated cyclone shelter, "
                f"charge emergency battery lamps, and follow official state disaster management bulletins. "
                f"Helpline: 1077 / 112."
            )

gemini_service = GeminiService()
