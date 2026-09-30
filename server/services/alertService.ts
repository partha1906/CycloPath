export interface AlertData {
  id: number;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  category: string;
  district: string;
  asset_name?: string;
  message: string;
  recommended_action: string;
  timestamp: string;
  acknowledged: boolean;
}

const DEFAULT_ALERTS: AlertData[] = [
  {
    id: 1,
    title: 'CRITICAL: Coastal Surge Inundation Breach',
    severity: 'CRITICAL',
    category: 'SURGE',
    district: 'Puri',
    asset_name: 'Puri District Headquarters Hospital',
    message:
      'Storm surge tide gauge projection exceeds 4.2m. Ground-level ambulance triage bay and backup generator diesel pumps at risk of salt water flooding within 4 hours.',
    recommended_action:
      'Relocate mobile medical triage to 1st floor; seal fuel sumps; notify Emergency Medical Officer.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: 2,
    title: 'HIGH ALERT: 132kV Substation Transformer Isolation',
    severity: 'CRITICAL',
    category: 'POWER',
    district: 'Jagatsinghpur',
    asset_name: 'Paradip Port Grid Substation 132/33kV',
    message:
      'High saline aerosol deposition combined with 150 km/h wind gusts creating severe insulator arcing risk. Automated trip imminent.',
    recommended_action:
      'Switch critical port logistics and hospital circuits to dedicated auxiliary diesel ring; sandbag substation control room.',
    timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: 3,
    title: 'WARNING: Arterial Road Inundation & Culvert Scour',
    severity: 'WARNING',
    category: 'ROAD_CUT',
    district: 'Puri',
    asset_name: 'Konark-Puri Marine Drive Road (OD-SH-11)',
    message:
      'High tide backwater overtopping coastal culverts at Km 18. Heavy commercial vehicles and ambulances advised to reroute.',
    recommended_action:
      'Enforce traffic diversion via inland Pipli NH-316 highway; stage JCB clearance machinery at junction.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    acknowledged: false,
  },
  {
    id: 4,
    title: 'SHELTER CAPACITY WARNING: Influx Surge',
    severity: 'WARNING',
    category: 'SHELTER',
    district: 'Kendrapara',
    asset_name: 'Rajnagar Model Cyclone Shelter',
    message:
      'Shelter occupancy has reached 88% of rated 2,500 capacity. Additional evacuee buses approaching from coastal hamlets.',
    recommended_action:
      'Activate secondary overflow shelter at Rajnagar Higher Secondary School; dispatch supplemental drinking water tanker.',
    timestamp: new Date(Date.now() - 72 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
  {
    id: 5,
    title: 'INFO: Cyclone SAMUDRA Eye-Wall Replenishment Cycle',
    severity: 'INFO',
    category: 'WIND',
    district: 'Statewide Coastal Belt',
    asset_name: 'Doppler Radar Paradip',
    message:
      'Core eye-wall contracted slightly with central pressure dropping to 952 hPa. Wind field outer gale radius expanded to 220 km.',
    recommended_action:
      'Maintain state-level red alert posture across Puri, Jagatsinghpur, and Kendrapara districts.',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    acknowledged: true,
  },
];

export class AlertService {
  private alerts: AlertData[];

  constructor() {
    this.alerts = [...DEFAULT_ALERTS];
  }

  getAllAlerts(severity?: string, district?: string): AlertData[] {
    let results = this.alerts;
    if (severity) {
      results = results.filter((a) => a.severity.toUpperCase() === severity.toUpperCase());
    }
    if (district) {
      results = results.filter((a) => a.district.toLowerCase().includes(district.toLowerCase()));
    }
    return results;
  }

  acknowledgeAlert(alertId: number): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  addSimulationAlert(title: string, severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO', district: string, assetName: string, message: string, action: string) {
    const newId = this.alerts.length + 1;
    this.alerts.unshift({
      id: newId,
      title,
      severity,
      category: 'SIMULATION',
      district,
      asset_name: assetName,
      message,
      recommended_action: action,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    });
  }
}

export const alertService = new AlertService();
