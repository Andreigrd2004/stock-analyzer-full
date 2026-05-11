'use client';

import React, { use, useState, useEffect } from 'react';
import { Header } from '@/components/ui/Header';
import { PriceOverview } from '@/components/stock/PriceOverview';
import { PriceChart } from '@/components/stock/PriceChart';
import { AiAnalysis } from '@/components/stock/AiAnalysis';
import { NewsFeed } from '@/components/stock/NewsFeed';
import { InsiderSentiment } from '@/components/stock/InsiderSentiment';
import { AiChat } from '@/components/stock/AiChat';
import { searchSymbols } from '@/lib/finnhubApi';
import { stockApi } from '@/lib/stockApi';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
  const { symbol: rawSymbol } = use(params);
  const symbol = rawSymbol.toUpperCase();

  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');

  // Fetch company name from Finnhub search
  useEffect(() => {
    let active = true;
    searchSymbols(symbol)
      .then((results) => {
        if (!active) return;
        const match = results.find(
          (r) => r.symbol === symbol || r.displaySymbol === symbol
        );
        if (match) setCompanyName(match.description);
      })
      .catch(() => { /* non-critical – chat still works without company name */ });
    return () => { active = false; };
  }, [symbol]);

  // Fetch current price for chat context
  useEffect(() => {
    let active = true;
    stockApi
      .getPriceChange(symbol)
      .then((raw: any) => {
        if (!active) return;
        let data = raw;
        if (typeof raw === 'string') { try { data = JSON.parse(raw); } catch (_) {} }
        if (Array.isArray(data)) data = data[0];
        const price = parseFloat(data?.c ?? data?.current ?? 0);
        if (price) setCurrentPrice(price.toFixed(2));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [symbol]);

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Price overview + chart stacked */}
        <div className={styles.topSection}>
          <PriceOverview symbol={symbol} />
          <PriceChart symbol={symbol} predictedPrice={predictedPrice} />
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.mainCol}>
            <AiAnalysis symbol={symbol} onPrediction={setPredictedPrice} />
          </div>
          <aside className={styles.sideCol}>
            <InsiderSentiment symbol={symbol} />
          </aside>
        </div>

        <div className={styles.dashboardGrid}>
          <div className={styles.fullCol}>
            <NewsFeed symbol={symbol} />
          </div>
        </div>
      </main>

      {/* Floating AI Chat – persists as long as user is on this stock page */}
      <AiChat
        symbol={symbol}
        companyName={companyName}
        currentPrice={currentPrice}
      />
    </>
  );
}
