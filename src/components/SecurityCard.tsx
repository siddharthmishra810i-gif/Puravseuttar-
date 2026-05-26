import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, ShieldAlert, Phone, MapPin, BadgeAlert, Coins, Sparkles, Building2, AlertTriangle, HelpCircle, Check } from "lucide-react";
import { motion } from "motion/react";
import { SecurityIndex, EmergencyContacts } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface SecurityCardProps {
  securityIndex: SecurityIndex;
  emergencyContacts: EmergencyContacts;
  destination: string;
  scamAlerts?: { title: string; description: string; severity: string }[];
  womenSafety?: { safeDistricts: string[]; dangerousDistricts: string[]; verifiedTips: string[]; emergencyHelpline: string };
}

export default function SecurityCard({ 
  securityIndex, 
  emergencyContacts, 
  destination,
  scamAlerts = [],
  womenSafety
}: SecurityCardProps) {
  const { theme } = useAppTheme();
  const isSafe = securityIndex.score.toLowerCase().includes("safe") || 
                 (parseInt(securityIndex.score.match(/\d+/)?.[0] || "100") > 70);

  // STORAGE KEYS
  const situStorageKey = useMemo(() => {
    return `situ_reg_v2_${(destination || "default").toLowerCase().replace(/\s+/g, "_")}`;
  }, [destination]);

  const lawsStorageKey = useMemo(() => {
    return `local_laws_v2_${(destination || "default").toLowerCase().replace(/\s+/g, "_")}`;
  }, [destination]);

  // STATES
  const [regForm, setRegForm] = useState({
    fullName: "",
    passportNum: "",
    localHotel: "",
    emergencyContact: ""
  });

  interface SituReg {
    fullName: string;
    passportNum: string;
    localHotel: string;
    emergencyContact: string;
    registeredAt: string;
    lastCheckIn: string;
  }

  const [situRegistration, setSituRegistration] = useState<SituReg | null>(null);
  const [acknowledgedLaws, setAcknowledgedLaws] = useState<Record<string, boolean>>({});

  // LOAD STATE ON MOUNT
  useEffect(() => {
    if (situStorageKey) {
      const saved = localStorage.getItem(situStorageKey);
      if (saved) {
        try { setSituRegistration(JSON.parse(saved)); } catch (e) { console.error(e); }
      } else {
        setSituRegistration(null);
      }
    }
  }, [situStorageKey]);

  useEffect(() => {
    if (lawsStorageKey) {
      const saved = localStorage.getItem(lawsStorageKey);
      if (saved) {
        try { setAcknowledgedLaws(JSON.parse(saved)); } catch (e) { console.error(e); }
      } else {
        setAcknowledgedLaws({});
      }
    }
  }, [lawsStorageKey]);

  // LAWS LIST BY DESTINATION
  const localLawsList = useMemo(() => {
    const dest = (destination || "").toLowerCase();
    
    const standardLaws = [
      { id: "law_passport", title: "Carry physical passport or original government ID credentials at all times", fine: "Penalty: Consular check / detainment custody risk" },
      { id: "law_dress", title: "Observe conservative clothing codes in religious baseline landmarks", fine: "Fine: Denied entrance to site premises" },
      { id: "law_drone", title: "Avoid operating drones near municipal structures without explicit local flyers permit", fine: "Rule: Equipment impoundment & civil ticket" },
      { id: "law_litter", title: "Do not throw waste on pavements (use color separation repositories)", fine: "Fine: $150 immediate sanitation penalty" }
    ];

    if (dest.includes("kyoto") || dest.includes("japan") || dest.includes("tokyo")) {
      return [
        { id: "jp_gion", title: "Never record pictures/videos on private lanes in historic Gion district", fine: "Fine: ¥10,000 regulatory caution fee" },
        { id: "jp_eat", title: "Avoid eating, drinking, or smoking cigarettes while walking on public streets", fine: "Rule: Highly offensive conduct warning" },
        { id: "jp_train", title: "Engage 'Manner Mode' (silent mode) on mobiles inside trains/metro trains", fine: "Etiquette: Train corridor quietness rules" },
        { id: "jp_trash", title: "Pack and carry home personal recycling waste (public bins do not exist)", fine: "Rule: Environmental circular waste compliance" }
      ];
    }

    if (dest.includes("singapore")) {
      return [
        { id: "sg_gum", title: "Never purchase, import, or use chewing gums outside of medical prescriptions", fine: "Fine: Up to S$1,000 civil charge" },
        { id: "sg_litter", title: "Spitting, littering, or smoking under corridors is extremely illegal", fine: "Fine: S$1,000 immediate custom ticket" },
        { id: "sg_walk", title: "Strictly cross at zebra grids (jaywalking triggers immediate charges)", fine: "Fine: S$200 first offense spot charge" },
        { id: "sg_wifi", title: "Never connect to unregistered, open commercial local hot-spot networks", fine: "Fine: Classified under malicious cyber-breach acts" }
      ];
    }

    if (dest.includes("roma") || dest.includes("italy")) {
      return [
        { id: "it_picnic", title: "Do not carry open picnics, eat, or sit on classical historic marble steps", fine: "Fine: €250 municipal monuments preservation fee" },
        { id: "it_tickets", title: "Validate physical paper travel cards before stepping inside trains or metro routes", fine: "Fine: €50 immediate inspector controller bill" },
        { id: "it_dress", title: "Keep raw shoulders, torso, and knees covered inside holy basilic churches", fine: "Rule: Enforced deny of transit entrance" },
        { id: "it_fountain", title: "Do not dip feet or swim inside public historic fountains (e.g. Fontana di Trevi)", fine: "Fine: Highly critical €500 ticket" }
      ];
    }

    if (dest.includes("iceland") || dest.includes("reykjavik")) {
      return [
        { id: "is_drive", title: "Never drive off-road or steer onto non-designated volcanic ash paths", fine: "Fine: Heavy volcanic ecosystem degradation fee (Up to S$5,000)" },
        { id: "is_lights", title: "Engage automobile headlights 24 hours constant (even at bright noon)", fine: "Rule: Mandatory high-hazard road security protocol" },
        { id: "is_thermal", title: "Take a thorough hot shower naked with soap prior to taking hot thermal pool baths", fine: "Rule: Strict volcanic hot spring sanitization rules" },
        { id: "is_water", title: "Drink directly from the pure cold kitchen taps (do not waste funds on bottled water)", fine: "Advice: Eco sustainability directive" }
      ];
    }

    return standardLaws;
  }, [destination]);

  // EVENT HANDLERS
  const handleRegisterDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.passportNum) return;
    
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const registrationDetails: SituReg = {
      ...regForm,
      registeredAt: nowStr,
      lastCheckIn: `Registered successfully at ${nowStr}`
    };

    setSituRegistration(registrationDetails);
    localStorage.setItem(situStorageKey, JSON.stringify(registrationDetails));
    
    // Clear form
    setRegForm({
      fullName: "",
      passportNum: "",
      localHotel: "",
      emergencyContact: ""
    });
  };

  const handlePingStatus = () => {
    if (!situRegistration) return;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updated = {
      ...situRegistration,
      lastCheckIn: `Safety confirmed at ${nowStr}`
    };
    setSituRegistration(updated);
    localStorage.setItem(situStorageKey, JSON.stringify(updated));
  };

  const handleDeleteRegistration = () => {
    setSituRegistration(null);
    localStorage.removeItem(situStorageKey);
  };

  const toggleLawAcknowledgement = (id: string) => {
    const updated = {
      ...acknowledgedLaws,
      [id]: !acknowledgedLaws[id]
    };
    setAcknowledgedLaws(updated);
    localStorage.setItem(lawsStorageKey, JSON.stringify(updated));
  };

  const complianceCount = useMemo(() => {
    return localLawsList.filter(law => !!acknowledgedLaws[law.id]).length;
  }, [localLawsList, acknowledgedLaws]);

  return (
    <div id="security-analysis-section" className={`space-y-6 w-full ${theme.fontBody}`}>
      
      {/* Top row: General Safety index */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
        
        {/* Safety Score and Context concerns */}
        <div className="md:col-span-7">
          <ThemeCard className="p-6 space-y-5 h-full liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
                  Situational Registry
                </span>
                <h3 className="font-sans font-semibold text-lg text-white flex items-center gap-2">
                  {isSafe ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                  )}
                  Safety & Situational Index
                </h3>
                <p className="text-xs opacity-70 text-white leading-normal">Live synthesized safety parameters, warning logs, and security recommendations</p>
              </div>

              <div className="text-right">
                <span className={`inline-block text-xs font-semibold font-mono tracking-wider uppercase px-3 py-1.5 rounded-2xl border liquid-glass text-white ${
                  isSafe 
                    ? "shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                    : "shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                }`} style={{ backgroundColor: isSafe ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.15)", borderColor: isSafe ? "rgba(52,211,153,0.3)" : "rgba(251,191,36,0.3)" }}>
                  {securityIndex.score}
                </span>
              </div>
            </div>

            {/* Dynamic Security Concerns */}
            <div className="space-y-3">
              <h4 className="font-sans font-medium text-white opacity-90 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Active Warning Logs & Concerns
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {securityIndex.concerns.map((concern, idx) => (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-2xl text-xs text-white opacity-90 flex items-start gap-2.5 liquid-glass"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)] shrink-0 mt-1" />
                    <span>{concern}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Safety Actions & Guidance */}
            <div className="space-y-3 pt-2">
              <h4 className="font-sans font-medium text-white opacity-90 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Precautions & Safety Protocols
              </h4>
              <ul className="space-y-2">
                {securityIndex.safetyTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-white opacity-80 flex items-start gap-2 leading-relaxed">
                    <span className="font-mono text-emerald-400 font-bold">0{idx + 1}.</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ThemeCard>
        </div>

        {/* Emergency Helpline Connections */}
        <div className="md:col-span-5 col-span-1">
          <ThemeCard className="p-6 flex flex-col justify-between h-full liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
                  Local Registry
                </span>
                <h3 className="font-sans font-semibold text-lg text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)] animate-pulse" />
                  Emergency Dial Center
                </h3>
                <p className="text-xs text-white opacity-70">Essential rescue and local dispatch channels live link ready</p>
              </div>

              <div className="divide-y divide-white/10">
                {/* Police */}
                <div className="py-3 flex items-center justify-between gap-4 first:pt-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 border rounded-xl liquid-glass bg-rose-950/30 border-rose-900/40 text-rose-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Police Department</h4>
                      <p className="text-[9px] text-white opacity-60 font-mono">Emergency Police Dispatch</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${emergencyContacts.police}`}
                    className="text-xs font-mono font-bold text-rose-300 px-3 py-1.5 rounded-xl border transition-all liquid-glass hover:scale-105 shadow-[0_0_10px_rgba(225,29,72,0.1)] bg-rose-950/40 border-rose-900/30"
                  >
                    {emergencyContacts.police}
                  </a>
                </div>

                {/* Ambulance */}
                <div className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 border rounded-xl liquid-glass bg-teal-950/30 border-teal-900/40 text-teal-300">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Ambulance Service</h4>
                      <p className="text-[9px] text-white opacity-60 font-mono">Immediate Medical Aid</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${emergencyContacts.ambulance}`}
                    className="text-xs font-mono font-bold text-teal-300 px-3 py-1.5 rounded-xl border transition-all liquid-glass hover:scale-105 shadow-[0_0_10px_rgba(20,184,166,0.1)] bg-teal-950/40 border-teal-900/30"
                  >
                    {emergencyContacts.ambulance}
                  </a>
                </div>

                {/* Fire */}
                {emergencyContacts.fireDept && (
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 border rounded-xl liquid-glass bg-orange-950/30 border-orange-900/40 text-orange-300">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white">Fire Rescue</h4>
                        <p className="text-[9px] text-white opacity-60 font-mono">Fire Hydrant Response</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${emergencyContacts.fireDept}`}
                      className="text-xs font-mono font-bold text-orange-300 px-3 py-1.5 rounded-xl border transition-all liquid-glass hover:scale-105 shadow-[0_0_10px_rgba(249,115,22,0.1)] bg-orange-950/40 border-orange-900/30"
                    >
                      {emergencyContacts.fireDept}
                    </a>
                  </div>
                )}
              </div>

              {/* Embassy & Travel Advice Details */}
              <div className="p-3.5 border rounded-2xl space-y-2 liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                <span className="text-[10px] font-semibold font-mono uppercase tracking-wide flex items-center gap-1 text-white opacity-80">
                  <Building2 className="w-3.5 h-3.5" style={{ color: theme.accentLighter }} />
                  Consular & Embassy Protocols
                </span>
                <p className="text-xs text-white opacity-70 leading-relaxed font-sans font-light">
                  {emergencyContacts.embassyInfo}
                </p>
              </div>
            </div>
          </ThemeCard>
        </div>
      </div>

      {/* Advanced safety panels row (Scams & Women safety mode) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scam alerts warnings console */}
        <ThemeCard className="p-6 space-y-4 liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-white opacity-90 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> SCAM & FRAUD RADAR
            </h4>
            <span className="text-[9px] font-mono text-white opacity-60">Color-coded warning matrix</span>
          </div>

          <div className="space-y-3">
            {scamAlerts.length > 0 ? (
              scamAlerts.map((scam, i) => {
                const severeColor = scam.severity === "high" 
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-200"
                  : scam.severity === "medium"
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-200"
                    : "bg-blue-500/15 border-blue-500/30 text-blue-200";
                return (
                  <div key={i} className={`p-3 border rounded-xl space-y-1 liquid-glass ${severeColor}`}>
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono font-black">
                      <span className="flex items-center gap-1">⚠️ {scam.title}</span>
                      <span className="px-1.5 py-0.5 bg-black/40 rounded border border-white/10">{scam.severity} RISK</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{scam.description}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-8 rounded-xl border text-center text-white opacity-60 text-xs font-mono liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                No acute scams reported for this sector. Always cross-examine local transport taxi rates.
              </div>
            )}
          </div>
        </ThemeCard>

        {/* Women safety Mode panel */}
        {womenSafety ? (
          <ThemeCard className="p-6 space-y-4 relative overflow-hidden liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-pink-400 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(244,114,182,0.3)]">
                <Sparkles className="w-4.5 h-4.5 text-pink-400" /> WOMEN SAFETY ASSISTANT ACTIVE
              </h4>
              <span className="text-[9px] font-mono text-white opacity-60 uppercase">Verified districts log</span>
            </div>

            <div className="space-y-3.5 relative z-10">
              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="p-3 rounded-xl space-y-1 border liquid-glass bg-emerald-950/20 border-emerald-900/30">
                  <span className="font-bold text-emerald-400 block text-[10px] font-mono uppercase tracking-wider drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">Safe Neighborhoods</span>
                  <ul className="text-[11px] text-white opacity-90 space-y-0.5 list-disc pl-3">
                    {womenSafety.safeDistricts.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>

                <div className="p-3 rounded-xl space-y-1 border liquid-glass bg-rose-950/20 border-rose-900/30">
                  <span className="font-bold text-rose-400 block text-[10px] font-mono uppercase tracking-wider drop-shadow-[0_0_5px_rgba(251,113,133,0.4)]">Exercise High Caution</span>
                  <ul className="text-[11px] text-white opacity-90 space-y-0.5 list-disc pl-3">
                    {(womenSafety.dangerousDistricts || []).map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>

              <div className="p-3 border rounded-xl liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                <span className="block text-[9px] font-mono uppercase tracking-widest text-pink-400 mb-1">Accommodation & Transport Tips</span>
                <ul className="text-xs text-white opacity-90 space-y-1 pl-3 list-decimal leading-relaxed">
                  {womenSafety.verifiedTips.map((tip, i) => <li key={i}>{tip}</li>)}
                </ul>
              </div>

              <div className="p-3 rounded-xl flex items-center justify-between border liquid-glass bg-pink-950/20 border-pink-900/30">
                <div>
                  <span className="text-[9px] font-mono uppercase text-pink-400 block font-bold">Women Helpline</span>
                  <span className="text-xs text-white opacity-80 font-sans leading-none">Emergency dedicated rescue & dispatch</span>
                </div>
                <a
                  href={`tel:${womenSafety.emergencyHelpline}`}
                  className="px-3.5 py-1.5 text-white rounded-xl text-xs font-mono font-bold shadow-md transition-all hover:scale-105 border liquid-glass bg-pink-600/60 hover:bg-pink-500/80 border-pink-500/50 shadow-[0_0_15px_rgba(219,39,119,0.3)]"
                >
                  📞 {womenSafety.emergencyHelpline}
                </a>
              </div>
            </div>
          </ThemeCard>
        ) : (
          <ThemeCard className="p-6 flex flex-col justify-center items-center text-center text-white opacity-60 text-xs font-mono liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}15` }}>
            <HelpCircle className="w-8 h-8 text-white opacity-30 mb-2" />
            <span>Generate an advanced travel plan to populate the female security indicators console.</span>
          </ThemeCard>
        )}
      </div>

      {/* Interactive Local Regulations & Situational Registry row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
        
        {/* CARD 1: Interactive Situational Passport Registry (Situ Register) */}
        <div>
          <ThemeCard className="p-6 space-y-4 h-full liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
                  Embassy Liaison
                </span>
                <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-white opacity-90 flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5" style={{ color: theme.accentLighter }} /> SITUATIONAL REGISTRY
                </h4>
              </div>
              <span className="text-[9px] font-mono text-white opacity-60">Consular Emergency Log</span>
            </div>

            {/* Form and info */}
            {situRegistration ? (
              <div className="p-4 border rounded-2xl space-y-3.5 relative overflow-hidden liquid-glass" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: theme.accent, opacity: 0.2 }} />
                
                <div className="flex items-center justify-between relative z-10">
                  <span className="px-2 py-1 border text-[9px] font-mono leading-none font-bold uppercase rounded-md flex items-center gap-1 liquid-glass" style={{ color: theme.accentLighter, borderColor: `${theme.accent}50`, backgroundColor: `${theme.accent}20` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.accentLighter }} /> Registered & Active
                  </span>
                  <span className="text-[8px] font-mono text-white opacity-60">ID: SEC-REG-{destination.substring(0,3).toUpperCase()}-{(parseInt(situRegistration.passportNum?.replace(/\D/g, "") || "4281") % 10000)}</span>
                </div>

                <div className="space-y-2 text-xs font-sans relative z-10">
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white opacity-70">Traveler Name:</span>
                    <span className="font-bold text-white opacity-90">{situRegistration.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white opacity-70">Document / ID:</span>
                    <span className="font-mono text-white opacity-90">•••• ••• {situRegistration.passportNum?.slice(-4) || "8821"}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white opacity-70">Local stay/Hotel:</span>
                    <span className="text-white opacity-90 truncate max-w-[180px]">{situRegistration.localHotel}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5">
                    <span className="text-white opacity-70">Emergency Contact:</span>
                    <span className="text-white opacity-90 font-mono">{situRegistration.emergencyContact || "Embassy Line"}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-white opacity-80 pt-1">
                    <span>Last check status:</span>
                    <span className="font-mono font-medium" style={{ color: theme.accentLighter }}>{situRegistration.lastCheckIn || "Registered successfully"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1.5 relative z-10">
                  <button
                    type="button"
                    onClick={handlePingStatus}
                    className="py-1.5 px-3 text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 border cursor-pointer hover:scale-[1.02] liquid-glass shadow-md"
                    style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}30`, borderColor: `${theme.accent}50` }}
                  >
                    📍 Send Safety Ping
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteRegistration}
                    className="py-1.5 px-2.5 text-[10px] font-bold font-mono uppercase rounded-xl transition-all border cursor-pointer text-center hover:scale-[1.02] liquid-glass"
                    style={{ color: "rgba(251,113,133)", backgroundColor: "rgba(225,29,72,0.15)", borderColor: "rgba(225,29,72,0.3)" }}
                  >
                    De-register
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterDetails} className="space-y-4 border p-4.5 rounded-2xl relative font-sans liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
                <span className="block text-[9px] font-mono uppercase tracking-widest font-bold mb-1" style={{ color: theme.accentLighter }}>Simulated Emergency Registration</span>
                
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white opacity-60 uppercase tracking-wide">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. John Doe"
                        value={regForm.fullName}
                        onChange={e => setRegForm({...regForm, fullName: e.target.value})}
                        className="w-full text-xs px-3 py-2 border rounded-xl text-white outline-none focus:ring-1 font-sans liquid-glass transition-colors"
                        style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white opacity-60 uppercase tracking-wide">Passport / ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. US99381A"
                        value={regForm.passportNum}
                        onChange={e => setRegForm({...regForm, passportNum: e.target.value})}
                        className="w-full text-xs px-3 py-2 border rounded-xl text-white outline-none focus:ring-1 font-mono liquid-glass transition-colors"
                        style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white opacity-60 uppercase tracking-wide">Local Stay / Hotel</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ritz-Carlton"
                        value={regForm.localHotel}
                        onChange={e => setRegForm({...regForm, localHotel: e.target.value})}
                        className="w-full text-xs px-3 py-2 border rounded-xl text-white outline-none focus:ring-1 font-sans liquid-glass transition-colors"
                        style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white opacity-60 uppercase tracking-wide">Emergency Contact</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jane (+1)"
                        value={regForm.emergencyContact}
                        onChange={e => setRegForm({...regForm, emergencyContact: e.target.value})}
                        className="w-full text-xs px-3 py-2 border rounded-xl text-white outline-none focus:ring-1 font-sans liquid-glass transition-colors"
                        style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-white text-xs font-bold font-mono uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-[1.02] mt-1.5 flex items-center justify-center gap-1.5 border liquid-glass"
                    style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}
                  >
                    🛡️ Secure Liaison Registration
                  </button>
                </div>
              </form>
            )}

            <p className="text-[10px] text-white opacity-50 leading-normal font-mono">
              * Submitting logs your coordinates directly inside the local browser security storage to mock embassy-level traveler trace protection.
            </p>
          </ThemeCard>
        </div>

        {/* CARD 2: Interactive Local Regulations Compliance Checklist (Local Regs) */}
        <div>
          <ThemeCard className="p-6 space-y-4 h-full liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
                  Legal Codex
                </span>
                <h4 className="text-xs font-bold font-mono tracking-widest uppercase text-white opacity-90 flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5" style={{ color: theme.accentLighter }} /> LOCAL CIVIL REGULATIONS
                </h4>
              </div>
              <span className="text-[9px] font-mono text-white opacity-60">Legal awareness tracker</span>
            </div>

            {/* Compliance progress bar */}
            <div className="p-3.5 border rounded-2xl space-y-2 liquid-glass" style={{ backgroundColor: `${theme.accent}08`, borderColor: `${theme.accent}15` }}>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-white opacity-60 uppercase tracking-wider text-[10px]">Regulations compliance</span>
                <span className="font-bold font-sans" style={{ color: theme.accentLighter }}>
                  {complianceCount} of {localLawsList.length} Acknowledged
                </span>
              </div>
              
              {/* progress line */}
              <div className="h-2 rounded-full overflow-hidden border border-white/10" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
                <div 
                  className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor]"
                  style={{ width: `${(complianceCount / (localLawsList.length || 1)) * 100}%`, backgroundColor: theme.accentLighter }}
                />
              </div>
            </div>

            {/* Checklist of regulations */}
            <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1 scrollbar-thin">
              {localLawsList.map((law) => {
                const isAcknowledged = !!acknowledgedLaws[law.id];
                return (
                  <button
                    key={law.id}
                    type="button"
                    onClick={() => toggleLawAcknowledgement(law.id)}
                    className={`w-full p-2.5 rounded-xl border text-left flex gap-3 items-start cursor-pointer transition-all liquid-glass ${
                      isAcknowledged
                        ? "opacity-60"
                        : "opacity-100 hover:scale-[1.01]"
                    }`}
                    style={isAcknowledged ? { backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}20` } : { backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isAcknowledged
                        ? "text-white"
                        : "bg-transparent border-white/30"
                    }`} style={isAcknowledged ? { backgroundColor: theme.accent, borderColor: theme.accentLighter } : {}}>
                      {isAcknowledged && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0 flex-1 leading-snug">
                      <p className={`text-xs font-bold font-sans ${isAcknowledged ? "line-through text-white opacity-60" : "text-white opacity-95"}`}>
                        {law.title}
                      </p>
                      <p className="text-[10px] font-mono mt-0.5 text-white opacity-60">{law.fine}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-white opacity-50 leading-normal font-mono">
              * Check elements to certify awareness compliance. Failing can produce penalties, holds, or local precinct tickets in {destination || "target territory"}.
            </p>
          </ThemeCard>
        </div>
      </div>
    </div>
  );
}
