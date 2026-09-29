import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import type { FnoStock, AtmResult, CandleData } from '../types';
import { generateOptionCandles } from '../data/marketSimulator';
import { Zap } from 'lucide-react';

interface OptionChartProps {
  stock: FnoStock;
  atmResult: AtmResult;
}

export const OptionChart: React.FC<OptionChartProps> = ({ stock, atmResult }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [activeCandle, setActiveCandle] = useState<CandleData | null>(null);

  // Generate synthetic correlated 5-min option candles for this ATM strike and option type
  const optionCandles = useMemo(() => {
    return generateOptionCandles(stock.historicalCandles, atmResult.atmStrike, atmResult.optionType);
  }, [stock.historicalCandles, atmResult.atmStrike, atmResult.optionType]);

  const latestOptionCandle = optionCandles[optionCandles.length - 1];
  const firstOptionCandle = optionCandles[0];
  const optionLtp = latestOptionCandle?.close || 0;
  const optionOpen = firstOptionCandle?.open || optionLtp;
  const optionChange = Number((optionLtp - optionOpen).toFixed(2));
  const optionChangePct = optionOpen > 0 ? Number(((optionChange / optionOpen) * 100).toFixed(2)) : 0;

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
          color: atmResult.optionType === 'CE' ? '#10b981' : '#ef4444',
          width: 1,
          style: 2,
          labelBackgroundColor: atmResult.optionType === 'CE' ? '#059669' : '#dc2626',
        },
        horzLine: {
          color: atmResult.optionType === 'CE' ? '#10b981' : '#ef4444',
          width: 1,
          style: 2,
          labelBackgroundColor: atmResult.optionType === 'CE' ? '#059669' : '#dc2626',
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

    const formattedData: CandlestickData<Time>[] = optionCandles.map((c) => ({
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

    // Crosshair hover tracking on option chart
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setActiveCandle(null);
        return;
      }
      const candle = param.seriesData.get(series) as any;
      if (candle) {
        setActiveCandle({
          time: Number(param.time),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
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
  }, [atmResult.optionSymbol, atmResult.optionType, optionCandles]);

  const displayCandle = activeCandle || latestOptionCandle;

  const formatCandleTime = (timestamp?: number) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-IN', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isCE = atmResult.optionType === 'CE';

  return (
    <div className="flex-1 flex flex-col bg-[#0c101a] border border-slate-800/80 rounded-lg overflow-hidden h-full">
      {/* Top Details & Header */}
      <div className="p-3 bg-[#0f1422] border-b border-slate-800 flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Option Contract Name & Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-100 font-mono tracking-wide">
                {atmResult.optionSymbol}
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded font-mono ${
                  isCE
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {isCE ? 'CALL (CE)' : 'PUT (PE)'}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                {atmResult.expiry}
              </span>
            </div>

            {/* Option LTP */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-100">
                ₹{optionLtp.toFixed(2)}
              </span>
              <span
                className={`flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  optionChange >= 0
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-400 border border-rose-500/30'
                }`}
              >
                {optionChange >= 0 ? '+' : ''}
                {optionChange.toFixed(2)} ({optionChangePct >= 0 ? '+' : ''}
                {optionChangePct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Anchor Context Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-indigo-950/50 border border-indigo-500/30 px-2.5 py-1 rounded text-xs font-mono text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Stock Close:</span>
              <strong className="text-white">₹{atmResult.candleClose.toFixed(2)}</strong>
              <span className="text-slate-400">({formatCandleTime(atmResult.candleTime)})</span>
            </div>
          </div>
        </div>

        {/* OHLC and Greeks Info Bar */}
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
            </div>

            {/* Simulated Greeks Badge */}
            <div className="hidden lg:flex items-center gap-3 text-[10px] text-slate-400">
              <span>Delta: <strong className="text-cyan-400">{isCE ? '+0.52' : '-0.48'}</strong></span>
              <span>IV: <strong className="text-amber-400">28.4%</strong></span>
              <span>Lot: <strong className="text-slate-300">{stock.lotSize}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="relative w-full flex-1 min-h-[360px]" />
    </div>
  );
};
