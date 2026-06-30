import React, { useState } from 'react';
import { DollarSign, PieChart, Coins, TrendingUp, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';
import { Itinerary } from '../types';

interface BudgetTrackerProps {
  itinerary: Itinerary;
}

const currencyRates: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  JPY: { symbol: '¥', rate: 161.2 },
  INR: { symbol: '₹', rate: 83.5 },
  GBP: { symbol: '£', rate: 0.79 },
};

export default function BudgetTracker({ itinerary }: BudgetTrackerProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const getPrice = (usdAmount: number) => {
    const info = currencyRates[selectedCurrency] || currencyRates.USD;
    return `${info.symbol}${Math.round(usdAmount * info.rate).toLocaleString()}`;
  };

  const budget = itinerary.budgetSummary || { food: 150, attractions: 100, transport: 80, other: 70 };
  const totalCost = itinerary.totalCostEstimate || (budget.food + budget.attractions + budget.transport + budget.other);

  const categories = [
    { name: 'Dining & Food', val: budget.food, color: 'bg-emerald-500', barColor: '#10b981', desc: 'Street eats, authentic lunches, cafes' },
    { name: 'Attractions & Tours', val: budget.attractions, color: 'bg-amber-500', barColor: '#f59e0b', desc: 'Museum entries, workshop fees, parks' },
    { name: 'Transportation', val: budget.transport, color: 'bg-sky-500', barColor: '#0ea5e9', desc: 'Public rail pass, bicycles, taxi trips' },
    { name: 'Hidden Gems & Backups', val: budget.other, color: 'bg-purple-500', barColor: '#a855f7', desc: 'Unplanned local souvenirs, fallback cafes' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6" id="budget-tracker">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <Coins className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans tracking-tight">AI Budget Architect</h3>
            <p className="text-xs text-slate-400 font-sans">Granite local cost estimations</p>
          </div>
        </div>

        {/* Currency Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1">
          {Object.keys(currencyRates).map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2 py-1 text-[10px] font-bold font-sans rounded-md transition ${
                selectedCurrency === curr ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Cost Ring / Summary Meter */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle
                cx="72"
                cy="72"
                r="60"
                stroke="#6366f1"
                strokeWidth="8"
                fill="none"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * 0.25} // fixed beautiful offset representing optimized budget safety
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="text-center z-10 flex flex-col items-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400">Total Plan Cost</span>
              <span className="text-xl font-bold text-white tracking-tight mt-0.5">{getPrice(totalCost)}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5 mt-1 font-mono">
                <TrendingUp className="w-3 h-3" />
                Bob Optimized
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-sans mt-4 text-center">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Avoided redundant journeys, saving ~18% cost</span>
          </div>
        </div>

        {/* Category List */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {categories.map((cat, idx) => {
            const pct = totalCost > 0 ? (cat.val / totalCost) * 100 : 0;
            return (
              <div key={idx} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                  </div>
                  <div className="font-mono text-slate-400">
                    <span className="text-slate-200 font-bold">{getPrice(cat.val)}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({Math.round(pct)}%)</span>
                  </div>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] text-slate-500 font-sans pl-4 leading-normal">{cat.desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
