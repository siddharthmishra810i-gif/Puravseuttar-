import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy loading Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable. Please add it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

function getFallbackItinerary(destination: string, daysLength: number = 3, personality: string = "Adventure Seeker", mood: string = "Lively", transport: string = "Public Transit", flexibility: string = "Balanced") {
  const cleanDest = destination.trim() || "Target Destination";
  const days = Array.from({ length: daysLength }, (_, i) => {
    const dayNum = i + 1;
    return {
      dayNumber: dayNum,
      title: `Exploring Highlights of ${cleanDest} (Day ${dayNum})`,
      activities: [
        {
          time: "Morning",
          title: `Must-See Landmarks & Morning Vibe`,
          description: `Kickstart your exploration of ${cleanDest}. Walk through scenic walkways, historic corridors, and iconic buildings while the morning breeze is crisp and crowds are light.`,
          location: `Central ${cleanDest}`,
          estimatedCost: "$15",
          isOutdoor: true,
          idealHour: "08:30 AM",
          crowdLevel: "Light (20% capacity)",
          localTips: "Get there early to catch the optimal sunrise light vectors for incredible landscape photography.",
          photographySpot: "Eastside Terrace Observation Desk",
          fatigueLevel: "Moderate (3km walking)",
          walkingDistance: "2.8 km",
          weatherSuitability: "Sunny or overcast",
          transportOption: "Public Metro Line or walk",
          nearbyRestSpot: "Cafe Solitude & Patisserie",
          hiddenAttraction: "Generous lookout point hidden down the narrow alleyway just 150m west."
        },
        {
          time: "Afternoon",
          title: `Local Culinary Experience & Cultural Immersion`,
          description: `Indulge in authentic regional lunch experiences. Savor highly certified recipes, underrated local noodle shops, or traditional bistros away from typical tourist crowds. Afterwards, discover an elite artisan museum.`,
          location: `Old Quarter, ${cleanDest}`,
          estimatedCost: "$25",
          isOutdoor: false,
          idealHour: "12:45 PM",
          crowdLevel: "Moderate (65% capacity)",
          localTips: "Ask for the non-English chef recommendation card for the most authentic seasonal food recipes.",
          photographySpot: "The Inner Courtyard Fountain",
          fatigueLevel: "Low",
          walkingDistance: "1.2 km",
          weatherSuitability: "Indoor sanctuary",
          transportOption: "Walk or local auto-cab",
          nearbyRestSpot: "Artisanal Tea Room 'Komorebi'",
          hiddenAttraction: "Traditional independent workshop demonstrating glass or woodcraft engraving techniques."
        },
        {
          time: "Evening",
          title: `Atmospheric Sunset Viewpoints & Nightlife`,
          description: `Gather at the highest topological point for sunset over the urban skyline. Follow it with winding strolls along the glowing canals or nightlife lounges tailored to your calibrated mood profile.`,
          location: `Canalway Promenade, ${cleanDest}`,
          estimatedCost: "$35",
          isOutdoor: true,
          idealHour: "06:15 PM",
          crowdLevel: "Vibrant (85% capacity)",
          localTips: "Arrive at the observation deck 30 minutes before official twilight to secure a premium camera angle.",
          photographySpot: "Bridge of Whispers Skyline Angle",
          fatigueLevel: "Low",
          walkingDistance: "1.5 km",
          weatherSuitability: "Excellent clear skies",
          transportOption: "Local Tuk-Tuk / Tramways",
          nearbyRestSpot: "The Sunset Cocktail Lounge",
          hiddenAttraction: "Hidden basement vinyl music club featuring jazz, vintage standards, and local acoustic guitarists."
        }
      ]
    };
  });

  return {
    destination: cleanDest,
    country: "Local Sovereignty",
    language: "Local Language / English widely understood",
    bestTimeToVisit: "April through October (Pleasant microclimates, high visibility)",
    isQuotaFallback: true,
    flightCosts: {
      info: "Fly directly into the nearest international hub. Fares fluctuate moderately between booking seasons. Flights remain predictable.",
      range: "$450 - $950 USD",
      historicalTrend: "Booking 6-8 weeks prior is statistically shown to shave 18% off list prices.",
      optimalBookingDay: "Tuesdays and Wednesdays (After midnight)",
      baggageTips: "Carry-on only avoids checked transport holds and guarantees fast transfers."
    },
    budget: {
      currency: "USD ($)",
      lowEndDaily: "$45 - $65 / day",
      midRangeDaily: "$110 - $160 / day",
      luxuryDaily: "$320 - $550+ / day",
      extraNotes: "Local taxation and safety infrastructure reserves may apply. Tipping is appreciated but strictly voluntary.",
      dailyBreakdown: [
        { category: "Lodging & Stays", cost: "$55/day" },
        { category: "Culinary & Street Diners", cost: "$35/day" },
        { category: "Transit & Metro passes", cost: "$12/day" },
        { category: "Entrance Permits", cost: "$15/day" }
      ],
      emergencyReserve: "$250 recommended",
      hiddenCosts: "Luggage lockers, tourist taxes, and peak transfer surcharges.",
      moneySavingTips: [
        "Purchase unlimited multi-day metro passes rather than individual trip tokens.",
        "Dine near local academic campuses to locate supreme quality portions at 40% discount.",
        "Carry a reusable light-filter bottle to utilize natural free tap hubs safely."
      ],
      overspendingRisk: "Overpriced dining spots directly facing primary historical squares.",
      tippingCulture: "Customary roundups are typical of casual diners, or 5-10% at premium bistros."
    },
    securityIndex: {
      score: "Safe & Vigilant (84/100)",
      concerns: [
        "Pickpocketing around packed train cabins or main market squares.",
        "Overpriced unregulated taxi drivers lacking active digital trackers.",
        "Overly pushy street vendors handing roses or bracelets as 'free gifts'."
      ],
      safetyTips: [
        "Always store valuables inside zipped front pockets or a body pouch.",
        "Order transport via verified ride-hailing software rather than flag-down hacks.",
        "Walk in well-lit, populated thoroughfares during late-night durations."
      ]
    },
    emergencyContacts: {
      police: "112 / 911 / Local Security Line",
      ambulance: "112 / 999",
      fireDept: "112 / 999",
      embassyInfo: "Major international embassies maintain central consulate corridors in the nearby metropolitan area."
    },
    accommodations: [
      {
        name: `${cleanDest} Heritage Boutique House`,
        type: "guesthouse",
        description: "A gorgeous, family-operated heritage mansion restoration with custom architectural artifacts, warm glowing lights, and a serene inner courtyard garden.",
        approxPricePerNight: "$85",
        whyStay: "Exuberates authentic local architecture and sits directly in a historic district.",
        reviewSnippet: "An absolute oasis! Best morning tea ceremony, and the location is walk-friendly to everywhere.",
        nearestMetro: "Central Station (400m)",
        walkabilityScore: 92,
        noiseLevel: "Very Quiet & Peacefully isolated",
        digitalNomadFriendliness: "High (Ergonomic tables)",
        internetSpeed: "120 Mbps symmetrical Fiber",
        groupSuitability: "Excellent for couples or independent travelers"
      },
      {
        name: "Zen Urban Shelter & Eco Lodge",
        type: "hostel / capsule",
        description: "A high-concept, sustainably constructed capsule cabin sanctuary equipped with premium ambient sound insulation, USB charging hubs, and a panoramic vegetative terrace deck.",
        approxPricePerNight: "$35",
        whyStay: "Budget-friendly, highly social for backpackers, and equipped with smart coworking spaces.",
        reviewSnippet: "Cleanest pods I have ever stayed in. Symmetrical high-speed Wi-Fi was phenomenal.",
        nearestMetro: "North Cross Depot (250m)",
        walkabilityScore: 88,
        noiseLevel: "Controlled silence zones",
        digitalNomadFriendliness: "Outstanding (Fitted with private video calling booths)",
        internetSpeed: "250 Mbps",
        groupSuitability: "Great for solo creators, backpackers, and tech nomads"
      }
    ],
    amenities: {
      restaurants: [
        {
          name: "The Artisan Hearth & Bistro",
          type: "Local specialty",
          description: "An authentic, highly rated dining spot serving secret regional recipes with seasonal local bio-sourced ingredients.",
          averageCost: "$18 - $30 per person",
          touristTrapProbability: "Negligible (95% local customer base)",
          authenticLocalScore: 98,
          reservationSuggested: true,
          waitingTimeNormal: "15 to 30 mins"
        },
        {
          name: "Noodle & Steam Dim-Sum Alley",
          type: "Charming casual",
          description: "Generous handmade dumplings, hot clay pots, and custom brewed herbal teas served in a cozy wooden corner.",
          averageCost: "$8 - $15 per person",
          touristTrapProbability: "Zero (Unmarked sign)",
          authenticLocalScore: 100,
          reservationSuggested: false,
          waitingTimeNormal: "5 to 10 mins"
        }
      ],
      chemists: [
        {
          name: `Central ${cleanDest} 24H Dispensary`,
          address: "Main Plaza Parade, Block 4B",
          notes: "Fully stocked pharmacy with professional English-fluent general consultants on call."
        }
      ]
    },
    translationPhrases: [
      { english: "Hello / Good Day", local: "Konnichiwa / Ciao / Hello", pronunciation: "As spelled", category: "greetings" },
      { english: "Where is the restrooms?", local: "Restroom map / Toilet direction?", pronunciation: "Where Toilet?", category: "emergency" },
      { english: "Thank you very much!", local: "Arigatou / Grazie / Thanks", pronunciation: "As spelled", category: "greetings" },
      { english: "I have a severe food allergy.", local: "Allergy Alert / Emergency restriction", pronunciation: "No peanut / milk / wheat", category: "allergen" }
    ],
    itineraryDays: days,
    personalityAdvice: `Because you are a ${personality} seeking a "${mood}" mood, this trip has been pace-calibrated to emphasize deep local immersion. We selected lesser-known neighborhood avenues, quieter panoramic viewpoints, and authentic slow-food dining options to guarantee that you stay fully refreshed.`,
    packingList: [
      { item: "Versatile Layers & Light Rain Shell", category: "Clothing", whyNeeded: "Provides safe temperature adaptation for all outdoor twilight walks." },
      { item: "High-yield Power Pack (10,000mAh)", category: "Electronics", whyNeeded: "Ensures your smartphone/camera remains powered for detailed mapping, photo spots, and translating." },
      { item: "Digital Travel Document copies", category: "Documents", whyNeeded: "Required for fast confirmation of identity during local regulations compliance checkups." },
      { item: "Ergonomic walking footwear", category: "Essentials", whyNeeded: "Absolutely key for walking fatigue ratings and exploring hidden observation stairs." }
    ],
    visaAndDocs: {
      visaRequired: "Visa-free entry for up to 90 days for most tourist passports (subject to local checkups).",
      passportValidity: "Must have at least 6 months remaining validity from your scheduled date of arrival.",
      insuranceSuggested: "Comprehensive emergency medical and baggage flight delay indemnity highly recommended.",
      vaccinations: ["Routine immunizations", "Tetanus booster", "Wild zone checkups"]
    },
    carbonTrack: {
      estimatedCo2Kg: 245.8,
      sustainableScore: 82,
      greenTips: [
        "Use local urban rail systems and electric train fleets instead of carbon private transport options.",
        "Join group walking tours or rent clean mechanical bicycles for nearby street explorations."
      ]
    },
    scamAlerts: [
      { title: "The Handover Bracelet Gambit", description: "Bystanders place 'free' string bracelets around your arm then demand aggressive cash donations.", severity: "medium" },
      { title: "Unmetered Airport Rides", description: "Cabs that state 'broken meters' and charge 3x rates at arrival points.", severity: "high" }
    ],
    womenSafety: {
      safeDistricts: ["Central Boulevard", "Arts Quarter", "Downtown Metro Corridors"],
      dangerousDistricts: ["Industrial Port Alleys", "Unlit backspaces behind main depots after midnight"],
      verifiedTips: [
        "Avoid unlicensed taxi cabs; use verified ride-hailing tracking software.",
        "Keep your smartphone fully powered and store a localized translation card for immediate security pings."
      ],
      emergencyHelpline: "112 Consular Line"
    },
    priceAlerts: {
      bestBookingWindow: "45 to 60 days before boarding",
      priceTrend: "Prices are stable with a minor downward trend of 4% forecast for the coming month.",
      potentialDeals: ["Early bird reservation incentives", "Mid-week flights discounts"]
    },
    weatherSim: {
      activeForecast: "Crisp & Pleasant 19°C",
      outdoorAlternativeTips: "In case of wind, rain, or high ozone elements, the itinerary is equipped to seamlessly shift into high-fidelity indoor museums or artisanal cafes."
    }
  };
}

function getFallbackTranslation(text: string, targetLanguage: string) {
  return {
    translatedText: `[Fallback] ${text}`,
    pronunciation: `ph-on-et-ic (${text})`,
    notes: `Operating in Fallback Companion Mode for target language: ${targetLanguage || "local dialect"}.`
  };
}

function getFallbackChatResponse(message: string, destination: string, personality: string) {
  return {
    text: `### 📡 Smart Offline Companion Mode

Hi there! I am currently operating in **Smart Fallback Mode** because the collective Gemini API free-tier quota is temporarily exhausted:

1. **Your Destination**: *${destination || "Specified territory"}*
2. **Your Traveler Persona**: *${personality}*

**Immediate Advice regarding your question ("${message}"):**
- **Local Highlights**: We highly recommend visiting older town quarters, choosing street eateries with handwritten menus, and walking along the canal promenade in the evening.
- **Safety tip**: Remember to keep cash inside zippered front slots and maintain active mobile emergency registrations.
- **Regulations**: Ensure you have a physical ID on hand, as local municipal marshals do carry out spontaneous audits in tourist spots.

Please try again in a few minutes, or upgrade your key configuration to restore full contextual AI capabilities!`
  };
}

// API Route: Smart itinerary planning with personality & mood
app.post("/api/plan", async (req, res) => {
  const { destination, days = 3, personality = "Standard", mood = "", exploreMode = "standard", transport = "Public Transit", flexibility = "Balanced" } = req.body;
  try {
    if (!destination || typeof destination !== "string") {
      return res.status(400).json({ error: "Destination string is required." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a gorgeous futuristic AI-driven travel dossier and ${days}-day itinerary for: "${destination}".
Context parameters to adapt everything:
- Traveler Personality: ${personality} (calibrating destinations, pacing, stays, and hidden gems)
- Current Travel Mood/Prompt: "${mood}" (personalizing the aura, activities, and emotional tone of the trip)
- Preferred Transportation: ${transport} (adapt transit ways and carbon track to match this mode)
- Itinerary Flexibility: ${flexibility} (adapt the schedule density, free time, and pacing)
- Explore Mode: ${exploreMode === "local" ? "'Explore Like a Local' Hidden Gems Mode active (prioritize underrated spots, non-touristy cafes, peaceful zones)" : "Standard Mode"}

Give realistic advice on flight costs (with pricing predictive trends, optimal booking weekdays, luggage limits), low-end/mid-range/luxury daily budgets (with daily cost breakdown categories, extreme tipping culture detail, overspending hot spots warning, hidden safety fees, simulated price inflation, and money-saving hacks), and best season to visit. 
Provide a comprehensive, highly responsive day-by-day itinerary with 3 distinct daily phases (e.g. Morning, Afternoon, Evening). Make each activity feel incredibly human: give optimal entry hour, expected crowds, custom local tips, sunset/sunrise photo spots, walking fatigue rating, nearby cozy cafe rest spots, transit ways, and hidden viewpoint attractions within 200m.

Also generate:
1. Specific personalityAdvice highlighting how the trip aligns with a ${personality} seeking a "${mood}" mood.
2. A customized packingList of essential elements tailored to the location, gender-neutral, weather-based, and duration.
3. Accurate visaAndDocs checklists containing passport, visa rules, custom rules, vaccinations, and travel insurance guidelines.
4. carbonTrack estimation with approximate Co2 emissions in Kg, eco scores, and sustainable green transit ideas.
5. Direct scamAlerts including common local tourist scams, safety warning, overcharging concerns, and night risk indicators.
6. womenSafety dossier highlighting safer neighborhoods, verified lodging advice, women-friendly transport options, and helpful warnings.
7. priceAlerts predicting flight drops, hotels discounts, and best booking times.
8. weatherSim showing active weather conditions (temp, status) and outdoor substitution advice in case of bad rain elements.
9. situational local translations (emergency, medical, list allergy, local slang)`,
      config: {
        systemInstruction: "You are an expert AI Travel Planner, security auditor, and custom concierge. Generate highly contextual travel dossiers and security indices in structured JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            destination: { type: Type.STRING },
            country: { type: Type.STRING },
            language: { type: Type.STRING },
            bestTimeToVisit: { type: Type.STRING },
            flightCosts: {
              type: Type.OBJECT,
              properties: {
                info: { type: Type.STRING, description: "General travel and flight booking advice" },
                range: { type: Type.STRING, description: "Estimated flight price range in USD from major hubs" },
                historicalTrend: { type: Type.STRING, description: "Historical flight price context" },
                optimalBookingDay: { type: Type.STRING, description: "Best days of the week to check/book tickets" },
                baggageTips: { type: Type.STRING, description: "Luggage limits or low-cost carrier check-in hacks" }
              },
              required: ["info", "range"]
            },
            budget: {
              type: Type.OBJECT,
              properties: {
                currency: { type: Type.STRING },
                lowEndDaily: { type: Type.STRING, description: "Avg. cost of hostels, street food, and public transport per day" },
                midRangeDaily: { type: Type.STRING, description: "Avg. cost of cozy guesthouse, casual restaurants, and taxi travel per day" },
                luxuryDaily: { type: Type.STRING, description: "Avg. cost of luxury hotels, fine dining, and private transfers per day" },
                extraNotes: { type: Type.STRING, description: "Tipping culture or hidden fees advice" },
                dailyBreakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      cost: { type: Type.STRING }
                    },
                    required: ["category", "cost"]
                  }
                },
                emergencyReserve: { type: Type.STRING },
                hiddenCosts: { type: Type.STRING },
                moneySavingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                overspendingRisk: { type: Type.STRING },
                tippingCulture: { type: Type.STRING }
              },
              required: ["currency", "lowEndDaily", "midRangeDaily", "luxuryDaily"]
            },
            securityIndex: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.STRING, description: "Safety rating (e.g., 'Very Safe (88/100)' or 'Medium Risk (54/100)')" },
                concerns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific scams, health issues, or local security warnings" },
                safetyTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps travelers must take to protect themselves" }
              },
              required: ["score", "concerns", "safetyTips"]
            },
            emergencyContacts: {
              type: Type.OBJECT,
              properties: {
                police: { type: Type.STRING },
                ambulance: { type: Type.STRING },
                fireDept: { type: Type.STRING },
                embassyInfo: { type: Type.STRING, description: "Advice on finding local embassies or key emergency lines" }
              },
              required: ["police", "ambulance", "embassyInfo"]
            },
            accommodations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING, description: "hotel, hostel, or dorm" },
                  description: { type: Type.STRING },
                  approxPricePerNight: { type: Type.STRING },
                  whyStay: { type: Type.STRING },
                  reviewSnippet: { type: Type.STRING },
                  nearestMetro: { type: Type.STRING },
                  walkabilityScore: { type: Type.INTEGER },
                  noiseLevel: { type: Type.STRING },
                  digitalNomadFriendliness: { type: Type.STRING },
                  internetSpeed: { type: Type.STRING },
                  groupSuitability: { type: Type.STRING }
                },
                required: ["name", "type", "description", "approxPricePerNight"]
              }
            },
            amenities: {
              type: Type.OBJECT,
              properties: {
                restaurants: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      description: { type: Type.STRING },
                      averageCost: { type: Type.STRING },
                      touristTrapProbability: { type: Type.STRING },
                      authenticLocalScore: { type: Type.INTEGER },
                      reservationSuggested: { type: Type.BOOLEAN },
                      waitingTimeNormal: { type: Type.STRING }
                    },
                    required: ["name", "type", "description"]
                  }
                },
                chemists: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      address: { type: Type.STRING },
                      notes: { type: Type.STRING }
                    },
                    required: ["name", "notes"]
                  }
                }
              },
              required: ["restaurants", "chemists"]
            },
            translationPhrases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  local: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                  category: { type: Type.STRING, description: "greetings, shopping, medical, emergency, allergen, police" }
                },
                required: ["english", "local", "pronunciation", "category"]
              }
            },
            itineraryDays: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING, description: "Morning, Afternoon, Evening" },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        location: { type: Type.STRING },
                        estimatedCost: { type: Type.STRING },
                        isOutdoor: { type: Type.BOOLEAN, description: "True if activity takes place outside, false if indoor museums/dining/etc." },
                        idealHour: { type: Type.STRING },
                        crowdLevel: { type: Type.STRING },
                        localTips: { type: Type.STRING },
                        photographySpot: { type: Type.STRING },
                        fatigueLevel: { type: Type.STRING },
                        walkingDistance: { type: Type.STRING },
                        weatherSuitability: { type: Type.STRING },
                        transportOption: { type: Type.STRING },
                        nearbyRestSpot: { type: Type.STRING },
                        hiddenAttraction: { type: Type.STRING }
                      },
                      required: ["time", "title", "description"]
                    }
                  }
                },
                required: ["dayNumber", "title", "activities"]
              }
            },
            // Advanced response attributes matching src/types.ts
            personalityAdvice: { type: Type.STRING },
            packingList: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  category: { type: Type.STRING, description: "Clothing, Electronics, Documents, Essentials" },
                  whyNeeded: { type: Type.STRING }
                },
                required: ["item", "category", "whyNeeded"]
              }
            },
            visaAndDocs: {
              type: Type.OBJECT,
              properties: {
                visaRequired: { type: Type.STRING },
                passportValidity: { type: Type.STRING },
                insuranceSuggested: { type: Type.STRING },
                vaccinations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["visaRequired", "passportValidity"]
            },
            carbonTrack: {
              type: Type.OBJECT,
              properties: {
                estimatedCo2Kg: { type: Type.NUMBER },
                greenTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                sustainableScore: { type: Type.NUMBER, description: "Eco score from 1 to 100" }
              },
              required: ["estimatedCo2Kg", "greenTips", "sustainableScore"]
            },
            scamAlerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  severity: { type: Type.STRING, description: "low, medium, high" }
                },
                required: ["title", "description", "severity"]
              }
            },
            womenSafety: {
              type: Type.OBJECT,
              properties: {
                safeDistricts: { type: Type.ARRAY, items: { type: Type.STRING } },
                dangerousDistricts: { type: Type.ARRAY, items: { type: Type.STRING } },
                verifiedTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                emergencyHelpline: { type: Type.STRING }
              },
              required: ["safeDistricts", "emergencyHelpline"]
            },
            priceAlerts: {
              type: Type.OBJECT,
              properties: {
                bestBookingWindow: { type: Type.STRING },
                priceTrend: { type: Type.STRING },
                potentialDeals: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["bestBookingWindow", "priceTrend"]
            },
            weatherSim: {
              type: Type.OBJECT,
              properties: {
                activeForecast: { type: Type.STRING, description: "e.g., 'Rainy 15°C', 'Sunny 24°C', 'Partly Cloudy' etc." },
                alertMessage: { type: Type.STRING, description: "Optional severe weather warning if applicable" },
                outdoorAlternativeTips: { type: Type.STRING, description: "What to do in bad weather elements" }
              },
              required: ["activeForecast", "outdoorAlternativeTips"]
            }
          },
          required: [
            "destination",
            "country",
            "language",
            "bestTimeToVisit",
            "flightCosts",
            "budget",
            "securityIndex",
            "emergencyContacts",
            "accommodations",
            "amenities",
            "translationPhrases",
            "itineraryDays"
          ]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Plan API Error (triggering gorgeous smart simulation fallback):", error);
    const fallback = getFallbackItinerary(destination, Number(days) || 3, personality, mood, transport, flexibility);
    res.json({
      ...fallback,
      isQuotaFallback: true,
      apiErrorMessage: error?.message || String(error)
    });
  }
});

// API Route: Quick translations
app.post("/api/translate-text", async (req, res) => {
  const { text, targetLanguage } = req.body;
  try {
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: "Text and targetLanguage are required." });
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate this text: "${text}" into the language: "${targetLanguage}". Provide visual script and phonetics.`,
      config: {
        systemInstruction: "You are an expert real-time translation assistant. Output translation details clearly as JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING, description: "Translated text in local characters" },
            pronunciation: { type: Type.STRING, description: "Phonetic / romanized guide on how to say it" },
            notes: { type: Type.STRING, description: "Usage context, polite particles or cultural guidelines if applicable" }
          },
          required: ["translatedText", "pronunciation"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Translation API Error (triggering smart legacy translation simulation):", error);
    const fallback = getFallbackTranslation(text, targetLanguage);
    res.json({
      ...fallback,
      isQuotaFallback: true
    });
  }
});

// API Route: Advanced AI Travel Agent Chat
app.post("/api/chat", async (req, res) => {
  const { message, history = [], destination, personality = "Standard" } = req.body;
  try {
    const ai = getGeminiClient();

    const chatInstructions = `You are a floating virtual AI Travel Assistant embedded inside the 'Smart Voyage AI' Operating System.
You are helping a traveler who is exploring or planning to visit: "${destination || "their target destination"}".
Their active personality matches "${personality}".
Your responses must be highly specific, supportive, safe, and rich in local hidden gems.
Give actual names of neighborhoods, custom warnings about scams, exact emergency resources, or women-friendly guidance.
Be direct and friendly, avoiding robotic generalities. Always reply with rich Markdown formatting.`;

    const contents = history.map((chatMessage: any) => ({
      role: chatMessage.role === "assistant" ? "model" : "user",
      parts: [{ text: chatMessage.content }]
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: chatInstructions,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Chat API Error (triggering smart chatbot text simulation):", error);
    const fallback = getFallbackChatResponse(message, destination, personality);
    res.json({
      text: fallback.text,
      isQuotaFallback: true
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
