import React, { useState } from "react";
import { Languages, Volume2, Copy, Search, Send, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TranslationPhrase, TranslationResponse } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface TranslationHelperProps {
  localPhrases: TranslationPhrase[];
  targetLanguage: string;
}

export default function TranslationHelper({ localPhrases, targetLanguage }: TranslationHelperProps) {
  const { theme } = useAppTheme();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customText, setCustomText] = useState("");
  const [translating, setTranslating] = useState(false);
  const [customTranslation, setCustomTranslation] = useState<TranslationResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCustom, setCopiedCustom] = useState(false);
  const [speakingCaption, setSpeakingCaption] = useState<string | null>(null);

  const categories = ["all", "greetings", "dining", "shopping", "medical", "emergency"];

  const filteredPhrases = localPhrases.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category?.toLowerCase() === activeCategory;
    const matchesSearch =
      p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.local.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pronunciation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleTranslateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setTranslating(true);
    setCustomTranslation(null);

    try {
      const response = await fetch("/api/translate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: customText, targetLanguage }),
      });
      if (!response.ok) {
        throw new Error("Translation request failed");
      }
      const rawText = await response.text();
      let data: TranslationResponse;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Invalid response format");
      }
      setCustomTranslation(data);
    } catch (error) {
      console.error(error);
    } finally {
      setTranslating(false);
    }
  };

  const copyToClipboard = (text: string, index: number | "custom") => {
    navigator.clipboard.writeText(text);
    if (index === "custom") {
      setCopiedCustom(true);
      setTimeout(() => setCopiedCustom(false), 2000);
    } else {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const speakText = (text: string, langCode: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.lang.toLowerCase().includes(langCode.toLowerCase()) || 
        v.name.toLowerCase().includes(targetLanguage.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
      utterance.rate = 0.85;
      
      utterance.onstart = () => setSpeakingCaption(text);
      utterance.onend = () => setSpeakingCaption(null);
      utterance.onerror = () => setSpeakingCaption(null);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div id="translation-helper-section" className={`grid grid-cols-1 lg:grid-cols-12 gap-6 w-full ${theme.fontBody}`}>
      {/* Translation Dictionary & Quick Search */}
      <ThemeCard className="lg:col-span-7 p-6 flex flex-col h-full liquid-glass drop-shadow-xl min-w-0" style={{ borderColor: `${theme.accent}20` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-sans font-semibold text-lg flex items-center gap-2`} style={{ color: theme.accentLighter }}>
              <Languages className="w-5 h-5" style={{ color: theme.accent }} />
              Essential Quick Phrases
            </h3>
            <p className="text-xs text-opacity-70 text-white mt-1">Useful phrases translated to Local Language</p>
          </div>
          <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full border liquid-glass" style={{ color: theme.accent, borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` }}>
            {targetLanguage}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
          <input
            type="text"
            placeholder="Search words, English phrase, or pronunciation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm placeholder-white/40 focus:outline-none focus:ring-2 text-white transition-all liquid-glass backdrop-blur-md"
            style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}25` }}
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none snap-x">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all shrink-0 snap-start border`}
              style={
                activeCategory === cat
                  ? { backgroundColor: theme.accent, color: "white", borderColor: theme.accentLighter }
                  : { backgroundColor: `${theme.accent}10`, color: "white", borderColor: `${theme.accent}25`, opacity: 0.7 }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List of Phrases */}
        <div className="space-y-3.5 flex-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {filteredPhrases.length > 0 ? (
              filteredPhrases.map((phrase, idx) => (
                <motion.div
                  layout
                  key={phrase.english + idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 rounded-2xl flex items-center justify-between gap-4 transition-all hover:scale-[1.01] group liquid-glass border cursor-pointer"
                  style={{ borderColor: `${theme.accent}25`, backgroundColor: `${theme.accent}05` }}
                >
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded-md border uppercase inline-block opacity-80" style={{ color: theme.accentLighter, borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15` }}>
                      {phrase.category || "General"}
                    </span>
                    <h4 className="font-sans font-medium text-white text-sm">{phrase.english}</h4>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <p className="font-semibold text-sm tracking-wide" style={{ color: theme.accent }}>{phrase.local}</p>
                      <span className="text-[11px] font-mono opacity-60 text-white">({phrase.pronunciation})</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => speakText(phrase.local, targetLanguage)}
                      title="Speak pronunciation"
                      className="p-2.5 rounded-xl transition-all liquid-glass opacity-70 hover:opacity-100 hover:scale-105 border"
                      style={{ color: theme.accentLighter, borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15` }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(phrase.local, idx)}
                      title="Copy local phrase"
                      className="p-2.5 rounded-xl transition-all liquid-glass opacity-70 hover:opacity-100 hover:scale-105 border relative"
                      style={{ color: theme.accentLighter, borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15` }}
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4" style={{ color: theme.accent }} />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center text-sm font-sans"
                style={{ color: "white", opacity: 0.5 }}
              >
                No phrases match your criteria
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ThemeCard>

      {/* Dynamic Voice/Text Custom Translator */}
      <ThemeCard className="lg:col-span-5 p-6 flex flex-col justify-between h-full liquid-glass drop-shadow-xl min-w-0" style={{ borderColor: `${theme.accent}20` }}>
        <div className="space-y-5">
          <div>
            <h3 className="font-sans font-semibold text-lg flex items-center gap-2" style={{ color: theme.accentLighter }}>
              <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
              Custom Quick Translator
            </h3>
            <p className="text-xs text-opacity-70 text-white mt-1">Need specific words? Translate any custom phrase on the go.</p>
          </div>

          <form onSubmit={handleTranslateCustom} className="space-y-4">
            <div className="relative">
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={`Type custom English terms to translate into ${targetLanguage || "local language"}...`}
                rows={3}
                className="w-full p-4 rounded-2xl text-sm placeholder-white/40 focus:outline-none focus:ring-1 text-white transition-all resize-none liquid-glass backdrop-blur-md"
                style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}25` }}
              />
            </div>

            <button
              type="submit"
              disabled={translating || !customText.trim()}
              className="w-full py-3 px-4 disabled:opacity-40 text-white font-medium text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 border hover:scale-[1.02]"
              style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}
            >
              {translating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Translate to {targetLanguage}
                </>
              )}
            </button>
          </form>

          {/* Translation Result Card */}
          <AnimatePresence mode="wait">
            {customTranslation && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-2xl space-y-4 relative overflow-hidden liquid-glass border mt-4"
                style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-md inline-block border" style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}25`, borderColor: `${theme.accent}40` }}>
                      Translation Result
                    </span>
                    <p className="text-xs italic mt-1 font-sans opacity-70 text-white">"{customText}"</p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <button
                      onClick={() => speakText(customTranslation.translatedText, targetLanguage)}
                      className="p-2 rounded-xl transition-all opacity-80 hover:opacity-100 hover:scale-105 border liquid-glass"
                      title="Speak Translation"
                      style={{ color: "white", borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}20` }}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(customTranslation.translatedText, "custom")}
                      className="p-2 rounded-xl transition-all opacity-80 hover:opacity-100 hover:scale-105 border liquid-glass"
                      title="Copy"
                      style={{ color: "white", borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}20` }}
                    >
                      {copiedCustom ? <Check className="w-3.5 h-3.5" style={{ color: theme.accent }} /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xl font-bold font-sans tracking-wide text-white">
                    {customTranslation.translatedText}
                  </div>
                  <div className="text-xs font-mono px-3 py-1.5 rounded-xl inline-block border liquid-glass" style={{ color: theme.accentLighter, backgroundColor: `${theme.accent}20`, borderColor: `${theme.accent}30` }}>
                    Phonetic: <span className="font-semibold text-white">{customTranslation.pronunciation}</span>
                  </div>
                </div>

                {customTranslation.notes && (
                  <div className="text-xs p-3 rounded-xl border liquid-glass text-white/90" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}25` }}>
                    <span className="font-medium text-white block mb-1">Usage Tip:</span>
                    {customTranslation.notes}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informational tip at bottom */}
        <div className="text-[11px] mt-6 pt-4 border-t leading-relaxed opacity-60 text-white font-mono" style={{ borderColor: `${theme.accent}20` }}>
          💡 <strong>Speaker Tip:</strong> Play the pronunciation helpers or copy and paste local characters into taxi screens or checkout queues. Language barriers disappear!
        </div>
      </ThemeCard>

      {/* Floating Caption Overlay when speaking */}
      <AnimatePresence>
        {speakingCaption && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-xl border flex items-center justify-center max-w-lg w-[90%]"
            style={{ backgroundColor: `${theme.accent}90`, borderColor: theme.accentLighter }}
          >
            <div className="flex items-center gap-4 w-full">
              <div className="p-3 rounded-full bg-white/20 animate-pulse">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <p className="text-xl font-bold font-sans text-white text-shadow-sm leading-tight text-center">
                "{speakingCaption}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
