import React, { useState } from "react";
import { Camera, MapPin, ZoomIn, Sparkles, Sliders, Eye, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface DestinationGalleryProps {
  destination: string;
  country: string;
}

// Pre-generated high-quality visual assets mapped directly from the AI agent image tool
const PRE_GENERATED_IMAGES: Record<string, string> = {
  "kyoto": "/src/assets/images/kyoto_scenery_1779519639506.png",
  "reykjavik": "/src/assets/images/reykjavik_scenery_1779519660762.png",
  "rome": "/src/assets/images/rome_scenery_1779519680652.png",
  "giza": "/src/assets/images/giza_scenery_1779519705606.png",
  "bali": "/src/assets/images/bali_scenery_1779519726969.png",
  "oaxaca": "/src/assets/images/oaxaca_scenery_1779519747857.png"
};

// Helpful subtitle hooks to enrich context
const IMAGE_CAPTIONS: Record<string, string> = {
  "kyoto": "Bespoke wooden pagoda framing golden autumn maples under ambient sunset rays.",
  "reykjavik": "Ciinematic green neon aurora borealis dancing over Icelandic alpine peaks.",
  "rome": "Majestic morning light filtering through the historic stone arches of the Colosseum.",
  "giza": "The imposing Great Pyramids rising majestically from silent golden desert sands.",
  "bali": "Deep green tropical terraced rice paddies surrounded by palms and morning mist.",
  "oaxaca": "Charming colonial streets decorated with vibrant stucco walls and hanging flowers."
};

export default function DestinationGallery({ destination, country }: DestinationGalleryProps) {
  const { theme } = useAppTheme();
  const normKey = destination.toLowerCase().trim();
  
  // Locate if we have a direct premium asset generated
  const hasPremiumImage = Object.prototype.hasOwnProperty.call(PRE_GENERATED_IMAGES, normKey);
  
  // Decide active main image
  const primarySrc = hasPremiumImage 
    ? PRE_GENERATED_IMAGES[normKey] 
    : `https://picsum.photos/seed/${encodeURIComponent(normKey)}_scenic/1200/600`;

  // Secondary auxiliary images for context grid
  const thumb1Src = `https://picsum.photos/seed/${encodeURIComponent(normKey)}_explore/500/350`;
  const thumb2Src = `https://picsum.photos/seed/${encodeURIComponent(normKey)}_culture/500/350`;

  const [activeBigImage, setActiveBigImage] = useState<string>(primarySrc);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Sync active image when destination shifts
  React.useEffect(() => {
    setActiveBigImage(primarySrc);
  }, [destination, primarySrc]);

  return (
    <ThemeCard id="destination-visual-gallery" className="p-6 space-y-5 liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
      
      {/* Gallery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 border rounded-2xl liquid-glass" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
            <Camera className="w-5 h-5 animate-pulse" style={{ color: theme.accentLighter }} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest block font-bold text-white opacity-70">
              Visual Dossier
            </span>
            <h3 className="font-sans font-semibold text-white text-sm">
              Scenic Landscapes & Landmark Highlights
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPremiumImage ? (
            <span className="px-3 py-1 border text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md liquid-glass text-white" style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}>
              <Sparkles className="w-3 h-3 text-white fill-white" />
              Generated Image
            </span>
          ) : (
            <span className="px-3 py-1 border text-[10px] font-bold font-mono uppercase tracking-wider rounded-xl liquid-glass text-white opacity-90" style={{ backgroundColor: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}>
              Destination Gallery
            </span>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
        
        {/* Large Selected Preview Showcase */}
        <div className="lg:col-span-8 group relative rounded-2xl overflow-hidden aspect-[16/9] border flex items-center justify-center liquid-glass" style={{ borderColor: `${theme.accent}30` }}>
          
          {/* Main Display Image */}
          <img
            src={activeBigImage}
            alt={`${destination} Landmark Showcase`}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 cursor-pointer select-none"
            onClick={() => setLightboxImage(activeBigImage)}
          />

          {/* Dark bottom scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

          {/* Location Badge overlay top left */}
          <div className="absolute top-4 left-4 pointer-events-none px-3.5 py-1.5 rounded-xl border flex items-center gap-1.5 liquid-glass" style={{ backgroundColor: `${theme.accent}40`, borderColor: `${theme.accent}60` }}>
            <MapPin className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white tracking-wide uppercase">
              {destination}, {country}
            </span>
          </div>

          {/* Action indicator on hover */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-2 rounded-xl border border-white/10 pointer-events-none">
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Caption Overlay */}
          <div className="absolute bottom-4 inset-x-4 pointer-events-none space-y-1">
            <p className="text-sm font-semibold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-spin" />
              {hasPremiumImage && activeBigImage === PRE_GENERATED_IMAGES[normKey] 
                ? "HD Generated Landscape Perspective" 
                : "Aesthetic Landmark Spot"
              }
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-light font-sans max-w-2xl drop-shadow-xs">
              {hasPremiumImage && activeBigImage === PRE_GENERATED_IMAGES[normKey]
                ? (IMAGE_CAPTIONS[normKey] || "Sleek environmental context illustration.")
                : `Simulated scenery framing local architecture, traditional colors, and spatial layout of ${destination}.`
              }
            </p>
          </div>
        </div>

        {/* Small Thumbnail Bento Columns */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold px-1">
              Select Alternate Angle
            </h4>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              
              {/* Primary Photo thumb */}
              <div 
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border cursor-pointer group bg-black transition-all ${
                  activeBigImage === primarySrc 
                    ? "ring-2 shadow-[0_0_15px_currentColor] z-10" 
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{ borderColor: activeBigImage === primarySrc ? theme.accentLighter : `${theme.accent}30`, color: theme.accentLighter }}
                onClick={() => setActiveBigImage(primarySrc)}
              >
                <img 
                  src={primarySrc}
                  alt={`${destination} Landmark Spot`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-all" />
                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 text-[9px] font-bold text-white rounded font-mono uppercase bg-black/60 border border-white/10 backdrop-blur-md">
                  Main Hero
                </span>
              </div>

              {/* Auxiliary Photo thumb 1 */}
              <div 
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border cursor-pointer group bg-black transition-all ${
                  activeBigImage === thumb1Src 
                    ? "ring-2 shadow-[0_0_15px_currentColor] z-10" 
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{ borderColor: activeBigImage === thumb1Src ? theme.accentLighter : `${theme.accent}30`, color: theme.accentLighter }}
                onClick={() => setActiveBigImage(thumb1Src)}
              >
                <img 
                  src={thumb1Src}
                  alt={`${destination} Adventure spot`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-all" />
                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 text-[9px] font-bold text-white rounded font-mono uppercase bg-black/60 border border-white/10 backdrop-blur-md">
                  Sightseeing
                </span>
                <div className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Auxiliary Photo thumb 2 */}
              <div 
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border cursor-pointer group bg-black transition-all hidden lg:block ${
                  activeBigImage === thumb2Src 
                    ? "ring-2 shadow-[0_0_15px_currentColor] z-10" 
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{ borderColor: activeBigImage === thumb2Src ? theme.accentLighter : `${theme.accent}30`, color: theme.accentLighter }}
                onClick={() => setActiveBigImage(thumb2Src)}
              >
                <img 
                  src={thumb2Src}
                  alt={`${destination} Culture vibe`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-all" />
                <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 text-[9px] font-bold text-white rounded font-mono uppercase bg-black/60 border border-white/10 backdrop-blur-md">
                  Cultural Style
                </span>
                <div className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

            </div>
          </div>

          <div className="border rounded-2xl p-3.5 text-[11px] text-white opacity-80 leading-relaxed font-sans space-y-1 mt-auto liquid-glass" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}>
            <p className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" style={{ color: theme.accentLighter }} />
              Dynamic Image Rendering
            </p>
            <p className="font-light">
              Toggle the thumbnails to explore different artistic angles. Every angle utilizes seeds calibrated for {destination}'s geography.
            </p>
          </div>

        </div>

      </div>

      {/* Lightbox Popout dialog model */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 focus:outline-none"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative max-w-5xl w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border shadow-2xl flex items-center justify-center liquid-glass"
              style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}30` }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Enlarged Visual Spotlight"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain select-none z-10"
              />

              {/* Close prompt button */}
              <button
                className="absolute top-4 right-4 text-white rounded-full px-4 py-2 text-xs font-mono font-bold tracking-wide transition-all border z-20 cursor-pointer hover:scale-105 liquid-glass"
                style={{ backgroundColor: `${theme.accent}40`, borderColor: theme.accentLighter }}
                onClick={() => setLightboxImage(null)}
              >
                ✕ CLOSE DIALOG
              </button>

              <div className="absolute bottom-4 left-4 border px-3 py-1.5 rounded-xl z-20 pointer-events-none liquid-glass" style={{ backgroundColor: `${theme.accent}40`, borderColor: `${theme.accent}60` }}>
                <span className="text-[10px] font-mono font-bold mr-1.5 uppercase opacity-90 text-white">Spotlight</span>
                <span className="text-white opacity-80 text-xs font-medium">{destination} landscape view</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </ThemeCard>
  );
}
