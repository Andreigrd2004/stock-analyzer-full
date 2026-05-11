'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { GlassCard } from '@/components/ui/GlassCard';
import { fetchMonthlyCandles } from '@/lib/finnhubApi';
import styles from './PriceChart.module.css';

// ── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint {
  date: string;    // e.g. "Apr 25"
  close: number;
  timestamp: number;
}

interface PriceChartProps {
  symbol: string;
  predictedPrice?: number | null;
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { date, close } = payload[0].payload as ChartPoint;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipDate}>{date}</p>
      <p className={styles.tooltipPrice}>${close.toFixed(2)}</p>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

function yTickFormatter(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

export const PriceChart: React.FC<PriceChartProps> = ({ symbol, predictedPrice }) => {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandles = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      const raw = await fetchMonthlyCandles(symbol, controller.signal);

      if (raw.s === 'no_data' || !raw.c?.length) {
        setError('No chart data available for this symbol.');
        return;
      }

      const points: ChartPoint[] = raw.t.map((ts, i) => ({
        date: formatTimestamp(ts),
        close: parseFloat(raw.c[i].toFixed(2)),
        timestamp: ts,
      }));

      setData(points);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Could not load price history.');
      }
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  }, [symbol]);

  useEffect(() => {
    loadCandles();
  }, [loadCandles]);

  // ── Compute Y-domain with headroom for predicted price ───────────────────
  const closes = data.map((d) => d.close);
  const allValues = predictedPrice ? [...closes, predictedPrice] : closes;
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 1;
  const padding = (maxVal - minVal) * 0.12;
  const yDomain: [number, number] = [
    parseFloat((minVal - padding).toFixed(2)),
    parseFloat((maxVal + padding).toFixed(2)),
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={`material-symbols-outlined ${styles.icon}`}>candlestick_chart</span>
            <div>
              <p className={styles.title}>Price History</p>
              <p className={styles.subtitle}>Loading 12-month chart…</p>
            </div>
          </div>
        </div>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
          <span>Fetching market data</span>
        </div>
      </GlassCard>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || data.length === 0) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={`material-symbols-outlined ${styles.icon}`}>candlestick_chart</span>
            <div>
              <p className={styles.title}>Price History — {symbol}</p>
            </div>
          </div>
        </div>
        <div className={styles.errorWrap}>
          <span className={`material-symbols-outlined ${styles.errorIcon}`}>signal_disconnected</span>
          <span>{error ?? 'Chart data unavailable.'}</span>
        </div>
      </GlassCard>
    );
  }

  // ── Chart ────────────────────────────────────────────────────────────────
  return (
    <GlassCard className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={`material-symbols-outlined ${styles.icon}`}>candlestick_chart</span>
          <div>
            <p className={styles.title}>Price History — {symbol}</p>
            <p className={styles.subtitle}>Monthly closing prices · last 12 months</p>
          </div>
        </div>

        {/* Prediction badge — only shown when predicted price is available */}
        {predictedPrice != null && (
          <div className={styles.predictionBadge}>
            <span className={styles.predictionDot} />
            AI Target: ${predictedPrice.toFixed(2)}
          </div>
        )}
      </div>

      {/* Chart */}
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#8c2bee" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#8c2bee" stopOpacity={0}    />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              dy={6}
            />

            <YAxis
              domain={yDomain}
              tickFormatter={yTickFormatter}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={58}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: 'rgba(140,43,238,0.35)',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />

            {/* AI Predicted price reference line */}
            {predictedPrice != null && (
              <ReferenceLine
                y={predictedPrice}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `$${predictedPrice.toFixed(2)}`,
                  position: 'insideTopRight',
                  fill: '#f59e0b',
                  fontSize: 11,
                  fontWeight: 600,
                  dy: -6,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="close"
              stroke="#8c2bee"
              strokeWidth={2}
              fill={`url(#grad-${symbol})`}
              dot={false}
              activeDot={{
                r: 5,
                stroke: '#8c2bee',
                strokeWidth: 2,
                fill: '#191022',
              }}
              animationDuration={900}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
