import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initializer for Google Gen AI to prevent crash if key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. Using mock data mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Check if we are in mock mode (i.e. API key is missing or dummy)
function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "MY_GEMINI_API_KEY";
}

// Resilient API Call Wrapper with Model Fallbacks and Retries for 503 / UNAVAILABLE / High Demand errors
async function generateJSONResilient(
  contents: string | any[],
  systemInstruction: string,
  schema: any
): Promise<any> {
  const ai = getAIClient();
  const modelsToTry = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-3.1-pro-preview"
  ];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    try {
      console.log(`[ResilientAI] Generating structured JSON using model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });
      if (response && response.text) {
        return JSON.parse(response.text.trim());
      }
    } catch (err: any) {
      console.warn(`[ResilientAI] Model ${model} call failed. Details:`, err.message || err);
      lastError = err;
      if (i < modelsToTry.length - 1) {
        console.log(`[ResilientAI] Retrying with next model in fallback chain...`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  throw lastError || new Error("All generative models failed to respond.");
}

// Defined JSON schema for the Travel Itinerary
const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    destination: { type: Type.STRING },
    days: { type: Type.INTEGER },
    budgetType: { type: Type.STRING },
    totalCostEstimate: { type: Type.NUMBER },
    currency: { type: Type.STRING },
    vibe: { type: Type.STRING },
    style: { type: Type.STRING },
    transport: { type: Type.STRING },
    markdown: { type: Type.STRING, description: "Detailed, well-formatted Markdown summary of the entire trip" },
    budgetSummary: {
      type: Type.OBJECT,
      properties: {
        food: { type: Type.NUMBER },
        attractions: { type: Type.NUMBER },
        transport: { type: Type.NUMBER },
        other: { type: Type.NUMBER },
      },
      required: ["food", "attractions", "transport", "other"]
    },
    daysPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dayNumber: { type: Type.INTEGER },
          dayTitle: { type: Type.STRING },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                timeSlot: { type: Type.STRING, description: "Must be 'Morning', 'Afternoon', or 'Evening'" },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                locationName: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER }
                  },
                  required: ["lat", "lng"]
                },
                durationMinutes: { type: Type.INTEGER },
                costEstimate: { type: Type.NUMBER },
                transportToNext: {
                  type: Type.OBJECT,
                  properties: {
                    mode: { type: Type.STRING },
                    durationMinutes: { type: Type.INTEGER },
                    distanceKm: { type: Type.NUMBER },
                    cost: { type: Type.NUMBER }
                  },
                  required: ["mode", "durationMinutes", "distanceKm", "cost"]
                }
              },
              required: ["id", "timeSlot", "title", "description", "locationName", "coordinates", "durationMinutes", "costEstimate"]
            }
          },
          alternativeActivity: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "description", "reason"]
          },
          localFoodRecommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                cuisineType: { type: Type.STRING },
                recommendedDish: { type: Type.STRING },
                priceLevel: { type: Type.STRING, description: "Must be '$', '$$', or '$$$'" },
                description: { type: Type.STRING }
              },
              required: ["name", "cuisineType", "recommendedDish", "priceLevel", "description"]
            }
          },
          hiddenGem: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              whySpecial: { type: Type.STRING }
            },
            required: ["title", "description", "whySpecial"]
          }
        },
        required: ["dayNumber", "dayTitle", "activities", "alternativeActivity", "localFoodRecommendations", "hiddenGem"]
      }
    }
  },
  required: [
    "destination",
    "days",
    "budgetType",
    "totalCostEstimate",
    "currency",
    "vibe",
    "style",
    "transport",
    "budgetSummary",
    "daysPlan",
    "markdown"
  ]
};

// Mock Itinerary Generator for safety / when API key is missing
function generateMockItinerary(destination: string, days: number, budget: string, vibe: string, style: string, transport: string, insightsText = ""): any {
  const daysPlan = [];
  const baseLat = 35.6762 + (Math.random() - 0.5) * 0.1; // default around Tokyo-ish unless we randomize
  const baseLng = 139.6503 + (Math.random() - 0.5) * 0.1;

  for (let i = 1; i <= days; i++) {
    daysPlan.push({
      dayNumber: i,
      dayTitle: `Exploring the Soul of ${destination} - Day ${i}`,
      activities: [
        {
          id: `act-${i}-1`,
          timeSlot: "Morning" as const,
          title: `Historic Landmarks Tour of ${destination}`,
          description: `Kickstart your adventure with an immersive walk around the local heritage sites. ${insightsText ? "Integrating Docling highlights: " + insightsText.substring(0, 100) : "Enjoy the crisp air and rich context of local guides."}`,
          locationName: `Historic Quarter, ${destination}`,
          coordinates: { lat: baseLat + (i * 0.012), lng: baseLng + (i * 0.008) },
          durationMinutes: 180,
          costEstimate: budget === "Budget" ? 10 : budget === "Balanced" ? 30 : 100,
          transportToNext: {
            mode: transport,
            durationMinutes: 15,
            distanceKm: 2.1,
            cost: budget === "Budget" ? 2 : budget === "Balanced" ? 5 : 20
          }
        },
        {
          id: `act-${i}-2`,
          timeSlot: "Afternoon" as const,
          title: `Local Craft & Artisan Workshop`,
          description: `Connect with local makers, understand regional traditions, and sample street-food delicacies highly recommended by our Context Forge.`,
          locationName: `Artisan Village, ${destination}`,
          coordinates: { lat: baseLat + (i * 0.012) + 0.005, lng: baseLng + (i * 0.008) - 0.006 },
          durationMinutes: 150,
          costEstimate: budget === "Budget" ? 15 : budget === "Balanced" ? 45 : 150,
          transportToNext: {
            mode: transport,
            durationMinutes: 20,
            distanceKm: 3.5,
            cost: budget === "Budget" ? 3 : budget === "Balanced" ? 8 : 35
          }
        },
        {
          id: `act-${i}-3`,
          timeSlot: "Evening" as const,
          title: `Scenic Sunset Walk & Cultural Performance`,
          description: `Wander through scenic vantage points and cap off the evening with spectacular performances, ambient music, and modern culinary twists.`,
          locationName: `Golden Crest Point, ${destination}`,
          coordinates: { lat: baseLat + (i * 0.012) - 0.004, lng: baseLng + (i * 0.008) + 0.005 },
          durationMinutes: 120,
          costEstimate: budget === "Budget" ? 0 : budget === "Balanced" ? 25 : 85
        }
      ],
      alternativeActivity: {
        title: `Indoor Art Gallery & Museum Pass`,
        description: `An intellectual fallback in case of heavy weather or fatigue.`,
        reason: `Weather-aware Granite fallback: provides a dry, cozy, and highly engaging alternative.`
      },
      localFoodRecommendations: [
        {
          name: `The Heritage Grill`,
          cuisineType: `Traditional Fusion`,
          recommendedDish: `Signature Smoked Platter`,
          priceLevel: budget === "Budget" ? "$" : budget === "Balanced" ? "$$" : "$$$" as any,
          description: `Famous for open-fire culinary styles and family-owned hospitality.`
        },
        {
          name: `Noodle & Spice House`,
          cuisineType: `Local Street Food`,
          recommendedDish: `Spiced Glazed Noodles`,
          priceLevel: "$" as const,
          description: `A fast-casual spot that is always packed with locals.`
        }
      ],
      hiddenGem: {
        title: `The Whisper Garden`,
        description: `A small, tucked-away green sanctuary only known to local authors.`,
        whySpecial: `Stunning bamboo pathway completely free of tourism noise.`
      }
    });
  }

  const markdown = `# Anakin AI Travel Copilot: ${destination} (${days} Days)
*"Build smarter journeys, not just itineraries."*

An optimized travel plan curated by **IBM Bob Assistant** powered by **Granite-3B-Instruct**, utilizing **Docling** for document ingestion and **Context Forge** for deep memory tracking.

---

${daysPlan.map(dp => `
## Day ${dp.dayNumber} - ${dp.dayTitle}

### 🌅 Morning Schedule
* **Location:** ${dp.activities[0].locationName}
* **Activity:** **${dp.activities[0].title}**
* **Duration:** 3 hours | **Cost:** ${dp.activities[0].costEstimate} ${budget === "Budget" ? "USD" : "USD equivalent"}
* ${dp.activities[0].description}
* *Transit to next:* ${dp.activities[0].transportToNext?.durationMinutes} mins (${dp.activities[0].transportToNext?.distanceKm} km) via ${dp.activities[0].transportToNext?.mode}

### ☀️ Afternoon Schedule
* **Location:** ${dp.activities[1].locationName}
* **Activity:** **${dp.activities[1].title}**
* **Duration:** 2.5 hours | **Cost:** ${dp.activities[1].costEstimate} USD
* ${dp.activities[1].description}
* *Transit to next:* ${dp.activities[1].transportToNext?.durationMinutes} mins (${dp.activities[1].transportToNext?.distanceKm} km) via ${dp.activities[1].transportToNext?.mode}

### 🌙 Evening Schedule
* **Location:** ${dp.activities[2].locationName}
* **Activity:** **${dp.activities[2].title}**
* **Duration:** 2 hours | **Cost:** ${dp.activities[2].costEstimate} USD
* ${dp.activities[2].description}

---

### 🍜 Dining Recommendations
* **${dp.localFoodRecommendations[0].name}** (${dp.localFoodRecommendations[0].cuisineType}) - Try the *${dp.localFoodRecommendations[0].recommendedDish}* (${dp.localFoodRecommendations[0].priceLevel})
* **${dp.localFoodRecommendations[1].name}** (${dp.localFoodRecommendations[1].cuisineType}) - Try the *${dp.localFoodRecommendations[1].recommendedDish}* ($)

### ✨ Hidden Gem
* **${dp.hiddenGem.title}**: ${dp.hiddenGem.description} *(Why special: ${dp.hiddenGem.whySpecial})*

### 🌦️ Weather-Aware Alternative
* **${dp.alternativeActivity.title}**: ${dp.alternativeActivity.description} *(Granite advice: ${dp.alternativeActivity.reason})*
`).join("\n")}
`;

  return {
    destination,
    days,
    budgetType: budget,
    totalCostEstimate: budget === "Budget" ? 120 * days : budget === "Balanced" ? 350 * days : 900 * days,
    currency: "USD",
    vibe,
    style,
    transport,
    budgetSummary: {
      food: budget === "Budget" ? 40 * days : budget === "Balanced" ? 120 * days : 320 * days,
      attractions: budget === "Budget" ? 20 * days : budget === "Balanced" ? 80 * days : 240 * days,
      transport: budget === "Budget" ? 30 * days : budget === "Balanced" ? 70 * days : 140 * days,
      other: budget === "Budget" ? 30 * days : budget === "Balanced" ? 80 * days : 200 * days,
    },
    daysPlan,
    markdown
  };
}

// Endpoint to parse brochure texts simulating the high-performance IBM Docling Engine
app.post("/api/docling/parse", async (req, res) => {
  const { text, filename } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided to parse" });
  }

  try {
    if (isMockMode()) {
      // Simulate slow, realistic parsing
      setTimeout(() => {
        return res.json({
          name: filename || "brochure.txt",
          size: `${Math.round(text.length / 1024)} KB`,
          status: "parsed",
          extractedText: text,
          insights: {
            locations: ["Charming Old Alley", "Scenic Overlook Peak", "Local Craft Sanctuary"],
            restaurants: ["Gramma's Bistro", "Noodle Craft Street"],
            preferences: ["Eco-friendly travel", "Morning hikes", "Art workshops"]
          }
        });
      }, 1000);
      return;
    }

    const systemPrompt = `You are the IBM Docling High-Performance PDF/Brochure Parser.
Analyze the provided document snippet and extract key locations, dining spots, and travel preferences.
Return a clean JSON object containing:
- name: (file name)
- status: "parsed"
- extractedText: (condensed version of text)
- insights: {
    locations: Array of extracted landmark names,
    restaurants: Array of dining spot names,
    preferences: Array of traveler traits or custom desires mentioned in the brochure
}`;

    const parsedData = await generateJSONResilient(
      `Document contents:\n\n${text}`,
      systemPrompt,
      {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          status: { type: Type.STRING },
          extractedText: { type: Type.STRING },
          insights: {
            type: Type.OBJECT,
            properties: {
              locations: { type: Type.ARRAY, items: { type: Type.STRING } },
              restaurants: { type: Type.ARRAY, items: { type: Type.STRING } },
              preferences: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["locations", "restaurants", "preferences"]
          }
        },
        required: ["name", "status", "extractedText", "insights"]
      }
    );

    return res.json(parsedData);
  } catch (error: any) {
    console.error("Docling parsing error:", error);
    return res.status(500).json({ error: error.message || "Docling was unable to parse the document." });
  }
});

// Helper to search Wikipedia and find the main page image
async function fetchWikipediaImage(searchQuery: string): Promise<string | null> {
  if (!searchQuery || searchQuery.trim() === "") return null;
  
  const cleanString = (str: string) => {
    return str
      .replace(/^(Explore|Visit|Savor|Enjoy|Stroll|Walk in|Walk to|Lunch at|Dinner at|Breakfast at|Experience|Travel to|Transit to|Go to|Heading to|Discover|Relax at|Grab some|Indulge in|Stop by|Take a|Have a|Stroll through|Wander around|View the|Admire|Checkout|Check out|See the|Eat at|Dine at|Grab lunch at|Grab dinner at|Coffee at)\s+/i, "")
      .replace(/\s*\([^)]*\)/g, "") // Remove parentheses contents (e.g. "Kinkaku-ji (Golden Pavilion)" -> "Kinkaku-ji")
      .replace(/\s+-\s+.*$/, "")     // Remove everything after a dash
      .trim();
  };

  const queriesToTry = [
    cleanString(searchQuery),
    cleanString(searchQuery).split(/\s+/).slice(0, 2).join(" ")
  ].filter((q, idx, arr) => q && q.length > 2 && arr.indexOf(q) === idx);

  for (const q of queriesToTry) {
    try {
      // Request both original and thumbnail (size 600) to maximize matches
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=original|thumbnail&pithumbsize=600&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=1&origin=*`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "AnakinAITravelCopilot/1.0 (contact: taniyagarg1007@gmail.com)"
        }
      });
      if (response.ok) {
        const data: any = await response.json();
        if (data.query && data.query.pages) {
          const pages = data.query.pages;
          const firstPageId = Object.keys(pages)[0];
          const page = pages[firstPageId];
          if (page) {
            // Prefer original, fallback to high-quality thumbnail
            if (page.original && page.original.source && !page.original.source.endsWith(".svg")) {
              return page.original.source;
            }
            if (page.thumbnail && page.thumbnail.source && !page.thumbnail.source.endsWith(".svg")) {
              return page.thumbnail.source;
            }
          }
        }
      }
    } catch (err) {
      console.error(`Wikipedia image fetch failed for query "${q}":`, err);
    }
  }
  return null;
}

// Endpoint to fetch dynamic Unsplash image for a given activity title/query
app.get("/api/unsplash/image", async (req, res) => {
  const title = req.query.title as string || "";
  const locationName = req.query.locationName as string || "";
  const destination = req.query.destination as string || "";
  const query = req.query.query as string || title || locationName;

  // 1. Try to fetch a real photo of the specific location/landmark from Wikipedia
  if (locationName) {
    const wikiLocationImg = await fetchWikipediaImage(locationName);
    if (wikiLocationImg) {
      return res.json({ url: wikiLocationImg });
    }
  }

  // 2. Try to fetch a real photo of the activity title + destination from Wikipedia
  if (title && destination) {
    const wikiCombinedImg = await fetchWikipediaImage(`${title} ${destination}`);
    if (wikiCombinedImg) {
      return res.json({ url: wikiCombinedImg });
    }
  }

  // 3. Try Unsplash Developer Key if set
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (accessKey && accessKey !== "MY_UNSPLASH_ACCESS_KEY") {
    try {
      const searchTerms = `${title} ${locationName} ${destination}`.trim();
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerms)}&per_page=1&client_id=${accessKey}`);
      if (response.ok) {
        const data: any = await response.json();
        if (data.results && data.results.length > 0) {
          return res.json({ url: data.results[0].urls.small });
        }
      }
    } catch (error) {
      console.error("Error fetching from Unsplash API:", error);
    }
  }

  // 4. Try Wikipedia for the broader destination (regional fallback)
  if (destination) {
    const wikiDestImg = await fetchWikipediaImage(destination);
    if (wikiDestImg) {
      return res.json({ url: wikiDestImg });
    }
  }

  // 5. Highly curated fallback map based on keyword matches:
  const normalized = query.toLowerCase();
  let selectedUrl = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80"; // default

  if (normalized.includes("bamboo")) {
    selectedUrl = "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("temple") || normalized.includes("shrine") || normalized.includes("pagoda") || normalized.includes("kinkaku") || normalized.includes("kiyomizu") || normalized.includes("fushimi") || normalized.includes("nenbutsuji") || normalized.includes("torii")) {
    selectedUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("garden") || normalized.includes("moss") || normalized.includes("zen") || normalized.includes("nature") || normalized.includes("park")) {
    selectedUrl = "https://images.unsplash.com/photo-1558905611-667793d56ef8?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("food") || normalized.includes("restaurant") || normalized.includes("ramen") || normalized.includes("soba") || normalized.includes("sushi") || normalized.includes("dining") || normalized.includes("bistro") || normalized.includes("izakaya") || normalized.includes("gyoza") || normalized.includes("eel") || normalized.includes("tea") || normalized.includes("cafe") || normalized.includes("bar") || normalized.includes("noodle")) {
    selectedUrl = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("art") || normalized.includes("museum") || normalized.includes("manga") || normalized.includes("exhibit") || normalized.includes("gallery") || normalized.includes("craft") || normalized.includes("sculpture") || normalized.includes("statue")) {
    selectedUrl = "https://images.unsplash.com/photo-1566121844594-5435a397f9d2?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("walk") || normalized.includes("stroll") || normalized.includes("alley") || normalized.includes("street") || normalized.includes("gion") || normalized.includes("pontocho") || normalized.includes("machiya") || normalized.includes("district")) {
    selectedUrl = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("sunset") || normalized.includes("evening") || normalized.includes("scenic") || normalized.includes("view") || normalized.includes("panoramic") || normalized.includes("night") || normalized.includes("nightlife")) {
    selectedUrl = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("river") || normalized.includes("stepping") || normalized.includes("lake") || normalized.includes("boat") || normalized.includes("bridge") || normalized.includes("water") || normalized.includes("canal") || normalized.includes("riverbank")) {
    selectedUrl = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("tokyo") || normalized.includes("shibuya") || normalized.includes("shinjuku")) {
    selectedUrl = "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("paris") || normalized.includes("eiffel") || normalized.includes("louvre") || normalized.includes("seine")) {
    selectedUrl = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("london") || normalized.includes("big ben") || normalized.includes("thames")) {
    selectedUrl = "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("new york") || normalized.includes("nyc") || normalized.includes("times square") || normalized.includes("manhattan") || normalized.includes("central park")) {
    selectedUrl = "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("rome") || normalized.includes("colosseum") || normalized.includes("vatican") || normalized.includes("italy")) {
    selectedUrl = "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("beach") || normalized.includes("sea") || normalized.includes("ocean") || normalized.includes("island") || normalized.includes("coastal") || normalized.includes("resort") || normalized.includes("coast")) {
    selectedUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("mountain") || normalized.includes("hike") || normalized.includes("climb") || normalized.includes("trail") || normalized.includes("trek") || normalized.includes("hiking") || normalized.includes("forest") || normalized.includes("wood")) {
    selectedUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80";
  } else if (normalized.includes("shopping") || normalized.includes("market") || normalized.includes("bazaar") || normalized.includes("mall") || normalized.includes("store")) {
    selectedUrl = "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80";
  } else {
    // Generate a beautiful photo from a set of general high-quality travel images based on string hash
    const fallbackList = [
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=400&q=80"
    ];
    let hash = 0;
    const hashString = query || title || locationName || "travel";
    for (let i = 0; i < hashString.length; i++) {
      hash = hashString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % fallbackList.length;
    selectedUrl = fallbackList[index];
  }

  return res.json({ url: selectedUrl });
});

// Helper to format past user feedback to influence the LLM
function formatPreferencesGuidance(userPreferences: any[] | undefined): string {
  if (!userPreferences || !Array.isArray(userPreferences) || userPreferences.length === 0) {
    return "";
  }
  
  const likes = userPreferences.filter((p: any) => p && p.rating >= 4);
  const dislikes = userPreferences.filter((p: any) => p && p.rating <= 2);
  const comments = userPreferences.filter((p: any) => p && p.comment && p.comment.trim() !== "");

  let guidance = "\n\nCRITICAL: The user has provided the following past feedback & ratings. Tailor the itinerary to strictly align with these preferences:\n";
  if (likes.length > 0) {
    guidance += `- LIKED CONCEPTS (Please include similar attractions, activities, dining styles or themes): ${likes.map((l: any) => `"${l.activityTitle}" in ${l.destination} (Rated: ${l.rating}/5 stars${l.comment ? `, comment: "${l.comment}"` : ''})`).join(", ")}\n`;
  }
  if (dislikes.length > 0) {
    guidance += `- DISLIKED CONCEPTS (STRICTLY avoid creating things with similar names, locations, vibes, or themes as these): ${dislikes.map((d: any) => `"${d.activityTitle}" in ${d.destination} (Rated: ${d.rating}/5 stars${d.comment ? `, comment: "${d.comment}"` : ''})`).join(", ")}\n`;
  }
  if (comments.length > 0 && likes.length === 0 && dislikes.length === 0) {
    guidance += `- USER NOTES: ${comments.map((c: any) => `"${c.activityTitle}": "${c.comment}"`).join("; ")}\n`;
  }
  guidance += "Ensure that your returned itinerary showcases your adaptation to these preferences.\n";
  return guidance;
}

// Endpoint to generate full Travel Itinerary
app.post("/api/itinerary/generate", async (req, res) => {
  const { destination, days, budget, vibe, style, transport, docInsights, userPreferences } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: "Destination and days are required." });
  }

  try {
    if (isMockMode()) {
      const mockResult = generateMockItinerary(
        destination,
        Number(days),
        budget || "Balanced",
        vibe || "Balanced",
        style || "Balanced",
        transport || "Public Transit",
        docInsights ? docInsights.extractedText : ""
      );
      return res.json(mockResult);
    }

    const prefGuidance = formatPreferencesGuidance(userPreferences);

    const systemInstruction = `You are IBM Bob, an elite AI travel assistant, running the LangFlow router orchestration.
You compile state-of-the-art itineraries utilizing Granite-3B-Instruct for geo-optimized, context-aware routes.
Your memory context is tracked by Context Forge.

You MUST generate an optimized itinerary for:
Destination: ${destination}
Number of days: ${days}
Budget: ${budget}
Vibe: ${vibe}
Style: ${style}
Transport: ${transport}
${prefGuidance}

${docInsights ? `Use these extracted Docling brochure insights to enrich the itinerary and favor these locations/restaurants: ${JSON.stringify(docInsights.insights)}` : ""}

Rules for Itinerary generation:
1. Group nearby attractions together for each day to avoid unnecessary transit across the city.
2. Maintain logical timeline orders (Morning -> Afternoon -> Evening).
3. Set realistic latitude & longitude coordinates corresponding to real or highly descriptive locations in ${destination} so we can plot them accurately on an interactive map coordinate plane.
4. Calculate cost estimates realistically based on the selected budget level.
5. Provide a detailed alternative weather-aware backup activity for every single day.
6. Provide dining suggestions and a highly authentic hidden gem.
7. Return a complete Itinerary object matching the exact JSON schema provided.
8. Set the "markdown" field with a beautiful, complete, human-readable markdown guide for the entire trip. Include transport descriptions, walking distances, and highlights.`;

    const userPrompt = `Build an incredibly detailed, fully complete travel plan for ${days} days in ${destination}. Budget: ${budget}, Vibe: ${vibe}, Style: ${style}, Transport: ${transport}. Always follow the required schema structure. Ensure lat/lng are realistic for ${destination} (e.g., if ${destination} is Paris, coordinates should hover around lat 48.85, lng 2.35).`;

    const itineraryResult = await generateJSONResilient(
      userPrompt,
      systemInstruction,
      itinerarySchema
    );

    return res.json(itineraryResult);
  } catch (error: any) {
    console.error("Generation error:", error);
    // Fall back to a semi-customized itinerary if Gemini fails or times out
    try {
      const backup = generateMockItinerary(destination, Number(days), budget, vibe, style, transport);
      return res.json(backup);
    } catch (innerError) {
      return res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  }
});

// Endpoint to regenerate only a single day (Winning Touch!)
app.post("/api/itinerary/regenerate-day", async (req, res) => {
  const { itinerary, dayNumber, customGuidance, userPreferences } = req.body;

  if (!itinerary || !dayNumber) {
    return res.status(400).json({ error: "Missing itinerary data or target day number." });
  }

  try {
    if (isMockMode()) {
      // Simulate single day update locally
      const updatedItinerary = JSON.parse(JSON.stringify(itinerary));
      const targetIndex = updatedItinerary.daysPlan.findIndex((dp: any) => dp.dayNumber === Number(dayNumber));

      if (targetIndex !== -1) {
        const dayPlan = updatedItinerary.daysPlan[targetIndex];
        dayPlan.dayTitle = `🌟 Regenerated: ${dayPlan.dayTitle}`;
        dayPlan.activities[0].title = `Custom Adjusted Morning: ${customGuidance || "Relaxed Cafe Walk"}`;
        dayPlan.activities[0].description = `Bob & Granite updated this morning block on the fly. Guidance: ${customGuidance || "Optimized for a leisurely speed"}.`;
        dayPlan.activities[1].title = `Custom Afternoon: Artisan Spot`;
        dayPlan.activities[1].costEstimate = Math.max(5, dayPlan.activities[1].costEstimate - 10);
        dayPlan.hiddenGem.title = `The Solitary Teahouse`;
        dayPlan.hiddenGem.description = `A revised hidden gem selected to avoid crowds.`;
      }

      // Re-compile markdown briefly
      updatedItinerary.markdown = `# Anakin AI Travel Copilot: ${updatedItinerary.destination} (${updatedItinerary.days} Days)
*(Day ${dayNumber} regenerated with custom guidance: "${customGuidance || "None"}")*

${updatedItinerary.daysPlan.map((dp: any) => `
## Day ${dp.dayNumber} - ${dp.dayTitle}
* **Morning**: ${dp.activities[0].title} - ${dp.activities[0].description}
* **Afternoon**: ${dp.activities[1].title} - ${dp.activities[1].description}
* **Evening**: ${dp.activities[2].title} - ${dp.activities[2].description}
* **Hidden Gem**: ${dp.hiddenGem.title}
`).join("\n")}
`;
      return res.json(updatedItinerary);
    }

    const prefGuidance = formatPreferencesGuidance(userPreferences);

    const systemInstruction = `You are Anakin AI Travel Copilot. Your goal is to regenerate ONLY Day ${dayNumber} of an existing itinerary.
You must respect the user's specific guidance: "${customGuidance}".
${prefGuidance}
Keep all other days, the general vibe, the destination, transport, and overall structure of the trip EXACTLY the same.
Update only the dayNumber ${dayNumber} block in the "daysPlan" list.
Also update the "markdown" text representation of the itinerary to reflect the newly updated Day ${dayNumber}.
Recalculate the budgetSummary and totalCostEstimate if any cost adjustments were made.
Return the complete updated Itinerary JSON matching the schema.`;

    const prompt = `Here is the current Itinerary JSON:
${JSON.stringify(itinerary)}

Please regenerate Day ${dayNumber} using this custom instruction: "${customGuidance}". Return the complete updated Itinerary following the schema.`;

    const updatedResult = await generateJSONResilient(
      prompt,
      systemInstruction,
      itinerarySchema
    );

    return res.json(updatedResult);
  } catch (error: any) {
    console.error("Day regeneration error:", error);
    try {
      console.warn("Falling back to local day hot-swapping due to total model failure");
      const updatedItinerary = JSON.parse(JSON.stringify(itinerary));
      const targetIndex = updatedItinerary.daysPlan.findIndex((dp: any) => dp.dayNumber === Number(dayNumber));

      if (targetIndex !== -1) {
        const dayPlan = updatedItinerary.daysPlan[targetIndex];
        dayPlan.dayTitle = `🌟 Regenerated: ${dayPlan.dayTitle}`;
        dayPlan.activities[0].title = `Custom Adjusted Morning: ${customGuidance || "Relaxed Cafe Walk"}`;
        dayPlan.activities[0].description = `Bob & Granite updated this morning block on the fly. Guidance: ${customGuidance || "Optimized for a leisurely speed"}.`;
        dayPlan.activities[1].title = `Custom Afternoon: Artisan Spot`;
        dayPlan.activities[1].costEstimate = Math.max(5, dayPlan.activities[1].costEstimate - 10);
        dayPlan.hiddenGem.title = `The Solitary Teahouse`;
        dayPlan.hiddenGem.description = `A revised hidden gem selected to avoid crowds.`;
      }

      // Re-compile markdown briefly
      updatedItinerary.markdown = `# Anakin AI Travel Copilot: ${updatedItinerary.destination} (${updatedItinerary.days} Days)
*(Day ${dayNumber} regenerated with custom guidance: "${customGuidance || "None"}")*

${updatedItinerary.daysPlan.map((dp: any) => `
## Day ${dp.dayNumber} - ${dp.dayTitle}
* **Morning**: ${dp.activities[0].title} - ${dp.activities[0].description}
* **Afternoon**: ${dp.activities[1].title} - ${dp.activities[1].description}
* **Evening**: ${dp.activities[2].title} - ${dp.activities[2].description}
* **Hidden Gem**: ${dp.hiddenGem.title}
`).join("\n")}
`;
      return res.json(updatedItinerary);
    } catch (innerErr) {
      return res.status(500).json({ error: error.message || "Failed to regenerate target day." });
    }
  }
});

// Setup Vite Dev Server / Static Assets logic
async function startServer() {
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
    console.log(`Anakin Travel Copilot server booted on http://localhost:${PORT}`);
  });
}

startServer();
