import sys
import asyncio
import os
import json
import urllib.parse
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional
import datetime

# Add current dir to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.config import settings, RiskWeights
from app.services.cyclone_service import cyclone_service
from app.services.risk_engine import risk_engine
from app.services.ml_service import ml_service
from app.services.routing_service import routing_service
from app.services.gemini_service import gemini_service
from app.services.agent_service import agent_service
from app.services.alert_service import alert_service
from app.services.report_service import report_service
from app.api.infrastructure import get_all_assets_evaluated
from app.api.simulation import run_scenario_simulation, SIMULATION_HISTORY
from app.schemas.schemas import SimulationRequest, AgentQueryRequest, MultimodalAnalysisRequest, RouteRequest, RiskWeightsSchema
from app.data.seed_data import DATA_SOURCES_SEED
from app.core.security import authenticate_user, issue_token_for_user, verify_token, DEMO_USERS, ROLE_ALIASES

class CyclopathAPIHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def send_json(self, data: Any, status: int = 200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_cors_headers()
        self.end_headers()
        
        # Custom serializer for dates/objects
        def default_serializer(o):
            if isinstance(o, (datetime.datetime, datetime.date)):
                return o.isoformat()
            if hasattr(o, "model_dump"):
                return o.model_dump()
            return str(o)
            
        body = json.dumps(data, default=default_serializer).encode("utf-8")
        self.wfile.write(body)

    def get_authenticated_user(self) -> Optional[Dict[str, Any]]:
        auth_header = self.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        token = auth_header.split("Bearer ", 1)[1].strip()
        try:
            return verify_token(token)
        except Exception:
            return None

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        query = urllib.parse.parse_qs(parsed.query)

        # Root
        if path == "" or path == "/":
            self.send_json({
                "platform": "Cyclopath AI",
                "tagline": "Predict the impact. Protect the infrastructure. Save communities.",
                "version": "1.0.0",
                "status": "Operational",
                "mode": "Demo Simulation (Severe Cyclone SAMUDRA — Coastal Odisha Swath)",
                "disclaimer": "AI-generated risk estimates are decision-support outputs and should be validated against official IMD and SDMA information before operational use."
            })
            return

        # Cyclones
        if path == "/api/cyclones":
            samudra = cyclone_service.get_default_cyclone_samudra()
            self.send_json([samudra])
            return

        if path.startswith("/api/cyclones/"):
            samudra = cyclone_service.get_default_cyclone_samudra()
            self.send_json(samudra)
            return

        # Infrastructure
        if path == "/api/infrastructure":
            assets = get_all_assets_evaluated()
            asset_type = query.get("asset_type", [None])[0]
            district = query.get("district", [None])[0]
            risk_cat = query.get("risk_category", [None])[0]
            search = query.get("search", [None])[0]
            
            if asset_type:
                assets = [a for a in assets if a["asset_type"].lower() == asset_type.lower()]
            if district:
                assets = [a for a in assets if district.lower() in a["district"].lower()]
            if risk_cat:
                assets = [a for a in assets if a["risk_assessment"]["risk_category"].lower() == risk_cat.lower()]
            if search:
                s = search.lower()
                assets = [a for a in assets if s in a["name"].lower() or s in a["asset_id"].lower() or s in a["district"].lower()]
            self.send_json(assets)
            return

        if path.startswith("/api/infrastructure/"):
            asset_id = path.split("/")[-1]
            assets = get_all_assets_evaluated()
            for a in assets:
                if str(a["id"]) == asset_id or a["asset_id"].lower() == asset_id.lower():
                    self.send_json(a)
                    return
            self.send_json({"error": "Asset not found"}, status=404)
            return

        # Risk Engine
        if path == "/api/risk/summary":
            assets = get_all_assets_evaluated()
            total = len(assets)
            crit = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Critical")
            high = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "High")
            mod = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Moderate")
            low = sum(1 for a in assets if a["risk_assessment"]["risk_category"] == "Low")
            
            hosp_risk = sum(1 for a in assets if a["asset_type"] == "hospital" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
            pwr_risk = sum(1 for a in assets if a["asset_type"] == "power_station" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
            brg_risk = sum(1 for a in assets if a["asset_type"] == "bridge" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
            rod_risk = sum(1 for a in assets if a["asset_type"] == "road" and a["risk_assessment"]["risk_category"] in ("Critical", "High"))
            shelters = sum(1 for a in assets if a["asset_type"] == "school_shelter")
            
            district_map = {}
            for a in assets:
                d = a["district"]
                if d not in district_map:
                    district_map[d] = {"district": d, "state": a["state"], "total": 0, "critical": 0, "high": 0, "scores": []}
                district_map[d]["total"] += 1
                score = a["risk_assessment"]["overall_vulnerability_score"]
                district_map[d]["scores"].append(score)
                if a["risk_assessment"]["risk_category"] == "Critical":
                    district_map[d]["critical"] += 1
                elif a["risk_assessment"]["risk_category"] == "High":
                    district_map[d]["high"] += 1

            district_breakdown = []
            for d, info in district_map.items():
                avg = round(sum(info["scores"]) / len(info["scores"]), 1) if info["scores"] else 0
                district_breakdown.append({
                    "district": d,
                    "state": info["state"],
                    "total_assets": info["total"],
                    "critical_assets": info["critical"],
                    "high_risk_assets": info["high"],
                    "avg_vulnerability_score": avg
                })
            district_breakdown.sort(key=lambda x: x["avg_vulnerability_score"], reverse=True)

            self.send_json({
                "total_monitored": total,
                "critical_assets": crit,
                "high_risk_assets": high,
                "moderate_risk_assets": mod,
                "low_risk_assets": low,
                "hospitals_at_risk": hosp_risk,
                "power_stations_at_risk": pwr_risk,
                "bridges_at_risk": brg_risk,
                "roads_at_risk": rod_risk,
                "shelters_active": shelters,
                "estimated_affected_population": 485000,
                "evacuation_priority_zones": ["Puri Coastal Block", "Paradip Industrial Rim", "Astaranga Delta", "Erasama Sector"],
                "category_distribution": [
                    {"name": "Critical (>80)", "count": crit, "fill": "#ef4444"},
                    {"name": "High (61-80)", "count": high, "fill": "#f97316"},
                    {"name": "Moderate (31-60)", "count": mod, "fill": "#eab308"},
                    {"name": "Low (0-30)", "count": low, "fill": "#22c55e"}
                ],
                "district_breakdown": district_breakdown
            })
            return

        if path == "/api/risk/weights":
            self.send_json(risk_engine.weights.model_dump())
            return

        if path == "/api/risk/heatmap":
            assets = get_all_assets_evaluated()
            pts = [[a["latitude"], a["longitude"], round(a["risk_assessment"]["overall_vulnerability_score"] / 100.0, 2)] for a in assets]
            self.send_json({"points": pts})
            return

        # Simulation history
        if path == "/api/simulation/history":
            self.send_json(SIMULATION_HISTORY)
            return

        # Alerts
        if path == "/api/alerts":
            sev = query.get("severity", [None])[0]
            dist = query.get("district", [None])[0]
            alerts = alert_service.get_all_alerts(severity=sev, district=dist)
            self.send_json(alerts)
            return

        # Reports
        if path == "/api/reports/latest":
            assets = get_all_assets_evaluated()
            cyclone = cyclone_service.get_default_cyclone_samudra()
            crit_assets = [a for a in assets if a["risk_assessment"]["risk_category"] == "Critical"]
            high_assets = [a for a in assets if a["risk_assessment"]["risk_category"] == "High"]
            crit_assets.sort(key=lambda x: x["risk_assessment"]["overall_vulnerability_score"], reverse=True)
            report = report_service.generate_assessment_report(
                cyclone=cyclone,
                assets=assets,
                critical_count=len(crit_assets),
                high_risk_count=len(high_assets),
                total_assets=len(assets),
                top_priorities=crit_assets
            )
            self.send_json(report)
            return

        # Observability Health
        if path == "/api/health":
            self.send_json({
                "status": "OPERATIONAL",
                "backend": "ONLINE (Cyclopath High-Throughput HTTP Engine)",
                "database": "ONLINE (SQLite / Cloud SQL Ready)",
                "ai_engine": "ONLINE (Gemini 1.5 Flash + Multimodal Fallback)",
                "map_engine": "ONLINE (Leaflet / CartoDB Dark Matter / GIS Layers)",
                "ml_service": "ONLINE (Random Forest Surrogate Ensemble 25 Trees)",
                "data_pipeline": "ONLINE (IMD + ISRO Bhuvan + OSM Feeds)",
                "active_scenario": "Severe Cyclone SAMUDRA (Coastal Odisha Swath)",
                "uptime_seconds": 120.0,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
            return

        # Data Sources
        if path == "/api/data-sources":
            results = [dict(d, id=idx) for idx, d in enumerate(DATA_SOURCES_SEED, 1)]
            self.send_json(results)
            return

        # Auth profile check
        if path == "/api/auth/me":
            user = self.get_authenticated_user()
            if not user:
                self.send_json({"error": "Unauthorized: Missing or invalid Bearer token. Send 'Authorization: Bearer <token>'."}, status=401)
                return
            self.send_json({"status": "authenticated", "verified_claims": user})
            return

        # Not found fallback
        self.send_json({"error": "Endpoint not found", "path": path}, status=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path.rstrip("/")
        
        # Read body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            payload = json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            payload = {}

        # Authentication: Login
        if path == "/api/auth/login":
            username = payload.get("username", "")
            password = payload.get("password", "")
            user = authenticate_user(username, password)
            if not user:
                self.send_json({"error": "Invalid username or password"}, status=401)
                return
            token = issue_token_for_user(user)
            self.send_json({
                "access_token": token,
                "token_type": "bearer",
                "username": user["username"],
                "role": user["role"],
                "title": user.get("title", ""),
                "agency": user.get("agency", "")
            })
            return

        # Authentication: Demo Token Issuance
        if path == "/api/auth/demo-token":
            if not settings.DEMO_MODE or not settings.ENABLE_DEMO_AUTH:
                self.send_json({"error": "Demo persona authentication is disabled"}, status=404)
                return
            role_req = payload.get("role", "Disaster_Authority")
            target_role = ROLE_ALIASES.get(role_req, role_req)
            matched = None
            for u in DEMO_USERS.values():
                if u["role"].lower() == target_role.lower():
                    matched = u
                    break
            if not matched:
                matched = DEMO_USERS["citizen"]
            token = issue_token_for_user(matched)
            self.send_json({
                "access_token": token,
                "token_type": "bearer",
                "username": matched["username"],
                "role": matched["role"],
                "title": matched.get("title", ""),
                "agency": matched.get("agency", "")
            })
            return

        # Cryptographically verified user extraction
        verified_user = self.get_authenticated_user()

        # Weights update (Cryptographically verified Admin/Authority only)
        if path == "/api/risk/weights":
            if not verified_user:
                self.send_json({
                    "error": "Unauthorized: Server-verified cryptographic authentication required to modify mathematical risk weights. Provide a valid 'Authorization: Bearer <token>' header."
                }, status=401)
                return
            role = verified_user.get("role", "")
            if role not in ("Disaster Management Authority", "Municipal Officer"):
                self.send_json({
                    "error": f"Forbidden: Administrative clearance required. Verified identity '{verified_user.get('sub')}' with role '{role}' is not authorized to reconfigure risk engine weights.",
                    "verified_user": verified_user.get("sub")
                }, status=403)
                return
            weights = RiskWeights(**payload)
            risk_engine.set_weights(weights)
            self.send_json(risk_engine.weights.model_dump())
            return

        # Simulation run
        if path == "/api/simulation":
            req = SimulationRequest(**payload)
            result = run_scenario_simulation(req)
            self.send_json(result.model_dump())
            return

        # Agent Query & Response Plan
        if path == "/api/agent/query":
            req = AgentQueryRequest(**payload)
            assets = get_all_assets_evaluated()
            cyclone = cyclone_service.get_default_cyclone_samudra()
            plan = agent_service.analyze_and_plan(
                query=req.query,
                district=req.district,
                asset_id=req.asset_id,
                language=req.language,
                context={"assets": assets, "cyclone": cyclone}
            )
            self.send_json(plan.model_dump())
            return

        # Multimodal Image Inspection
        if path == "/api/multimodal/analyze":
            req = MultimodalAnalysisRequest(**payload)
            result = gemini_service.analyze_infrastructure_image_sync(
                image_base64=req.image_base64,
                asset_id=req.asset_id,
                context_notes=req.context_notes
            )
            self.send_json(result.model_dump())
            return

        # Route Optimization
        if path == "/api/routes/optimize":
            req = RouteRequest(**payload)
            resp = routing_service.calculate_optimal_route(
                start_lat=req.start_lat,
                start_lng=req.start_lng,
                end_lat=req.end_lat,
                end_lng=req.end_lng,
                avoid_high_flood=req.avoid_high_flood,
                vehicle_type=req.vehicle_type
            )
            self.send_json(resp.model_dump())
            return

        # Alert acknowledge (Cryptographically verified Command personnel only)
        if path.startswith("/api/alerts/") and path.endswith("/ack"):
            if not verified_user:
                self.send_json({
                    "error": "Unauthorized: Valid Bearer token required to acknowledge disaster alerts. Pass 'Authorization: Bearer <token>'."
                }, status=401)
                return
            role = verified_user.get("role", "")
            if role not in ("Disaster Management Authority", "Municipal Officer", "Emergency Responder"):
                self.send_json({
                    "error": f"Forbidden: Operational clearance required. Public citizen role cannot acknowledge disaster alerts.",
                    "verified_user": verified_user.get("sub")
                }, status=403)
                return
            alert_id = int(path.split("/")[-2])
            alert_service.acknowledge_alert(alert_id)
            self.send_json({
                "status": "acknowledged", 
                "alert_id": alert_id,
                "acknowledged_by": verified_user.get("sub"),
                "role": role
            })
            return

        self.send_json({"error": "Endpoint not found", "path": path}, status=404)

def run_server(port: int = 8000):
    server = ThreadingHTTPServer((os.getenv("HOST", "0.0.0.0"), port), CyclopathAPIHandler)
    print(f"Cyclopath AI Native Multi-Threaded HTTP Server listening on http://127.0.0.1:{port}", flush=True)
    server.serve_forever()

if __name__ == "__main__":
    run_server(8000)
