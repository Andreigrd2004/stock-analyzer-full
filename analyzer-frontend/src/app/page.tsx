"use client"
import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../components/ui/Header';
import { TrendingMarkets } from '../components/stock/TrendingMarkets';
import { Badge } from '../components/ui/Badge';
import { SymbolSearch } from '../components/ui/SymbolSearch';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBgGlow} />
          
          <div className={styles.heroContent}>
            <Badge variant="primary" glow>AI-Powered Insights</Badge>
            <h1 className={styles.title}>
              Smart Global Equity Analysis
            </h1>
            <p className={styles.subtitle}>
              Discover meaningful data with real-time tracking, historical sentiment, and proprietary AI analysis algorithms.
            </p>
            
            <SymbolSearch
              placeholder="Search symbol or company name (e.g. AAPL, Tesla)"
              onSelect={(sym) => router.push(`/stock/${sym}`)}
            />
          </div>
        </section>

        <TrendingMarkets />
      </main>
    </>
  );
}
