'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/ui/Header';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { brokerApi } from '@/lib/brokerApi';
import { useRole } from '@/context/RoleContext';
import styles from './register-broker.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateUrl(value: string): boolean {
  try { new URL(value); return true; } catch { return false; }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterBrokerPage() {
  const router = useRouter();
  const { role, loading: roleLoading } = useRole();

  // ── Role Guard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roleLoading && role !== 'ADMIN') {
      router.replace('/');
    }
  }, [role, roleLoading, router]);

  const [form, setForm] = useState({
    userId: '',
    companyName: '',
    redirectUrl: '',
    bidAmount: '',
    dailyBudget: '',
    active: true,
  });

  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleChange = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const uid = parseInt(form.userId, 10);
    if (!form.userId.trim())                    next.userId      = 'Required.';
    else if (isNaN(uid) || uid <= 0)            next.userId      = 'Must be a valid positive integer.';
    if (!form.companyName.trim())               next.companyName = 'Required.';
    if (!form.redirectUrl.trim())               next.redirectUrl = 'Required.';
    else if (!validateUrl(form.redirectUrl))    next.redirectUrl = 'Enter a valid URL.';
    const bid    = parseFloat(form.bidAmount);
    const budget = parseFloat(form.dailyBudget);
    if (!form.bidAmount || isNaN(bid) || bid <= 0)        next.bidAmount   = 'Must be > 0.';
    if (!form.dailyBudget || isNaN(budget) || budget <= 0) next.dailyBudget = 'Must be > 0.';
    else if (!isNaN(bid) && budget < bid)                  next.dailyBudget = 'Must be ≥ bid.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await brokerApi.createBroker({
        userId:      parseInt(form.userId, 10),
        companyName: form.companyName.trim(),
        redirectUrl: form.redirectUrl.trim(),
        bidAmount:   parseFloat(form.bidAmount).toFixed(2),
        dailyBudget: parseFloat(form.dailyBudget).toFixed(2),
        active:      form.active,
      });
      router.push('/');
    } catch (err: unknown) {
      setServerError((err as Error).message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header activePage="register-broker" />

      <main className={styles.main}>
        <div className={styles.bgGlowLeft}  aria-hidden />
        <div className={styles.bgGlowRight} aria-hidden />

        <div className={styles.card}>
          {/* ── Header ── */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '1.4rem' }}>
                query_stats
              </span>
            </div>
            <div>
              <h1 className={styles.title}>Register a Broker</h1>
              <p className={styles.subtitle}>
                Set up the affiliate campaign and start reaching investors on AiStockAnalyzer.me.
              </p>
            </div>
          </div>

          {/* ── Server error ── */}
          {serverError && (
            <div className={styles.serverError} role="alert">
              <span className="material-symbols-outlined">error</span>
              {serverError}
            </div>
          )}

          {/* ── Form ── */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Row 0: User ID (full-width) */}
            <div className={styles.inputGroup}>
              <label htmlFor="user-id" className={styles.label}>User ID</label>
              <TextInput
                id="user-id"
                type="number"
                icon="badge"
                placeholder="e.g. 42"
                value={form.userId}
                onChange={handleChange('userId')}
                min="1"
                step="1"
              />
              {errors.userId
                ? <span className={styles.fieldError}>{errors.userId}</span>
                : <span className={styles.fieldHint}>The ID of the user account that will become a broker.</span>
              }
            </div>

            {/* Row 1: Company Name + Redirect URL */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="company-name" className={styles.label}>Company Name</label>
                <TextInput
                  id="company-name"
                  type="text"
                  icon="business"
                  placeholder="e.g. Apex Capital"
                  value={form.companyName}
                  onChange={handleChange('companyName')}
                />
                {errors.companyName && <span className={styles.fieldError}>{errors.companyName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="redirect-url" className={styles.label}>Redirect URL</label>
                <TextInput
                  id="redirect-url"
                  type="url"
                  icon="link"
                  placeholder="https://yourbroker.com/signup"
                  value={form.redirectUrl}
                  onChange={handleChange('redirectUrl')}
                />
                {errors.redirectUrl && <span className={styles.fieldError}>{errors.redirectUrl}</span>}
              </div>
            </div>

            {/* Row 2: Bid Amount + Daily Budget */}
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label htmlFor="bid-amount" className={styles.label}>Bid Amount (CPC)</label>
                <div className={styles.prefixWrapper}>
                  <span className={styles.prefix}>$</span>
                  <input
                    id="bid-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="2.50"
                    className={`${styles.prefixInput} ${errors.bidAmount ? styles.prefixInputError : ''}`}
                    value={form.bidAmount}
                    onChange={handleChange('bidAmount')}
                  />
                </div>
                {errors.bidAmount && <span className={styles.fieldError}>{errors.bidAmount}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="daily-budget" className={styles.label}>Daily Budget</label>
                <div className={styles.prefixWrapper}>
                  <span className={styles.prefix}>$</span>
                  <input
                    id="daily-budget"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="150.00"
                    className={`${styles.prefixInput} ${errors.dailyBudget ? styles.prefixInputError : ''}`}
                    value={form.dailyBudget}
                    onChange={handleChange('dailyBudget')}
                  />
                </div>
                {errors.dailyBudget && <span className={styles.fieldError}>{errors.dailyBudget}</span>}
              </div>
            </div>

            {/* Row 3: Toggle + Info side by side */}
            <div className={styles.row}>
              {/* Active toggle */}
              <label htmlFor="active-toggle" className={styles.toggleRow}>
                <input
                  id="active-toggle"
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={form.active}
                  onChange={handleChange('active')}
                />
                <div className={`${styles.toggleTrack} ${form.active ? styles.toggleTrackOn : ''}`}>
                  <div className={styles.toggleThumb} />
                </div>
                <span className={styles.toggleMeta}>
                  <span className={styles.toggleTitle}>Launch immediately</span>
                  <span className={styles.toggleDesc}>
                    {form.active ? 'Campaign goes live on submit.' : 'Start paused — activate later.'}
                  </span>
                </span>
              </label>

              {/* Info callout */}
              <div className={styles.infoBox}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary)', flexShrink: 0, fontSize: '1.1rem' }}>
                  lightbulb
                </span>
                <p className={styles.infoText}>
                  A higher <strong>bid</strong> gives you better placement on user watchlists.
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              glow
              className={styles.submitBtn}
              disabled={loading}
              id="register-broker-btn"
            >
              {loading ? (
                <>
                  <span className={`material-symbols-outlined ${styles.spinIcon}`}>refresh</span>
                  Registering…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Register Broker Account
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </>
  );
}
