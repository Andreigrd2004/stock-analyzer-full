'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { stockApi } from '@/lib/stockApi';
import type { InsiderSentimentItem, InsiderSentimentResponse } from '@/types';
import styles from './InsiderSentiment.module.css';

export const InsiderSentiment: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [dataPoints, setDataPoints] = useState<InsiderSentimentItem[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const res = await stockApi.getInsiderSentiment(symbol);
        if (!active) return;
        
        let sentimentData: InsiderSentimentResponse | null = null;
        let textSummary: string | null = null;

        if (typeof res === 'string') {
          // Only attempt parse if it looks like JSON
          const trimmed = res.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              sentimentData = JSON.parse(trimmed);
            } catch (e) {
              textSummary = res;
            }
          } else {
            textSummary = res;
          }
        } else {
          sentimentData = res as InsiderSentimentResponse;
        }

        setSummary(textSummary);

        // Use up to the 3 most recent entries
        if (sentimentData && sentimentData.data && sentimentData.data.length > 0) {
          const sorted = [...sentimentData.data].sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
          });
          setDataPoints(sorted.slice(0, 3));
        } else {
          setDataPoints([]);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load sentiment');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
  }, [symbol]);

  if (loading) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <Skeleton width={150} height={20} />
        </div>
        <div className={styles.content}>
          <div className={styles.metricsGridSkel}>
            <Skeleton width="100%" height={60} />
            <Skeleton width="100%" height={60} />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (error || (dataPoints.length === 0 && !summary)) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Insider Sentiment</h3>
        </div>
        <div className={styles.emptyState}>
          {error || `No recent insider data for ${symbol}.`}
        </div>
      </GlassCard>
    );
  }

  if (summary && dataPoints.length === 0) {
    const isMetricsFormat = summary.includes('Average MSPR:') && summary.includes('Latest MSPR:');
    
    if (isMetricsFormat) {
      const parts = summary.split('|').map(p => p.trim());
      
      let avg = '', latest = '', latestPeriod = '', trendStr = '', dp = '';
      
      parts.forEach(p => {
        if (p.startsWith('Average MSPR:')) avg = p.replace('Average MSPR:', '').trim();
        else if (p.startsWith('Latest MSPR:')) {
           const match = p.match(/Latest MSPR:\s*([\-\d,.]+)\s*\((.*?)\)/);
           if (match) {
             latest = match[1];
             latestPeriod = match[2];
           } else {
             latest = p.replace('Latest MSPR:', '').trim();
           }
        }
        else if (p.startsWith('Trend:')) trendStr = p.replace('Trend:', '').trim();
        else if (p.startsWith('Data points:')) dp = p.replace('Data points:', '').replace('.', '').trim();
      });

      return (
        <GlassCard className={`${styles.container} ${styles.overflowHidden}`}>
          <div className={styles.glowBg} />
          <h3 className={styles.title}>
            Insider Sentiment
          </h3>

          <div className={styles.content}>
            <div className={styles.metricsGrid}>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Avg MSPR</span>
                <div className={styles.metricValue}>{avg}</div>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Latest MSPR</span>
                <div className={styles.metricValue}>
                  {latest}
                  {latestPeriod && <span className={styles.periodLabel}>({latestPeriod})</span>}
                </div>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Trend</span>
                <div className={`${styles.metricValue} ${trendStr === 'Improving' ? styles.txtPos : (trendStr === 'Deteriorating' ? styles.txtNeg : '')} ${styles.txtSm}`}>
                  {trendStr}
                </div>
              </div>
              <div className={styles.metricBox}>
                <span className={styles.metricLabel}>Data Points</span>
                <div className={styles.metricValue}>{dp}</div>
              </div>
            </div>
          </div>
        </GlassCard>
      );
    }

    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Insider Insights</h3>
        </div>
        <div className={styles.content}>
          <p className={styles.summaryText}>{summary}</p>
        </div>
      </GlassCard>
    );
  }

  if (dataPoints.length === 0) return null; // Final safety check

  const latestData = dataPoints[0];
  const latestMspr = latestData.mspr;
  const avgMspr = dataPoints.reduce((sum, item) => sum + item.mspr, 0) / dataPoints.length;
  
  let trend = "Stable";
  if (latestMspr < avgMspr - 0.5) trend = "Deteriorating";
  else if (latestMspr > avgMspr + 0.5) trend = "Improving";
  else if (latestMspr < avgMspr) trend = "Deteriorating";
  else if (latestMspr > avgMspr) trend = "Improving";

  return (
    <GlassCard className={`${styles.container} ${styles.overflowHidden}`}>
      <div className={styles.glowBg} />
      <h3 className={styles.title}>
        Insider Sentiment
      </h3>

      <div className={styles.content}>
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Avg MSPR</span>
            <div className={styles.metricValue}>{avgMspr.toFixed(2)}</div>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Latest MSPR</span>
            <div className={styles.metricValue}>
              {latestMspr.toFixed(2)}
              <span className={styles.periodLabel}>({latestData.month}/{latestData.year})</span>
            </div>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Trend</span>
            <div className={`${styles.metricValue} ${trend === 'Improving' ? styles.txtPos : (trend === 'Deteriorating' ? styles.txtNeg : '')} ${styles.txtSm}`}>
              {trend}
            </div>
          </div>
          <div className={styles.metricBox}>
            <span className={styles.metricLabel}>Data Points</span>
            <div className={styles.metricValue}>{dataPoints.length}</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
