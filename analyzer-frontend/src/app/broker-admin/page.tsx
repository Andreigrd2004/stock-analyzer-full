'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '../../components/ui/Header';
import { brokerApi, brokerClickApi } from '../../lib/brokerApi';
import { useRole } from '@/context/RoleContext';
import type { Broker, BrokerClick } from '../../types';
import styles from './broker-admin.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive the "your" broker from the list (the one that belongs to the signed-in user).
 *  For now we pick the first active broker; swap this with a real filter once the
 *  backend exposes a /brokers/me endpoint. */
function resolveMyBroker(brokers: Broker[]): Broker | null {
  return brokers.find((b) => b.active) ?? brokers[0] ?? null;
}

function countClicksToday(clicks: BrokerClick[]): number {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  return clicks.filter((c) => c.clickedAt?.startsWith(today)).length;
}

function totalSpend(clicks: BrokerClick[], bidCpc: string): string {
  const cpc = parseFloat(bidCpc) || 0;
  const todayClicks = countClicksToday(clicks);
  return (cpc * todayClicks).toFixed(2);
}

function formatPosition(allBids: number[], myBid: number): number {
  // position = how many bids are strictly higher than mine + 1
  const higher = allBids.filter((b) => b > myBid).length;
  return higher + 1;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function BrokerAdminPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  // ── Role Guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roleLoading && role !== 'BROKER') {
      router.replace('/');
    }
  }, [role, roleLoading, router]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [broker, setBroker] = useState<Broker | null>(null);
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);
  const [clicks, setClicks] = useState<BrokerClick[]>([]);
  const [allBidAmounts, setAllBidAmounts] = useState<number[]>([]);

  const [isActive, setIsActive] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [dailyBudget, setDailyBudget] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [brokers, bids] = await Promise.all([
        brokerApi.getAllBrokers(),
        brokerApi.getAllBidAmounts(),
      ]);

      setAllBrokers(brokers);
      setAllBidAmounts(bids);

      const mine = resolveMyBroker(brokers);
      if (mine) {
      setBroker(mine);
      setIsActive(mine.active);
      setBidAmount(mine.bidAmount);
      setDailyBudget(mine.dailyBudget);

      const brokerClicks = await brokerClickApi.getClicksByBroker(mine.id);
      setClicks(brokerClicks);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load broker data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Only fetch data once the role is confirmed as BROKER.
  // This prevents the GET /brokers call from firing during the brief window
  // before the role guard fires and redirects non-BROKER users.
  useEffect(() => {
    if (roleLoading) return;          // wait until role is resolved
    if (role !== 'BROKER') return;    // guard will redirect; don't fetch
    loadData();
  }, [role, roleLoading, loadData]);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!broker) return;
    setSaving(true);
    setSaveMsg(null);
    setError(null);
    try {
      const updated = await brokerApi.updateBroker({
        active:      isActive,
        bidAmount:   bidAmount,
        dailyBudget: dailyBudget,
        companyName: broker.companyName,
        redirectUrl: broker.redirectUrl,
      });
      setBroker(updated);
      // Refresh bid amounts so the chart stays accurate
      const bids = await brokerApi.getAllBidAmounts();
      setAllBidAmounts(bids);
      setSaveMsg('Campaign saved successfully.');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const myBidNum = parseFloat(bidAmount) || 0;
  const clicksToday = countClicksToday(clicks);
  const dailySpend = totalSpend(clicks, bidAmount);
  const position = allBidAmounts.length > 0 ? formatPosition(allBidAmounts, myBidNum) : null;

  // Build bars: sort all bid amounts desc, cap at 5 for readability
  const sortedBids = [...allBidAmounts].sort((a, b) => a - b);
  const maxBid = Math.max(...sortedBids, myBidNum, 0.01);

  const bars = sortedBids.slice(-6).map((bid, i) => {
    const isYou = Math.abs(bid - myBidNum) < 0.001;
    return {
      id: isYou ? 'YOU' : `B${i + 1}`,
      price: `$${bid.toFixed(2)}`,
      height: Math.round((bid / maxBid) * 90),
      isYou,
    };
  });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Header activePage="broker-admin" />
      <div className={styles.bgGlow} />

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <div className={styles.pageHeaderRow}>
            <div>
              <h1 className={styles.pageTitle}>Campaign Overview</h1>
              <p className={styles.pageSubtitle}>
                Manage your affiliate visibility and bidding strategy.
              </p>
            </div>
          </div>
        </header>

        {/* Global error banner */}
        {error && (
          <div className={styles.errorBanner} role="alert">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingState}>
            <span className={`material-symbols-outlined ${styles.spinIcon}`}>refresh</span>
            Loading campaign data…
          </div>
        ) : (
          <div className={styles.grid}>
            {/* ── Left Panel: Campaign Control ── */}
            <section className={`${styles.glassCard} ${styles.leftPanel}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                    tune
                  </span>
                  Campaign Control
                </h2>

                {/* Active toggle */}
                <label className={styles.toggleLabel} htmlFor="campaign-toggle">
                  <input
                    id="campaign-toggle"
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <div className={`${styles.toggleTrack} ${isActive ? styles.toggleTrackActive : ''}`}>
                    <div className={styles.toggleThumb} />
                  </div>
                  <span className={styles.toggleText}>
                    {isActive ? 'Active' : 'Paused'}
                  </span>
                </label>
              </div>

              {/* Inputs */}
              <div className={styles.inputs}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="bid-amount">
                    Bid Amount (CPC)
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>$</span>
                    <input
                      id="bid-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.input}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="daily-budget">
                    Daily Budget
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputPrefix}>$</span>
                    <input
                      id="daily-budget"
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.input}
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Save button + feedback */}
              <div className={styles.saveRow}>
                <button
                  className={`${styles.saveBtn} ${saving ? styles.saveBtnDisabled : ''}`}
                  onClick={handleSave}
                  disabled={saving || !broker}
                  id="save-campaign-btn"
                >
                  <span className="material-symbols-outlined">
                    {saving ? 'hourglass_top' : 'save'}
                  </span>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saveMsg && (
                  <span className={styles.saveSuccess}>
                    <span className="material-symbols-outlined">check_circle</span>
                    {saveMsg}
                  </span>
                )}
              </div>

              {/* Real-Time Performance */}
              <div className={styles.performanceBox}>
                <h4 className={styles.performanceTitle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    monitoring
                  </span>
                  Real-Time Performance
                </h4>
                <div className={styles.metricsGrid}>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Clicks Today</div>
                    <div className={`${styles.metricValue} ${styles.metricGreen}`}>
                      {clicksToday}
                    </div>
                  </div>
                  <div className={styles.metric}>
                    <div className={styles.metricLabel}>Current Daily Spend</div>
                    <div className={`${styles.metricValue} ${styles.metricAmber}`}>
                      ${dailySpend}
                    </div>
                  </div>
                  <div className={`${styles.metric} ${styles.metricFull}`}>
                    <div className={styles.metricLabel}>Total All-Time Clicks</div>
                    <div className={`${styles.metricValue} ${styles.metricSmall}`}>
                      {clicks.length.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Right Panel: Market Competitive Landscape ── */}
            <section className={`${styles.glassCard} ${styles.rightPanel}`}>
              <div className={styles.panelGlow} />

              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)' }}>
                    stacked_bar_chart
                  </span>
                  Market Competitive Landscape
                </h2>
                <span className={`${styles.liveBadge} ${styles.animateGlow}`}>Live Bids</span>
              </div>

              {/* Bar Chart */}
              <div className={styles.chartArea}>
                {/* Y-Axis */}
                <div className={styles.yAxis}>
                  <span>${maxBid.toFixed(2)}</span>
                  <span>${(maxBid * 0.75).toFixed(2)}</span>
                  <span>${(maxBid * 0.5).toFixed(2)}</span>
                  <span>${(maxBid * 0.25).toFixed(2)}</span>
                </div>

                {/* Bars */}
                <div className={styles.barsContainer}>
                  {bars.length > 0 ? bars.map((bar) => (
                    <div
                      key={bar.id}
                      className={`${styles.barGroup} ${bar.isYou ? styles.barGroupYou : ''}`}
                    >
                      {bar.isYou && (
                        <div className={styles.youLabel}>
                          <span className={styles.youBadge}>You</span>
                        </div>
                      )}
                      <div
                        className={`${styles.bar} ${bar.isYou ? styles.barActive : styles.barDefault}`}
                        style={{ height: `${bar.height}%` }}
                      >
                        <div className={styles.barTooltip}>{bar.price}</div>
                      </div>
                      <span className={`${styles.barLabel} ${bar.isYou ? styles.barLabelActive : ''}`}>
                        {bar.id}
                      </span>
                    </div>
                  )) : (
                    <p className={styles.noBidData}>No bid data available yet.</p>
                  )}
                </div>
              </div>

              {/* Market Insight */}
              <div className={styles.insightBox}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', marginTop: '2px' }}>
                  lightbulb
                </span>
                <div>
                  <h4 className={styles.insightTitle}>Market Insight</h4>
                  {position !== null ? (
                    <p className={styles.insightText}>
                      Your bid of{' '}
                      <strong className={styles.insightHighlight}>${myBidNum.toFixed(2)}</strong>{' '}
                      currently places you at position{' '}
                      <strong className={styles.insightHighlight}>#{position}</strong> out of{' '}
                      {allBidAmounts.length} active brokers.{' '}
                      {position <= 3
                        ? 'Maintaining this position ensures high visibility on active user watchlists, maximising lead generation volume.'
                        : 'Consider raising your bid to reach the top 3 and maximise your lead generation volume.'}
                    </p>
                  ) : (
                    <p className={styles.insightText}>
                      No competitor data available yet. Your bid will be ranked once other
                      brokers are active.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className="material-symbols-outlined" style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            info
          </span>
          <p className={styles.footerText}>
            SYS_LOG: Broker priority is determined by active status, budget availability, and bid
            amount threshold.
          </p>
        </div>
      </footer>
    </>
  );
}
