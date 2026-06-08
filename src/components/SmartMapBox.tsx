import React, { useState, useMemo, useEffect } from "react";
import { Map as MapIcon, Utensils, Home, Compass, Search, Info } from "lucide-react";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Accommodation, Restaurant, ItineraryDay, LocationCoordinates } from "../types";

interface SmartMapBoxProps {
  destination: string;
  country: string;
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  itineraryDays: ItineraryDay[];
  showChronologicalPath?: boolean;
  centerCoordinates?: LocationCoordinates;
}

interface MapPinItem {
  id: string;
  name: string;
  type: "accommodation" | "restaurant" | "activity";
  subtext: string;
  costInfo: string;
  lat: number;
  lng: number;
}

function getDeterministicOffset(name: string, centerMap: LocationCoordinates) {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < name.length; i++) {
    hash1 = name.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = name.charCodeAt(i) + ((hash2 << 7) - hash2);
  }
  const latOffset = ((Math.abs(hash1) % 100) - 50) / 2000;
  const lngOffset = ((Math.abs(hash2) % 100) - 50) / 2000;
  return { lat: centerMap.lat + latOffset, lng: centerMap.lng + lngOffset };
}

const createIcon = (type: string, color: string, isActive: boolean) => {
  let svg = '';
  if (type === 'accommodation') svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
  else if (type === 'restaurant') svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
  else svg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;

  const bgClasses = isActive ? `bg-indigo-600 shadow-[0_0_15px_${color}] ring-2 ring-white shadow-xl` : "bg-slate-800 border border-slate-600 shadow-md opacity-90";
  const colorHex = isActive ? "#fff" : color;

  const html = `
    <div class="relative flex items-center justify-center w-7 h-7 rounded-full ${bgClasses} text-white transition-all overflow-hidden" style="color: ${colorHex}">
      ${svg}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-marker bg-transparent border-none',
    iconSize: isActive ? [32, 32] : [28, 28],
    iconAnchor: isActive ? [16, 16] : [14, 14],
    popupAnchor: [0, -16]
  });
};

const MapController = ({ pins, centerCoords }: { pins: MapPinItem[], centerCoords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    } else {
      map.setView(centerCoords, 13);
    }
  }, [pins, centerCoords, map]);
  return null;
};

export default function SmartMapBox({
  destination,
  country,
  accommodations,
  restaurants,
  itineraryDays,
  showChronologicalPath = false,
  centerCoordinates
}: SmartMapBoxProps) {
  const { theme } = useAppTheme();
  const [activeCategory, setActiveCategory] = useState<"all" | "accommodation" | "restaurant" | "activity">("all");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchedCenter, setFetchedCenter] = useState<LocationCoordinates | null>(null);

  useEffect(() => {
    if (!centerCoordinates) {
      let isMounted = true;
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (isMounted) {
            if (data && data.length > 0) {
              setFetchedCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            } else {
              setFetchedCenter({ lat: 48.8566, lng: 2.3522 });
            }
          }
        }).catch(() => {
          if (isMounted) setFetchedCenter({ lat: 48.8566, lng: 2.3522 });
        });
      return () => { isMounted = false; };
    }
  }, [destination, centerCoordinates]);

  const mapCenter = centerCoordinates || fetchedCenter;

  const allMapPins = useMemo<MapPinItem[]>(() => {
    const list: MapPinItem[] = [];
    if (!mapCenter) return list;

    accommodations.forEach((item, index) => {
      const coords = item.coordinates || getDeterministicOffset(item.name, mapCenter);
      list.push({
        id: `stay-${index}`,
        name: item.name,
        type: "accommodation",
        subtext: item.description || "Lodging",
        costInfo: item.approxPricePerNight || "N/A",
        ...coords
      });
    });

    restaurants.forEach((item, index) => {
      const coords = item.coordinates || getDeterministicOffset(item.name, mapCenter);
      list.push({
        id: `eat-${index}`,
        name: item.name,
        type: "restaurant",
        subtext: item.description || "Dining",
        costInfo: item.averageCost || "Standard",
        ...coords
      });
    });

    itineraryDays.forEach((day, dIdx) => {
      day.activities.forEach((activity, idx) => {
        if (list.some(existing => existing.name === activity.title)) return;
        const coords = activity.coordinates || getDeterministicOffset(activity.title, mapCenter);
        list.push({
          id: `act-${day.dayNumber}-${idx}`,
          name: activity.title,
          type: "activity",
          subtext: activity.description || "Sightseeing",
          costInfo: activity.estimatedCost || "Free",
          ...coords
        });
      });
    });

    return list;
  }, [accommodations, restaurants, itineraryDays, mapCenter]);

  const filteredPins = useMemo(() => {
    return allMapPins.filter((pin) => {
      const matchesCategory = activeCategory === "all" || pin.type === activeCategory;
      const matchesSearch = pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pin.subtext.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allMapPins, activeCategory, searchQuery]);

  if (!mapCenter) {
    return <div className="p-6 text-center text-slate-400">Loading spatial data for {destination}...</div>;
  }

  const pathPositions = showChronologicalPath 
    ? allMapPins.filter(p => p.type === 'activity').map(p => [p.lat, p.lng] as [number, number])
    : [];

  return (
    <ThemeCard id="smart-itinerary-map" className={`p-6 space-y-6 ${theme.fontClass} relative`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-white/[0.04] ${theme.textAccent} rounded-2xl border border-white/10 ${theme.glowClass} backdrop-blur-md`}>
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
              OpenStreetMap Global Feed
            </span>
            <h3 className="font-sans font-semibold text-white text-sm">
              Live Coordinate Map for {destination}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => setActiveCategory("all")} className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${activeCategory === "all" ? `${theme.bgAccent} text-white border-transparent` : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"}`}>📍 All ({allMapPins.length})</button>
          <button onClick={() => setActiveCategory("accommodation")} className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${activeCategory === "accommodation" ? "bg-blue-600/80 text-white border-transparent" : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"}`}><Home className="w-3.5 h-3.5" /> Lodging</button>
          <button onClick={() => setActiveCategory("restaurant")} className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${activeCategory === "restaurant" ? "bg-emerald-600/80 text-white border-transparent" : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"}`}><Utensils className="w-3.5 h-3.5" /> Dining</button>
          <button onClick={() => setActiveCategory("activity")} className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${activeCategory === "activity" ? "bg-amber-600/80 text-white border-transparent" : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"}`}><Compass className="w-3.5 h-3.5" /> Sightsee</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        <div className="lg:col-span-4 flex flex-col space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter spot name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.02] border border-white/10 rounded-xl text-xs placeholder-slate-400 text-slate-200 outline-none focus:ring-1 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredPins.length > 0 ? (
              filteredPins.map((pin) => {
                const isSelected = pin.id === selectedPinId;
                return (
                  <div
                    key={pin.id}
                    onClick={() => setSelectedPinId(pin.id)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${isSelected ? 'bg-white/[0.06] border-white/20' : 'bg-white/[0.01] hover:bg-white/[0.04] border-white/5'}`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {pin.type === "accommodation" && <span className="p-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px]"><Home className="w-3 h-3" /></span>}
                          {pin.type === "restaurant" && <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px]"><Utensils className="w-3 h-3" /></span>}
                          {pin.type === "activity" && <span className="p-1 bg-amber-500/10 text-amber-450 rounded-lg text-[10px]"><Compass className="w-3 h-3" /></span>}
                          <h4 className="font-sans font-bold text-slate-200 text-xs truncate max-w-[160px]">{pin.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug font-light">{pin.subtext}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 block">{pin.costInfo}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : <p className="text-xs text-slate-400 text-center py-10">No pins match your filters.</p>}
          </div>
          <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-start gap-2.5 text-[11px] text-slate-400 leading-normal">
            <Info className={`w-4 h-4 ${theme.textAccent} shrink-0 mt-0.5`} />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200 block">OpenStreetMap Integration</span>
              <p className="font-light">Geospatial data rendered via interactive leaflet mapping utilizing real world coordinate plotting via GenAI and Nominatim.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-3xl relative overflow-hidden aspect-[16/10] sm:aspect-[16/9] border border-slate-700 shadow-sm z-0">
          <MapContainer 
            center={[mapCenter.lat, mapCenter.lng]} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="w-full h-full z-0 leaflet-container"
            style={{ width: "100%", height: "100%", zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM contributors</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png"
            />
            {filteredPins.map(pin => {
              const isSelected = selectedPinId === pin.id;
              let color = "#cbd5e1"; // default slate-300
              if (pin.type === 'accommodation') color = "#60a5fa"; // blue-400
              if (pin.type === 'restaurant') color = "#34d399"; // emerald-400
              if (pin.type === 'activity') color = "#fbbf24"; // amber-400
              
              return (
                <Marker 
                  key={pin.id} 
                  position={[pin.lat, pin.lng]} 
                  icon={createIcon(pin.type, color, isSelected)}
                  eventHandlers={{
                    click: () => setSelectedPinId(pin.id)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="text-xs font-sans text-slate-900 leading-none">
                      <strong className="block text-sm mb-1">{pin.name}</strong>
                      <span className="text-slate-600 font-light block line-clamp-2">{pin.subtext}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
            
            {showChronologicalPath && pathPositions.length > 1 && (
              <Polyline 
                positions={pathPositions} 
                pathOptions={{ color: theme.accent, weight: 3, dashArray: '5, 10', opacity: 0.7 }}
              />
            )}

            <MapController pins={filteredPins} centerCoords={[mapCenter.lat, mapCenter.lng]} />
          </MapContainer>
        </div>
      </div>
    </ThemeCard>
  );
}
