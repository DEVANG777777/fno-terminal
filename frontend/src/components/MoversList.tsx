import React, { useState, useRef } from 'react';
import type { FnoStock } from '../types';
import { TrendingUp, TrendingDown, Search, Flame, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface MoversListProps {
  stocks: FnoStock[];
  selectedStock: FnoStock;
  onSelectStock: (stock: FnoStock) => void;
}

type TabType = 'all' | 'gainers' | 'losers';

export const MoversList: React.FC<MoversListProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('gainers');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sorting logic based on % Change
  const gainers = [...stocks]
    .filter((s) => s.changePercent >= 0)
    .sort((a, b) => b.changePercent - a.changePercent);

  const losers = [...stocks]
    .filter((s) => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent);

  let displayedStocks = stocks;
  if (activeTab === 'gainers') displayedStocks = gainers;
  if (activeTab === 'losers') displayedStocks = losers;

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedStocks = displayedStocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }

  // 250ms Debounced Hover Handler
  const handleMouseEnter = (stock: FnoStock) => {
    setHoveredSymbol(stock.symbol);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    hoverTimerRef.current = setTimeout(() => {
      onSelectStock(stock);
    }, 250); // 250ms wait requirement
  };

  const handleMouseLeave = () => {
    setHoveredSymbol(null);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  };

  return (
    <div className="w-full lg:w-72 xl:w-80 flex flex-col bg-[#0c101a] border border-slate-800/80 rounded-lg overflow-hidden shrink-0 h-full">
      {/* Header & Tabs */}
      <div className="p-2.5 bg-[#0f1422] border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-xs text-slate-200 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>F&O Movers</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
            ⚡ 250ms Hover
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-[#080b11] p-0.5 rounded border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('gainers')}
            className={`py-1 rounded flex items-center justify-center gap-1 transition-all ${
              activeTab === 'gainers'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span>Gainers ({gainers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('losers')}
            className={`py-1 rounded flex items-center justify-center gap-1 transition-all ${
              activeTab === 'losers'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3 h-3 text-rose-400" />
            <span>Losers ({losers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1 rounded transition-all ${
              activeTab === 'all'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({stocks.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search F&O stock (e.g. RELIANCE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080b11] border border-slate-800 rounded pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Stock Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50 p-1.5 space-y-1">
        {displayedStocks.map((stock) => {
          const isSelected = selectedStock.symbol === stock.symbol;
          const isHovered = hoveredSymbol === stock.symbol;
          const isPositive = stock.changePercent >= 0;

          return (
            <div
              key={stock.symbol}
              onMouseEnter={() => handleMouseEnter(stock)}
              onMouseLeave={handleMouseLeave}
              onClick={() => onSelectStock(stock)}
              className={`p-2 rounded cursor-pointer transition-all duration-150 relative select-none ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-950/60 to-slate-900 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                  : isHovered
                  ? 'bg-slate-800/60 border border-slate-700'
                  : 'bg-[#0f1422]/70 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              {/* Selected Marker Pill */}
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-cyan-400 rounded-r" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-100 font-mono tracking-wide">
                    {stock.symbol}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  )}
                </div>

                {/* % Change Pill */}
                <div
                  className={`flex items-center gap-0.5 text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isPositive
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>
                    {isPositive ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Sub-info: LTP, PrevClose, Strike Step */}
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-200 font-semibold">
                    ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Prev ₹{stock.prevClose.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="bg-slate-800/80 px-1 rounded text-slate-300">
                    Step: ₹{stock.strikeInterval}
                  </span>
                  <span className="text-slate-500">
                    Lot: {stock.lotSize}
                  </span>
                </div>
              </div>

              {/* 250ms Hover Progress Bar Visual */}
              {isHovered && !isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800 overflow-hidden rounded-b">
                  <div className="h-full bg-cyan-400 animate-[progress_250ms_linear_forwards]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info Tip */}
      <div className="px-3 py-1.5 bg-[#080b11] border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>🖱️ Hover 250ms to auto-load</span>
        <span className="text-slate-500 font-mono">Sort: % Change</span>
      </div>
    </div>
  );
};
