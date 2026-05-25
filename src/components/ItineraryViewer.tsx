import React, { useState } from "react";
import { Compass, Clock, MapPin, Sparkles, ChevronDown, ChevronUp, Landmark, Route } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ItineraryDay } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface ItineraryViewerProps {
  itineraryDays: ItineraryDay[];
  showChronologicalPath?: boolean;
  onToggleChronologicalPath?: () => void;
}

export default function ItineraryViewer({
  itineraryDays,
  showChronologicalPath = false,
  onToggleChronologicalPath,
}: ItineraryViewerProps) {
  const [activeDayIdx, setActiveDayIdx] = useState<number>(0);
  const { theme } = useAppTheme();

  return (
    <ThemeCard id="itinerary-detail-view" className="p-6 space-y-6 liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}15` }}>
      
      {/* Header and Day Selector */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b pb-5" style={{ borderColor: `${theme.accent}20` }}>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
            Chronological Engine
          </span>
          <h3 className="font-sans font-semibold text-lg text-white flex items-center gap-2">
            <Compass className="w-5 h-5" style={{ color: theme.accentLighter }} />
            Day-by-Day Travel Itinerary
          </h3>
          <p className="text-xs text-white opacity-60 font-sans">
            Carefully paced travel plan covering the must-see spots, sights, and hidden gems.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Day selection buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {itineraryDays.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayIdx(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold font-sans transition-all shrink-0 border cursor-pointer liquid-glass ${
                  activeDayIdx === idx
                    ? "text-white"
                    : "text-white opacity-60 hover:opacity-100 border-white/10"
                }`}
                style={activeDayIdx === idx ? { 
                  borderColor: theme.accentLighter, 
                  boxShadow: `0 0 15px ${theme.accent}30`,
                  backgroundColor: `${theme.accent}25`
                } : { backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {onToggleChronologicalPath && (
            <button
              onClick={onToggleChronologicalPath}
              className={`px-4 py-2 rounded-2xl text-[10px] font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer shrink-0 liquid-glass hover:scale-105 shadow-md ${
                showChronologicalPath
                  ? "text-white"
                  : "text-white opacity-80"
              }`}
              style={{
                borderColor: showChronologicalPath ? theme.accentLighter : `${theme.accent}30`,
                backgroundColor: showChronologicalPath ? `${theme.accent}40` : `${theme.accent}10`,
                boxShadow: showChronologicalPath ? `0 0 20px ${theme.accent}50` : undefined,
              }}
            >
              <Route className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: showChronologicalPath ? "#fff" : theme.accentLighter, animation: showChronologicalPath ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none' }} />
              {showChronologicalPath ? "🔌 Drawing Active" : "✍️ Draw Route Path"}
            </button>
          )}
        </div>
      </div>

      {/* Main active day renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDayIdx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Day Title & Summary banner */}
          <div className="p-4 border rounded-2xl flex items-center gap-3 liquid-glass" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
            <div className="p-2.5 border rounded-xl font-mono font-bold text-xs liquid-glass shadow-md" style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}30`, borderColor: `${theme.accent}50` }}>
              Day {itineraryDays[activeDayIdx].dayNumber}
            </div>
            <div>
              <h4 className="font-sans font-semibold text-white opacity-90 text-sm">
                {itineraryDays[activeDayIdx].title}
              </h4>
              <p className="text-[11px] text-white opacity-60 font-sans mt-0.5">
                A gorgeous selection of local activities structured to maximize enjoyment and pacing.
              </p>
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-[1.5px]" style={{ WebkitTextFillColor: 'inherit' }}>
            <div className="absolute left-3.5 top-3 bottom-3 w-[1.5px]" style={{ backgroundColor: `${theme.accent}30` }} />
            {itineraryDays[activeDayIdx].activities.map((activity, actIdx) => (
              <div key={actIdx} className="flex gap-4 relative">
                {/* Timeline node */}
                <div className="w-7 h-7 border rounded-full flex items-center justify-center shrink-0 z-10 text-[10px] font-mono font-semibold text-white liquid-glass shadow-[0_0_8px_currentColor]" style={{ backgroundColor: `${theme.accent}30`, borderColor: theme.accentLighter, color: theme.accentLighter }}>
                  {actIdx + 1}
                </div>

                {/* Activity Detail Card */}
                <div className="flex-1 border rounded-2xl p-4 space-y-2 transition-all hover:scale-[1.01] liquid-glass drop-shadow-md" style={{ backgroundColor: `${theme.accent}08`, borderColor: `${theme.accent}20` }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" style={{ color: theme.accentLighter }} />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{ color: theme.accentLighter }}>
                        {activity.time}
                      </span>
                    </div>

                    {activity.estimatedCost && (
                      <span className="text-[10px] font-mono font-bold border px-2.5 py-0.5 rounded-md liquid-glass text-emerald-400" style={{ backgroundColor: "rgba(52,211,153,0.15)", borderColor: "rgba(52,211,153,0.3)" }}>
                        Est: {activity.estimatedCost}
                      </span>
                    )}
                  </div>

                  <h5 className="font-sans font-semibold text-white opacity-95 text-sm">
                    {activity.title}
                  </h5>

                  <p className="text-xs text-white opacity-70 leading-relaxed font-sans font-light">
                    {activity.description}
                  </p>

                  {/* Human-like Tactical Details Badge Matrix */}
                  {(activity.idealHour || activity.crowdLevel || activity.fatigueLevel || activity.walkingDistance || activity.transportOption) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activity.idealHour && (
                        <span className="px-2 py-0.5 border rounded-lg font-mono text-[9px] leading-none flex items-center gap-1 liquid-glass" style={{ backgroundColor: `${theme.accent}20`, borderColor: `${theme.accent}40`, color: theme.accentLighter }}>
                          ⏱️ {activity.idealHour}
                        </span>
                      )}
                      {activity.crowdLevel && (
                        <span className="px-2 py-0.5 border rounded-lg text-[9px] leading-none flex items-center gap-1 liquid-glass text-amber-300" style={{ backgroundColor: "rgba(251,191,36,0.15)", borderColor: "rgba(251,191,36,0.3)" }}>
                          👥 {activity.crowdLevel} Crowds
                        </span>
                      )}
                      {activity.fatigueLevel && (
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] leading-none flex items-center gap-1 liquid-glass ${
                          activity.fatigueLevel === "High" ? "text-rose-400" :
                          activity.fatigueLevel === "Moderate" ? "text-orange-400" :
                          "text-emerald-400"
                        }`} style={{
                          backgroundColor: activity.fatigueLevel === "High" ? "rgba(251,113,133,0.15)" : activity.fatigueLevel === "Moderate" ? "rgba(251,146,60,0.15)" : "rgba(52,211,153,0.15)",
                          borderColor: activity.fatigueLevel === "High" ? "rgba(251,113,133,0.3)" : activity.fatigueLevel === "Moderate" ? "rgba(251,146,60,0.3)" : "rgba(52,211,153,0.3)"
                        }}>
                          🏃 Fatigue: {activity.fatigueLevel}
                        </span>
                      )}
                      {activity.walkingDistance && (
                        <span className="px-2 py-0.5 border rounded-lg font-mono text-[9px] leading-none flex items-center gap-1 liquid-glass text-white opacity-80" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
                          🚶 {activity.walkingDistance}
                        </span>
                      )}
                      {activity.transportOption && (
                        <span className="px-2 py-0.5 border rounded-lg text-[9px] leading-none flex items-center gap-1 liquid-glass text-blue-300" style={{ backgroundColor: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.3)" }}>
                          🚇 {activity.transportOption}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Contextual Tips and Secret Attractions box */}
                  {(activity.localTips || activity.photographySpot || activity.nearbyRestSpot || activity.hiddenAttraction) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5 pt-2.5 p-3 rounded-2xl border liquid-glass" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}>
                      {activity.localTips && (
                        <div className="text-[10px] text-white opacity-70 leading-snug">
                          <strong className="text-white opacity-90">💡 Local Tip:</strong> {activity.localTips}
                        </div>
                      )}
                      {activity.photographySpot && (
                        <div className="text-[10px] text-white opacity-70 leading-snug">
                          <strong className="text-white opacity-90">📷 Photo Spot:</strong> {activity.photographySpot}
                        </div>
                      )}
                      {activity.nearbyRestSpot && (
                        <div className="text-[10px] text-white opacity-70 leading-snug">
                          <strong className="text-white opacity-90">☕ Café / Rest:</strong> {activity.nearbyRestSpot}
                        </div>
                      )}
                      {activity.hiddenAttraction && (
                        <div className="text-[10px] leading-snug" style={{ color: theme.accentLighter }}>
                          <strong className="font-bold opacity-100" style={{ color: theme.accent }}>🔮 Secret Gem:</strong> {activity.hiddenAttraction}
                        </div>
                      )}
                    </div>
                  )}

                  {activity.location && (
                    <div className="flex items-center gap-1.5 text-[10px] text-white opacity-60 font-mono pt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Basic local recommendation help tip */}
      <div className="text-[11px] text-white opacity-60 leading-snug pt-3 border-t font-light flex items-center gap-1.5" style={{ borderColor: `${theme.accent}20` }}>
        <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accentLighter }} />
        <span><strong className="text-white opacity-90">Pro Tip:</strong> Click the lodging, dining, or chemist directions above to preview geographical review stats ahead of time!</span>
      </div>

    </ThemeCard>
  );
}
