export interface StockQuote {
  c: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
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
  predicted?: number;
}

export interface PredictionDTO {
  stockSymbol: string;
  summary: string;
  action: string;
  currentPrice: number;
  createdAt: string;
  validUntil: string;
  predicted: number;
}

export interface PredictionListResponse {
  predictions: PredictionDTO[];
}

export interface PredictionsListRequest {
  stockSymbols: string[];
}

export interface UserStockInterest {
  id: string;
  symbol: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
}

export interface LoginPayload {
  username: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  displayName: string;
  username: string;
  password?: string;
}

export interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

export interface FinnhubCandleResponse {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: 'ok' | 'no_data';
}



export interface Broker {
  id: number;
  userId: number;
  companyName: string;
  redirectUrl: string;
  bidAmount: string;
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



export interface BrokerClick {
  id: number;
  brokerId: number;
  clickedAt: string;
  stockSymbol?: string;
}

export interface BrokerClickCreateRequest {
  brokerName: string;
}

export interface BrokerClickUpdateRequest {
  stockSymbol?: string;
}

