import React from "react";
import { Bed, MapPin, Search, Star, MessageSquareCode, UtensilsCrossed, Pill, ExternalLink, Activity } from "lucide-react";
import { Accommodation, Amenities } from "../types";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface AccommodationsAndPlacesProps {
  accommodations: Accommodation[];
  amenities: Amenities;
  destination: string;
}

export default function AccommodationsAndPlaces({ accommodations, amenities, destination }: AccommodationsAndPlacesProps) {
  const { theme } = useAppTheme();
  
  // Custom Maps deep-links
  const getMapsQueryUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + " " + destination)}`;
  };

  const getGeneralSearchUrl = (category: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(category + " " + destination)}`;
  };

  return (
    <div id="accommodations-amenities-section" className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${theme.fontBody}`}>
      
      {/* Recommended Accommodations & Lodging */}
      <div className="lg:col-span-7 h-full">
        <ThemeCard className="p-6 space-y-5 h-full liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
              Stay Directory
            </span>
            <h3 className="font-sans font-semibold text-lg flex items-center gap-2" style={{ color: theme.accentLighter }}>
              <Bed className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
              Lodging & Accommodations
            </h3>
            <p className="text-xs opacity-70 text-white mt-1">
              Handpicked stays for different traveler styles. Click search to see real reviews on Google Maps.
            </p>
          </div>

          {/* Accommodations map */}
          <div className="space-y-4">
            {accommodations.map((lodging, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl space-y-3.5 transition-all hover:scale-[1.01] group liquid-glass border cursor-pointer"
                style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}15` }}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase border liquid-glass" style={{ color: theme.accentLighter, borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}>
                        {lodging.type}
                      </span>
                      <h4 className="font-sans font-semibold text-white text-sm">{lodging.name}</h4>
                    </div>
                    <div className="text-xs font-semibold font-mono" style={{ color: theme.accent }}>
                      Estimated Price: <span className="text-white">{lodging.approxPricePerNight}</span>
                    </div>
                  </div>

                  {/* Google Maps search lookup */}
                  <a
                    href={getMapsQueryUrl(lodging.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-xl border transition-all shrink-0 hover:scale-105 liquid-glass"
                    style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}
                  >
                    <MapPin className="w-3.5 h-3.5" style={{ color: theme.accent }} />
                    View reviews
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>

                <p className="text-xs leading-relaxed font-sans opacity-90 text-white">{lodging.description}</p>
                
                {/* Intelligent Lodging Vitals */}
                {(lodging.nearestMetro || lodging.noiseLevel || lodging.walkabilityScore || lodging.internetSpeed || lodging.digitalNomadFriendliness || lodging.groupSuitability) && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {lodging.nearestMetro && (
                      <span className="px-2 py-0.5 border rounded-lg text-[10px] leading-none liquid-glass text-white" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}>
                        🚇 Metro: {lodging.nearestMetro}
                      </span>
                    )}
                    {lodging.walkabilityScore !== undefined && (
                      <span className="px-2 py-0.5 border rounded-lg font-mono text-[10px] leading-none liquid-glass text-white" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}>
                        🚶 Walkability: {lodging.walkabilityScore}/100
                      </span>
                    )}
                    {lodging.noiseLevel && (
                      <span className="px-2 py-0.5 border rounded-lg text-[10px] leading-none liquid-glass text-white" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}>
                        🔊 Noise: {lodging.noiseLevel}
                      </span>
                    )}
                    {lodging.digitalNomadFriendliness && (
                      <span className="px-2 py-0.5 border rounded-lg text-[10px] leading-none flex items-center gap-1 font-semibold liquid-glass text-white" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}>
                        💻 Nomad Match: {lodging.digitalNomadFriendliness} {lodging.internetSpeed ? `(${lodging.internetSpeed})` : ""}
                      </span>
                    )}
                    {lodging.groupSuitability && (
                      <span className="px-2 py-0.5 border rounded-lg text-[10px] leading-none liquid-glass text-white" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}10` }}>
                        👥 Groups: {lodging.groupSuitability}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  {lodging.whyStay && (
                    <div className="p-2.5 rounded-xl space-y-1 border liquid-glass" style={{ borderColor: `${theme.accent}15`, backgroundColor: `${theme.accent}05` }}>
                      <span className="font-semibold block text-white opacity-90">Why Stay Here:</span>
                      <span className="leading-tight block opacity-80 text-white">{lodging.whyStay}</span>
                    </div>
                  )}
                  {lodging.reviewSnippet && (
                    <div className="p-2.5 rounded-xl space-y-1 border liquid-glass" style={{ borderColor: `${theme.accent}15`, backgroundColor: `${theme.accent}05` }}>
                      <span className="font-semibold flex items-center gap-1 text-white opacity-90">
                        <Star className="w-3 h-3 text-amber-400" /> Traveler Review:
                      </span>
                      <span className="leading-tight italic block opacity-80 text-white">"{lodging.reviewSnippet}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick External Map Hub Links */}
          <div className="pt-2 p-4 rounded-2xl border space-y-3 liquid-glass mt-4" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}20` }}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider block" style={{ color: theme.accentLighter }}>
              Custom Map Explorers:
            </span>
            <div className="flex flex-wrap gap-2">
              <a
                href={getGeneralSearchUrl("cheap hostels")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md liquid-glass border hover:scale-105"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15` }}
              >
                🛌 Explore Hostels & Dorms <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
              <a
                href={getGeneralSearchUrl("boutique hotels")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-md liquid-glass border hover:scale-105"
                style={{ borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}15` }}
              >
                🏨 Luxury stays <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>
        </ThemeCard>
      </div>

      {/* Suggested Restaurants & Chemists */}
      <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
        
        {/* Restaurants section */}
        <ThemeCard className="p-6 space-y-4 liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
              Food Registry
            </span>
            <h3 className="font-sans font-semibold text-lg flex items-center gap-2 text-white" style={{ color: theme.accentLighter }}>
              <UtensilsCrossed className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
              Suggested Dining Spots
            </h3>
          </div>

          <div className="space-y-3">
            {amenities.restaurants ? (
              amenities.restaurants.map((place, idx) => (
                <div key={idx} className="p-3 rounded-2xl flex flex-col justify-between gap-1 transition-all hover:scale-[1.02] border liquid-glass" style={{ borderColor: `${theme.accent}15`, backgroundColor: `${theme.accent}05` }}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-sans font-semibold text-white">{place.name}</h4>
                    <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded border uppercase liquid-glass" style={{ color: theme.accentLighter, borderColor: `${theme.accent}30`, backgroundColor: `${theme.accent}10` }}>
                      {place.type}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 text-white leading-snug">{place.description}</p>
                  
                  {/* Intelligent Culinary Scores */}
                  {(place.touristTrapProbability !== undefined || place.authenticLocalScore !== undefined || place.reservationSuggested !== undefined || place.waitingTimeNormal) && (
                    <div className="flex flex-wrap gap-1 mt-2 mb-1 p-2 rounded-xl border liquid-glass text-white" style={{ borderColor: `${theme.accent}20`, backgroundColor: `${theme.accent}05` }}>
                      {place.authenticLocalScore !== undefined && (
                        <span className="px-2 py-0.5 border rounded text-[9px] font-mono leading-none flex items-center gap-0.5 liquid-glass" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` }}>
                          ⭐ Authenticity: {place.authenticLocalScore}%
                        </span>
                      )}
                      {place.touristTrapProbability !== undefined && (
                        <span className={`px-2 py-0.5 border rounded text-[9px] font-mono leading-none flex items-center gap-0.5 liquid-glass ${
                          place.touristTrapProbability.toLowerCase().includes("high") || place.touristTrapProbability.toLowerCase().includes("risk") || parseFloat(place.touristTrapProbability) > 50
                            ? "text-rose-400 border-rose-500/30 bg-rose-500/10" 
                            : ""
                        }`} style={!(place.touristTrapProbability.toLowerCase().includes("high") || place.touristTrapProbability.toLowerCase().includes("risk") || parseFloat(place.touristTrapProbability) > 50) ? { borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` } : {}}>
                          🚨 Trap Prob: {place.touristTrapProbability}
                        </span>
                      )}
                      {place.reservationSuggested !== undefined && (
                        <span className="px-2 py-0.5 border rounded text-[9px] leading-none flex items-center gap-0.5 liquid-glass" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` }}>
                          🎟️ {place.reservationSuggested ? "Res. Suggested" : "Walk-ins Welcome"}
                        </span>
                      )}
                      {place.waitingTimeNormal && (
                        <span className="px-2 py-0.5 border rounded text-[9px] leading-none flex items-center gap-1 liquid-glass" style={{ borderColor: `${theme.accent}40`, backgroundColor: `${theme.accent}15` }}>
                          👥 Wait: {place.waitingTimeNormal}
                        </span>
                      )}
                    </div>
                  )}

                  {place.averageCost && (
                    <div className="text-[10px] italic mt-1 font-mono opacity-60 text-white">
                      Cost estimate: {place.averageCost}
                    </div>
                  )}
                  <a
                    href={getMapsQueryUrl(place.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium hover:underline flex items-center gap-1 mt-1 shrink-0"
                    style={{ color: theme.accentLighter }}
                  >
                    View menu & reviews <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-xs opacity-60 text-white">Loading dining spots...</p>
            )}
          </div>

          <a
            href={getGeneralSearchUrl("top restaurants local food")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 text-white font-medium text-xs rounded-xl border flex items-center justify-center transition-all hover:scale-[1.02] shadow-md"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}
          >
            🍕 Search nearby dining hubs in Maps
          </a>
        </ThemeCard>

        {/* Chemist / Pharmacy directory */}
        <ThemeCard className="p-6 space-y-4 liquid-glass drop-shadow-xl" style={{ borderColor: `${theme.accent}20` }}>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest block mb-1 opacity-70 text-white">
              Medical Registry
            </span>
            <h3 className="font-sans font-semibold text-lg flex items-center gap-2 text-white" style={{ color: theme.accentLighter }}>
              <Pill className="w-5 h-5 flex-shrink-0" style={{ color: theme.accent }} />
              Local Chemist Shops
            </h3>
          </div>

          <div className="space-y-3">
            {amenities.chemists ? (
              amenities.chemists.map((chem, idx) => (
                <div key={idx} className="p-3 rounded-2xl space-y-1 transition-all hover:scale-[1.02] border liquid-glass" style={{ borderColor: `${theme.accent}15`, backgroundColor: `${theme.accent}05` }}>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-white">
                    <span>{chem.name}</span>
                  </div>
                  {chem.address && <p className="text-[10px] font-mono opacity-60 text-white">{chem.address}</p>}
                  <p className="text-[11px] leading-snug italic opacity-80 text-white">"{chem.notes}"</p>
                  <a
                    href={getMapsQueryUrl(chem.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-medium hover:underline flex items-center gap-1 pt-1 shrink-0"
                    style={{ color: theme.accentLighter }}
                  >
                    Find directions <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))
            ) : (
              <p className="text-xs opacity-60 text-white">Locating pharmacies...</p>
            )}
          </div>

          <a
            href={getGeneralSearchUrl("pharmacy chemist emergency shop")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 text-white font-medium text-xs rounded-xl border flex items-center justify-center transition-all hover:scale-[1.02] shadow-md"
            style={{ backgroundColor: theme.accent, borderColor: theme.accentLighter }}
          >
            🏥 Find all nearby open chemist shops
          </a>
        </ThemeCard>

      </div>

    </div>
  );
}
