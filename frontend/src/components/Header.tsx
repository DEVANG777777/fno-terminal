import React, { useState, useEffect } from 'react';
import { Clock, HelpCircle, Zap, TrendingUp, TrendingDown, Settings } from 'lucide-react';
import type { IndexData } from '../types';
import type { AngelStatus } from '../services/apiClient';

interface HeaderProps {
  nifty: IndexData;
  bankNifty: IndexData;
  angelStatus: AngelStatus | null;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nifty,
  bankNifty,
  angelStatus,
  onOpenHelp,
  onOpenSettings,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isAngelConnected = angelStatus?.is_connected ?? false;

  return (
    <header className="bg-[#0b0f19] border-b border-slate-800/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-sm shadow-md shadow-cyan-500/20">
            F&O
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-slate-100 uppercase flex items-center gap-2">
              Analysis Terminal
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
                Phase 3 Live
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Angel One SmartAPI Crosshair Scanner</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

        {/* Live / SmartAPI Status Badge */}
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full font-mono text-[11px] transition-all cursor-pointer ${
            isAngelConnected
              ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
              : 'bg-blue-950/40 border border-blue-500/30 text-cyan-300 hover:border-cyan-400'
          }`}
          title="Click to configure Angel One SmartAPI credentials"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isAngelConnected ? 'bg-emerald-400' : 'bg-cyan-400'
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isAngelConnected ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
            ></span>
          </span>
          <span className="font-semibold tracking-wide">
            {isAngelConnected ? 'ANGEL ONE LIVE' : 'SMARTAPI READY'}
          </span>
          <span className="text-[9px] text-slate-400 border-l border-slate-700 pl-1.5">
            {isAngelConnected ? `ID: ${angelStatus?.client_code}` : 'SETUP API'}
          </span>
        </button>
      </div>

      {/* Index Micro Tickers */}
      <div className="hidden lg:flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-lg">
        {/* NIFTY 50 */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 text-[11px]">NIFTY 50:</span>
          <span className="font-mono font-bold text-slate-100">
            {nifty.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`flex items-center text-[11px] font-mono font-semibold ${
              nifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {nifty.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {nifty.change >= 0 ? '+' : ''}
            {nifty.change.toFixed(2)} ({nifty.changePercent > 0 ? '+' : ''}
            {nifty.changePercent.toFixed(2)}%)
          </span>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* BANKNIFTY */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 text-[11px]">BANKNIFTY:</span>
          <span className="font-mono font-bold text-slate-100">
            {bankNifty.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <span
            className={`flex items-center text-[11px] font-mono font-semibold ${
              bankNifty.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {bankNifty.change >= 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {bankNifty.change >= 0 ? '+' : ''}
            {bankNifty.change.toFixed(2)} ({bankNifty.changePercent > 0 ? '+' : ''}
            {bankNifty.changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Right Controls: Clock, 250ms Debounce Indicator, Settings, Guide */}
      <div className="flex items-center gap-2.5">
        {/* 250ms Fast Hover Active Tag */}
        <div className="hidden sm:flex items-center gap-1.5 bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded text-[11px]">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-medium">250ms Hover Active</span>
        </div>

        {/* Clock */}
        <div className="flex items-center gap-1.5 font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeStr || '09:15:00 AM'} IST</span>
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium px-2.5 py-1 rounded transition-all border border-slate-700 cursor-pointer"
          title="Configure Angel One SmartAPI"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>

        {/* Gujarati Flow Guide Modal Button */}
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-3 py-1 rounded transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          title="Terminal Architecture & Gujarati Workflow"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Gujarati Guide</span>
        </button>
      </div>
    </header>
  );
};
