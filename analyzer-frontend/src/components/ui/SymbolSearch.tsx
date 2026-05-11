'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { searchSymbols } from '../../lib/finnhubApi';
import type { FinnhubSearchResult } from '../../types';
import { TextInput } from './TextInput';
import { Button } from './Button';
import styles from './SymbolSearch.module.css';

interface SymbolSearchProps {
  /** Called when a result is selected (click or Enter). Receives the ticker symbol. */
  onSelect?: (symbol: string) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 350;
const MAX_RESULTS = 10;

export function SymbolSearch({
  onSelect,
  placeholder = 'Search symbol or company name…',
}: SymbolSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FinnhubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Search logic ────────────────────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const data = await searchSymbols(q, controller.signal);
      setResults(data.slice(0, MAX_RESULTS));
      setOpen(data.length > 0);
      setActiveIdx(-1);
    } catch (err: unknown) {
      // AbortError is expected — ignore it
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Symbol search error:', err.message);
        setResults([]);
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Debounce on query change ─────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // ── Outside click ───────────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Item selection ──────────────────────────────────────────────────────
  function handleSelect(result: FinnhubSearchResult) {
    setQuery(result.displaySymbol);
    setOpen(false);
    setResults([]);
    onSelect?.(result.symbol);
  }

  // ── Keyboard navigation ─────────────────────────────────────────────────
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && activeIdx < results.length) {
        handleSelect(results[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // ── Manual submit (Analyze button) ─────────────────────────────────────
  function handleAnalyze() {
    const sym = query.trim().toUpperCase();
    if (!sym) return;
    setOpen(false);
    onSelect?.(sym);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputRow}>
        <TextInput
          id="symbol-search-input"
          icon="search"
          placeholder={placeholder}
          value={query}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Stock symbol search"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <Button
          id="symbol-search-analyze-btn"
          type="button"
          variant="primary"
          glow
          onClick={handleAnalyze}
        >
          Analyze
        </Button>

        {/* Inline spinner */}
        {loading && (
          <span className={styles.spinnerWrap} aria-hidden="true">
            <span className={styles.spinner} />
          </span>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="Symbol suggestions">
          {results.length === 0 ? (
            <p className={styles.noResults}>No results found</p>
          ) : (
            results.map((r, idx) => (
              <div
                key={r.symbol}
                role="option"
                aria-selected={idx === activeIdx}
                className={`${styles.item} ${idx === activeIdx ? styles.itemActive : ''}`}
                onMouseDown={(e) => {
                  // mousedown fires before input blur, so we prevent blur first
                  e.preventDefault();
                  handleSelect(r);
                }}
                onMouseEnter={() => setActiveIdx(idx)}
              >
                <span className={styles.symbol}>{r.displaySymbol}</span>
                <span className={styles.description}>{r.description}</span>
                {r.type && <span className={styles.typeBadge}>{r.type}</span>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
