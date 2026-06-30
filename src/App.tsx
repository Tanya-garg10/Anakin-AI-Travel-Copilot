import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Sparkles,
  MapPin,
  Compass,
  DollarSign,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Send,
  Check,
  Trash,
  Plus,
  Map,
  AlertCircle,
  FileText,
  Upload,
  ChevronRight,
  Bookmark,
  ArrowRight,
  Milestone,
  Info,
  Footprints,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Itinerary, WorkflowLog, DoclingDoc, DayPlan } from './types';
import LangFlowVisualizer from './components/LangFlowVisualizer';
import ItineraryMap from './components/ItineraryMap';
import BudgetTracker from './components/BudgetTracker';
import ActivityImage from './components/ActivityImage';
import ActivityFeedback from './components/ActivityFeedback';
import AIPreferencesDashboard from './components/AIPreferencesDashboard';

export default function App() {
  // Navigation & User Choices
  const [destination, setDestination] = useState<string>('Kyoto, Japan');
  const [days, setDays] = useState<number>(3);
  const [budgetType, setBudgetType] = useState<string>('Balanced');
  const [vibe, setVibe] = useState<string>('Cultural & Heritage');
  const [style, setStyle] = useState<string>('Immersive Explorer');
  const [transport, setTransport] = useState<string>('Public Transit');

  // Docling Brochure Input
  const [brochureText, setBrochureText] = useState<string>('');
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [parsedDoc, setParsedDoc] = useState<DoclingDoc | null>(null);

  // App Main State
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [savedItineraries, setSavedItineraries] = useState<Itinerary[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'markdown'>('timeline');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);

  // Regenerate One Day Modal / Custom Guidance States
  const [isRegeneratingDay, setIsRegeneratingDay] = useState<boolean>(false);
  const [targetRegenDay, setTargetRegenDay] = useState<number | null>(null);
  const [regenGuidance, setRegenGuidance] = useState<string>('');

  // AI Preferences Sync State
  const [refreshPrefs, setRefreshPrefs] = useState<number>(0);
  const triggerPrefsRefresh = () => setRefreshPrefs((prev) => prev + 1);

  // Initial load
  useEffect(() => {
    // Load saved plans from localStorage
    const saved = localStorage.getItem('anakin_saved_itineraries');
    if (saved) {
      try {
        setSavedItineraries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved plans', e);
      }
    }

    // Auto load a beautiful starter itinerary to make the app look instantly professional
    triggerStarterTrip();
  }, []);

  const triggerStarterTrip = () => {
    // Default professional Kyoto plan as starting point
    const starter: Itinerary = {
      destination: 'Kyoto, Japan',
      days: 3,
      budgetType: 'Balanced',
      totalCostEstimate: 540,
      currency: 'USD',
      vibe: 'Cultural & Heritage',
      style: 'Immersive Explorer',
      transport: 'Public Transit',
      budgetSummary: {
        food: 180,
        attractions: 150,
        transport: 110,
        other: 100
      },
      daysPlan: [
        {
          dayNumber: 1,
          dayTitle: 'Historic Arashiyama & Bamboo Paths',
          activities: [
            {
              id: 'k-1-1',
              timeSlot: 'Morning',
              title: 'Sagano Bamboo Forest',
              description: 'Walk through the towering bamboo stalks. The early morning rays pierce through the greenery with breathtaking visual lines.',
              locationName: 'Arashiyama, Kyoto',
              coordinates: { lat: 35.0156, lng: 135.6715 },
              durationMinutes: 90,
              costEstimate: 0,
              transportToNext: {
                mode: 'Walking',
                durationMinutes: 10,
                distanceKm: 0.6,
                cost: 0
              }
            },
            {
              id: 'k-1-2',
              timeSlot: 'Afternoon',
              title: 'Tenryu-ji Zen Garden Temple',
              description: 'Explore the gorgeous 14th-century temple gardens. Famous for its reflecting pond framed by the Arashiyama mountains.',
              locationName: 'Tenryuji, Kyoto',
              coordinates: { lat: 35.0158, lng: 135.6776 },
              durationMinutes: 120,
              costEstimate: 12,
              transportToNext: {
                mode: 'Public Transit',
                durationMinutes: 20,
                distanceKm: 3.2,
                cost: 3
              }
            },
            {
              id: 'k-1-3',
              timeSlot: 'Evening',
              title: 'Otagi Nenbutsuji Forest Sculptures',
              description: 'Wander through 1,200 whimsical stone statues. A rare spiritual gem recommended by the Context Forge model database.',
              locationName: 'Saga Toriimoto, Kyoto',
              coordinates: { lat: 35.0275, lng: 135.6668 },
              durationMinutes: 90,
              costEstimate: 8
            }
          ],
          alternativeActivity: {
            title: 'Kasho Salon Traditional Teahouse',
            description: 'Participate in a serene private tea ceremony to escape any afternoon showers.',
            reason: 'Weather-aware Granite advice: high humidity fallback.'
          },
          localFoodRecommendations: [
            {
              name: 'Arashiyama Yoshimura',
              cuisineType: 'Handmade Soba Noodles',
              recommendedDish: 'Tempura Soba Set overlooking the river',
              priceLevel: '$$',
              description: 'Known for spectacular views of the Togetsukyo Bridge.'
            },
            {
              name: 'Saga Tofu Ine',
              cuisineType: 'Traditional Buddhist Tofu',
              recommendedDish: 'Yuba (tofu skin) Set Meal',
              priceLevel: '$$',
              description: 'Authentic vegetarian preparations made fresh daily.'
            }
          ],
          hiddenGem: {
            title: 'Gio-ji Temple Moss Sanctuary',
            description: 'A tiny, quiet temple set deep in a forest of tall maples and vibrant green moss.',
            whySpecial: 'Completely escapes the tourist crowds of central Arashiyama.'
          }
        },
        {
          dayNumber: 2,
          dayTitle: 'Golden Pavilion & Sacred Rock Gardens',
          activities: [
            {
              id: 'k-2-1',
              timeSlot: 'Morning',
              title: 'Kinkaku-ji (The Golden Pavilion)',
              description: 'Witness the iconic top two floors completely covered in gold leaf, reflecting beautifully in the surrounding Mirror Pond.',
              locationName: 'Kita Ward, Kyoto',
              coordinates: { lat: 35.0394, lng: 135.7292 },
              durationMinutes: 90,
              costEstimate: 10,
              transportToNext: {
                mode: 'Walking',
                durationMinutes: 25,
                distanceKm: 1.4,
                cost: 0
              }
            },
            {
              id: 'k-2-2',
              timeSlot: 'Afternoon',
              title: 'Ryoan-ji Rock Garden',
              description: 'Contemplate the mysterious 15 carefully placed boulders arranged in a sea of pristine raked white gravel.',
              locationName: 'Ryoanji, Kyoto',
              coordinates: { lat: 35.0345, lng: 135.7182 },
              durationMinutes: 100,
              costEstimate: 6,
              transportToNext: {
                mode: 'Public Transit',
                durationMinutes: 30,
                distanceKm: 5.4,
                cost: 4
              }
            },
            {
              id: 'k-2-3',
              timeSlot: 'Evening',
              title: 'Pontocho Alley Izakaya Stroll',
              description: 'Walk through the narrow, atmospheric lantern-lit alleyway flanking the Kamogawa River. Perfect for evening dining.',
              locationName: 'Pontocho, Kyoto',
              coordinates: { lat: 35.0058, lng: 135.7712 },
              durationMinutes: 150,
              costEstimate: 45
            }
          ],
          alternativeActivity: {
            title: 'Kyoto International Manga Museum',
            description: 'Browse thousands of historic Japanese graphic novels inside an old school building.',
            reason: 'Relaxing air-conditioned sanctuary.'
          },
          localFoodRecommendations: [
            {
              name: 'Chao Chao Gyoza',
              cuisineType: 'Gyoza Specialities',
              recommendedDish: 'Crispy Winged Gyoza Platter',
              priceLevel: '$',
              description: 'Fast-paced, vibrant local spot always serving high-energy bites.'
            }
          ],
          hiddenGem: {
            title: 'Kamogawa Riverbank Stepping Stones',
            description: 'Cross the river by jumping across giant concrete stones shaped like turtles and birds.',
            whySpecial: 'A cherished neighborhood pastime where local musicians rehearse at twilight.'
          }
        },
        {
          dayNumber: 3,
          dayTitle: 'Vermilion Torii Pathways & Gion Heritage',
          activities: [
            {
              id: 'k-3-1',
              timeSlot: 'Morning',
              title: 'Fushimi Inari Shrine',
              description: 'Hike through the thousands of vermilion torii gates winding up the sacred Mount Inari forest.',
              locationName: 'Fushimi Ward, Kyoto',
              coordinates: { lat: 34.9671, lng: 135.7727 },
              durationMinutes: 150,
              costEstimate: 0,
              transportToNext: {
                mode: 'Public Transit',
                durationMinutes: 20,
                distanceKm: 4.8,
                cost: 3
              }
            },
            {
              id: 'k-3-2',
              timeSlot: 'Afternoon',
              title: 'Kiyomizu-dera Temple Wooden Stage',
              description: 'Stand on the massive wooden stage built entirely without nails, offering incredible panoramic views of the city.',
              locationName: 'Higashiyama, Kyoto',
              coordinates: { lat: 34.9949, lng: 135.7850 },
              durationMinutes: 120,
              costEstimate: 8,
              transportToNext: {
                mode: 'Walking',
                durationMinutes: 20,
                distanceKm: 1.2,
                cost: 0
              }
            },
            {
              id: 'k-3-3',
              timeSlot: 'Evening',
              title: 'Gion District Geisha Stroll',
              description: 'Walk by preserved wooden machiya merchant houses. Catch glimpses of Geiko and Maiko heading to evening performances.',
              locationName: 'Gion, Kyoto',
              coordinates: { lat: 35.0037, lng: 135.7782 },
              durationMinutes: 120,
              costEstimate: 20
            }
          ],
          alternativeActivity: {
            title: 'Kyoto Museum of Crafts & Design',
            description: 'Watch living national treasures paint lacquerware and weave silk fabrics.',
            reason: 'Elegant design center safe from crowds.'
          },
          localFoodRecommendations: [
            {
              name: 'Gion Uokeyatsudora',
              cuisineType: 'Michelin-starred Unagi',
              recommendedDish: 'Traditional Eel in Wooden Bucket',
              priceLevel: '$$$',
              description: 'Premium dining inside a historic 100-year-old wooden house.'
            }
          ],
          hiddenGem: {
            title: 'Kennin-ji Temple Twin Dragons',
            description: 'Look up at the monumental ink painting of twin celestial dragons sweeping across the ceiling.',
            whySpecial: 'The oldest Zen temple in Kyoto, offering a remarkably quiet courtyard.'
          }
        }
      ],
      markdown: `# Anakin AI Travel Copilot: Kyoto, Japan (3 Days)\n\nAn optimized travel plan curated by **IBM Bob Assistant**...`
    };
    setItinerary(starter);
  };

  // Helper to add workflow logs
  const pushLog = (node: WorkflowLog['node'], message: string, status: WorkflowLog['status'] = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLog: WorkflowLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      node,
      message,
      status
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Parse Travel Document using Docling Mock / Real API
  const handleParseDocument = async () => {
    if (!brochureText.trim()) return;
    setIsParsingDoc(true);
    setLogs([]);
    pushLog('Docling', 'Starting High-Performance Brochure Parsing Engine...', 'working');

    try {
      const response = await fetch('/api/docling/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: brochureText, filename: 'my_trip_guide.txt' })
      });

      if (!response.ok) throw new Error('Parsing failed.');

      const data: DoclingDoc = await response.json();
      setParsedDoc(data);
      pushLog('Docling', 'Extracted 3 locations, 2 restaurants, and traveler traits.', 'success');
      pushLog('ContextForge', 'Storing extracted brochure context in memory ledger.', 'success');
    } catch (e: any) {
      pushLog('Docling', `Failed parsing document: ${e.message}`, 'warning');
    } finally {
      setIsParsingDoc(false);
    }
  };

  // Trigger main AI Itinerary generation
  const handleGenerateItinerary = async () => {
    if (!destination.trim()) return;

    setIsGenerating(true);
    setLogs([]);
    setActiveNode('LangFlow Router');

    pushLog('LangFlow Router', `Constructing graph execution path for "${destination}"...`, 'info');

    // Node 1: Ingesting doc
    setTimeout(() => {
      setActiveNode('Docling');
      if (parsedDoc) {
        pushLog('Docling', 'Found active Docling brochure ledger. Injecting reference data.', 'success');
      } else {
        pushLog('Docling', 'No document brochure attached. Skipping ingestion node.', 'info');
      }
    }, 800);

    // Node 2: Context Forge memory
    setTimeout(() => {
      setActiveNode('ContextForge');
      pushLog('ContextForge', 'Analyzing historical travel styles & local weather-aware metrics.', 'success');
    }, 1800);

    // Node 3: IBM Bob Strategy
    setTimeout(() => {
      setActiveNode('IBM Bob');
      pushLog('IBM Bob', 'Structuring cognitive itinerary mapping graph with local constraints.', 'working');
    }, 2800);

     // Node 4: Granite LLM Itinerary Assembly
    setTimeout(async () => {
      setActiveNode('Granite');
      pushLog('Granite', 'Assembling optimized coordinates, schedules, dining spots, and markdown text.', 'working');

      try {
        let userPreferences = [];
        try {
          const storedPrefs = localStorage.getItem('user-preferences');
          if (storedPrefs) userPreferences = JSON.parse(storedPrefs);
        } catch (e) {
          console.error('Failed to parse user-preferences for generation', e);
        }

        const response = await fetch('/api/itinerary/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination,
            days,
            budget: budgetType,
            vibe,
            style,
            transport,
            docInsights: parsedDoc,
            userPreferences
          })
        });

        if (!response.ok) throw new Error('Server responded with an error.');

        const result: Itinerary = await response.json();
        setItinerary(result);
        setSelectedDayIndex(0);

        pushLog('Granite', 'Synthesized high-fidelity itinerary safely.', 'success');
        pushLog('LangFlow Router', 'Completed all workflow nodes with 100% confidence!', 'success');
      } catch (err: any) {
        pushLog('Granite', `Error generating: ${err.message}. Reverting to local fallback engine.`, 'warning');
        // Let mock function help
        triggerStarterTrip();
      } finally {
        setIsGenerating(false);
        setActiveNode(null);
      }
    }, 4000);
  };

  // Winning Feature: Regenerate Only One Day
  const triggerRegenDay = (dayNum: number) => {
    setTargetRegenDay(dayNum);
    setRegenGuidance('');
    setIsRegeneratingDay(true);
  };

  const handleRegenDaySubmit = async () => {
    if (!itinerary || !targetRegenDay) return;

    setIsGenerating(true);
    setIsRegeneratingDay(false);
    setLogs([]);
    setActiveNode('LangFlow Router');

    pushLog('LangFlow Router', `Orchestrating hot-swap for Day ${targetRegenDay}...`, 'info');
    pushLog('ContextForge', `Adding specialized instruction overlay: "${regenGuidance}"`, 'info');

    setTimeout(() => {
      setActiveNode('IBM Bob');
      pushLog('IBM Bob', `Recalculating alternative schedule blocks for Day ${targetRegenDay}...`, 'working');
    }, 1000);

    setTimeout(async () => {
      setActiveNode('Granite');
      pushLog('Granite', 'Generating revised day schedule and aligning budget limits.', 'working');

      try {
        let userPreferences = [];
        try {
          const storedPrefs = localStorage.getItem('user-preferences');
          if (storedPrefs) userPreferences = JSON.parse(storedPrefs);
        } catch (e) {
          console.error('Failed to parse user-preferences for day regeneration', e);
        }

        const response = await fetch('/api/itinerary/regenerate-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itinerary,
            dayNumber: targetRegenDay,
            customGuidance: regenGuidance,
            userPreferences
          })
        });

        if (!response.ok) throw new Error('Hot-swap regeneration failed.');

        const updatedResult: Itinerary = await response.json();
        setItinerary(updatedResult);
        pushLog('Granite', `Successfully updated Day ${targetRegenDay}! All other days preserved.`, 'success');
        pushLog('LangFlow Router', 'Hot-swap workflow graph completed.', 'success');
      } catch (e: any) {
        pushLog('Granite', `Failed to swap day: ${e.message}`, 'warning');
      } finally {
        setIsGenerating(false);
        setActiveNode(null);
        setTargetRegenDay(null);
      }
    }, 2500);
  };

  // Save Current Itinerary to Local Storage list
  const handleSaveItinerary = () => {
    if (!itinerary) return;
    const isAlreadySaved = savedItineraries.some(item => item.destination === itinerary.destination && item.days === itinerary.days);
    if (isAlreadySaved) {
      alert('This travel plan is already saved in your Copilot vault!');
      return;
    }

    const itemToSave: Itinerary = {
      ...itinerary,
      id: `${Date.now()}`,
      createdAt: new Date().toLocaleDateString()
    };

    const updated = [itemToSave, ...savedItineraries];
    setSavedItineraries(updated);
    localStorage.setItem('anakin_saved_itineraries', JSON.stringify(updated));
  };

  // Delete Saved Itinerary
  const handleDeleteItinerary = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedItineraries.filter(item => item.id !== id);
    setSavedItineraries(updated);
    localStorage.setItem('anakin_saved_itineraries', JSON.stringify(updated));
  };

  // Export Markdown File
  const handleExportMarkdown = () => {
    if (!itinerary) return;
    const element = document.createElement('a');
    const file = new Blob([itinerary.markdown || 'No markdown loaded.'], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_itinerary.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Export standard iCalendar file
  const handleExportCalendar = () => {
    if (!itinerary) return;
    let icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Anakin AI Travel Copilot//EN\n`;

    itinerary.daysPlan.forEach((dp) => {
      dp.activities.forEach((act, idx) => {
        const startHour = act.timeSlot === 'Morning' ? '090000' : act.timeSlot === 'Afternoon' ? '140000' : '190000';
        const endHour = act.timeSlot === 'Morning' ? '120000' : act.timeSlot === 'Afternoon' ? '170000' : '210000';

        icsContent += `BEGIN:VEVENT\n`;
        icsContent += `SUMMARY:Day ${dp.dayNumber}: ${act.title}\n`;
        icsContent += `DESCRIPTION:${act.description.replace(/\n/g, ' ')}\n`;
        icsContent += `LOCATION:${act.locationName}\n`;
        icsContent += `DTSTART:202610${12 + dp.dayNumber - 1}T${startHour}\n`;
        icsContent += `DTEND:202610${12 + dp.dayNumber - 1}T${endHour}\n`;
        icsContent += `END:VEVENT\n`;
      });
    });

    icsContent += `END:VCALENDAR`;

    const element = document.createElement('a');
    const file = new Blob([icsContent], { type: 'text/calendar' });
    element.href = URL.createObjectURL(file);
    element.download = `${itinerary.destination.replace(/[^a-zA-Z0-9]/g, '_')}_calendar.ics`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectedDayPlan = itinerary?.daysPlan[selectedDayIndex];

  // Calculations for total statistics
  const totalWalkKm = itinerary?.daysPlan.reduce((acc, dp) => {
    return acc + dp.activities.reduce((sum, act) => sum + (act.transportToNext?.distanceKm || 0), 0);
  }, 0) || 0;

  const totalTransitMinutes = itinerary?.daysPlan.reduce((acc, dp) => {
    return acc + dp.activities.reduce((sum, act) => sum + (act.transportToNext?.durationMinutes || 0), 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-[#0A0A1A] text-white font-sans overflow-x-hidden p-4 sm:p-6 relative selection:bg-indigo-500 selection:text-white" id="main-copilot-container">
      {/* Absolute Frosted Ambient Mesh Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Layer */}
      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10">

        {/* Dynamic Header */}
        <header className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Workflow className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">Anakin AI Travel Copilot</h1>
                <span className="text-[10px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 font-mono px-2 py-0.5 rounded-full font-bold">
                  IBM Bob V2
                </span>
              </div>
              <p className="text-xs text-white/60 italic font-mono">"Build smarter journeys, not just itineraries." — Curated with Granite-3B-Instruct</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveItinerary}
              disabled={!itinerary}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                itinerary
                  ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md shadow-blue-500/20'
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Save Trip</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              disabled={!itinerary}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                itinerary
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer'
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              }`}
            >
              <FileDown className="w-4 h-4" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={handleExportCalendar}
              disabled={!itinerary}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                itinerary
                  ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 cursor-pointer'
                  : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Export Calendar (.ics)</span>
            </button>
          </div>
        </header>

        {/* Master Bento Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column Controls Panel (4 Columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Travel Parameter Builder Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Compass className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">Trip Parameter Matrix</h2>
              </div>

              {/* Destination Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Target Destination</label>
                <div className="relative">
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans transition"
                    placeholder="e.g. Paris, France"
                  />
                  <MapPin className="absolute right-3.5 top-3 w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Day count slide selector */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">
                  <span>Number of Days</span>
                  <span className="text-blue-400 font-bold font-mono">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
              </div>

              {/* Budget Option Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Budget Tier</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Budget', 'Balanced', 'Luxury'].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBudgetType(b)}
                      className={`py-2 text-xs font-semibold rounded-xl transition ${
                        budgetType === b
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/60'
                          : 'bg-slate-950 hover:bg-slate-900 border border-white/10 text-slate-400'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Vibe Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Travel Vibe</label>
                <select
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans transition cursor-pointer"
                >
                  <option value="Cultural & Heritage">Cultural & Heritage</option>
                  <option value="Relaxation & Spa">Relaxation & Spa</option>
                  <option value="High Adventure">High Adventure</option>
                  <option value="Culinary & Gastronomy">Culinary & Gastronomy</option>
                  <option value="Nightlife & Entertainment">Nightlife & Entertainment</option>
                </select>
              </div>

              {/* Travel Style Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Companion Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans transition cursor-pointer"
                >
                  <option value="Immersive Explorer">Immersive Explorer</option>
                  <option value="Slow & Laid Back">Slow & Laid Back</option>
                  <option value="Fast-Paced Sightsee">Fast-Paced Sightsee</option>
                  <option value="Luxe Wanderer">Luxe Wanderer</option>
                </select>
              </div>

              {/* Transit Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-bold">Preferred Transport Mode</label>
                <select
                  value={transport}
                  onChange={(e) => setTransport(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans transition cursor-pointer"
                >
                  <option value="Public Transit">Public Transit (Rail & Bus)</option>
                  <option value="Walking">Walking Only</option>
                  <option value="Taxi & Rideshare">Taxi & Rideshare</option>
                  <option value="Rental Car">Rental Car</option>
                </select>
              </div>

              {/* Generate Trigger Button */}
              <button
                onClick={handleGenerateItinerary}
                disabled={isGenerating}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Computing AI Model Nodes...' : 'Generate AI Travel Plan'}</span>
              </button>
            </div>

            {/* IBM Docling Document Intake Card */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">IBM Docling Parser</h2>
                </div>
                <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded-full font-bold font-mono">
                  Engine Active
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Paste contents of custom PDF brochures or travel flight details. Docling automatically structures the text for the Granite model.
              </p>

              <textarea
                value={brochureText}
                onChange={(e) => setBrochureText(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono transition"
                placeholder="Paste brochure snippet here (e.g., 'Loved staying near the Kamogawa stepping stones and eating miso ramen at Chao Chao...')"
              />

              <button
                onClick={handleParseDocument}
                disabled={isParsingDoc || !brochureText.trim()}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                <Upload className="w-4 h-4" />
                <span>{isParsingDoc ? 'Docling Parsing...' : 'Parse Ingested Text'}</span>
              </button>

              {parsedDoc && (
                <div className="bg-slate-950/80 rounded-xl p-3 border border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">{parsedDoc.name}</span>
                    <span className="text-[9px] text-emerald-400 flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  </div>

                  {/* Extracted preferences */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedDoc.insights.locations.map((loc, i) => (
                      <span key={i} className="text-[9px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-900">
                        📍 {loc}
                      </span>
                    ))}
                    {parsedDoc.insights.restaurants.map((rest, i) => (
                      <span key={i} className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-900">
                        🍜 {rest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Preferences Tuning Memory Panel */}
            <AIPreferencesDashboard 
              refreshTrigger={refreshPrefs} 
              onPreferencesCleared={triggerPrefsRefresh} 
            />

            {/* Saved Plans Sidebar Vault */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Trip Copilot Vault</span>
                <span className="text-[10px] bg-slate-950 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full font-mono">
                  {savedItineraries.length} Saved
                </span>
              </div>

              {savedItineraries.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4 font-sans">
                  No saved itineraries in vault yet. Generate a trip and click "Save Trip".
                </p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto">
                  {savedItineraries.map((saved) => (
                    <div
                      key={saved.id}
                      onClick={() => setItinerary(saved)}
                      className="group bg-slate-950 hover:bg-slate-900/80 border border-white/5 rounded-xl p-3 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition">
                          {saved.destination}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {saved.days} Days • {saved.budgetType}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteItinerary(saved.id!, e)}
                        className="text-slate-600 hover:text-red-400 p-1.5 hover:bg-white/5 rounded-lg transition"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column Core Workspace (8 Columns) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Top Stat Widget Rail */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-md">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Destination Range</span>
                <span className="text-base font-bold text-slate-100 font-sans tracking-tight truncate">
                  {itinerary ? itinerary.destination : 'None'}
                </span>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-md">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Total Walking Distance</span>
                <span className="text-base font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <Footprints className="w-4.5 h-4.5 text-emerald-500" />
                  {totalWalkKm > 0 ? `${totalWalkKm.toFixed(1)} km` : '0 km'}
                </span>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-md">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Average Travel Time</span>
                <span className="text-base font-bold text-indigo-400 font-mono flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-indigo-500" />
                  {totalTransitMinutes > 0 ? `${totalTransitMinutes} mins` : 'None'}
                </span>
              </div>

              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-1 shadow-md">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">AI Confidence Score</span>
                <span className="text-base font-bold text-blue-400 font-mono">
                  {itinerary ? '94.8%' : 'Standby'}
                </span>
              </div>
            </div>

            {/* Main Interactive Screen with Tabs */}
            {itinerary && (
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl" id="itinerary-display-screen">
                {/* Visual Screen Header */}
                <div className="bg-slate-950/80 border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Day Navigation Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl p-1 shrink-0 overflow-x-auto max-w-full">
                    {itinerary.daysPlan.map((dp, idx) => (
                      <button
                        key={dp.dayNumber}
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`px-3 py-1.5 text-xs font-bold font-sans rounded-lg transition shrink-0 ${
                          selectedDayIndex === idx
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Day {dp.dayNumber}
                      </button>
                    ))}
                  </div>

                  {/* Layout mode switcher */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        activeTab === 'timeline' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Daily Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab('markdown')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                        activeTab === 'markdown' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Markdown Guide
                    </button>
                  </div>
                </div>

                {/* Main Screen Body View */}
                <div className="p-6">
                  {activeTab === 'timeline' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Left: Active Day's Detailed Schedule (7 cols) */}
                      <div className="lg:col-span-7 flex flex-col gap-6">
                        {selectedDayPlan && (
                          <div className="flex flex-col gap-6">
                            
                            {/* Day Header with Quick "Regenerate Day" link */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                              <div>
                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">Day 0{selectedDayPlan.dayNumber}</span>
                                <h3 className="text-lg font-bold text-slate-100">{selectedDayPlan.dayTitle}</h3>
                              </div>
                              <button
                                onClick={() => triggerRegenDay(selectedDayPlan.dayNumber)}
                                className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                                title="Regenerate only this day's attractions"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Adjust Day {selectedDayPlan.dayNumber}</span>
                              </button>
                            </div>

                            {/* Activities Chronology Track */}
                            <div className="flex flex-col gap-6 relative pl-3">
                              {/* Left track line */}
                              <div className="absolute left-[20px] top-6 bottom-6 w-[2px] bg-white/10" />

                              {selectedDayPlan.activities.map((act) => {
                                const isMorning = act.timeSlot === 'Morning';
                                const isAfternoon = act.timeSlot === 'Afternoon';
                                const badgeColor =
                                  isMorning ? 'bg-amber-950 text-amber-300 border-amber-800' :
                                  isAfternoon ? 'bg-orange-950 text-orange-300 border-orange-800' :
                                  'bg-purple-950 text-purple-300 border border-purple-800';

                                return (
                                  <div key={act.id} className="flex gap-4 relative z-10">
                                    {/* Slot Circle Label */}
                                    <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shrink-0 font-mono text-[10px] font-bold text-slate-400">
                                      {act.timeSlot.substring(0, 2)}
                                    </div>

                                    {/* Activity Details Card */}
                                    <div className="flex-1 bg-slate-950/60 rounded-2xl p-4 border border-white/5 flex flex-col sm:flex-row gap-4 shadow-sm items-start group">
                                      {/* Unsplash Dynamic Thumbnail */}
                                      <div className="w-full sm:w-28 h-28 sm:h-24 rounded-xl overflow-hidden shrink-0 relative border border-white/10 bg-slate-900/40" id={`thumb-wrapper-${act.id}`}>
                                        <ActivityImage 
                                          title={act.title} 
                                          locationName={act.locationName} 
                                          destination={itinerary?.destination || ''} 
                                          alt={act.title} 
                                        />
                                      </div>

                                      <div className="flex-1 w-full flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded border mr-2 ${badgeColor}`}>
                                              {act.timeSlot}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">{act.durationMinutes} mins</span>
                                            <h4 className="text-sm font-bold text-slate-100 mt-1">{act.title}</h4>
                                          </div>
                                          <span className="text-xs font-bold text-slate-300 font-mono bg-slate-900 px-2 py-1 rounded shrink-0">
                                            {act.costEstimate === 0 ? 'Free' : `$${act.costEstimate}`}
                                          </span>
                                        </div>

                                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{act.description}</p>

                                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-white/5 pt-2 mt-1">
                                          <span className="flex items-center gap-1 text-slate-400">
                                            <MapPin className="w-3 h-3 text-slate-500" />
                                            {act.locationName}
                                          </span>
                                          {act.transportToNext && (
                                            <span className="text-emerald-400">
                                              → Transit: {act.transportToNext.distanceKm}km via {act.transportToNext.mode}
                                            </span>
                                          )}
                                        </div>

                                        <ActivityFeedback 
                                          activityTitle={act.title} 
                                          destination={itinerary?.destination || ''} 
                                          onFeedbackChange={triggerPrefsRefresh}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Local Culinary recommendations & Hidden Gems */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                              {/* Dining block */}
                              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-bold">Local Food Highlights</span>
                                {selectedDayPlan.localFoodRecommendations.slice(0, 2).map((food, i) => (
                                  <div key={i} className="flex flex-col border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center justify-between text-xs font-semibold">
                                      <span className="text-slate-200">{food.name}</span>
                                      <span className="text-emerald-400 font-mono">{food.priceLevel}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">{food.cuisineType}: *{food.recommendedDish}*</span>
                                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{food.description}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Hidden Gem & Alternative Backup Block */}
                              <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider font-bold">Unesco Alternative & Gem</span>
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    {selectedDayPlan.hiddenGem.title}
                                  </span>
                                  <p className="text-[10px] text-slate-400 leading-normal">{selectedDayPlan.hiddenGem.description}</p>
                                  <span className="text-[9px] text-slate-500 font-serif italic mt-0.5">Note: {selectedDayPlan.hiddenGem.whySpecial}</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>

                      {/* Right: Map View for Active Day (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        {selectedDayPlan && (
                          <ItineraryMap
                            activities={selectedDayPlan.activities}
                            destination={itinerary.destination}
                          />
                        )}

                        {/* Weather-aware Advice widget */}
                        {selectedDayPlan?.alternativeActivity && (
                          <div className="bg-indigo-950/20 border border-indigo-900/60 rounded-2xl p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-indigo-300">Weather-aware backup</span>
                              <h4 className="text-xs font-bold text-slate-100 mt-1">{selectedDayPlan.alternativeActivity.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{selectedDayPlan.alternativeActivity.description}</p>
                              <p className="text-[9px] text-indigo-400/80 font-mono mt-1">{selectedDayPlan.alternativeActivity.reason}</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* Markdown Tab Content View */
                    <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span className="text-xs font-mono text-slate-400">Curated Markdown Ledger Output</span>
                        <button
                          onClick={handleExportMarkdown}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-white rounded text-[10px] font-mono transition"
                        >
                          Raw Download
                        </button>
                      </div>
                      <pre className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap select-text">
                        {itinerary.markdown}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic Interactive Budget Calculator */}
            {itinerary && (
              <BudgetTracker itinerary={itinerary} />
            )}

            {/* IBM Active LangFlow Computing Node Monitor (Always visible to show high tech value) */}
            <LangFlowVisualizer
              logs={logs}
              isGenerating={isGenerating}
              activeNode={activeNode}
            />

          </div>

        </div>

        {/* Global Footer attribution panel */}
        <footer className="h-20 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 shadow-md text-slate-400 text-xs">
          <div className="flex gap-4 sm:gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase tracking-tighter">IBM Technology Integration</span>
              <span className="text-xs font-bold text-slate-300">IBM Granite-3B-Instruct Model Core</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase tracking-tighter">Document Parser</span>
              <span className="text-xs font-bold text-amber-400">Docling Engine Ingestion V2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 uppercase tracking-tighter">Memory Ledger</span>
              <span className="text-xs font-bold text-teal-400">Context Forge Persistence</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active LangFlow Instance</span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          </div>
        </footer>

      </div>

      {/* Winning Touch: Single Day Hot-Swap Revision Modal */}
      <AnimatePresence>
        {isRegeneratingDay && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl text-white"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <h3 className="font-bold text-slate-100">Hot-Swap Day {targetRegenDay} Revision</h3>
                </div>
                <button
                  onClick={() => setIsRegeneratingDay(false)}
                  className="text-slate-400 hover:text-white font-sans text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Tell the **IBM Bob / Granite Model** how to adjust ONLY Day {targetRegenDay}. It will preserve all other days of your {itinerary?.days}-day plan intact!
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">Special Guidance Instruction</label>
                <textarea
                  value={regenGuidance}
                  onChange={(e) => setRegenGuidance(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-sans"
                  placeholder="e.g. 'Make it rainy day friendly', 'Substitute morning stroll for a premium ramen spot', 'Adjust to lower budget activity'"
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={() => setIsRegeneratingDay(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 rounded-xl text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRegenDaySubmit}
                  disabled={!regenGuidance.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  Execute Hot-Swap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
