import type { FinnhubSearchResult, FinnhubSearchResponse, FinnhubCandleResponse } from '../types';

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? 'YOUR_FINNHUB_API_KEY';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';





export async function searchSymbols(
  query: string,
  signal?: AbortSignal
): Promise<FinnhubSearchResult[]> {
  if (!query.trim()) return [];

  const url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(query.trim())}&token=${FINNHUB_API_KEY}`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Finnhub search failed: ${res.status}`);
  }

  const data: FinnhubSearchResponse = await res.json();
  return data.result ?? [];
}






export async function fetchMonthlyCandles(
  symbol: string,
  signal?: AbortSignal
): Promise<FinnhubCandleResponse> {
  const url = `/next-api/price-history?symbol=${encodeURIComponent(symbol)}`;

  const res = await fetch(url, { signal });

  if (!res.ok) {
    throw new Error(`Price history fetch failed: ${res.status}`);
  }

  return res.json() as Promise<FinnhubCandleResponse>;
}


