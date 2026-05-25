import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppTheme } from "../context/ThemeContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantChatProps {
  destination: string;
  personality: string;
}

export default function AIAssistantChat({ destination, personality = "Standard" }: AIAssistantChatProps) {
  const { theme } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: `Hi there! I'm your Smart Voyage AI companion. Ask me anything about local dining, safety tips, hidden gems, or weather-adaptive routes in **${destination || "your target destination"}**!` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const userMsg = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages,
          destination,
          personality
        })
      });

      if (!response.ok) {
        throw new Error("Chat failed to consult. Check connectivity.");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: "⚠️ Sorry, my synaptic flight telemetry has stalled. Check your internet connection or verify your API keys." }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating capsule trigger button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            layoutId="chat-capsule"
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-[1.25rem] text-white flex items-center justify-center shadow-2xl cursor-pointer relative group liquid-glass backdrop-blur-2xl"
            style={{ backgroundColor: `${theme.accent}33`, borderColor: `${theme.accent}66` }}
          >
            <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110 drop-shadow-md" style={{ color: theme.accentLighter }} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 border border-white rounded-full animate-pulse shadow-md" style={{ backgroundColor: theme.accentLighter }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Actual Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layoutId="chat-capsule"
            className="w-[340px] sm:w-[400px] h-[500px] rounded-3xl overflow-hidden flex flex-col shadow-2xl liquid-glass backdrop-blur-3xl"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            style={{ borderColor: `${theme.accent}33` }}
          >
            {/* Header section with high-tech status */}
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: `${theme.accent}20`, backgroundColor: `${theme.accent}10` }}>
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-xl liquid-glass border-none backdrop-blur-md shadow-inner" style={{ color: theme.accent, backgroundColor: `${theme.accent}25` }}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold font-sans tracking-tight text-white">Voyage Assistant capsule</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: theme.accent }} />
                    <span className="text-[9px] font-mono uppercase tracking-widest opacity-70 flex items-center gap-1" style={{ color: theme.accentLighter }}>
                      {personality} Companion Active
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-all cursor-pointer opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Message streams render */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.role === "user" 
                      ? "text-white rounded-tr-md shadow-md"
                      : "text-slate-100 rounded-tl-md border shadow-sm liquid-glass backdrop-blur-md"
                  }`}
                  style={m.role === "user" ? { backgroundColor: theme.accent } : { borderColor: `${theme.accent}20`, backgroundColor: `${theme.accent}15` }}
                  >
                    {m.role === "assistant" && idx === 0 ? (
                      <p dangerouslySetInnerHTML={{ __html: m.content }} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start">
                  <div className="liquid-glass border rounded-2xl rounded-tl-none p-3.5 text-xs text-white/70 flex items-center gap-2 shadow-inner" style={{ borderColor: `${theme.accent}20` }}>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: theme.accentLighter }} />
                    <span>Gemini is compiling advice...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input message form footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2 liquid-glass" style={{ borderColor: `${theme.accent}20`, backgroundColor: `${theme.accent}05` }}>
              <input
                type="text"
                required
                placeholder={`Ask about ${destination || "dining, hidden spots, transport"}...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-xs px-3.5 py-3 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-1 liquid-glass"
                style={{ borderColor: `${theme.accent}30` }}
              />
              <button
                type="submit"
                disabled={sending || !inputValue.trim()}
                className="p-3 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-md border"
                style={!sending && inputValue.trim() ? { backgroundColor: theme.accent, borderColor: theme.accentLighter } : { backgroundColor: `${theme.accent}40`, borderColor: `${theme.accent}20` }}
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
