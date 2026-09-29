import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { IndexChart } from './components/IndexChart';
import { MoversList } from './components/MoversList';
import { StockChart } from './components/StockChart';
import { OptionChart } from './components/OptionChart';
import { WorkflowExplainerModal } from './components/WorkflowExplainerModal';
import { AngelSettingsModal } from './components/AngelSettingsModal';
import { initializeFnoStocks, generateIndices } from './data/marketSimulator';
import { evaluateAtmOption } from './utils/atmEngine';
import { useDebounce } from './hooks/useDebounce';
import { useLiveSocket } from './hooks/useLiveSocket';
import { fetchBackendStatus, fetchAtmOption, fetchIndices, fetchMovers, fetchStockCandles } from './services/apiClient';
import type { AngelStatus } from './services/apiClient';
import type { FnoStock, IndexData, AtmResult } from './types';

export const App: React.FC = () => {
  // Market State (Initializes with sensible defaults, then hydrates from real Angel One API)
  const [stocks, setStocks] = useState<FnoStock[]>(() => initializeFnoStocks());
  const [indices, setIndices] = useState<{ nifty: IndexData; bankNifty: IndexData }>(() =>
    generateIndices()
  );

  // Angel One SmartAPI Status
  const [angelStatus, setAngelStatus] = useState<AngelStatus | null>(null);

  // Modals
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Selected Stock in center panel (Defaults to RELIANCE)
  const [selectedStock, setSelectedStock] = useState<FnoStock>(() => {
    const defaultStock = stocks.find((s) => s.symbol === 'RELIANCE') || stocks[0];
    return defaultStock;
  });

  // Crosshair Hovered Candle State on Stock Chart
  const [rawHoveredClose, setRawHoveredClose] = useState<number | null>(null);
  const [rawHoveredTime, setRawHoveredTime] = useState<number | null>(null);

  // 250ms Debounce for Candle Crosshair -> Option Chart Sync
  const debouncedHoveredClose = useDebounce<number | null>(rawHoveredClose, 250);
  const debouncedHoveredTime = useDebounce<number | null>(rawHoveredTime, 250);

  // Refresh real backend status & market data from Angel One SmartAPI
  const loadRealMarketData = useCallback(async () => {
    const status = await fetchBackendStatus();
    if (status) {
      setAngelStatus(status);
    }

    // Fetch real Indices (Nifty 50 & Bank Nifty)
    const realIndices = await fetchIndices();
    if (realIndices && realIndices.nifty && realIndices.bankNifty) {
      setIndices(realIndices);
    }

    // Fetch real F&O Movers
    const realMovers = await fetchMovers();
    if (realMovers && Array.isArray(realMovers) && realMovers.length > 0) {
      setStocks(realMovers);
      // Keep selectedStock synced
      setSelectedStock((prev) => {
        const match = realMovers.find((m: any) => m.symbol === prev.symbol);
        return match || realMovers[0];
      });
    }
  }, []);

  useEffect(() => {
    loadRealMarketData();
    const interval = setInterval(loadRealMarketData, 8000);
    return () => clearInterval(interval);
  }, [loadRealMarketData]);

  // Load real candles for selected stock whenever it changes
  useEffect(() => {
    let isMounted = true;
    fetchStockCandles(selectedStock.symbol).then((res) => {
      if (isMounted && res && res.candles && res.candles.length > 0) {
        setSelectedStock((prev) => ({
          ...prev,
          historicalCandles: res.candles,
          ltp: res.candles[res.candles.length - 1].close,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedStock.symbol]);

  // Live WebSocket Tick Handler
  const handleLiveTick = useCallback((tick: any) => {
    if (tick.type === 'TICK') {
      if (tick.nifty_delta) {
        setIndices((prev) => {
          const newNiftyLtp = Number((prev.nifty.ltp + tick.nifty_delta).toFixed(2));
          const newNiftyChange = Number((newNiftyLtp - prev.nifty.prevClose).toFixed(2));
          const newNiftyPct = Number(((newNiftyChange / prev.nifty.prevClose) * 100).toFixed(2));

          const newBnfLtp = Number((prev.bankNifty.ltp + tick.bnf_delta).toFixed(2));
          const newBnfChange = Number((newBnfLtp - prev.bankNifty.prevClose).toFixed(2));
          const newBnfPct = Number(((newBnfChange / prev.bankNifty.prevClose) * 100).toFixed(2));

          return {
            nifty: { ...prev.nifty, ltp: newNiftyLtp, change: newNiftyChange, changePercent: newNiftyPct },
            bankNifty: { ...prev.bankNifty, ltp: newBnfLtp, change: newBnfChange, changePercent: newBnfPct },
          };
        });
      }
    }
  }, []);

  useLiveSocket(handleLiveTick);

  // Crosshair hover callback from StockChart
  const handleCandleHoverChange = useCallback((close: number | null, time: number | null) => {
    setRawHoveredClose(close);
    setRawHoveredTime(time);
  }, []);

  useEffect(() => {
    setRawHoveredClose(null);
    setRawHoveredTime(null);
  }, [selectedStock.symbol]);

  // Compute ATM Result
  const latestCandle = selectedStock.historicalCandles[selectedStock.historicalCandles.length - 1];
  const effectiveClose = debouncedHoveredClose ?? (latestCandle?.close || selectedStock.ltp);
  const effectiveTime = debouncedHoveredTime ?? (latestCandle?.time || 0);

  const baseAtmResult: AtmResult = useMemo(() => {
    return evaluateAtmOption(
      selectedStock.symbol,
      effectiveClose,
      effectiveTime,
      selectedStock.strikeInterval,
      selectedStock.changePercent
    );
  }, [selectedStock.symbol, effectiveClose, effectiveTime, selectedStock.strikeInterval, selectedStock.changePercent]);

  const [liveAtmResult, setLiveAtmResult] = useState<AtmResult>(baseAtmResult);

  // Sync with Backend ATM endpoint for real Angel token and expiry
  useEffect(() => {
    setLiveAtmResult(baseAtmResult);

    let isMounted = true;
    fetchAtmOption(
      selectedStock.symbol,
      effectiveClose,
      selectedStock.strikeInterval,
      selectedStock.changePercent
    ).then((res) => {
      if (isMounted && res) {
        setLiveAtmResult({
          ...baseAtmResult,
          atmStrike: res.atm_strike,
          optionType: res.option_type,
          optionSymbol: res.angel_symbol || res.option_symbol,
          expiry: res.expiry || baseAtmResult.expiry,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedStock.symbol, effectiveClose, effectiveTime, selectedStock.strikeInterval, selectedStock.changePercent, baseAtmResult]);

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      {/* Top Navigation & Status Bar */}
      <Header
        nifty={indices.nifty}
        bankNifty={indices.bankNifty}
        angelStatus={angelStatus}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Terminal Body */}
      <main className="flex-1 flex flex-col p-2.5 gap-2.5 max-w-[1920px] w-full mx-auto">
        {/* TOP ROW: Live Index Charts (NIFTY 50 & BANKNIFTY) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 min-h-[220px]">
          <IndexChart data={indices.nifty} height={200} />
          <IndexChart data={indices.bankNifty} height={200} />
        </section>

        {/* BOTTOM ROW: F&O Movers + Stock Chart + Option Chart */}
        <section className="flex-1 flex flex-col lg:flex-row gap-2.5 min-h-[480px]">
          {/* Panel 1: F&O Movers (Left Column) */}
          <MoversList
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={(stock) => setSelectedStock(stock)}
          />

          {/* Panel 2: Stock 5-Min Chart (Center Column) */}
          <StockChart
            stock={selectedStock}
            onCandleHoverChange={handleCandleHoverChange}
            hoveredCandleClose={rawHoveredClose}
            hoveredCandleTime={rawHoveredTime}
          />

          {/* Panel 3: Option 5-Min Chart (Right Column) */}
          <OptionChart
            stock={selectedStock}
            atmResult={liveAtmResult}
          />
        </section>
      </main>

      {/* Angel One Settings Modal */}
      <AngelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        status={angelStatus}
        onStatusRefresh={loadRealMarketData}
      />

      {/* Architecture & Gujarati Workflow Modal */}
      <WorkflowExplainerModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
