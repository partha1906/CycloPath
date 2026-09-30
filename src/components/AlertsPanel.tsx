import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Check
} from 'lucide-react';
import { Alert } from '../types';
import { api } from '../services/api';

interface AlertsPanelProps {
  alerts: Alert[];
  onAlertAcknowledged: (id: number) => void;
  userRole?: string;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  onAlertAcknowledged,
  userRole = 'Disaster_Authority'
}) => {
  const isCitizen = userRole === 'Public_Citizen';
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  const filtered = safeAlerts.filter(a => {
    if (filterSeverity !== 'all' && a.severity.toLowerCase() !== filterSeverity.toLowerCase()) return false;
    return true;
  });

  const handleAck = async (id: number) => {
    try {
      await api.acknowledgeAlert(id);
      onAlertAcknowledged(id);
    } catch (err) {
      console.error('Ack error:', err);
    }
  };

  return (
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-8 py-8 space-y-8 bg-slate-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <BellRing className="w-7 h-7 text-rose-600" />
            <span>Emergency Operations Center Alert Stream</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time multi-hazard threshold breaches, storm surge inundation warnings, and infrastructure cut-off alerts
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="text-slate-500 font-medium">Filter by severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 outline-none cursor-pointer font-medium shadow-xs"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Notices</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {(filtered || []).map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';
          
          return (
            <div 
              key={alert.id}
              className={`p-5 rounded-xl border transition relative space-y-3 shadow-xs ${
                alert.acknowledged
                  ? 'bg-slate-50 border-slate-200 opacity-70'
                  : isCritical
                  ? 'bg-white border-l-4 border-l-rose-600 border-slate-200'
                  : isWarning
                  ? 'bg-white border-l-4 border-l-amber-500 border-slate-200'
                  : 'bg-white border-l-4 border-l-slate-400 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isCritical ? 'badge-critical' : isWarning ? 'badge-high' : 'badge-moderate'
                  }`}>
                    {alert.severity} · {alert.category}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{alert.district} District</span>
                  {alert.asset_name && (
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                      · {alert.asset_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{alert.timestamp}</span>
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">{alert.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{alert.message}</p>
              </div>

              {/* Recommended Action & Acknowledgment */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <strong className="text-slate-900">Recommended Action:</strong>
                  <span>{alert.recommended_action}</span>
                </div>

                {!alert.acknowledged ? (
                  !isCitizen ? (
                    <button
                      onClick={() => handleAck(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge Protocol</span>
                    </button>
                  ) : null
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acknowledged by Incident Command</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
