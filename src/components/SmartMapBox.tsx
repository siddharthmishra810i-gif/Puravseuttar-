import React, { useState, useMemo, useEffect } from "react";
import { Map, MapPin, Utensils, Home, Compass, Navigation, ArrowUpRight, Check, Sliders, Info, Search, Layers } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Accommodation, Restaurant, ItineraryDay } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface SmartMapBoxProps {
  destination: string;
  country: string;
  accommodations: Accommodation[];
  restaurants: Restaurant[];
  itineraryDays: ItineraryDay[];
  showChronologicalPath?: boolean;
}

interface MapPinItem {
  id: string;
  name: string;
  type: "accommodation" | "restaurant" | "activity";
  subtext: string;
  costInfo: string;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
}

// Deterministic seed coordinate generator so pins reside in realistic spatial configurations
function getDeterministicCoords(name: string) {
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < name.length; i++) {
    hash1 = name.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = name.charCodeAt(i) + ((hash2 << 7) - hash2);
  }
  // Distribute within 15% - 85% range to stay away from the canvas edges
  const x = 15 + (Math.abs(hash1) % 70);
  const y = 20 + (Math.abs(hash2) % 65);
  return { x, y };
}

export default function SmartMapBox({
  destination,
  country,
  accommodations,
  restaurants,
  itineraryDays,
  showChronologicalPath = false,
}: SmartMapBoxProps) {
  const { theme } = useAppTheme();
  const [activeCategory, setActiveCategory] = useState<"all" | "accommodation" | "restaurant" | "activity">("all");
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState<"topological" | "satellite">("topological");
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [hoveredPinId, setHoveredPinId] = useState<string | null>(null);

  // Color-coded map toggles for specific categories (independent category visibilities on map canvas)
  const [visibleCategories, setVisibleCategories] = useState<Set<"accommodation" | "restaurant" | "activity">>(
    new Set(["accommodation", "restaurant", "activity"])
  );

  const toggleCategoryVisibility = (category: "accommodation" | "restaurant" | "activity") => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Chronological activities list for drawing animated routing pathways
  const chronologicalActivities = useMemo(() => {
    const list: { name: string; x: number; y: number; dayNumber: number }[] = [];
    itineraryDays.forEach((day) => {
      day.activities.forEach((activity) => {
        const { x, y } = getDeterministicCoords(activity.title);
        if (list.length === 0 || list[list.length - 1].name !== activity.title) {
          list.push({
            name: activity.title,
            x,
            y,
            dayNumber: day.dayNumber
          });
        }
      });
    });
    return list;
  }, [itineraryDays]);

  // Harmonize pins list
  const allMapPins = useMemo<MapPinItem[]>(() => {
    const list: MapPinItem[] = [];

    // 1. Map Accommodations
    accommodations.forEach((item, index) => {
      const { x, y } = getDeterministicCoords(item.name);
      list.push({
        id: `stay-${index}`,
        name: item.name,
        type: "accommodation",
        subtext: item.description || "Scenic local lodging options.",
        costInfo: item.approxPricePerNight || "N/A",
        x,
        y,
      });
    });

    // 2. Map Restaurants
    restaurants.forEach((item, index) => {
      const { x, y } = getDeterministicCoords(item.name);
      list.push({
        id: `eat-${index}`,
        name: item.name,
        type: "restaurant",
        subtext: item.description || "Highly praised culinary experience.",
        costInfo: item.averageCost || "Standard Fare",
        x,
        y,
      });
    });

    // 3. Map Activities
    itineraryDays.forEach((day) => {
      day.activities.forEach((activity, index) => {
        // Skip adding duplicates of the same activity name
        if (list.some((existing) => existing.name.toLowerCase() === activity.title.toLowerCase())) {
          return;
        }
        const { x, y } = getDeterministicCoords(activity.title);
        list.push({
          id: `act-${day.dayNumber}-${index}`,
          name: activity.title,
          type: "activity",
          subtext: activity.description || "Point of interest sightseeing.",
          costInfo: activity.estimatedCost || "Free Access",
          x,
          y,
        });
      });
    });

    return list;
  }, [accommodations, restaurants, itineraryDays]);

  // Filter pins for general listings search
  const filteredPins = useMemo(() => {
    return allMapPins.filter((pin) => {
      const matchesCategory = activeCategory === "all" || pin.type === activeCategory;
      const matchesSearch = pin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            pin.subtext.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allMapPins, activeCategory, searchQuery]);

  // Map-specific pins filtered further by the interactive legend toggles
  const mapPinsToShow = useMemo(() => {
    return filteredPins.filter((pin) => visibleCategories.has(pin.type));
  }, [filteredPins, visibleCategories]);

  // Set default pin when loaded or map pins shift
  useEffect(() => {
    if (mapPinsToShow.length > 0) {
      if (!selectedPinId || !mapPinsToShow.some(p => p.id === selectedPinId)) {
        setSelectedPinId(mapPinsToShow[0].id);
      }
    } else {
      setSelectedPinId(null);
    }
  }, [destination, mapPinsToShow]);

  const activeSelectedPin = useMemo(() => {
    return mapPinsToShow.find((p) => p.id === selectedPinId) || null;
  }, [mapPinsToShow, selectedPinId]);

  // Support state for clustering groups in percentage units
  const [expandedClusterIds, setExpandedClusterIds] = useState<string[]>([]);

  // Reset clusters on filter or destination shifts
  useEffect(() => {
    setExpandedClusterIds([]);
  }, [destination, activeCategory, visibleCategories]);

  // Proximity clustering algorithm based on active, toggled map pins
  const clusters = useMemo(() => {
    const clusterDistThreshold = 10; // X/Y percentage units threshold
    const resultList: {
      id: string;
      pins: MapPinItem[];
      x: number;
      y: number;
    }[] = [];

    mapPinsToShow.forEach((pin) => {
      // Find if there is an existing cluster that is close to this pin
      let found = false;
      for (const cluster of resultList) {
        const dx = cluster.x - pin.x;
        const dy = cluster.y - pin.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < clusterDistThreshold) {
          cluster.pins.push(pin);
          // Recalculate center
          cluster.x = cluster.pins.reduce((sum, p) => sum + p.x, 0) / cluster.pins.length;
          cluster.y = cluster.pins.reduce((sum, p) => sum + p.y, 0) / cluster.pins.length;
          found = true;
          break;
        }
      }
      if (!found) {
        resultList.push({
          id: `cluster-${pin.id}`,
          pins: [pin],
          x: pin.x,
          y: pin.y,
        });
      }
    });
    return resultList;
  }, [mapPinsToShow]);

  const getOrbitCoords = (clusterX: number, clusterY: number, idx: number, total: number) => {
    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2; // start from 12 o'clock
    const radius = 9; // radius in percentage coordinates
    return {
      x: clusterX + radius * Math.cos(angle),
      y: clusterY + radius * Math.sin(angle),
    };
  };

  return (
    <ThemeCard id="smart-itinerary-map" className={`p-6 space-y-6 ${theme.fontClass} relative`}>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-white/[0.04] ${theme.textAccent} rounded-2xl border border-white/10 ${theme.glowClass} backdrop-blur-md`}>
            <Map className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">
              Global Micro-Grid Map
            </span>
            <h3 className="font-sans font-semibold text-white text-sm">
              Vector Coordinate Layout Map for {destination}
            </h3>
          </div>
        </div>

        {/* Categories Tab selectors */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
              activeCategory === "all"
                ? `${theme.bgAccent} text-white border-transparent`
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"
            }`}
          >
            📍 All ({allMapPins.length})
          </button>
          <button
            onClick={() => setActiveCategory("accommodation")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${
              activeCategory === "accommodation"
                ? "bg-blue-600/80 text-white border-transparent"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            Lodging
          </button>
          <button
            onClick={() => setActiveCategory("restaurant")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${
              activeCategory === "restaurant"
                ? "bg-emerald-600/80 text-white border-transparent"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Dining
          </button>
          <button
            onClick={() => setActiveCategory("activity")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border flex items-center gap-1 ${
              activeCategory === "activity"
                ? "bg-amber-600/80 text-white border-transparent"
                : "bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Sightseeing
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar list vs Map canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Side: interactive listings view */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          
          {/* Search box overlay */}
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
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white/[0.06] border-white/20 shadow-sm"
                        : "bg-white/[0.01] hover:bg-white/[0.04] border-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          {pin.type === "accommodation" && (
                            <span className="p-1 bg-blue-500/10 text-blue-400 rounded-lg text-[10px]">
                              <Home className="w-3 h-3" />
                            </span>
                          )}
                          {pin.type === "restaurant" && (
                            <span className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px]">
                              <Utensils className="w-3 h-3" />
                            </span>
                          )}
                          {pin.type === "activity" && (
                            <span className="p-1 bg-amber-500/10 text-amber-450 rounded-lg text-[10px]">
                              <Compass className="w-3 h-3" />
                            </span>
                          )}
                          <h4 className="font-sans font-bold text-slate-200 text-xs truncate max-w-[160px]">
                            {pin.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1 leading-snug font-light">
                          {pin.subtext}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] font-mono font-bold bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded text-indigo-300 block">
                          {pin.costInfo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-10">
                No pins match your filters.
              </p>
            )}
          </div>

          <div className="p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl flex items-start gap-2.5 text-[11px] text-slate-400 leading-normal">
            <Info className={`w-4 h-4 ${theme.textAccent} shrink-0 mt-0.5`} />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-200 block">Interactive Coordinates</span>
              <p className="font-light">Click a spot in the sidebar matrix or select a waypoint marker on the canvas map to toggle details.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Map Canvas Simulation */}
        <div className={`lg:col-span-8 rounded-3xl relative overflow-hidden aspect-[16/10] sm:aspect-[16/9] border transition-all duration-500 shadow-sm flex items-center justify-center select-none ${
          mapStyle === "satellite"
            ? "bg-slate-950 border-indigo-950/60"
            : "bg-slate-900 border-slate-800"
        }`}>
          
          {/* Aesthetic Map Style Toggle Switches */}
          <button
            onClick={() => setMapStyle(prev => prev === "topological" ? "satellite" : "topological")}
            className="absolute top-4 left-4 z-40 bg-slate-900/95 hover:bg-slate-800 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold font-mono text-white uppercase tracking-wider transition-all duration-300 hover:scale-105 shadow-md cursor-pointer"
            title="Switch Map style layout"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Map Style: {mapStyle === "topological" ? "topological" : "satellite"}</span>
          </button>

          {/* Accessible Collapsible Legend Toggles */}
          <div className="absolute top-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-xl p-2 md:p-3 shadow-md text-white w-[145px] sm:w-[160px] transition-all">
            <button
              onClick={() => setIsLegendExpanded(!isLegendExpanded)}
              className="flex items-center justify-between w-full gap-2 text-[10px] uppercase font-mono tracking-wider font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Legend
              </span>
              <span className="text-[9px] text-indigo-400">{isLegendExpanded ? "▲ Hide" : "▼ Show"}</span>
            </button>

            <AnimatePresence>
              {isLegendExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-1.5 mt-2 pt-2 border-t border-slate-800"
                >
                  <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mb-1 leading-normal">
                    Toggle Markers:
                  </p>

                  {/* Lodging Toggle Button */}
                  <button
                    onClick={() => toggleCategoryVisibility("accommodation")}
                    className={`flex items-center justify-between w-full text-[10px] p-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                      visibleCategories.has("accommodation")
                        ? "bg-blue-950/40 border-blue-500/25 text-blue-300 hover:bg-blue-900/25"
                        : "bg-slate-900/10 border-transparent text-slate-500 hover:bg-slate-900/25 opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        visibleCategories.has("accommodation") ? "bg-blue-500 ring-4 ring-blue-500/20" : "bg-slate-600"
                      }`} />
                      <span className="font-sans flex items-center gap-1 truncate"><Home className="w-3 h-3 shrink-0" /> Lodging</span>
                    </span>
                    <span className="text-[8px] shrink-0 font-mono font-bold">{visibleCategories.has("accommodation") ? "ON" : "OFF"}</span>
                  </button>

                  {/* Dining Toggle Button */}
                  <button
                    onClick={() => toggleCategoryVisibility("restaurant")}
                    className={`flex items-center justify-between w-full text-[10px] p-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                      visibleCategories.has("restaurant")
                        ? "bg-emerald-950/40 border-emerald-500/25 text-emerald-300 hover:bg-emerald-900/25"
                        : "bg-slate-900/10 border-transparent text-slate-500 hover:bg-slate-900/25 opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        visibleCategories.has("restaurant") ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-slate-600"
                      }`} />
                      <span className="font-sans flex items-center gap-1 truncate"><Utensils className="w-3 h-3 shrink-0" /> Dining</span>
                    </span>
                    <span className="text-[8px] shrink-0 font-mono font-bold">{visibleCategories.has("restaurant") ? "ON" : "OFF"}</span>
                  </button>

                  {/* Sightseeing Toggle Button */}
                  <button
                    onClick={() => toggleCategoryVisibility("activity")}
                    className={`flex items-center justify-between w-full text-[10px] p-1.5 rounded-lg border transition-all text-left cursor-pointer ${
                      visibleCategories.has("activity")
                        ? "bg-amber-950/40 border-amber-500/25 text-amber-300 hover:bg-amber-900/25"
                        : "bg-slate-900/10 border-transparent text-slate-500 hover:bg-slate-900/25 opacity-50"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        visibleCategories.has("activity") ? "bg-amber-500 ring-4 ring-amber-500/20" : "bg-slate-600"
                      }`} />
                      <span className="font-sans flex items-center gap-1 truncate"><Compass className="w-3 h-3 shrink-0" /> Sightsee</span>
                    </span>
                    <span className="text-[8px] shrink-0 font-mono font-bold">{visibleCategories.has("activity") ? "ON" : "OFF"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Animated Map Style Layers */}
          <AnimatePresence mode="wait">
            {mapStyle === "topological" ? (
              <motion.svg
                key="topo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid-topo" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.15)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-topo)" />

                {/* Stylized river flowing horizontally across */}
                <path
                  d="M -50 180 Q 200 40, 500 240 T 1150 120"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.2)"
                  strokeWidth="28"
                  strokeLinecap="round"
                />
                <path
                  d="M -50 180 Q 200 40, 500 240 T 1150 120"
                  fill="none"
                  stroke="rgba(14, 165, 233, 0.15)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />

                {/* Green park zones overlay */}
                <circle cx="85%" cy="30%" r="90" fill="rgba(16, 185, 129, 0.04)" />
                <circle cx="20%" cy="75%" r="110" fill="rgba(16, 185, 129, 0.05)" />
              </motion.svg>
            ) : (
              <motion.svg
                key="satellite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="grid-sat" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="1" />
                    <circle cx="0" cy="0" r="1.5" fill="rgba(99,102,241,0.15)" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-sat)" />

                {/* Satellite Radar / Infrared / Thermal scans */}
                <path
                  d="M -50 185 Q 210 35, 490 245 T 1160 115"
                  fill="none"
                  stroke="rgba(14, 165, 233, 0.08)"
                  strokeWidth="32"
                />
                <circle cx="50%" cy="50%" r="140" fill="none" stroke="rgba(99, 102, 241, 0.06)" strokeWidth="1.5" strokeDasharray="5, 10" />
                <circle cx="50%" cy="50%" r="280" fill="none" stroke="rgba(99, 102, 241, 0.03)" strokeWidth="1" strokeDasharray="10, 15" />
                
                {/* Crosshairs for focus targeting */}
                <path d="M 20 20 L 40 20 M 20 20 L 20 40" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                <path d="M 95% 20 L 91% 20 M 95% 20 L 95% 40" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                <path d="M 20 90% L 40 90% M 20 90% L 20 80%" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                <path d="M 95% 90% L 91% 90% M 95% 90% L 95% 80%" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />

                {/* Overlay high-tech coordinate telemetry tags */}
                <text x="180" y="30" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">ORBITER_ALT_SYS: 412.5km</text>
                <text x="50" y="90%" fill="rgba(255,255,255,0.25)" fontSize="7" fontFamily="monospace">CAM_STATUS: ACTIVE [RGB_NIGHT_IR]</text>

                {/* Thermal heat signature hotspots under city clusters */}
                <circle cx="35%" cy="30%" r="60" fill="rgba(239, 68, 68, 0.05)" />
                <circle cx="65%" cy="60%" r="80" fill="rgba(239, 68, 68, 0.03)" />
                <circle cx="45%" cy="50%" r="120" fill="rgba(59, 130, 246, 0.04)" />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Compass Rose graphics inline */}
          <div className="absolute top-24 right-4 pointer-events-none opacity-20 text-white flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-widest font-bold">N</span>
            <div className="w-10 h-10 border border-white/40 rounded-full flex items-center justify-center relative rotate-45 my-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-0.5 h-8 bg-white" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-0.5 w-8 bg-white" />
              </div>
            </div>
          </div>

          {/* Scale Indicator */}
          <div className="absolute bottom-4 left-4 pointer-events-none bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[9px] font-mono text-slate-300">
            METRIC SCALE: 1 UNIT ≈ {mapStyle === "satellite" ? "120m [SWEEP]" : "450m"}
          </div>

          {/* Animated SVG polyline paths between sequential day-by-day activities */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="itineraryRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#f472b6" />
                </linearGradient>
                <style>{`
                  @keyframes tacticalDash {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  .animated-tactical-polyline {
                    stroke-dasharray: 4, 3;
                    animation: tacticalDash 16s linear infinite;
                  }
                `}</style>
              </defs>
              {showChronologicalPath && chronologicalActivities.length > 1 && (
                <polyline
                  points={chronologicalActivities.map(act => `${act.x},${act.y}`).join(" ")}
                  fill="none"
                  stroke="url(#itineraryRouteGradient)"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animated-tactical-polyline drop-shadow-[0_0_4px_rgba(129,140,248,0.6)]"
                />
              )}

              {/* Draw expanded cluster concentric paths connecting map pins inside SVG canvas */}
              {clusters.map((cluster) => {
                if (cluster.pins.length > 1 && expandedClusterIds.includes(cluster.id)) {
                  return cluster.pins.map((pin, idx) => {
                    const coord = getOrbitCoords(cluster.x, cluster.y, idx, cluster.pins.length);
                    return (
                      <line
                        key={`line-${pin.id}`}
                        x1={cluster.x}
                        y1={cluster.y}
                        x2={coord.x}
                        y2={coord.y}
                        stroke={theme.accent}
                        strokeWidth="0.30"
                        strokeDasharray="1.2 1.2"
                        className="opacity-75 animate-pulse"
                      />
                    );
                  });
                }
                return null;
              })}
            </svg>
          </div>

          {/* Floating Waypoint pin markers with proximity clustering */}
          <div className="absolute inset-0">
            {clusters.map((cluster) => {
              const isClusterGroup = cluster.pins.length > 1;
              const isExpanded = expandedClusterIds.includes(cluster.id);

              // 1. If it's a multi-stop cluster and NOT expanded, display the cluster bubble
              if (isClusterGroup && !isExpanded) {
                return (
                  <motion.div
                    key={cluster.id}
                    className="absolute z-25"
                    style={{ left: `${cluster.x}%`, top: `${cluster.y}%` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 240, damping: 20 }}
                  >
                    <motion.button
                      onClick={() => {
                        setExpandedClusterIds((prev) => [...prev, cluster.id]);
                        // Default selection to first nested element
                        if (cluster.pins.length > 0) {
                          setSelectedPinId(cluster.pins[0].id);
                        }
                      }}
                      whileHover={{ 
                        scale: 1.18,
                        boxShadow: `0 0 25px ${theme.accent}`,
                        borderColor: theme.accent,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="relative w-12 h-12 rounded-full cursor-pointer transition-all border-2 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-20 backdrop-blur-md"
                      style={{
                        borderColor: theme.accent,
                        backgroundColor: `${theme.background.includes("bg-[#") ? "#0f111e" : "rgba(10,13,26,0.88)"}`
                      }}
                    >
                      <span className="text-[11px] uppercase tracking-wider font-extrabold leading-none text-white font-sans">
                        {cluster.pins.length}
                      </span>
                      <span className="text-[7px] tracking-tight leading-none text-slate-300 uppercase mt-0.5 font-bold">
                        Stops
                      </span>
                      
                      {/* Expansion hint text badge */}
                      <span className={`absolute -bottom-2.5 bg-slate-900 border text-[6px] tracking-wider font-bold uppercase rounded-md px-1.5 py-0.5 filter-none z-30 transition-all`}
                        style={{
                          borderColor: theme.accent + "50",
                          color: theme.accentLighter || "#fff"
                        }}
                      >
                        Expand
                      </span>

                      {/* Cluster radial outer ring pulse */}
                      <motion.span
                        className="absolute inset-0 rounded-full pointer-events-none"
                        animate={{
                          boxShadow: [
                            `0 0 0px 1px ${theme.accent}33`,
                            `0 0 8px 3px ${theme.accent}66`,
                            `0 0 0px 1px ${theme.accent}33`
                          ]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2.5,
                          ease: "easeInOut"
                        }}
                      />
                    </motion.button>
                  </motion.div>
                );
              }

              // 2. If it is an expanded group, render its center anchor AND individual orbiting pins
              if (isClusterGroup && isExpanded) {
                return (
                  <React.Fragment key={cluster.id}>
                    {/* Tiny Central Anchor with Collapse handle */}
                    <motion.div
                      className="absolute z-35"
                      style={{ left: `${cluster.x}%`, top: `${cluster.y}%`, x: "-50%", y: "-50%" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <button
                        onClick={() => {
                          setExpandedClusterIds((prev) => prev.filter(id => id !== cluster.id));
                        }}
                        className="w-5 h-5 rounded-full bg-slate-950 border border-white/20 flex items-center justify-center shadow-lg hover:border-red-500 hover:text-red-400 text-[10px] text-slate-400 font-bold transition-all hover:scale-110 cursor-pointer"
                        title="Collapse stops back into bubble group"
                      >
                        ×
                      </button>
                    </motion.div>

                    {/* Orbiting individual map pins with premium layout staggered expansion and hover tooltips */}
                    {cluster.pins.map((pin, idx) => {
                      const coord = getOrbitCoords(cluster.x, cluster.y, idx, cluster.pins.length);
                      const isActive = pin.id === selectedPinId;
                      let pinColor = "bg-indigo-600 text-white ring-indigo-400/30";
                      if (pin.type === "accommodation") pinColor = "bg-blue-600 text-white ring-blue-500/20";
                      if (pin.type === "restaurant") pinColor = "bg-emerald-600 text-white ring-emerald-500/20";
                      if (pin.type === "activity") pinColor = "bg-amber-600 text-white ring-amber-500/20";

                      return (
                        <motion.div
                          key={pin.id}
                          className="absolute z-20"
                          style={{ x: "-50%", y: "-50%" }}
                          initial={{ left: `${cluster.x}%`, top: `${cluster.y}%`, scale: 0, opacity: 0 }}
                          animate={{ left: `${coord.x}%`, top: `${coord.y}%`, scale: 1, opacity: 1 }}
                          exit={{ left: `${cluster.x}%`, top: `${cluster.y}%`, scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 180, damping: 14, delay: idx * 0.05 }}
                        >
                          <motion.button
                            onClick={() => setSelectedPinId(pin.id)}
                            onMouseEnter={() => setHoveredPinId(pin.id)}
                            onMouseLeave={() => setHoveredPinId(null)}
                            whileHover={{ 
                              scale: 1.35,
                              boxShadow: `0 0 20px ${theme.accent}`,
                              borderColor: theme.accent,
                              transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.9 }}
                            className={`relative p-2.5 rounded-full cursor-pointer transition-all border-2 ring-4 duration-300 ${pinColor} ${
                              isActive 
                                ? "border-white ring-offset-2 ring-indigo-500/50 scale-125 z-30 shadow-[0_0_20px_rgba(255,255,255,0.73)] animate-pulse" 
                                : "border-slate-800/40 ring-transparent z-10"
                            }`}
                            style={{
                              borderColor: isActive ? theme.accent : "rgba(255, 255, 255, 0.15)",
                              boxShadow: isActive ? `0 0 16px ${theme.accent}, inset 0 1px rgba(255,255,255,0.4)` : `0 4px 10px rgba(0,0,0,0.3)`,
                              backgroundColor: isActive ? "rgba(10,13,26,0.95)" : "rgba(15, 23, 42, 0.75)",
                              color: pin.type === "accommodation" ? "#60a5fa" : pin.type === "restaurant" ? "#34d399" : "#fbbf24"
                            }}
                          >
                            {pin.type === "accommodation" && <Home className="w-3.5 h-3.5" />}
                            {pin.type === "restaurant" && <Utensils className="w-3.5 h-3.5" />}
                            {pin.type === "activity" && <Compass className="w-3.5 h-3.5" />}

                            {/* Active Pulsing radar */}
                            {isActive && (
                              <motion.span 
                                className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-60 pointer-events-none"
                                initial={{ opacity: 0.6, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.8 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                              />
                            )}

                            {/* Dynamic colored theme pulse */}
                            <motion.span
                              className="absolute inset-0 rounded-full pointer-events-none"
                              animate={{
                                boxShadow: isActive 
                                  ? [`0 0 0px ${theme.accent}`, `0 0 15px ${theme.accent}`, `0 0 0px ${theme.accent}`]
                                  : [`0 0 0px rgba(0,0,0,0)`, `0 0 6px ${theme.accent}33`, `0 0 0px rgba(0,0,0,0)`]
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 2.2,
                                ease: "easeInOut"
                              }}
                            />
                          </motion.button>

                          {/* Premium interactive theme-accent glow tooltip */}
                          <AnimatePresence>
                            {(isActive || hoveredPinId === pin.id) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 12, x: "-50%" }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, scale: 0.8, y: 12, x: "-50%" }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-full left-1/2 mb-2.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white border-2 pointer-events-none whitespace-nowrap shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md z-40 flex items-center gap-1.5 animate-none"
                                style={{
                                  backgroundColor: "rgba(10, 13, 26, 0.95)",
                                  borderColor: theme.accent,
                                  boxShadow: `0 0 15px ${theme.accent}40`
                                }}
                              >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
                                <span className="truncate max-w-[130px]">{pin.name}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </React.Fragment>
                );
              }

              // 3. For single isolated pins, just render as usual but with premium theme glowing interaction and tooltip!
              const pin = cluster.pins[0];
              const isActive = pin.id === selectedPinId;
              let pinColor = "bg-indigo-600 text-white ring-indigo-400/30";
              if (pin.type === "accommodation") pinColor = "bg-blue-600 text-white ring-blue-500/20";
              if (pin.type === "restaurant") pinColor = "bg-emerald-600 text-white ring-emerald-500/20";
              if (pin.type === "activity") pinColor = "bg-amber-600 text-white ring-amber-500/20";

              return (
                <motion.div
                  key={pin.id}
                  className="absolute z-20"
                  style={{ left: `${pin.x}%`, top: `${pin.y}%`, x: "-50%", y: "-50%" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <motion.button
                    onClick={() => setSelectedPinId(pin.id)}
                    onMouseEnter={() => setHoveredPinId(pin.id)}
                    onMouseLeave={() => setHoveredPinId(null)}
                    whileHover={{ 
                      scale: 1.35,
                      boxShadow: `0 0 20px ${theme.accent}`,
                      borderColor: theme.accent,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.9 }}
                    className={`relative p-2.5 rounded-full cursor-pointer transition-all border-2 ring-4 duration-300 ${pinColor} ${
                      isActive 
                        ? "border-white ring-offset-2 ring-indigo-500/50 scale-120 z-30 shadow-[0_0_20px_rgba(255,255,255,0.73)]" 
                        : "border-slate-800/40 ring-transparent z-10"
                    }`}
                    style={{
                      borderColor: isActive ? theme.accent : "rgba(255, 255, 255, 0.15)",
                      boxShadow: isActive ? `0 0 16px ${theme.accent}, inset 0 1px rgba(255,255,255,0.4)` : `0 4px 10px rgba(0,0,0,0.3)`,
                      backgroundColor: isActive ? "rgba(10,13,26,0.95)" : "rgba(15, 23, 42, 0.75)",
                      color: pin.type === "accommodation" ? "#60a5fa" : pin.type === "restaurant" ? "#34d399" : "#fbbf24"
                    }}
                  >
                    {pin.type === "accommodation" && <Home className="w-4 h-4" />}
                    {pin.type === "restaurant" && <Utensils className="w-4 h-4" />}
                    {pin.type === "activity" && <Compass className="w-4 h-4" />}

                    {/* Active Pulsing radar effect */}
                    {isActive && (
                      <motion.span 
                        className="absolute inset-0 rounded-full bg-inherit animate-ping opacity-60 pointer-events-none"
                        initial={{ opacity: 0.6, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                      />
                    )}

                    {/* Highly responsive custom theme glowing pulse */}
                    <motion.span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      animate={{
                        boxShadow: isActive 
                          ? [`0 0 0px ${theme.accent}`, `0 0 15px ${theme.accent}`, `0 0 0px ${theme.accent}`]
                          : [`0 0 0px rgba(0,0,0,0)`, `0 0 6px ${theme.accent}33`, `0 0 0px rgba(0,0,0,0)`]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.button>

                  {/* Premium interactive theme-accent glow tooltip */}
                  <AnimatePresence>
                    {(isActive || hoveredPinId === pin.id) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 12, x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.8, y: 12, x: "-50%" }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-full left-1/2 mb-2.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-white border-2 pointer-events-none whitespace-nowrap shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md z-40 flex items-center gap-1.5 animate-none"
                        style={{
                          backgroundColor: "rgba(10, 13, 26, 0.95)",
                          borderColor: theme.accent,
                          boxShadow: `0 0 15px ${theme.accent}40`
                        }}
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: theme.accent }} />
                        <span className="truncate max-w-[130px]">{pin.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Hover highlight preview description card popup bottom right/middle */}
          <AnimatePresence>
            {activeSelectedPin && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-xs bg-slate-950/95 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-white shadow-2xl z-40 space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-bold uppercase">
                      {activeSelectedPin.type === "accommodation" ? "🏨 Accommodations" : activeSelectedPin.type === "restaurant" ? "🍽️ Dinings Menu" : "🎯 Activity highlight"}
                    </span>
                    <span className="text-[10px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded text-white/90">
                      {activeSelectedPin.costInfo}
                    </span>
                  </div>
                  <h4 className="font-sans font-bold text-sm text-white">{activeSelectedPin.name}</h4>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">{activeSelectedPin.subtext}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-4">
                  <span className="text-[9px] text-slate-400 font-mono tracking-wide">
                    Coords: X-{activeSelectedPin.x}% / Y-{activeSelectedPin.y}%
                  </span>
                  
                  {/* Google Maps search deep-link redirect */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeSelectedPin.name + ", " + destination + ", " + country)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all w-fit shrink-0"
                  >
                    <span>Maps Index</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fallback overlay helper if no pins at all or all toggled off */}
          {mapPinsToShow.length === 0 && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-1.5 z-10 p-4">
              <Compass className="w-8 h-8 text-indigo-400 animate-bounce" />
              <p className="text-white text-xs font-semibold">No active map markers on canvas.</p>
              <p className="text-slate-400 text-[10px] max-w-xs font-light">
                {filteredPins.length === 0 
                  ? "Clear your filter queries/search term to display coordinates."
                  : "Toggle categories in the Legend above to restore markers on map."}
              </p>
            </div>
          )}

        </div>

      </div>

    </ThemeCard>
  );
}
