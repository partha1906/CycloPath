import React, { useState } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Filter,
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

  const filtered = alerts.filter(a => {
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
    <div className="w-full flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <BellRing className="w-6 h-6 text-red-400" />
            <span>Emergency Operations Center Alert Stream</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-hazard threshold breaches, storm surge inundation warnings, and infrastructure cut-off alerts
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold">Filter:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#090d18] border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Notices</option>
          </select>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';
          
          return (
            <div 
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border transition relative space-y-3 ${
                alert.acknowledged
                  ? 'bg-[#090d18]/60 border-slate-800/80 opacity-70'
                  : isCritical
                  ? 'bg-red-950/20 border-red-800/60 shadow-lg shadow-red-950/20'
                  : isWarning
                  ? 'bg-amber-950/15 border-amber-800/50'
                  : 'bg-[#0e1422] border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    isCritical ? 'badge-critical' : isWarning ? 'badge-high' : 'badge-moderate'
                  }`}>
                    {alert.severity} • {alert.category}
                  </span>
                  <span className="text-xs font-bold text-white">{alert.district} District</span>
                  {alert.asset_name && (
                    <span className="text-xs text-slate-400">({alert.asset_name})</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(alert.timestamp).toLocaleTimeString()} IST</span>
                  </div>

                  {!alert.acknowledged ? (
                    isCitizen ? (
                      <span className="text-slate-500 font-medium text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                        Command Auth Required
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAck(alert.id)}
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Acknowledge</span>
                      </button>
                    )
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acknowledged</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#070a12] border border-slate-800/80 text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Recommended Directive: </strong>
                  <span>{alert.recommended_action}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
