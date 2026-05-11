'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/ui/Header';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { userApi } from '@/lib/userApi';
import { stockApi } from '@/lib/stockApi';
import type { StockQuote, UserStockInterest } from '@/types';
import styles from './page.module.css';

// Local type for combined data
interface WatchlistItem {
  interestId: string;
  symbol: string;
  quote?: StockQuote;
  loading: boolean;
  error?: string;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user ID for demonstration
  const userId = '1';

  useEffect(() => {
    let active = true;

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        let interests: { symbol: string }[] = [];

        try {
          const remoteInterests = await userApi.getWatchlist();
          if (remoteInterests) {
            const dataList = Array.isArray(remoteInterests) ? remoteInterests : (remoteInterests.interests || []);
            if (dataList.length > 0) {
              interests = (dataList.map((item: any): { symbol: string } => {
                let sym = '';
                if (typeof item === 'string') {
                  sym = item;
                } else if (item && typeof item === 'object') {
                  sym = item.stockName || item.symbol || '';
                }
                return { symbol: sym };
              })).filter((i: { symbol: string }) => i.symbol !== '');
            }
          }
        } catch (e) {
          console.warn('Backend userApi failed', e);
        }

        if (!active) return;

        const initialItems = interests.map(i => ({
          interestId: i.symbol, // using symbol as ID since backend uses stockName
          symbol: i.symbol,
          loading: true,
        }));
        
        setItems(initialItems);

        // Fetch quotes for each item
        initialItems.forEach(async (item) => {
          try {
            const res = await stockApi.getPriceChange(item.symbol);
            if (!active) return;

            let finalQuote: StockQuote | null = null;
            let dataObj = res;
            if (typeof dataObj === 'string') {
              try {
                dataObj = JSON.parse(dataObj);
              } catch (e) {
                console.error('Failed to parse watchlist quote', e);
              }
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
            }

            if (finalQuote && (finalQuote.c !== 0 || finalQuote.pc !== 0)) {
              setItems(prev => prev.map(p => 
                p.symbol === item.symbol ? { ...p, quote: finalQuote!, loading: false } : p
              ));
            } else {
              throw new Error('No quote data');
            }
          } catch (err: any) {
            if (!active) return;
            setItems(prev => prev.map(p => 
              p.symbol === item.symbol ? { ...p, loading: false, error: 'Failed' } : p
            ));
          }
        });

      } catch (err: any) {
        if (active) setError(err.message || 'Failed to initialize watchlist');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchWatchlist();
    return () => { active = false; };
  }, [userId]);

  const handleRemove = async (interestId: string, symbol: string) => {
    // Optimistic update
    setItems(prev => prev.filter(i => i.symbol !== symbol));
    try {
      await userApi.removeFromWatchlist(symbol);
    } catch (e) {
      console.warn('Failed to remove from backend', e);
    }
  };

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            <span className="material-symbols-outlined starIcon">star</span>
            Followed Stocks
          </h1>
        </div>

        <GlassCard className={styles.tableCard}>
          {error ? (
            <div className={styles.emptyState}>{error}</div>
          ) : loading ? (
            <div className={styles.loadingState}>
              <Skeleton height={40} className={styles.mb} />
              <Skeleton height={60} className={styles.mb} />
              <Skeleton height={60} />
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>
              Your watchlist is empty. Search for a stock to add it here.
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th className={styles.alignRight}>Price</th>
                    <th className={styles.alignRight}>24h Change</th>
                    <th className={styles.alignCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const quote = item.quote;
                    let changeValue = 0;
                    let changePercent = 0;
                    let isPositive = true;

                    if (quote) {
                      changeValue = (quote?.c ?? 0) - (quote?.pc ?? 0);
                      changePercent = quote?.pc ? (changeValue / quote.pc) * 100 : 0;
                      isPositive = changeValue >= 0;
                    }

                    return (
                      <tr key={item.interestId}>
                        <td>
                          <div className={styles.assetCol}>
                            <div className={styles.assetAvatar}>
                              {item.symbol ? item.symbol.charAt(0) : '?'}
                            </div>
                            <div className={styles.assetInfo}>
                              <Link href={`/stock/${item.symbol}`} className={styles.assetSymbol}>
                                {item.symbol}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className={styles.alignRight}>
                          {item.loading ? (
                            <Skeleton width={60} height={20} className={styles.inlineBlock} />
                          ) : quote ? (
                            <span className={styles.priceText}>${(quote?.c ?? 0).toFixed(2)}</span>
                          ) : (
                            <span className={styles.errorText}>-</span>
                          )}
                        </td>
                        <td className={styles.alignRight}>
                          {item.loading ? (
                            <Skeleton width={60} height={20} className={styles.inlineBlock} />
                          ) : quote ? (
                            <span className={`${styles.changeText} ${isPositive ? styles.textSuccess : styles.textDanger}`}>
                              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                          ) : (
                            <span className={styles.errorText}>-</span>
                          )}
                        </td>
                        <td className={styles.alignCenter}>
                          <div className={styles.actionBtns}>
                            <Link href={`/stock/${item.symbol}`}>
                              <Button variant="ghost" className={styles.iconBtn}>
                                <span className="material-symbols-outlined">analytics</span>
                              </Button>
                            </Link>
                            <Button 
                              variant="ghost" 
                              className={styles.iconBtnDanger}
                              onClick={() => handleRemove(item.interestId, item.symbol)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </main>
    </>
  );
}
