import React, { useEffect, useState, useRef } from 'react';
import { Workflow, Layers, Brain, FileText, Activity, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkflowLog } from '../types';

interface LangFlowVisualizerProps {
  logs: WorkflowLog[];
  isGenerating: boolean;
  activeNode: string | null;
}

export default function LangFlowVisualizer({ logs, isGenerating, activeNode }: LangFlowVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const nodes = [
    { id: 'Docling', label: 'Docling Parser', icon: FileText, desc: 'Ingesting Guides' },
    { id: 'ContextForge', label: 'Context Forge', icon: Layers, desc: 'Memory Tracking' },
    { id: 'LangFlow Router', label: 'LangFlow Router', icon: Workflow, desc: 'Node Orchestration' },
    { id: 'IBM Bob', label: 'IBM Bob Assistant', icon: Brain, desc: 'Cognitive Strategy' },
    { id: 'Granite', label: 'Granite LLM', icon: Activity, desc: 'Itinerary Assembly' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100 flex flex-col gap-6" id="langflow-visualizer">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Workflow className="w-5 h-5 text-indigo-400 animate-pulse" />
          <div>
            <h3 className="text-base font-semibold text-slate-100 font-sans tracking-tight">IBM LangFlow Node Orchestrator</h3>
            <p className="text-xs text-slate-400 font-mono">Status: {isGenerating ? 'Active Computation' : 'Standby / Idle'}</p>
          </div>
        </div>
        {isGenerating && (
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-950/40 border border-indigo-800/60 rounded-full text-xs text-indigo-300">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Bob is thinking...</span>
          </div>
        )}
      </div>

      {/* Workflow Map Nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-2 relative">
        {nodes.map((node, idx) => {
          const isActive = activeNode === node.id || (isGenerating && !activeNode && idx === 2);
          const Icon = node.icon;
          return (
            <div key={node.id} className="flex flex-col items-center text-center relative z-10">
              <motion.div
                animate={isActive ? { scale: [1, 1.08, 1], borderColor: ['#6366f1', '#a5b4fc', '#6366f1'] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                  isActive
                    ? 'bg-indigo-950/80 border-indigo-500 shadow-lg shadow-indigo-500/25 text-indigo-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span className={`text-xs font-semibold mt-2 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                {node.label}
              </span>
              <span className="text-[10px] text-slate-500 font-mono mt-0.5">{node.desc}</span>
            </div>
          );
        })}
        {/* Dynamic Connected Flashing Line Background */}
        <div className="absolute top-8 left-6 right-6 h-[2px] bg-slate-800 -z-0 hidden sm:block">
          {isGenerating && (
            <motion.div
              initial={{ left: '0%', width: '0%' }}
              animate={{ left: ['0%', '100%'], width: ['10%', '30%', '10%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute top-0 h-full bg-indigo-500 shadow-md shadow-indigo-400"
            />
          )}
        </div>
      </div>

      {/* Logging Panel */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Computation Logs</span>
        <div
          ref={containerRef}
          className="bg-slate-950 rounded-xl p-4 h-44 overflow-y-auto border border-slate-800/60 flex flex-col gap-2.5 font-mono text-[11px] leading-relaxed scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="text-slate-600 italic h-full flex items-center justify-center">
                Ready for query. Submit preferences to execute IBM Bob orchestration.
              </div>
            ) : (
              logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2 items-start"
                >
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight shrink-0 ${
                    log.node === 'Docling' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    log.node === 'ContextForge' ? 'bg-teal-950 text-teal-300 border border-teal-800' :
                    log.node === 'IBM Bob' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                    log.node === 'Granite' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    'bg-indigo-950 text-indigo-300 border border-indigo-800'
                  }`}>
                    {log.node}
                  </span>
                  <span className={
                    log.status === 'success' ? 'text-emerald-400' :
                    log.status === 'warning' ? 'text-amber-400' :
                    log.status === 'working' ? 'text-indigo-400 animate-pulse' :
                    'text-slate-300'
                  }>
                    {log.message}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
