import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import type { IndexData, CandleData } from '../types';

interface IndexChartProps {
  data: IndexData;
  height?: number;
}

export const IndexChart: React.FC<IndexChartProps> = ({ data, height = 210 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: '#0c101a' },
        textColor: '#94a3b8',
        fontSize: 10,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: '#151d2c' },
        horzLines: { color: '#151d2c' },
      },
      crosshair: {
        vertLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
        horzLine: {
          color: '#38bdf8',
          width: 1,
          style: 3,
          labelBackgroundColor: '#0284c7',
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#1e293b',
        barSpacing: 6,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const formattedData: CandlestickData<Time>[] = data.candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Crosshair hover tracking
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const candle = param.seriesData.get(candlestickSeries) as any;
      if (candle) {
        setHoveredCandle({
          time: Number(param.time),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
      }
    });

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [height, data.symbol]);

  // Update data when candles change
  useEffect(() => {
    if (seriesRef.current && data.candles.length > 0) {
      const formattedData: CandlestickData<Time>[] = data.candles.map((c) => ({
        time: c.time as Time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(formattedData);
    }
  }, [data.candles]);

  const latestCandle = data.candles[data.candles.length - 1];
  const activeDisplay = hoveredCandle || latestCandle;

  return (
    <div className="flex-1 bg-[#0c101a] border border-slate-800/80 rounded-lg overflow-hidden flex flex-col">
      {/* Chart Header Bar */}
      <div className="px-3 py-2 bg-[#0f1422] border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200 tracking-wide">{data.symbol}</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">5 MIN</span>
          <span className="font-mono font-bold text-slate-100">{data.ltp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          <span
            className={`flex items-center font-mono font-semibold text-[11px] ${
              data.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {data.change >= 0 ? '+' : ''}
            {data.change.toFixed(2)} ({data.changePercent >= 0 ? '+' : ''}
            {data.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* OHLC Bar */}
        {activeDisplay && (
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span>O: <strong className="text-slate-200">{activeDisplay.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-emerald-400">{activeDisplay.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-rose-400">{activeDisplay.low.toFixed(2)}</strong></span>
            <span>C: <strong className={activeDisplay.close >= activeDisplay.open ? 'text-emerald-400' : 'text-rose-400'}>{activeDisplay.close.toFixed(2)}</strong></span>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="relative w-full flex-1" style={{ minHeight: `${height}px` }} />
    </div>
  );
};
