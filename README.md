<div align="center">

# ✈️ Anakin AI Travel Copilot

### *"Build smarter journeys, not just itineraries."*

[![IBM Bob Challenge](https://img.shields.io/badge/IBM_Bob-Challenge_Entry-054ADA?style=for-the-badge&logo=ibm&logoColor=white)](https://ibm.com)
[![Granite LLM](https://img.shields.io/badge/Granite--3B--Instruct-Powered-00D4AA?style=for-the-badge&logo=ai&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

**A premium, context-aware full-stack travel planner built for the IBM Bob Challenge.**  
Anakin uses an elite multi-node orchestration architecture to group attractions geographically, optimize budgets across multiple currencies, analyze unstructured brochures, and support dynamic single-day hot-swap revisions.

</div>

## 🎨 Visual Philosophy: Frosted Glass Slate

The interface implements an immersive **Frosted Glass Slate** design language:

| Design Element | Implementation |
|---|---|
| **Translucent Glass UI** | `backdrop-blur-xl` + `bg-white/5` overlays with micro-borders (`border-white/10`) |
| **Luminous Mesh Accents** | Ambient cyan, blue & violet orbs floating in deep `#0A0A1A` space |
| **Dynamic Chronology Rails** | Interactive milestones with zoom + GPS-optimized coordinate plotting |
| **Smooth Animations** | Framer Motion transitions for every UI state change |

## 🚀 Key Innovation Highlights

### 1. 📄 IBM Docling PDF/Brochure Intake
Most planners ignore the user's existing flight tickets, PDF brochures, or custom destination checklists. Our integrated **IBM Docling high-performance parser** structures messy unstructured texts, isolates target locations and dining spots, and feeds them directly into the Granite LLM prompt context.

### 2. 🧠 Active IBM LangFlow Orchestrator
We expose the full computation loop to the user! An interactive visual log monitor streams telemetry updates as the request triggers different workflow nodes:

```
Docling Parser ➔ Context Forge (Memory) ➔ LangFlow Router ➔ IBM Bob Strategy ➔ Granite LLM
```

### 3. ✨ The Winning Touch: "Regenerate Only One Day"
Instead of forcing users to recreate an entire multi-day trip because they want one minor adjustment, Anakin supports **hot-swapping single-day revisions**. Users can input specific daily instructions (e.g., *"Make it a rainy day alternative"* or *"Add a premium noodle bar"*), and our hot-swap API updates only that targeted day while keeping the rest of the trip completely untouched.

### 4. 🧮 Multi-Currency Budget Architect
Interactive cost allocation charts with on-the-fly currency conversion between **USD, EUR, JPY, INR, and GBP** — with precise converted balances based on Granite's budget tier estimations.

### 5. 🖼️ Smart Activity Images
Real landmark images fetched via **Wikipedia API** with Unsplash fallback and curated keyword-based defaults — no generic stock photos.

### 6. 🗺️ Interactive GPS Map
Every activity is plotted on a coordinate map with connecting route lines, walking distance markers, and zoom/pan controls.

### 7. ⭐ AI Preferences Dashboard
Rate and comment on activities. Your feedback is persisted and directly influences future trip regenerations — the AI learns what you love and avoids what you don't.

### 8. 💾 Copilot Vault (Local Persistence)
All planned trips are securely stored in browser localStorage. Reload, compare, or delete past adventures dynamically.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript 5.8 |
| **Styling** | Tailwind CSS 4 |
| **Animations** | Framer Motion (`motion/react`) |
| **Icons** | Lucide React |
| **Backend** | Express.js (TypeScript) |
| **AI / LLM** | Google Gemini API (`@google/genai`) |
| **Bundler** | Vite 6 |
| **Dev Runtime** | tsx |

### IBM Technologies Employed

| Component | Role |
|---|---|
| **IBM Bob Assistant** | Cognitive strategy layer for travel route cohesion & rest-sightseeing balance |
| **Granite-3B-Instruct** | LLM generating optimized travel paths, backup activities & food suggestions |
| **Docling Engine** | Raw ingestion for PDFs, images & unstructured text files |
| **Context Forge** | Preserves historical context & tracks cumulative walking metrics |
| **LangFlow** | Master node router orchestrating JSON and Markdown outputs |

## 📁 Project Structure

```
anakin/
├── index.html              # Entry HTML with SEO meta tags
├── server.ts               # Express backend with AI endpoints
├── vite.config.ts          # Vite + Tailwind + React config
├── package.json            # Dependencies & scripts
├── metadata.json           # App metadata (AI Studio)
├── tsconfig.json           # TypeScript configuration
├── .env.example            # Environment variable template
├── .gitignore
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Main application (1200+ lines)
│   ├── index.css           # Tailwind CSS import
│   ├── types.ts            # TypeScript interfaces
│   └── components/
│       ├── LangFlowVisualizer.tsx    # Workflow node telemetry display
│       ├── ItineraryMap.tsx          # GPS coordinate map plotting
│       ├── BudgetTracker.tsx         # Multi-currency budget charts
│       ├── ActivityImage.tsx         # Smart image fetching (Wiki + Unsplash)
│       ├── ActivityFeedback.tsx      # Star rating & comment system
│       └── AIPreferencesDashboard.tsx # Aggregated feedback viewer
└── assets/
    └── .aistudio/
```

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- (Optional) **Gemini API Key** for live AI generation

### 1. Clone the Repository

```bash
git clone https://github.com/Tanya-garg10/Task-Management-System.git anakin
cd anakin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
UNSPLASH_ACCESS_KEY=""   # Optional — falls back to Wikipedia images
```

> **Note:** The app runs in **mock mode** automatically when `GEMINI_API_KEY` is missing or set to the default placeholder. You'll still get a fully functional demo with realistic sample data.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 5. Production Build (Optional)

```bash
npm run build
npm start
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/docling/parse` | Parse brochure/PDF text via IBM Docling Engine |
| `POST` | `/api/itinerary/generate` | Generate a complete multi-day travel itinerary |
| `POST` | `/api/itinerary/regenerate-day` | Hot-swap regenerate a single day with custom guidance |
| `GET` | `/api/unsplash/image` | Fetch activity images (Wikipedia → Unsplash → curated fallbacks) |

## 🌐 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI-powered generation |
| `APP_URL` | ❌ | Hosted URL (auto-injected in AI Studio) |
| `UNSPLASH_ACCESS_KEY` | ❌ | Unsplash developer key for high-res activity images |

## 📜 Available Scripts

| Script | Command | Description |
|---|---|---|
| **Dev** | `npm run dev` | Start development server with hot reload |
| **Build** | `npm run build` | Build frontend (Vite) + backend (esbuild) |
| **Start** | `npm start` | Run production build |
| **Preview** | `npm run preview` | Preview Vite production build |
| **Lint** | `npm run lint` | TypeScript type checking |
| **Clean** | `npm run clean` | Remove build artifacts |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

<div align="center">

**Built with ❤️ for the IBM Bob Challenge**

*Powered by IBM Bob • Granite-3B-Instruct • Docling • LangFlow • Google Gemini*

</div>
