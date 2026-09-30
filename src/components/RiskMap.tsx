import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Building2, 
  Zap, 
  GitFork, 
  Navigation, 
  Home, 
  Wind, 
  Maximize2, 
  Minimize2, 
  Search,
  Check
} from 'lucide-react';
import { Cyclone, InfrastructureAsset } from '../types';

interface RiskMapProps {
  cyclone: Cyclone | null;
  assets: InfrastructureAsset[];
  selectedAsset: InfrastructureAsset | null;
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  cyclone,
  assets,
  selectedAsset,
  onSelectAsset
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer visibility toggles
  const [showCone, setShowCone] = useState(true);
  const [showWindRings, setShowWindRings] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showPower, setShowPower] = useState(true);
  const [showBridges, setShowBridges] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Layer groups refs
  const layerGroupsRef = useRef<{
    cone?: L.LayerGroup;
    windRings?: L.LayerGroup;
    markers?: L.LayerGroup;
    routes?: L.LayerGroup;
  }>({});

  // 1. Initialize Map with clean light tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on coastal Odisha / Bay of Bengal swath
    const map = L.map(mapContainerRef.current, {
      center: [20.0, 86.0],
      zoom: 8,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Clean, crisp Light Tile Layer (CartoDB Voyager or Light All)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Initialize Layer Groups
    layerGroupsRef.current.cone = L.layerGroup().addTo(map);
    layerGroupsRef.current.windRings = L.layerGroup().addTo(map);
    layerGroupsRef.current.routes = L.layerGroup().addTo(map);
    layerGroupsRef.current.markers = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Render Cyclone Trajectory, Cone & Wind Rings (SOLID, CALM, NO BLINKING)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !cyclone) return;

    const coneGroup = layerGroupsRef.current.cone;
    const windGroup = layerGroupsRef.current.windRings;
    if (!coneGroup || !windGroup) return;

    coneGroup.clearLayers();
    windGroup.clearLayers();

    if (showCone) {
      // Cone of uncertainty polygon
      if (cyclone.cone_coordinates && Array.isArray(cyclone.cone_coordinates) && cyclone.cone_coordinates.length > 0) {
        const coneLatLngs = cyclone.cone_coordinates.map(pt => [pt[0], pt[1]] as [number, number]);
        L.polygon(coneLatLngs, {
          color: '#e11d48',
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: '#f43f5e',
          fillOpacity: 0.1
        }).addTo(coneGroup);
      }

      // Trajectory polyline
      if (cyclone.trajectory_points && Array.isArray(cyclone.trajectory_points) && cyclone.trajectory_points.length > 0) {
        const trackLatLngs = cyclone.trajectory_points.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(trackLatLngs, {
          color: '#be123c',
          weight: 3,
          opacity: 0.9
        }).addTo(coneGroup);

        // Historical & forecast trajectory dots (Clean, static dots)
        cyclone.trajectory_points.forEach((p) => {
          const isLandfall = p.time.includes('Landfall');
          const isCurrent = p.time.includes('Current');

          const dotColor = isCurrent ? '#dc2626' : isLandfall ? '#d97706' : '#0284c7';
          const radius = isCurrent ? 7 : isLandfall ? 6 : 4;

          const circle = L.circleMarker([p.lat, p.lng], {
            radius: radius,
            color: '#ffffff',
            weight: 2,
            fillColor: dotColor,
            fillOpacity: 1
          }).addTo(coneGroup);

          circle.bindTooltip(`
            <div style="font-size: 12px; font-family: sans-serif; color: #0f172a; padding: 2px;">
              <strong style="color: #0f172a;">${p.time}</strong><br/>
              Intensity: ${p.intensity}<br/>
              Wind: ${p.wind_kmh} km/h · Pressure: ${p.pressure_hpa} hPa
            </div>
          `);
        });
      }
    }

    if (showWindRings) {
      // Cyclone Eye Center Marker (Clean solid red circle, NO BLINKING, NO PULSE)
      const eyeIcon = L.divIcon({
        className: 'cyclone-static-marker',
        html: `
          <div style="width: 22px; height: 22px; border-radius: 50%; background: #dc2626; border: 2.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([cyclone.current_lat, cyclone.current_lng], { icon: eyeIcon })
        .addTo(windGroup)
        .bindTooltip(`<div style="color: #0f172a; font-family: sans-serif; font-size: 12px;"><b>${cyclone.name} Center</b><br/>Wind: ${cyclone.max_wind_speed_kmh} km/h</div>`);

      // Gale wind ring (220 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 220000,
        color: '#0284c7',
        weight: 1.2,
        dashArray: '5, 5',
        fillColor: '#0284c7',
        fillOpacity: 0.05
      }).addTo(windGroup).bindTooltip('Gale Wind Field (65+ km/h Radius)');

      // Severe storm ring (100 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 100000,
        color: '#d97706',
        weight: 1.5,
        dashArray: '4, 4',
        fillColor: '#d97706',
        fillOpacity: 0.08
      }).addTo(windGroup).bindTooltip('Destructive Storm Radius (110+ km/h)');

      // Hurricane core eyewall ring (40 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 40000,
        color: '#dc2626',
        weight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.12
      }).addTo(windGroup).bindTooltip('Core Eyewall Radius (165+ km/h)');
    }
  }, [cyclone, showCone, showWindRings]);

  // 3. Render Emergency Evacuation Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const routesGroup = layerGroupsRef.current.routes;
    if (!map || !routesGroup) return;

    routesGroup.clearLayers();

    if (showRoutes) {
      // Primary Inland Safe Route (NH-316 corridor)
      const safeCorridor = [
        [19.8210, 85.8450],
        [19.8135, 85.8312],
        [20.0200, 85.8300],
        [20.1130, 85.8270],
        [20.2312, 85.7780]
      ] as [number, number][];

      L.polyline(safeCorridor, {
        color: '#059669',
        weight: 4,
        opacity: 0.95
      }).addTo(routesGroup).bindTooltip('<div style="color: #0f172a; font-family: sans-serif; font-size: 12px;"><b>SAFE CORRIDOR</b><br/>Inland NH-316 Expressway (Elevated, Low Flood Risk)</div>');

      // High-Risk Coastal Route (Marine Drive beach highway)
      const breachCorridor = [
        [19.8210, 85.8450],
        [19.8500, 85.9800],
        [19.8876, 86.0945],
        [19.9950, 86.2950]
      ] as [number, number][];

      L.polyline(breachCorridor, {
        color: '#dc2626',
        weight: 3.5,
        dashArray: '6, 6',
        opacity: 0.9
      }).addTo(routesGroup).bindTooltip('<div style="color: #0f172a; font-family: sans-serif; font-size: 12px;"><b>HIGH SURGE HAZARD ROUTE</b><br/>Konark Marine Drive (Overtopping Breach Risk)</div>');
    }
  }, [showRoutes]);

  // 4. Render Infrastructure Markers (STATIC, HIGH CONTRAST, CLEAN)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = layerGroupsRef.current.markers;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const safeAssets = Array.isArray(assets) ? assets : [];
    const filtered = safeAssets.filter(asset => {
      if (asset.asset_type === 'hospital' && !showHospitals) return false;
      if (asset.asset_type === 'power_station' && !showPower) return false;
      if (asset.asset_type === 'bridge' && !showBridges) return false;
      if (asset.asset_type === 'road' && !showRoads) return false;
      if (asset.asset_type === 'school_shelter' && !showShelters) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(q) || asset.district.toLowerCase().includes(q);
      }
      return true;
    });

    filtered.forEach(asset => {
      const score = asset.risk_assessment?.overall_vulnerability_score || 0;
      const cat = asset.risk_assessment?.risk_category || 'Moderate';
      
      const color = score >= 80 ? '#dc2626' : score >= 60 ? '#ea580c' : score >= 30 ? '#d97706' : '#16a34a';
      const isSelected = selectedAsset?.id === asset.id;

      // Custom Clean Marker (NO BLINKING, NO NEON GLOW)
      const markerHtml = `
        <div style="
          width: ${isSelected ? '26px' : '18px'}; 
          height: ${isSelected ? '26px' : '18px'}; 
          border-radius: 50%; 
          background: ${color}; 
          border: 2px solid #ffffff; 
          box-shadow: 0 1px 4px rgba(0,0,0,0.25); 
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer;
        ">
          <div style="width: 4px; height: 4px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-infra-marker',
        html: markerHtml,
        iconSize: isSelected ? [26, 26] : [18, 18],
        iconAnchor: isSelected ? [13, 13] : [9, 9]
      });

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon })
        .addTo(markersGroup);

      marker.on('click', () => {
        onSelectAsset(asset);
      });

      // Tooltip content with crisp light design
      marker.bindTooltip(`
        <div style="padding: 2px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <div style="font-weight: 600; color: #0f172a;">${asset.name}</div>
          <div style="font-size: 11px; color: #64748b; text-transform: capitalize;">${asset.asset_type.replace('_', ' ')} · ${asset.district}</div>
          <div style="margin-top: 3px; font-weight: 600; font-size: 11px; color: ${color};">
            Score: ${score}/100 (${cat.toUpperCase()})
          </div>
        </div>
      `, { offset: [0, -8] });
    });
  }, [assets, selectedAsset, showHospitals, showPower, showBridges, showRoads, showShelters, searchQuery, onSelectAsset]);

  // Center on selected asset if updated
  useEffect(() => {
    if (selectedAsset && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedAsset.latitude, selectedAsset.longitude], 12, {
        duration: 0.8
      });
    }
  }, [selectedAsset]);

  return (
    <div className={`relative w-full h-full flex flex-col bg-slate-50 ${isFullscreen ? 'fixed inset-0 z-50' : 'flex-1'}`}>
      {/* Top Search & Filter Bar Overlay - Clean Light Theme */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Input */}
        <div className="pointer-events-auto flex items-center bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3 py-2 w-72 shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search coastal assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-slate-900 placeholder-slate-400 outline-none w-full font-medium"
          />
        </div>

        {/* Layer Controls Floating Bar */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-1.5 shadow-sm text-xs">
          <button 
            onClick={() => setShowCone(!showCone)}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showCone ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Cone</span>
          </button>

          <button 
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showHospitals ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hospitals</span>
          </button>

          <button 
            onClick={() => setShowPower(!showPower)}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showPower ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Power</span>
          </button>

          <button 
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showRoutes ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Routes</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend (Bottom Left) - Clean White Box */}
      <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-xs shadow-md space-y-2 pointer-events-none">
        <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">Risk Severity</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>Critical (&gt;80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600"></span>
            <span>High (61-80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
            <span>Moderate (31-60)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Low (&lt;30)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
