'use client';

import React, { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { stockApi } from '@/lib/stockApi';
import { userApi } from '@/lib/userApi';
import type { StockQuote, StockPriceChange } from '@/types';
import { BrokerModal } from './BrokerModal';
import styles from './PriceOverview.module.css';

export const PriceOverview: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [priceChange, setPriceChange] = useState<StockPriceChange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);
  const [showAlreadyExistsPopup, setShowAlreadyExistsPopup] = useState(false);

  useEffect(() => {
    let active = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const rawChange = await stockApi.getPriceChange(symbol).catch((err: any) => {
          console.error(err);
          return null;
        });

        if (!active) return;
        console.log(`[DEBUG] Received rawChange for ${symbol}:`, rawChange);

        let finalQuote: StockQuote | null = null;
        let finalChange: StockPriceChange | null = null;

        if (rawChange) {
          let dataObj = rawChange;
          if (typeof rawChange === 'string') {
            try {
              dataObj = JSON.parse(rawChange);
            } catch (e) { }
          }
          
          if (Array.isArray(dataObj)) {
            dataObj = dataObj[0];
          }

          if (dataObj && typeof dataObj === 'object') {
            finalQuote = {
              c: parseFloat(dataObj.c ?? dataObj.current ?? 0) || 0,
              h: parseFloat(dataObj.h ?? dataObj.high ?? 0) || 0,
              l: parseFloat(dataObj.l ?? dataObj.low ?? 0) || 0,
              o: parseFloat(dataObj.o ?? dataObj.open ?? 0) || 0,
              pc: parseFloat(dataObj.pc ?? dataObj.previousClose ?? 0) || 0,
              t: dataObj.t ? (typeof dataObj.t === 'string' ? parseFloat(dataObj.t) : dataObj.t) : Date.now()
            };
            
            finalChange = dataObj;
          }
        }

        if (finalQuote && (finalQuote.c !== 0 || finalQuote.pc !== 0)) {
          setQuote(finalQuote);
        }
        if (finalChange && Object.keys(finalChange).length > 0) {
          setPriceChange(finalChange);
        }
        
        if (!finalQuote && !finalChange) {
          setError('Data unreachable or malformed.');
        }
      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load data');
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
          <Skeleton width={120} height={24} />
          <Skeleton width={80} height={32} />
        </div>
        <div className={styles.priceRow}>
          <Skeleton width={150} height={48} />
          <Skeleton width={100} height={24} />
        </div>
        <div className={styles.intervals}>
          <Skeleton width="100%" height={48} />
        </div>
      </GlassCard>
    );
  }

  const hasData = quote && (quote.c !== 0 || quote.pc !== 0);

  if (error || !hasData) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.symbol}>{symbol}</h2>
        </div>
        <div className={styles.errorState}>
          {error || 'Quote data unavailable'}
        </div>
      </GlassCard>
    );
  }

  const changeValue = (quote?.c ?? 0) - (quote?.pc ?? 0);
  const changePercent = quote?.pc ? (changeValue / quote.pc) * 100 : 0;
  const isPositive = changeValue >= 0;

  const handleAddWatchlist = async () => {
    try {
      setIsAddingWatchlist(true);
      await userApi.addToWatchlist(symbol);
      setWatchlistSuccess(true);
      setTimeout(() => setWatchlistSuccess(false), 3000);
    } catch (e: any) {
      console.error('Failed to add to watchlist', e);
      if (e.message === 'Stock interest already exists.') {
        setShowAlreadyExistsPopup(true);
        setTimeout(() => setShowAlreadyExistsPopup(false), 3000);
      }
    } finally {
      setIsAddingWatchlist(false);
    }
  };

  return (
    <GlassCard className={styles.container} style={{ position: 'relative' }}>
      {showAlreadyExistsPopup && (
        <div className={styles.popupToast}>
          <span className="material-symbols-outlined">info</span>
          Already in Watchlist!
        </div>
      )}
      <div className={styles.topSection}>
        <div className={styles.titleInfo}>
          <h1 className={styles.symbol}>{symbol}</h1>
          <span className={styles.companyName}>Stock Quote</span>
        </div>
        <div className={styles.actions}>
          <Button variant="primary" className={styles.tradeBtn} onClick={() => setIsBrokerModalOpen(true)}>
            Trade
          </Button>
          <Button 
            variant="secondary" 
            className={styles.iconBtn} 
            onClick={handleAddWatchlist}
            disabled={isAddingWatchlist || watchlistSuccess}
          >
            <span className="material-symbols-outlined">
              {watchlistSuccess ? 'check_circle' : 'add_circle'}
            </span>
          </Button>
        </div>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.currentPrice}>
          ${(quote?.c ?? 0).toFixed(2)}
        </span>
        <div className={`${styles.changeValue} ${isPositive ? styles.positive : styles.negative}`}>
          <span className="material-symbols-outlined">
            {isPositive ? 'trending_up' : 'trending_down'}
          </span>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}% (${Math.abs(changeValue).toFixed(2)})
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>High</span>
          <span className={styles.metricValue}>${(quote?.h ?? 0).toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Low</span>
          <span className={styles.metricValue}>${(quote?.l ?? 0).toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Open</span>
          <span className={styles.metricValue}>${(quote?.o ?? 0).toFixed(2)}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Prev Close</span>
          <span className={styles.metricValue}>${(quote?.pc ?? 0).toFixed(2)}</span>
        </div>
      </div>

      {priceChange && (
        <div className={styles.intervals}>
          {['1D', '5D', '1M', '3M', 'YTD', '1Y'].map((interval) => {
            const field = interval as keyof StockPriceChange;
            const val = priceChange[field] as number;
            if (val === undefined) return null;
            
            const isPos = val >= 0;
            return (
              <div key={interval} className={styles.intervalBadge}>
                <span className={styles.intervalKey}>{interval}</span>
                <span className={`${styles.intervalVal} ${isPos ? styles.txtPos : styles.txtNeg}`}>
                  {isPos ? '+' : ''}{val.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      <BrokerModal 
        isOpen={isBrokerModalOpen} 
        onClose={() => setIsBrokerModalOpen(false)} 
        symbol={symbol} 
      />
    </GlassCard>
  );
};
