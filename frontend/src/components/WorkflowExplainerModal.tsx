import React from 'react';
import { X, ArrowRight, Zap } from 'lucide-react';

interface WorkflowExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowExplainerModal: React.FC<WorkflowExplainerModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      title: 'UI Setup & Real Behavior',
      descGuj: 'TradingView Lightweight Charts અને Premium Dark UI સાથે Index, Movers, Stock & Option Panels.',
      badge: 'Phase 1 Ready',
      color: 'text-cyan-400',
    },
    {
      num: '2',
      title: 'Gainer / Loser Logic',
      descGuj: '% Change = (LTP - Previous Close) ÷ Previous Close × 100 મુજબ Dynamic Sorting.',
      badge: 'Formula Implemented',
      color: 'text-amber-400',
    },
    {
      num: '3',
      title: '250ms Stock Hover (Fast Switching)',
      descGuj: 'Mouse stock પર લઈ જતાં 250ms wait પછી વગર click એ stock chart સીધો load થાય છે.',
      badge: '250ms Debounce',
      color: 'text-emerald-400',
    },
    {
      num: '4',
      title: 'Historical Candle Hover',
      descGuj: 'Candle પર mouse લઈ જતાં તે historical candle નો Close ભાવ capture થાય છે (LTP નહીં!).',
      badge: 'Crosshair Hook',
      color: 'text-blue-400',
    },
    {
      num: '5',
      title: 'ATM Strike Calculation',
      descGuj: 'Strike Interval મુજબ Nearest ATM Strike Round થાય છે (દા.ત. RELIANCE 1428 → 1420).',
      badge: 'ATM Engine',
      color: 'text-purple-400',
    },
    {
      num: '6',
      title: 'CE કે PE Selection',
      descGuj: 'Gainer (% > 0) હોય તો CALL (CE) અને Loser (% < 0) હોય તો PUT (PE) auto-select થાય છે.',
      badge: 'Direction Logic',
      color: 'text-pink-400',
    },
    {
      num: '7',
      title: 'Option Chart 250ms Debounce',
      descGuj: 'Right panel માં 5-min Option Candlestick Chart 250ms debounce સાથે smooth load થાય છે.',
      badge: '60 FPS Chart',
      color: 'text-cyan-400',
    },
    {
      num: '8',
      title: 'Angel One SmartAPI (Phase 2/3 Roadmap)',
      descGuj: 'WebSocket Live Ticks અને SmartAPI REST Candle Data integration માટે Backend તૈયાર છે.',
      badge: 'Future Phase',
      color: 'text-slate-400',
    },
    {
      num: '9',
      title: 'Instrument Master Local Cache',
      descGuj: 'Token search fast કરવા સ્થાનિક JSON/DB cache જેથી candle hover વખતે API search delay ન થાય.',
      badge: 'Architecture',
      color: 'text-slate-400',
    },
    {
      num: '10',
      title: 'Auto Expiry Detection',
      descGuj: 'Monthly/Weekly Current Valid Expiry આપમેળે detect થઈને token map થશે.',
      badge: 'Auto Detect',
      color: 'text-slate-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#0e1320] border border-slate-700/80 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#121828] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-cyan-400 font-bold">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100 uppercase tracking-wide">
                F&O Analysis Terminal — Architecture & Workflow
              </h2>
              <p className="text-xs text-slate-400">
                10-Step Logic (સંપૂર્ણ ગુજરાતી સમજૂતી)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {/* Visual Flow Banner */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-lg p-3">
            <div className="text-[11px] font-mono text-cyan-300 font-semibold mb-2 flex items-center gap-1.5">
              <span>🔄 Live Interaction Flow:</span>
            </div>
            <div className="flex items-center justify-between gap-1 overflow-x-auto text-[10px] font-mono text-slate-300 py-1">
              <div className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-center">
                Gainer / Loser
              </div>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/50 text-cyan-300 text-center">
                250ms Hover
              </div>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="bg-slate-800/80 px-2 py-1 rounded border border-slate-700 text-center">
                Stock 5M Chart
              </div>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="bg-blue-950/80 px-2 py-1 rounded border border-blue-500/50 text-blue-300 text-center">
                Candle Close
              </div>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="bg-purple-950/80 px-2 py-1 rounded border border-purple-500/50 text-purple-300 text-center">
                ATM Strike
              </div>
              <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
              <div className="bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/50 text-emerald-300 text-center">
                CE / PE Chart
              </div>
            </div>
          </div>

          {/* Grid of Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-[#121828]/60 border border-slate-800/80 rounded-lg p-3 flex gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-cyan-400">
                  {s.num}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-100 text-xs">{s.title}</h4>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                      {s.badge}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{s.descGuj}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#121828] border-t border-slate-800 flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Phase 1 Active • Ready for Live Testing</span>
          <button
            onClick={onClose}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Got It (સમજાઈ ગયું 👍)
          </button>
        </div>
      </div>
    </div>
  );
};
