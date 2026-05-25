import React, { useState } from "react";
import { Award, Camera, Plus, Map, BookOpen, Quote, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface TimelineEvent {
  id: string;
  time: string;
  location: string;
  note: string;
  moodIndex: "😊" | "😮" | "❤️" | "😴" | "🚶";
}

interface TravelPassportProps {
  destination: string;
  country: string;
}

export default function TravelPassport({ destination, country }: TravelPassportProps) {
  const { theme } = useAppTheme();
  const [stamps, setStamps] = useState<string[]>([
    "🇯🇵 KYOTO", "🇮🇸 REYKJAVIK", "🇮🇹 ROMA"
  ]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([
    { id: "1", time: "Day 1 09:30 AM", location: "Grand Entryway", note: "Watched the sunrise overlooking the old castle. Stunning quiet light.", moodIndex: "❤️" },
    { id: "2", time: "Day 2 02:15 PM", location: "Traditional Bistro", note: "Discovered a cozy local shop down a narrow alley. Extraordinary traditional soup.", moodIndex: "😊" }
  ]);
  const [newNote, setNewNote] = useState("");
  const [newLoc, setNewLoc] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newMood, setNewMood] = useState<TimelineEvent["moodIndex"]>("😊");

  // Simple simulated stamp for CURRENT destination
  const hasCurrentStamp = stamps.includes(`${country.substring(0, 2).toUpperCase()} ${destination.toUpperCase()}`);

  const handleClaimStamp = () => {
    const stampText = `${country.substring(0, 2).toUpperCase()} ${destination.toUpperCase()}`;
    if (stamps.includes(stampText)) return;
    setStamps([...stamps, stampText]);
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !newLoc.trim()) return;
    const event: TimelineEvent = {
      id: Date.now().toString(),
      time: newTime || "Day 1 12:00 PM",
      location: newLoc,
      note: newNote,
      moodIndex: newMood
    };
    setTimeline([event, ...timeline]);
    setNewNote("");
    setNewLoc("");
    setNewTime("");
  };

  const achievements = [
    { name: "Pioneer Trailblazer", desc: "First generated Custom AI Dossier", icon: Trophy, unlocked: true },
    { name: "Culture Seeker", desc: "Practiced 6 local language pronunciations", icon: Award, unlocked: stamps.length >= 1 },
    { name: "Safety General", desc: "Secured emergency contact lines in offline storage", icon: Trophy, unlocked: stamps.length >= 3 },
    { name: "Eco Guardian", desc: "Achieved sustainable travel score above 75", icon: Sparkles, unlocked: true }
  ];

  return (
    <ThemeCard className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
      
      {/* Visual Stamps & Certifications */}
      <div className="lg:col-span-5 space-y-5">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: theme.accentLighter }} />
          <h3 className="text-xs font-bold font-mono tracking-widest text-white opacity-80 uppercase">Digital Passport Stamps</h3>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {stamps.map((stamp, idx) => (
            <motion.div
              key={stamp}
              whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 3 : -3 }}
              className="aspect-square border border-dashed rounded-full flex flex-col items-center justify-center p-3 relative shadow-md group overflow-hidden cursor-pointer liquid-glass"
              style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}05` }}
            >
              <div className="absolute inset-0 transition-all opacity-0 group-hover:opacity-10" style={{ backgroundColor: theme.accent }} />
              <div className="w-16 h-16 border rounded-full flex flex-col items-center justify-center border-dashed relative z-10 text-center" style={{ borderColor: `${theme.accent}40` }}>
                <span className="text-[14px] leading-none mb-1">✈️</span>
                <span className="text-[9px] font-mono font-black leading-none tracking-widest uppercase block max-w-full truncate" style={{ color: theme.accentLighter }}>{stamp}</span>
                <span className="text-[7px] font-mono opacity-50 mt-1 uppercase text-white">UNLOCKED</span>
              </div>
            </motion.div>
          ))}

          {/* Claim Current stamp button if not registered */}
          {!hasCurrentStamp && (
            <motion.button
              onClick={handleClaimStamp}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="aspect-square border border-dashed rounded-full flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all group liquid-glass"
              style={{ borderColor: theme.accent, backgroundColor: `${theme.accent}15` }}
            >
              <span className="text-lg animate-bounce duration-1000">📥</span>
              <span className="text-[9px] font-mono font-black uppercase tracking-widest mt-1 group-hover:text-white transition-all shadow-[0_0_10px_currentColor]" style={{ color: theme.accentLighter }}>Claim Stamp</span>
              <span className="text-[8px] opacity-60 text-white font-sans mt-0.5 max-w-[80px] leading-tight block">{destination}</span>
            </motion.button>
          )}
        </div>

        {/* Travel Achievements progress */}
        <div className="p-4 rounded-2xl space-y-3 mt-6 border liquid-glass" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white opacity-80 font-bold flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> achievements
            </span>
            <span className="text-[9px] font-mono opacity-60 text-white">
              {achievements.filter(a => a.unlocked).length} / {achievements.length}
            </span>
          </div>
          <div className="space-y-2">
            {achievements.map((item) => (
              <div key={item.name} className="flex items-start gap-2.5 p-2 rounded-xl border liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                <item.icon className={`w-4 h-4 shrink-0 mt-0.5 ${item.unlocked ? "text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-white opacity-30"}`} />
                <div className="min-w-0">
                  <h4 className={`text-[11px] font-bold ${item.unlocked ? "text-white opacity-90" : "text-white opacity-50"}`}>{item.name}</h4>
                  <p className="text-[9px] text-white opacity-60 truncate leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memory Timeline & Journaling */}
      <div className="lg:col-span-7 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold font-mono tracking-widest uppercase opacity-80 text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4" style={{ color: theme.accentLighter }} /> memory timeline & notes
            </h4>
            <span className="text-[9px] font-mono opacity-60 text-white">chronological memories</span>
          </div>

          {/* Quick timeline form */}
          <form onSubmit={handleAddTimeline} className="space-y-2.5 p-3.5 border rounded-2xl liquid-glass" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="Day / Time (e.g. Day 1 2:30 PM)"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="text-[11px] px-2.5 py-1.5 border rounded-lg text-white outline-none focus:ring-1 font-mono liquid-glass"
                style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
              />
              <input
                type="text"
                required
                placeholder="Location / Spot"
                value={newLoc}
                onChange={(e) => setNewLoc(e.target.value)}
                className="text-[11px] px-2.5 py-1.5 border rounded-lg text-white outline-none focus:ring-1 font-sans liquid-glass"
                 style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
              />
            </div>
            
            <textarea
              required
              rows={2}
              placeholder="Record a journal entry, sensory note or local memory..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full text-xs p-2.5 border rounded-lg text-white outline-none focus:ring-1 leading-snug font-sans resize-none liquid-glass scrollbar-thin"
              style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
            />

            <div className="flex justify-between items-center pt-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-white opacity-70 font-mono">Current Mood:</span>
                <div className="flex items-center gap-1 p-1 rounded-md border liquid-glass" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}>
                  {(["😊", "😮", "❤️", "😴", "🚶"] as TimelineEvent["moodIndex"][]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setNewMood(m)}
                      className={`w-5 h-5 flex items-center justify-center text-xs rounded transition-all cursor-pointer ${
                        newMood === m ? "scale-110 shadow-[0_0_10px_currentColor]" : "opacity-50 hover:opacity-100"
                      }`}
                      style={newMood === m ? { backgroundColor: theme.accent } : {}}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 text-white rounded-lg text-[11px] font-bold font-mono tracking-wider uppercase flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02] liquid-glass shadow-md"
                style={{ backgroundColor: theme.accent }}
              >
                <Plus className="w-3.5 h-3.5" /> Log memory
              </button>
            </div>
          </form>

          {/* Sequential Timeline List */}
          <div className="space-y-4 pl-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] max-h-[220px] overflow-y-auto pr-1 mt-4 scrollbar-thin" style={{ WebkitTextFillColor: 'inherit' }}>
             <div className="absolute left-[11px] top-2 bottom-2 w-[1px]" style={{ backgroundColor: `${theme.accent}40` }} />
            <AnimatePresence>
              {timeline.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="relative pl-7 space-y-1 group"
                >
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full border flex items-center justify-center text-xs relative z-10 font-mono shadow-sm group-hover:scale-110 transition-transform liquid-glass"
                       style={{ borderColor: theme.accentLighter, backgroundColor: `${theme.accent}30` }}>
                    {event.moodIndex}
                  </div>
                  
                  <div className="border rounded-xl p-3 transition-all hover:scale-[1.01] liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                    <div className="flex justify-between items-center text-[10px] font-mono opacity-70 text-white mb-1">
                      <span className="font-bold">{event.time}</span>
                      <span>@{event.location}</span>
                    </div>
                    <p className="text-xs text-white opacity-90 font-sans leading-relaxed">{event.note}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

    </ThemeCard>
  );
}
