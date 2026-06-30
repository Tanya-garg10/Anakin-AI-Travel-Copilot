export interface Activity {
  id: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening';
  title: string;
  description: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  durationMinutes: number;
  costEstimate: number;
  transportToNext?: {
    mode: string;
    durationMinutes: number;
    distanceKm: number;
    cost: number;
  };
}

export interface DayPlan {
  dayNumber: number;
  dayTitle: string;
  activities: Activity[];
  alternativeActivity: {
    title: string;
    description: string;
    reason: string;
  };
  localFoodRecommendations: {
    name: string;
    cuisineType: string;
    recommendedDish: string;
    priceLevel: '$' | '$$' | '$$$';
    description: string;
  }[];
  hiddenGem: {
    title: string;
    description: string;
    whySpecial: string;
  };
}

export interface Itinerary {
  id?: string;
  destination: string;
  days: number;
  budgetType: string;
  totalCostEstimate: number;
  currency: string;
  vibe: string;
  style: string;
  transport: string;
  daysPlan: DayPlan[];
  markdown: string;
  budgetSummary: {
    food: number;
    attractions: number;
    transport: number;
    other: number;
  };
  createdAt?: string;
}

export interface WorkflowLog {
  id: string;
  timestamp: string;
  node: 'Docling' | 'ContextForge' | 'IBM Bob' | 'Granite' | 'LangFlow Router';
  message: string;
  status: 'info' | 'success' | 'warning' | 'working';
}

export interface DoclingDoc {
  name: string;
  size: string;
  status: 'parsed' | 'failed' | 'processing';
  extractedText: string;
  insights: {
    locations: string[];
    restaurants: string[];
    preferences: string[];
  };
}
