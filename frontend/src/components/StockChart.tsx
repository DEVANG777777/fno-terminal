import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import type { FnoStock, CandleData } from '../types';
import { calculateATM, getOptionType } from '../utils/atmEngine';
import { Crosshair, Clock } from 'lucide-react';

interface StockChartProps {
  stock: FnoStock;
  onCandleHoverChange: (close: number | null, time: number | null) => void;
  hoveredCandleClose?: number | null;
  hoveredCandleTime?: number | null;
}

export const StockChart: React.FC<StockChartProps> = ({
  stock,
  onCandleHoverChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [activeCandle, setActiveCandle] = useState<CandleData | null>(null);

  // Latest candle as default
  const latestCandle = stock.historicalCandles[stock.historicalCandles.length - 1];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 450,
      layout: {
        background: { type: ColorType.Solid, color: '#0c101a' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#141b27' },
        horzLines: { color: '#141b27' },
      },
      crosshair: {
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 2,
          labelBackgroundColor: '#0284c7',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e293b',
        barSpacing: 9,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.08,
          bottom: 0.08,
        },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const formattedData: CandlestickData<Time>[] = stock.historicalCandles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    series.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

    // Crosshair Hover Event Listener
    // KEY REQUIREMENT: Captures Historical Candle Close under mouse!
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setActiveCandle(null);
        onCandleHoverChange(null, null);
        return;
      }

      const candle = param.seriesData.get(series) as any;
      if (candle) {
        const cTime = Number(param.time);
        const candleObj: CandleData = {
          time: cTime,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        };
        setActiveCandle(candleObj);
        onCandleHoverChange(candle.close, cTime);
      }
    });

    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [stock.symbol]);

  // Update data when stock candles update
  useEffect(() => {
    if (seriesRef.current && stock.historicalCandles.length > 0) {
      const formattedData: CandlestickData<Time>[] = stock.historicalCandles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(formattedData);
    }
  }, [stock.historicalCandles]);

  // Display candle (hovered historical candle or latest LTP candle)
  const displayCandle = activeCandle || latestCandle;
  const isHovering = activeCandle !== null;

  // Active ATM calculation for current view
  const currentATM = useMemo(() => {
    if (!displayCandle) return null;
    return calculateATM(displayCandle.close, stock.strikeInterval);
  }, [displayCandle, stock.strikeInterval]);

  const optionType = getOptionType(stock.changePercent);

  // Time format
  const formatCandleTime = (timestamp?: number) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0c101a] border border-slate-800/80 rounded-lg overflow-hidden h-full">
      {/* Top Details & Header */}
      <div className="p-3 bg-[#0f1422] border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Stock Symbol & LTP */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-100 font-mono tracking-wide">
                {stock.symbol}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono font-medium">
                5 MIN
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {stock.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-100">
                ₹{stock.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  stock.changePercent >= 0
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                }`}
              >
                {stock.changePercent >= 0 ? '+' : ''}
                {stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Real-time Hovered Candle Banner */}
          <div className="flex items-center gap-2 flex-wrap">
            {isHovering ? (
              <div className="flex items-center gap-2 bg-blue-950/60 border border-cyan-500/40 px-2.5 py-1 rounded text-xs font-mono text-cyan-300 animate-pulse">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>CANDLE HOVER:</span>
                <span className="text-slate-200">Time: {formatCandleTime(displayCandle?.time)}</span>
                <span className="text-cyan-400 font-bold">Close: ₹{displayCandle?.close.toFixed(2)}</span>
                <span className="bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-200 font-bold">
                  ATM: {currentATM} {optionType}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>LATEST CLOSE: ₹{latestCandle?.close.toFixed(2)}</span>
                <span className="text-slate-300 font-bold">ATM: {currentATM} {optionType}</span>
              </div>
            )}
          </div>
        </div>

        {/* OHLC Bar */}
        {displayCandle && (
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#080b11] px-3 py-1.5 rounded border border-slate-800/80">
            <div className="flex items-center gap-4 flex-wrap">
              <span>Time: <strong className="text-slate-200">{formatCandleTime(displayCandle.time)}</strong></span>
              <span>Open: <strong className="text-slate-200">{displayCandle.open.toFixed(2)}</strong></span>
              <span>High: <strong className="text-emerald-400">{displayCandle.high.toFixed(2)}</strong></span>
              <span>Low: <strong className="text-rose-400">{displayCandle.low.toFixed(2)}</strong></span>
              <span>
                Close:{' '}
                <strong
                  className={
                    displayCandle.close >= displayCandle.open ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {displayCandle.close.toFixed(2)}
                </strong>
              </span>
              <span>Vol: <strong className="text-slate-300">{displayCandle.volume?.toLocaleString()}</strong></span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-slate-500 text-[10px]">
              <span>Interval: ₹{stock.strikeInterval}</span>
              <span>•</span>
              <span>Move mouse over candles to test historical ATM</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="relative w-full flex-1 min-h-[360px]" />
    </div>
  );
};
