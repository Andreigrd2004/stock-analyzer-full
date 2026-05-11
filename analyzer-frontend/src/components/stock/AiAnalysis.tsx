'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { stockApi } from '@/lib/stockApi';
import type { AiAnalysisResponse, AiTermAnalysis } from '@/types';
import styles from './AiAnalysis.module.css';

// ── helpers ──────────────────────────────────────────────────────────────────

interface TermMeta {
  label: string;
  icon: string;
  accentVar: string;
  gradientFrom: string;
  gradientTo: string;
}

const TERM_META: TermMeta[] = [
  {
    label: 'Short Term',
    icon: 'bolt',
    accentVar: '--warning',
    gradientFrom: 'rgba(245,158,11,0.18)',
    gradientTo: 'rgba(245,158,11,0.04)',
  },
  {
    label: 'Mid Term',
    icon: 'trending_up',
    accentVar: '--primary',
    gradientFrom: 'rgba(140,43,238,0.22)',
    gradientTo: 'rgba(140,43,238,0.04)',
  },
  {
    label: 'Long Term',
    icon: 'rocket_launch',
    accentVar: '--success',
    gradientFrom: 'rgba(16,185,129,0.18)',
    gradientTo: 'rgba(16,185,129,0.04)',
  },
];

function sentimentFromScore(score: number): { variant: 'success' | 'danger' | 'warning' | 'primary'; label: string } {
  if (score >= 2) return { variant: 'success', label: 'Strong Buy' };
  if (score === 1) return { variant: 'success', label: 'Buy' };
  if (score === 0) return { variant: 'warning', label: 'Hold' };
  if (score === -1) return { variant: 'danger', label: 'Sell' };
  return { variant: 'danger', label: 'Strong Sell' };
}

/** Truncate text to a given character limit */
function truncate(text: string, limit = 120) {
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + '…';
}

// ── sub-components ────────────────────────────────────────────────────────────

interface TermCardProps {
  termData: AiTermAnalysis;
  meta: TermMeta;
  onClick: () => void;
}

const TermCard: React.FC<TermCardProps> = ({ termData, meta, onClick }) => {
  const { variant, label } = sentimentFromScore(termData.score);

  return (
    <button
      className={styles.termCard}
      style={
        {
          '--card-grad-from': meta.gradientFrom,
          '--card-grad-to': meta.gradientTo,
          '--card-accent': `var(${meta.accentVar})`,
        } as React.CSSProperties
      }
      onClick={onClick}
      aria-label={`Open ${meta.label} analysis`}
    >
      {/* Top row */}
      <div className={styles.termCardHeader}>
        <div className={styles.termCardIcon}>
          <span className="material-symbols-outlined">{meta.icon}</span>
        </div>
        <Badge variant={variant} glow>
          {label}
        </Badge>
      </div>

      {/* Title */}
      <p className={styles.termCardLabel}>{meta.label}</p>

      {/* Preview */}
      <p className={styles.termCardPreview}>{truncate(termData.detailed_reasoning)}</p>

      {/* Footer CTA */}
      <div className={styles.termCardFooter}>
        <span className={styles.readMore}>Read full analysis</span>
        <span className={`material-symbols-outlined ${styles.arrowIcon}`}>arrow_forward</span>
      </div>
    </button>
  );
};

// ── modal ─────────────────────────────────────────────────────────────────────

interface ModalProps {
  termData: AiTermAnalysis;
  meta: TermMeta;
  onClose: () => void;
}

const AnalysisModal: React.FC<ModalProps> = ({ termData, meta, onClose }) => {
  const { variant, label } = sentimentFromScore(termData.score);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        style={
          {
            '--modal-accent': `var(${meta.accentVar})`,
            '--modal-grad-from': meta.gradientFrom,
          } as React.CSSProperties
        }
      >
        {/* Glow blob */}
        <div className={styles.modalGlow} />

        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleRow}>
            <div
              className={styles.modalIconWrap}
              style={{ background: meta.gradientFrom }}
            >
              <span className="material-symbols-outlined">{meta.icon}</span>
            </div>
            <div>
              <p className={styles.modalSubtitle}>AI Analysis</p>
              <h3 className={styles.modalTitle}>{meta.label}</h3>
            </div>
          </div>

          <div className={styles.modalActions}>
            <Badge variant={variant} glow>
              {label}
            </Badge>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Score bar */}
        <div className={styles.scoreSection}>
          <div className={styles.scoreLabelRow}>
            <span className={styles.scoreLabel}>Conviction Score</span>
            <span className={styles.scoreValue}>{termData.score > 0 ? '+' : ''}{termData.score}</span>
          </div>
          <div className={styles.scoreTrack}>
            <div
              className={styles.scoreFill}
              style={{
                width: `${Math.min(Math.abs(termData.score) / 2, 1) * 100}%`,
                background: `var(${meta.accentVar})`,
                marginLeft: termData.score < 0 ? 'auto' : undefined,
              }}
            />
          </div>
        </div>

        {/* Full reasoning */}
        <div className={styles.modalBody}>
          <p className={styles.modalBodyLabel}>Detailed Reasoning</p>
          <p className={styles.modalBodyText}>{termData.detailed_reasoning}</p>
        </div>
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

export const AiAnalysis: React.FC<{ symbol: string; onPrediction?: (price: number) => void }> = ({ symbol, onPrediction }) => {
  const [analysis, setAnalysis] = useState<AiAnalysisResponse | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openTerm, setOpenTerm] = useState<null | 0 | 1 | 2>(null);

  const handleGenerate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stockApi.getAiAnalysis(symbol);
      setAnalysis(data);
      // Forward predicted price to parent if present
      if (data && typeof data === 'object' && typeof data.predicted === 'number') {
        onPrediction?.(data.predicted);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI analysis.');
    } finally {
      setLoading(false);
    }
  }, [symbol, onPrediction]);

  // Derive term data array for structured responses
  const terms: (AiTermAnalysis | undefined)[] =
    analysis && typeof analysis === 'object'
      ? [analysis.short_term, analysis.medium_term, analysis.long_term]
      : [undefined, undefined, undefined];

  // ── empty / generate state ────────────────────────────────────────────────
  if (!analysis && !loading && !error) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={`material-symbols-outlined ${styles.icon}`}>psychology</span>
            <h2 className={styles.title}>Neural Reasoning</h2>
          </div>
          <Badge variant="primary">PRO</Badge>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIconWrap}>
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <p className={styles.emptyText}>
            Gain deep insights using advanced AI algorithms tailored to{' '}
            <strong style={{ color: 'var(--primary)' }}>{symbol}</strong>'s latest data.
          </p>
          <Button variant="primary" glow onClick={handleGenerate}>
            Generate AI Analysis
          </Button>
        </div>
      </GlassCard>
    );
  }

  // ── loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={`material-symbols-outlined ${styles.icon}`}>psychology</span>
            <h2 className={styles.title}>Neural Reasoning</h2>
          </div>
        </div>
        <div className={styles.cardsGrid}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.skelCard}>
              <Skeleton height={16} width="50%" />
              <Skeleton height={12} />
              <Skeleton height={12} width="80%" />
              <Skeleton height={12} width="65%" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  // ── error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <GlassCard className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={`material-symbols-outlined ${styles.icon}`}>psychology</span>
            <h2 className={styles.title}>Neural Reasoning</h2>
          </div>
          <Button variant="ghost" onClick={handleGenerate} className={styles.refreshBtn}>
            <span className="material-symbols-outlined">refresh</span>
          </Button>
        </div>
        <div className={styles.errorState}>
          <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--danger)' }}>
            error_outline
          </span>
          <p>{error}</p>
          <p className={styles.errorSub}>The raw data remains available across the dashboard.</p>
        </div>
      </GlassCard>
    );
  }

  // ── results state ─────────────────────────────────────────────────────────
  return (
    <>
      <GlassCard className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={`material-symbols-outlined ${styles.icon}`}>psychology</span>
            <h2 className={styles.title}>Neural Reasoning</h2>
          </div>
          <Button variant="ghost" onClick={handleGenerate} disabled={loading} className={styles.refreshBtn}>
            <span className="material-symbols-outlined">refresh</span>
          </Button>
        </div>

        {/* Fallback – plain string response */}
        {typeof analysis === 'string' ? (
          <p className={styles.textContent}>{analysis}</p>
        ) : (
          <div className={styles.cardsGrid}>
            {TERM_META.map((meta, i) => {
              const termData = terms[i];
              if (!termData) return null;
              return (
                <TermCard
                  key={meta.label}
                  termData={termData}
                  meta={meta}
                  onClick={() => setOpenTerm(i as 0 | 1 | 2)}
                />
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Modal */}
      {openTerm !== null && terms[openTerm] && (
        <AnalysisModal
          termData={terms[openTerm]!}
          meta={TERM_META[openTerm]}
          onClose={() => setOpenTerm(null)}
        />
      )}
    </>
  );
};
