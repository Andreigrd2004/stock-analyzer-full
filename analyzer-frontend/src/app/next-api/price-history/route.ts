import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/price-history?symbol=AAPL
 *
 * Server-side proxy to Yahoo Finance. Normalizes the response to the same
 * shape as FinnhubCandleResponse so the client needs no changes.
 * No API key required — works on any free plan.
 */
export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
  }

  const yahooUrl =
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}` +
    `?interval=1mo&range=1y&includePrePost=false`;

  try {
    const res = await fetch(yahooUrl, {
      headers: {
        // Yahoo requires a real User-Agent header
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      // Cache for 1 hour on the server — monthly bars don't change minute-by-minute
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Yahoo Finance returned ${res.status}` },
        { status: res.status }
      );
    }

    const raw = await res.json();
    const result = raw?.chart?.result?.[0];

    if (!result || raw?.chart?.error) {
      return NextResponse.json({ s: 'no_data', c: [], t: [], h: [], l: [], o: [], v: [] });
    }

    const { timestamp } = result;
    const quote = result.indicators?.quote?.[0] ?? {};

    // Normalize to FinnhubCandleResponse shape
    const normalized = {
      s: 'ok' as const,
      t: (timestamp as number[]) ?? [],
      c: (quote.close  as (number | null)[])?.map((v) => v ?? 0) ?? [],
      h: (quote.high   as (number | null)[])?.map((v) => v ?? 0) ?? [],
      l: (quote.low    as (number | null)[])?.map((v) => v ?? 0) ?? [],
      o: (quote.open   as (number | null)[])?.map((v) => v ?? 0) ?? [],
      v: (quote.volume as (number | null)[])?.map((v) => v ?? 0) ?? [],
    };

    return NextResponse.json(normalized);
  } catch (err) {
    console.error('[price-history] fetch error:', err);
    return NextResponse.json({ error: 'Internal error fetching price history' }, { status: 500 });
  }
}
