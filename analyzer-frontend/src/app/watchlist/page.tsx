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
import { AiAnalysis } from '@/components/stock/AiAnalysis';
import type { StockQuote, PredictionDTO } from '@/types';
import styles from './page.module.css';



interface WatchlistItem {
  interestId: string;
  symbol: string;
  quote?: StockQuote;
  quoteLoading: boolean;
  quoteError?: string;
  prediction?: PredictionDTO;
  predictionsLoading: boolean;
}







interface ModalState {
  symbol: string;
  summary: string | null;
}



function getActionVariant(action: string): 'success' | 'danger' | 'warning' | 'primary' {
  const a = action.toLowerCase();
  if (a.includes('buy'))  return 'success';
  if (a.includes('sell')) return 'danger';
  if (a.includes('hold')) return 'warning';
  return 'primary';
}



export default function WatchlistPage() {
  const [items, setItems]     = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [modal, setModal]     = useState<ModalState | null>(null);

  const userId = '1';


  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleCloseModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal]);

  useEffect(() => {
    let active = true;

    const fetchWatchlist = async () => {
      try {
        setLoading(true);


        let symbols: string[] = [];
        try {
          const remote = await userApi.getWatchlist();
          if (remote) {
            const list = Array.isArray(remote) ? remote : (remote.interests ?? []);
            symbols = list
              .map((item: any) => {
                if (typeof item === 'string') return item;
                return item?.stockName || item?.symbol || '';
              })
              .filter(Boolean);
          }
        } catch (e) {
          console.warn('Watchlist fetch failed', e);
        }

        if (!active) return;


        const initial: WatchlistItem[] = symbols.map(sym => ({
          interestId: sym,
          symbol: sym,
          quoteLoading: true,
          predictionsLoading: true,
        }));
        setItems(initial);
        setLoading(false);


        initial.forEach(async (item) => {
          try {
            const res = await stockApi.getPriceChange(item.symbol);
            if (!active) return;

            let data: any = res;
            if (typeof data === 'string') { try { data = JSON.parse(data); } catch (_) {} }
            if (Array.isArray(data)) data = data[0];

            const q: StockQuote | null = data && typeof data === 'object'
              ? {
                  c:  parseFloat(data.c  ?? data.current       ?? 0) || 0,
                  h:  parseFloat(data.h  ?? data.high          ?? 0) || 0,
                  l:  parseFloat(data.l  ?? data.low           ?? 0) || 0,
                  o:  parseFloat(data.o  ?? data.open          ?? 0) || 0,
                  pc: parseFloat(data.pc ?? data.previousClose ?? 0) || 0,
                  t:  data.t ? (typeof data.t === 'string' ? parseFloat(data.t) : data.t) : Date.now(),
                }
              : null;

            setItems(prev => prev.map(p =>
              p.symbol === item.symbol
                ? { ...p, quote: q ?? undefined, quoteLoading: false, quoteError: q ? undefined : 'No data' }
                : p
            ));
          } catch {
            if (!active) return;
            setItems(prev => prev.map(p =>
              p.symbol === item.symbol ? { ...p, quoteLoading: false, quoteError: 'Failed' } : p
            ));
          }
        });


        if (symbols.length > 0) {
          try {
            const predRes = await stockApi.getRelatedPredictions({ stockSymbols: symbols });
            if (!active) return;

            const predictions: PredictionDTO[] = predRes?.predictions ?? [];

            setItems(prev => prev.map(p => {
              const pred = predictions.find((pr: PredictionDTO) => pr.stockSymbol === p.symbol);
              return { ...p, prediction: pred, predictionsLoading: false };
            }));
          } catch (e) {
            console.warn('Predictions fetch failed', e);
            setItems(prev => prev.map(p => ({ ...p, predictionsLoading: false })));
          }
        }

      } catch (err: any) {
        if (active) setError(err.message || 'Failed to load watchlist');
        setLoading(false);
      }
    };

    fetchWatchlist();
    return () => { active = false; };
  }, [userId]);

  const handleRemove = async (symbol: string) => {
    setItems(prev => prev.filter(i => i.symbol !== symbol));
    try { await userApi.removeFromWatchlist(symbol); }
    catch (e) { console.warn('Remove failed', e); }
  };





  const handleCloseModal = async () => {
    const wasGenerating = modal && modal.summary === null;
    const symbol = modal?.symbol;
    setModal(null);

    if (wasGenerating && symbol) {
      try {
        const predRes = await stockApi.getRelatedPredictions({ stockSymbols: [symbol] });
        const predictions: PredictionDTO[] = predRes?.predictions ?? [];
        const pred = predictions.find((pr: PredictionDTO) => pr.stockSymbol === symbol);
        if (pred) {
          setItems(prev => prev.map(p =>
            p.symbol === symbol ? { ...p, prediction: pred } : p
          ));
        }
      } catch (e) {
        console.warn('Prediction refresh failed', e);
      }
    }
  };



  return (
    <>
      <Header activePage="watchlist" />
      <main className={styles.main}>

        {}
        <div className={styles.headerRow}>
          <h1 className={styles.title}>
            <span className={`material-symbols-outlined ${styles.starIcon}`}>star</span>
            Followed Stocks
          </h1>
        </div>

        {}
        {error && (
          <GlassCard>
            <div className={styles.emptyState}>{error}</div>
          </GlassCard>
        )}

        {}
        {!error && loading && (
          <div className={styles.gridContainer}>
            {[1, 2, 3].map(n => (
              <GlassCard key={n}>
                <div className={styles.cardInner}>
                  <div className={styles.loadingState}>
                    <Skeleton height={36} />
                    <Skeleton height={72} />
                    <Skeleton height={36} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {}
        {!error && !loading && items.length === 0 && (
          <GlassCard>
            <div className={styles.emptyState}>
              Your watchlist is empty. Search for a stock to add it here.
            </div>
          </GlassCard>
        )}

        {}
        {!error && !loading && items.length > 0 && (
          <div className={styles.gridContainer}>
            {items.map(item => {
              const quote         = item.quote;
              const hasPrediction = !!item.prediction;

              const changeValue   = quote ? (quote.c - quote.pc) : 0;
              const changePercent = quote?.pc ? (changeValue / quote.pc) * 100 : 0;
              const isPositive    = changeValue >= 0;

              return (
                <GlassCard key={item.interestId}>

                  <div className={styles.cardInner}>

                    {}
                    <div className={styles.cardHeader}>
                      <div className={styles.assetCol}>
                        <div className={styles.assetAvatar}>
                          {item.symbol.charAt(0)}
                        </div>
                        <div className={styles.assetInfo}>
                          <Link href={`/stock/${item.symbol}`} className={styles.assetSymbol}>
                            {item.symbol}
                          </Link>
                          {item.predictionsLoading ? (
                            <Skeleton width={60} height={18} />
                          ) : hasPrediction ? (
                            <Badge variant={getActionVariant(item.prediction!.action)} glow>
                              {item.prediction!.action.toUpperCase()}
                            </Badge>
                          ) : (
                            <span className={styles.noPredictionNote}>No prediction yet</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {}
                    <div className={styles.priceSection}>
                      <div className={styles.priceCol}>
                        <span className={styles.priceLabel}>Current Price</span>
                        {item.quoteLoading ? (
                          <Skeleton width={80} height={22} />
                        ) : quote ? (
                          <span className={styles.priceText}>${quote.c.toFixed(2)}</span>
                        ) : (
                          <span className={styles.errorText}>—</span>
                        )}
                      </div>

                      <div className={styles.priceCol} style={{ alignItems: 'flex-end' }}>
                        <span className={styles.priceLabel}>24H Change</span>
                        {item.quoteLoading ? (
                          <Skeleton width={60} height={22} />
                        ) : quote ? (
                          <span className={`${styles.changeText} ${isPositive ? styles.textSuccess : styles.textDanger}`}>
                            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                          </span>
                        ) : (
                          <span className={styles.errorText}>—</span>
                        )}
                      </div>
                    </div>

                    {}
                    <div className={styles.predictionStrip}>
                      {hasPrediction ? (
                        <>
                          <div className={styles.predictionTarget}>
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '1.1rem', color: 'var(--primary)' }}
                            >
                              target
                            </span>
                            AI Target:&nbsp;
                            <span className={styles.predictionTargetValue}>
                              ${item.prediction!.predicted.toFixed(2)}
                            </span>
                          </div>
                          <Badge variant={getActionVariant(item.prediction!.action)}>
                            {item.prediction!.action.toUpperCase()}
                          </Badge>
                        </>
                      ) : item.predictionsLoading ? (
                        <Skeleton width={160} height={18} />
                      ) : (
                        <span className={styles.noPredictionNote}>No AI prediction available</span>
                      )}
                    </div>

                    {}
                    <div className={styles.cardActions}>
                      {hasPrediction ? (

                        <Button
                          variant="primary"
                          onClick={() => setModal({ symbol: item.symbol, summary: item.prediction!.summary })}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                            auto_awesome
                          </span>
                          More Details
                        </Button>
                      ) : !item.predictionsLoading ? (

                        <Button
                          variant="primary"
                          onClick={() => setModal({ symbol: item.symbol, summary: null })}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                            psychology
                          </span>
                          Generate AI
                        </Button>
                      ) : (
                        <div />
                      )}

                      {}
                      <div className={styles.actionBtnsRight}>
                        <Link href={`/stock/${item.symbol}`}>
                          <Button variant="ghost" className={styles.iconBtn} title="View Analytics">
                            <span className="material-symbols-outlined">analytics</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className={styles.iconBtnDanger}
                          onClick={() => handleRemove(item.symbol)}
                          title="Remove from watchlist"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </Button>
                      </div>
                    </div>

                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

      </main>

      {}
      {modal && (
        <div
          className={styles.modalOverlay}
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label={`AI Prediction for ${modal.symbol}`}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            {}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleRow}>
                <span
                  className="material-symbols-outlined"
                  style={{ color: 'var(--primary)', fontSize: '1.5rem' }}
                >
                  psychology
                </span>
                <div>
                  <p className={styles.modalSubtitle}>
                    {modal.summary ? 'AI Neural Reasoning' : 'Generate AI Analysis'}
                  </p>
                  <h2 className={styles.modalTitle}>{modal.symbol}</h2>
                </div>
              </div>
              <button
                className={styles.modalCloseBtn}
                onClick={handleCloseModal}
                aria-label="Close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {}
            <div className={styles.modalBody}>
              <AiAnalysis
                symbol={modal.symbol}
                initialData={modal.summary ?? undefined}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
