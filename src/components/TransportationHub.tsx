import React from "react";
import { Train, Bus, CarFront, Navigation, ExternalLink, Map, Info } from "lucide-react";
import { useAppTheme } from "../context/ThemeContext";
import { ThemeCard } from "./ThemeDecorators";

interface TransportationHubProps {
  destination: string;
  transportPreference: string;
}

export default function TransportationHub({ destination, transportPreference }: TransportationHubProps) {
  const { theme } = useAppTheme();

  // Basic mock link generator based on destination
  const getMapsUrl = () => `https://www.google.com/maps/search/transit+in+${encodeURIComponent(destination)}`;
  const getTransitAppsUrl = () => `https://www.google.com/search?q=best+transit+app+for+${encodeURIComponent(destination)}`;

  const renderIcon = () => {
    switch (transportPreference) {
      case "Public Transit": return <Train className="w-8 h-8" style={{ color: theme.accentLighter }} />;
      case "Walking/Biking": return <Navigation className="w-8 h-8" style={{ color: theme.accentLighter }} />;
      case "Rental Car": return <CarFront className="w-8 h-8" style={{ color: theme.accentLighter }} />;
      case "Taxi/Rideshare": return <CarFront className="w-8 h-8" style={{ color: theme.accentLighter }} />;
      default: return <Bus className="w-8 h-8" style={{ color: theme.accentLighter }} />;
    }
  };

  return (
    <ThemeCard className="p-6">
      <div className="flex items-center gap-3 mb-6 border-b pb-4" style={{ borderColor: `${theme.accent}30` }}>
        {renderIcon()}
        <div>
          <h3 className="font-display font-black text-xl text-white">Transportation Hub</h3>
          <p className="text-sm font-light text-white opacity-70">
            Navigating {destination} via {transportPreference}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-4 rounded-2xl liquid-glass border" style={{ backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}25` }}>
            <h4 className="flex items-center gap-2 text-sm font-bold font-mono text-white mb-2 uppercase tracking-wide">
              <Info className="w-4 h-4" style={{ color: theme.accent }}/> Selected Mode
            </h4>
            <div className="text-2xl font-bold text-white mb-1">
              {transportPreference}
            </div>
            <p className="text-xs text-white opacity-80 leading-relaxed">
              Your itinerary and carbon tracking are optimized for this specific transit mode. To modify your preference, return to the main dashboard configuration.
            </p>
          </div>
          
          <a
            href={getMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-[1.02] liquid-glass cursor-pointer"
            style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}20` }}
          >
            <div className="flex items-center gap-3">
              <Map className="w-5 h-5" style={{ color: theme.accentLighter }} />
              <div>
                <span className="block text-sm font-bold text-white">Live Maps & Routes</span>
                <span className="block text-xs text-white opacity-70 font-mono">View transit map on Google Maps</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-white opacity-50" />
          </a>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl liquid-glass border h-full" style={{ backgroundColor: `${theme.accent}05`, borderColor: `${theme.accent}20` }}>
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" style={{ color: theme.accentLighter }}/> Recommended Tools
            </h4>
            <ul className="space-y-3">
              <li className="text-sm text-white opacity-80 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span> Google Maps (Universal routing & offline maps)
              </li>
              <li className="text-sm text-white opacity-80 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span> Uber / Local Taxi Apps (For reliable rides)
              </li>
              <li className="text-sm text-white opacity-80 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span> Transit / Citymapper (If available in {destination})
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: `${theme.accent}20` }}>
              <a
                href={getTransitAppsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border transition-all text-xs font-bold text-white uppercase tracking-wider bg-white/5 hover:bg-white/10"
                style={{ borderColor: `${theme.accent}30` }}
              >
                Find Local Apps <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </ThemeCard>
  );
}
