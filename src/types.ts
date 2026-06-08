export interface FlightCosts {
  info: string;
  range: string;
  historicalTrend?: string;
  optimalBookingDay?: string;
  baggageTips?: string;
}

export interface Budget {
  currency: string;
  lowEndDaily: string;
  midRangeDaily: string;
  luxuryDaily: string;
  extraNotes?: string;
  dailyBreakdown?: { category: string; cost: string }[];
  emergencyReserve?: string;
  hiddenCosts?: string;
  moneySavingTips?: string[];
  overspendingRisk?: string;
  tippingCulture?: string;
}

export interface SecurityIndex {
  score: string;
  concerns: string[];
  safetyTips: string[];
}

export interface EmergencyContacts {
  police: string;
  ambulance: string;
  fireDept?: string;
  embassyInfo: string;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface Accommodation {
  name: string;
  type: string; // hotel, hostel, dorm
  description: string;
  approxPricePerNight: string;
  whyStay?: string;
  reviewSnippet?: string;
  nearestMetro?: string;
  walkabilityScore?: number;
  noiseLevel?: string;
  digitalNomadFriendliness?: string;
  internetSpeed?: string;
  groupSuitability?: string;
  coordinates?: LocationCoordinates;
}

export interface Restaurant {
  name: string;
  type: string;
  description: string;
  averageCost?: string;
  touristTrapProbability?: string;
  authenticLocalScore?: number;
  reservationSuggested?: boolean;
  waitingTimeNormal?: string;
  coordinates?: LocationCoordinates;
}

export interface Chemist {
  name: string;
  address?: string;
  notes: string;
}

export interface Amenities {
  restaurants: Restaurant[];
  chemists: Chemist[];
}

export interface TranslationPhrase {
  english: string;
  local: string;
  pronunciation: string;
  category: string; // greetings, shopping, medical, emergency, allergen, police
}

export interface Activity {
  time: string; // Morning, Afternoon, Evening
  title: string;
  description: string;
  location?: string;
  estimatedCost?: string;
  isOutdoor?: boolean;
  idealHour?: string;
  crowdLevel?: string;
  localTips?: string;
  photographySpot?: string;
  fatigueLevel?: string; // e.g. "Low", "Moderate", "High"
  walkingDistance?: string;
  weatherSuitability?: string;
  transportOption?: string;
  nearbyRestSpot?: string;
  hiddenAttraction?: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

export interface ItineraryData {
  destination: string;
  country: string;
  language: string;
  bestTimeToVisit: string;
  flightCosts: FlightCosts;
  budget: Budget;
  securityIndex: SecurityIndex;
  emergencyContacts: EmergencyContacts;
  accommodations: Accommodation[];
  amenities: Amenities;
  translationPhrases: TranslationPhrase[];
  itineraryDays: ItineraryDay[];
  // Advanced features additions
  personalityAdvice?: string;
  packingList?: { item: string; category: string; whyNeeded: string }[];
  visaAndDocs?: { visaRequired: string; passportValidity: string; insuranceSuggested?: string; vaccinations?: string[] };
  carbonTrack?: { estimatedCo2Kg: number; greenTips: string[]; sustainableScore: number };
  scamAlerts?: { title: string; description: string; severity: "low" | "medium" | "high" }[];
  womenSafety?: { safeDistricts: string[]; dangerousDistricts: string[]; verifiedTips: string[]; emergencyHelpline: string };
  priceAlerts?: { bestBookingWindow: string; priceTrend: string; potentialDeals: string[] };
  weatherSim?: { activeForecast: string; alertMessage?: string; outdoorAlternativeTips: string };
  isQuotaFallback?: boolean;
  apiErrorMessage?: string;
}

export interface TranslationResponse {
  translatedText: string;
  pronunciation: string;
  notes?: string;
}
