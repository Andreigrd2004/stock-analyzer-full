'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { stockApi } from '@/lib/stockApi';
import type { NewsItem } from '@/types';
import styles from './NewsFeed.module.css';

export const NewsFeed: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadNews = async () => {
      try {
        setLoading(true);
        // Using a mock range for the last 14 days
        const res = await stockApi.getNews(symbol);
        if (!active) return;
        
        if (Array.isArray(res)) {
          setNews(res);
        } else if (res && typeof res === 'object' && 'items' in res && Array.isArray((res as any).items)) {
          setNews((res as any).items);
        } else {
          setNews([]);
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load news');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadNews();
    return () => { active = false; };
  }, [symbol]);

  return (
    <GlassCard className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span className="material-symbols-outlined">newspaper</span>
          Latest Insights
        </h2>
      </div>

      <div className={styles.feed}>
        {loading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className={styles.newsSkeleton}>
              <div className={styles.imageWrapper}>
                <Skeleton width="100%" height="100%" />
              </div>
              <div className={styles.skelContent}>
                <Skeleton width={100} height={12} />
                <Skeleton width="100%" height={16} />
                <Skeleton width="80%" height={16} />
              </div>
            </div>
          ))
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : news.length === 0 ? (
          <div className={styles.emptyState}>No recent news found for {symbol}.</div>
        ) : (
          news.slice(0, 10).map((item, idx) => (
            <a 
              key={item.id || idx} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.newsItem}
            >
              {item.image && (
                <div className={styles.imageWrapper}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className={styles.image} loading="lazy" />
                </div>
              )}
              <div className={styles.content}>
                <div className={styles.meta}>
                  <span className={styles.source}>{item.source}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.date}>
                    {new Date(item.datetime * 1000).toLocaleDateString()}
                  </span>
                </div>
                <h4 className={styles.headline}>{item.headline}</h4>
              </div>
            </a>
          ))
        )}
      </div>
    </GlassCard>
  );
};
