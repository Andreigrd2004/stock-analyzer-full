export interface StockQuote {
  c: number; // current
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

export interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export interface InsiderSentimentItem {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

export interface InsiderSentimentResponse {
  symbol: string;
  data: InsiderSentimentItem[];
}

export interface StockPriceChange {
  symbol: string;
  ["1D"]: number;
  ["5D"]: number;
  ["1M"]: number;
  ["3M"]: number;
  ["6M"]: number;
  ytd: number;
  ["1Y"]: number;
  ["3Y"]: number;
  ["5Y"]: number;
  ["10Y"]: number;
  max: number;
}

export interface AiTermAnalysis {
  score: number;
  detailed_reasoning: string;
}

export interface AiAnalysisResponse {
  symbol?: string;
  short_term?: AiTermAnalysis;
  medium_term?: AiTermAnalysis;
  long_term?: AiTermAnalysis;
  predicted?: number;  // Actual price target from the backend ML model
}

export interface UserStockInterest {
  id: string; // or number depending on backend
  symbol: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface LoginPayload {
  username: string;
  password?: string; // Optional if you handle OAuth
}

export interface RegisterPayload {
  email: string;
  displayName: string;
  username: string;
  password?: string;
}

export interface FinnhubSearchResult {
  description: string;   // e.g. "Apple Inc"
  displaySymbol: string; // e.g. "AAPL"
  symbol: string;        // e.g. "AAPL"
  type: string;          // e.g. "Common Stock"
}

export interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

export interface FinnhubCandleResponse {
  c: number[];           // close prices
  h: number[];           // high prices
  l: number[];           // low prices
  o: number[];           // open prices
  t: number[];           // unix timestamps (seconds)
  v: number[];           // volumes
  s: 'ok' | 'no_data';  // status
}

// ── Broker ────────────────────────────────────────────────────────────────────

export interface Broker {
  id: number;
  userId: number;
  companyName: string;
  redirectUrl: string;
  bidAmount: string;    // BigDecimal serialised as string by Jackson
  dailyBudget: string;
  active: boolean;
}

export interface BrokerCreateRequest {
  userId: number;
  companyName: string;
  redirectUrl: string;
  bidAmount: string;
  dailyBudget: string;
  active: boolean;
}

export interface BrokerUpdateRequest {
  companyName?: string;
  redirectUrl?: string;
  bidAmount?: string;
  dailyBudget?: string;
  active?: boolean;
}

// ── BrokerClick ───────────────────────────────────────────────────────────────

export interface BrokerClick {
  id: number;
  brokerId: number;
  clickedAt: string;    // ISO-8601 timestamp
  stockSymbol?: string;
}

export interface BrokerClickCreateRequest {
  brokerName: string;
}

export interface BrokerClickUpdateRequest {
  stockSymbol?: string;
}

