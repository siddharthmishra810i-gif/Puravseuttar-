import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  return (
    <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto w-full text-foreground">
      <div className="text-3xl tracking-tight font-display text-white">
        {/* Brand placeholder */}
      </div>
      <div className="hidden md:flex items-center space-x-8">
        <a href="#home" className="text-sm text-white font-medium hover:text-white transition-colors relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-px after:bg-white">Home</a>
        <a href="#about" className="text-sm text-muted-foreground hover:text-white transition-colors">About</a>
        <a href="#reach-us" className="text-sm text-muted-foreground hover:text-white transition-colors">Reach Us</a>
      </div>
      <button 
        onClick={() => document.getElementById('planner-form')?.scrollIntoView({ behavior: 'smooth' })}
        className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white hover:scale-105 transition-transform duration-300">
        Begin Journey
      </button>
    </nav>
  );
}

const QUOTES = [
  "Where <em>dreams</em> rise <em>through the silence.</em>",
  "Some <em>journeys</em> begin where <em>words disappear.</em>",
  "The world <em>whispers</em> differently to <em>wandering souls.</em>",
  "Between <em>cities and stars</em>, we find <em>ourselves.</em>",
  "Not all who wander <em>are lost</em> — some are <em>awakening.</em>",
  "Every <em>destination</em> changes the <em>person who arrives.</em>",
  "Travel is the <em>art</em> of becoming <em>someone new.</em>",
  "In <em>quiet places</em>, the loudest <em>dreams are born.</em>",
  "The <em>horizon</em> always belongs to the <em>curious.</em>",
  "Some places feel like <em>memories</em> before they <em>happen.</em>",
  "The <em>soul expands</em> with every <em>unfamiliar road.</em>",
  "<em>Adventure</em> begins the moment <em>certainty ends.</em>",
  "Beautiful journeys are written in <em>moments</em>, not <em>maps.</em>",
  "There are worlds hidden behind <em>ordinary flights.</em>",
  "Silence, motion, <em>light</em> — this is where <em>stories begin.</em>"
];

const renderQuote = (quoteStr: string) => {
  return quoteStr.split(/(<em>.*?<\/em>)/g).map((part, i) => {
    if (part.startsWith('<em>') && part.endsWith('</em>')) {
      return (
        <em key={i} className="not-italic text-white opacity-60 transition-opacity duration-300">
          {part.substring(4, part.length - 5)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export default function CinematicHero() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden flex flex-col justify-between">
      {/* Navbar overlaying the video */}
      <Navbar />

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-[90px] pt-16 pb-40 flex-1 min-h-[600px]">
        {/* Progress bar line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-white/10 w-full max-w-sm rounded overflow-hidden">
          <motion.div 
            key={quoteIndex}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 6, ease: "linear" }}
            className="h-full bg-white/40"
          />
        </div>

        <div className="relative w-full max-w-7xl flex items-center justify-center min-h-[220px] md:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.h1
              key={quoteIndex}
              initial={{ y: 24, opacity: 0, filter: "blur(12px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -24, opacity: 0, filter: "blur(12px)" }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-2.46px] font-display text-white w-full px-4"
            >
              {renderQuote(QUOTES[quoteIndex])}
            </motion.h1>
          </AnimatePresence>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12"
        >
          <button 
            onClick={() => document.getElementById('planner-form')?.scrollIntoView({ behavior: 'smooth' })}
            className="liquid-glass rounded-full px-14 py-5 text-base text-white hover:scale-105 transition-transform duration-300 shadow-xl"
          >
            Begin Journey
          </button>
        </motion.div>
      </div>
    </div>
  );
}
