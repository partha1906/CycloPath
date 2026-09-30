from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

DEFAULT_ALERTS = [
    {
        "id": 1,
        "title": "CRITICAL: Coastal Surge Inundation Breach",
        "severity": "CRITICAL",
        "category": "SURGE",
        "district": "Puri",
        "asset_name": "Puri District Headquarters Hospital",
        "message": "Storm surge tide gauge projection exceeds 4.2m. Ground-level ambulance triage bay and backup generator diesel pumps at risk of salt water flooding within 4 hours.",
        "recommended_action": "Relocate mobile medical triage to 1st floor; seal fuel sumps; notify Emergency Medical Officer.",
        "timestamp": datetime.utcnow() - timedelta(minutes=8),
        "acknowledged": False
    },
    {
        "id": 2,
        "title": "HIGH ALERT: 132kV Substation Transformer Isolation",
        "severity": "CRITICAL",
        "category": "POWER",
        "district": "Jagatsinghpur",
        "asset_name": "Paradip Port Grid Substation 132/33kV",
        "message": "High saline aerosol deposition combined with 150 km/h wind gusts creating severe insulator arcing risk. Automated trip imminent.",
        "recommended_action": "Switch critical port logistics and hospital circuits to dedicated auxiliary diesel ring; sandbag substation control room.",
        "timestamp": datetime.utcnow() - timedelta(minutes=24),
        "acknowledged": False
    },
    {
        "id": 3,
        "title": "WARNING: Arterial Road Inundation & Culvert Scour",
        "severity": "WARNING",
        "category": "ROAD_CUT",
        "district": "Puri",
        "asset_name": "Konark-Puri Marine Drive Road (OD-SH-11)",
        "message": "High tide backwater overtopping coastal culverts at Km 18. Heavy commercial vehicles and ambulances advised to reroute.",
        "recommended_action": "Enforce traffic diversion via inland Pipli NH-316 highway; stage JCB clearance machinery at junction.",
        "timestamp": datetime.utcnow() - timedelta(minutes=45),
        "acknowledged": False
    },
    {
        "id": 4,
        "title": "SHELTER CAPACITY WARNING: Influx Surge",
        "severity": "WARNING",
        "category": "SHELTER",
        "district": "Kendrapara",
        "asset_name": "Rajnagar Model Cyclone Shelter",
        "message": "Shelter occupancy has reached 88% of rated 2,500 capacity. Additional evacuee buses approaching from coastal hamlets.",
        "recommended_action": "Activate secondary overflow shelter at Rajnagar Higher Secondary School; dispatch supplemental drinking water tanker.",
        "timestamp": datetime.utcnow() - timedelta(hours=1, minutes=12),
        "acknowledged": True
    },
    {
        "id": 5,
        "title": "INFO: Cyclone SAMUDRA Eye-Wall Replenishment Cycle",
        "severity": "INFO",
        "category": "WIND",
        "district": "Statewide Coastal Belt",
        "asset_name": "Doppler Radar Paradip",
        "message": "Core eye-wall contracted slightly with central pressure dropping to 952 hPa. Wind field outer gale radius expanded to 220 km.",
        "recommended_action": "Maintain state-level red alert posture across Puri, Jagatsinghpur, and Kendrapara districts.",
        "timestamp": datetime.utcnow() - timedelta(hours=2),
        "acknowledged": True
    }
]

class AlertService:
    def __init__(self):
        self.alerts = list(DEFAULT_ALERTS)

    def get_all_alerts(self, severity: Optional[str] = None, district: Optional[str] = None) -> List[Dict[str, Any]]:
        results = self.alerts
        if severity:
            results = [a for a in results if a["severity"].upper() == severity.upper()]
        if district:
            results = [a for a in results if district.lower() in a["district"].lower()]
        return results

    def acknowledge_alert(self, alert_id: int) -> bool:
        for alert in self.alerts:
            if alert["id"] == alert_id:
                alert["acknowledged"] = True
                return True
        return False

    def add_simulation_alert(self, title: str, severity: str, district: str, asset_name: str, message: str, action: str):
        new_id = len(self.alerts) + 1
        self.alerts.insert(0, {
            "id": new_id,
            "title": title,
            "severity": severity,
            "category": "SIMULATION",
            "district": district,
            "asset_name": asset_name,
            "message": message,
            "recommended_action": action,
            "timestamp": datetime.utcnow(),
            "acknowledged": False
        })

alert_service = AlertService()
