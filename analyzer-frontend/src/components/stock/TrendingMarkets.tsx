'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { stockApi } from '../../lib/stockApi';
import styles from './TrendingMarkets.module.css';

interface MarketData {
  name: string;
  symbol: string;
  type: string;
  c?: number;
  pc?: number;
  percentChange?: number;
  error: boolean;
}

const TRENDING_SYMBOLS = [
  { symbol: 'AMZN', name: 'Amazon', type: 'STOCK' },
  { symbol: 'AAPL', name: 'Apple', type: 'STOCK' },
  { symbol: 'GOOGL', name: 'Google', type: 'STOCK' }
];

export function TrendingMarkets() {
  const [markets, setMarkets] = useState<MarketData[]>(
    TRENDING_SYMBOLS.map(m => ({ ...m, error: false }))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchQuotes = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          TRENDING_SYMBOLS.map(async (market) => {
            try {
              const rawChange = await stockApi.getPriceChange(market.symbol);
              let dataObj = rawChange;
              if (typeof rawChange === 'string') {
                try { dataObj = JSON.parse(rawChange); } catch (e) {}
              }
              if (Array.isArray(dataObj)) dataObj = dataObj[0];

              if (dataObj && typeof dataObj === 'object') {
                const currentPrice = parseFloat(dataObj.c ?? dataObj.current ?? 0) || 0;
                const prevClose = parseFloat(dataObj.pc ?? dataObj.previousClose ?? 0) || 0;
                const percentChange1D = dataObj['1D'] !== undefined ? parseFloat(dataObj['1D']) : null;

                let calculatedPercentChange = 0;
                if (percentChange1D !== null && !isNaN(percentChange1D)) {
                  calculatedPercentChange = percentChange1D;
                } else if (currentPrice && prevClose) {
                  calculatedPercentChange = ((currentPrice - prevClose) / prevClose) * 100;
                }

                return { 
                  ...market, 
                  c: currentPrice, 
                  pc: prevClose, 
                  percentChange: calculatedPercentChange,
                  error: false 
                };
              }
              return { ...market, error: true };
            } catch (err) {
              console.error(`Failed to fetch stock-data for ${market.symbol}`, err);
              return { ...market, error: true };
            }
          })
        );
        
        if (isMounted) {
          setMarkets(results);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuotes();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={styles.trendingSection}>
      <h2 className={styles.sectionTitle}>
        <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>star</span>
        Trending Markets
      </h2>
      
      {loading ? (
        <div className={styles.loadingContainer}>
          <span style={{ color: 'var(--color-text-muted)' }}>Loading market data...</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {markets.map((market, index) => {
            const currentPrice = market.c;
            const percentChange = market.percentChange || 0;
            const isPositive = percentChange >= 0;

            return (
              <GlassCard key={index} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{market.name}</h3>
                    <span className={styles.cardSubtitle}>{market.type}</span>
                  </div>
                  <div className={styles.score}>
                    {market.error || currentPrice === undefined ? (
                      <Badge variant="danger" glow>Unavailable</Badge>
                    ) : (
                      <Badge variant={isPositive ? 'success' : 'danger'} glow>
                        {isPositive ? 'Bullish' : 'Bearish'}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  {market.error || currentPrice === undefined ? (
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>--</span>
                    </div>
                  ) : (
                    <div className={styles.priceContainer}>
                      <span className={styles.price}>{currentPrice.toFixed(2)}</span>
                      <span className={isPositive ? styles.percentSuccess : styles.percentDanger}>
                        {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </section>
  );
}
