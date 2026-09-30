import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Building2, 
  Zap, 
  GitFork, 
  Navigation, 
  Home, 
  Wind, 
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import { Cyclone, InfrastructureAsset, AssetType } from '../types';

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

  // 1. Initialize Map
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

    // Dark Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
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

  // 2. Render Cyclone Trajectory, Cone & Wind Rings
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
      if (cyclone.cone_coordinates && cyclone.cone_coordinates.length > 0) {
        const coneLatLngs = cyclone.cone_coordinates.map(pt => [pt[0], pt[1]] as [number, number]);
        L.polygon(coneLatLngs, {
          color: '#f43f5e',
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: '#f43f5e',
          fillOpacity: 0.12
        }).addTo(coneGroup);
      }

      // Trajectory polyline
      if (cyclone.trajectory_points && cyclone.trajectory_points.length > 0) {
        const trackLatLngs = cyclone.trajectory_points.map(p => [p.lat, p.lng] as [number, number]);
        L.polyline(trackLatLngs, {
          color: '#fb7185',
          weight: 3,
          opacity: 0.85
        }).addTo(coneGroup);

        // Historical & forecast trajectory dots
        cyclone.trajectory_points.forEach((p, idx) => {
          const isLandfall = p.time.includes('Landfall');
          const isCurrent = p.time.includes('Current');

          const dotColor = isCurrent ? '#ef4444' : isLandfall ? '#f59e0b' : '#38bdf8';
          const radius = isCurrent ? 8 : isLandfall ? 6 : 4;

          const circle = L.circleMarker([p.lat, p.lng], {
            radius: radius,
            color: dotColor,
            weight: 2,
            fillColor: dotColor,
            fillOpacity: 0.9
          }).addTo(coneGroup);

          circle.bindTooltip(`
            <div style="font-size: 11px;">
              <strong>${p.time}</strong><br/>
              Intensity: ${p.intensity}<br/>
              Wind: ${p.wind_kmh} km/h • Pressure: ${p.pressure_hpa} hPa
            </div>
          `);
        });
      }
    }

    if (showWindRings) {
      // Eye Center Pulsing Marker
      const eyeIcon = L.divIcon({
        className: 'cyclone-radar-marker',
        html: `
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 15px #ef4444; display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #fff;"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([cyclone.current_lat, cyclone.current_lng], { icon: eyeIcon })
        .addTo(windGroup)
        .bindTooltip(`<b>${cyclone.name} Center</b><br/>Wind: ${cyclone.max_wind_speed_kmh} km/h`);

      // Gale wind ring (220 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 220000,
        color: '#38bdf8',
        weight: 1,
        dashArray: '6, 6',
        fillColor: '#38bdf8',
        fillOpacity: 0.04
      }).addTo(windGroup).bindTooltip('Gale Wind Field (65+ km/h Radius)');

      // Severe storm ring (100 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 100000,
        color: '#f59e0b',
        weight: 1.2,
        dashArray: '4, 4',
        fillColor: '#f59e0b',
        fillOpacity: 0.08
      }).addTo(windGroup).bindTooltip('Destructive Storm Radius (110+ km/h)');

      // Hurricane core eyewall ring (40 km radius)
      L.circle([cyclone.current_lat, cyclone.current_lng], {
        radius: 40000,
        color: '#ef4444',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.16
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
      // Primary Inland Safe Route (NH-316 corridor: Puri -> Pipli -> Bhubaneswar AIIMS)
      const safeCorridor = [
        [19.8210, 85.8450],
        [19.8135, 85.8312],
        [20.0200, 85.8300],
        [20.1130, 85.8270],
        [20.2312, 85.7780]
      ] as [number, number][];

      L.polyline(safeCorridor, {
        color: '#10b981',
        weight: 4.5,
        opacity: 0.95
      }).addTo(routesGroup).bindTooltip('<b>RECOMMENDED SAFE CORRIDOR</b><br/>Inland NH-316 Expressway (Elevated, Low Flood Risk)');

      // High-Risk Coastal Route (Marine Drive beach highway)
      const breachCorridor = [
        [19.8210, 85.8450],
        [19.8500, 85.9800],
        [19.8876, 86.0945],
        [19.9950, 86.2950]
      ] as [number, number][];

      L.polyline(breachCorridor, {
        color: '#ef4444',
        weight: 3.5,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(routesGroup).bindTooltip('<b>HIGH SURGE HAZARD ROUTE</b><br/>Konark Marine Drive (Overtopping Breach Risk)');
    }
  }, [showRoutes]);

  // 4. Render Infrastructure Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = layerGroupsRef.current.markers;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filtered = assets.filter(asset => {
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
      
      const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f97316' : score >= 30 ? '#eab308' : '#22c55e';
      const isSelected = selectedAsset?.id === asset.id;

      // Custom HTML Marker Icon
      const markerHtml = `
        <div style="
          width: ${isSelected ? '28px' : '20px'}; 
          height: ${isSelected ? '28px' : '20px'}; 
          border-radius: 50%; 
          background: ${color}; 
          border: 2px solid ${isSelected ? '#ffffff' : '#0e131f'}; 
          box-shadow: 0 0 ${isSelected ? '16px #38bdf8' : '6px rgba(0,0,0,0.8)'}; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-infra-marker',
        html: markerHtml,
        iconSize: isSelected ? [28, 28] : [20, 20],
        iconAnchor: isSelected ? [14, 14] : [10, 10]
      });

      const marker = L.marker([asset.latitude, asset.longitude], { icon: customIcon })
        .addTo(markersGroup);

      marker.on('click', () => {
        onSelectAsset(asset);
      });

      // Tooltip content
      marker.bindTooltip(`
        <div style="padding: 2px;">
          <div style="font-weight: bold; color: #fff;">${asset.name}</div>
          <div style="font-size: 11px; color: #94a3b8; text-transform: capitalize;">${asset.asset_type.replace('_', ' ')} • ${asset.district}</div>
          <div style="margin-top: 4px; font-weight: bold; font-size: 11px; color: ${color};">
            Score: ${score}/100 (${cat.toUpperCase()})
          </div>
        </div>
      `, { offset: [0, -10] });
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
    <div className={`relative w-full h-full flex flex-col bg-[#07090e] ${isFullscreen ? 'fixed inset-0 z-50' : 'flex-1'}`}>
      {/* Top Search & Filter Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search Input */}
        <div className="pointer-events-auto flex items-center bg-[#090d18]/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-2 w-72 shadow-xl">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search coastal assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full"
          />
        </div>

        {/* Layer Controls Floating Pill */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#090d18]/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-xl text-xs">
          <button 
            onClick={() => setShowCone(!showCone)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showCone ? 'bg-red-600/30 text-red-300 border border-red-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cone</span>
          </button>

          <button 
            onClick={() => setShowHospitals(!showHospitals)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showHospitals ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hospitals</span>
          </button>

          <button 
            onClick={() => setShowPower(!showPower)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showPower ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Power</span>
          </button>

          <button 
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
              showRoutes ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Routes</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Leaflet Map Div */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-[#090d18]/90 backdrop-blur-md border border-slate-700/80 text-[11px] shadow-2xl space-y-2 pointer-events-none">
        <span className="font-bold text-slate-300 uppercase tracking-wider block">Risk Severity</span>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>Critical (&gt;80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>High (61-80)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            <span>Moderate (31-60)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Low (&lt;30)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
