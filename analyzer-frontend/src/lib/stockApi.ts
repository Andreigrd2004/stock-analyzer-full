import { fetchApi } from './apiClient';
import type { 
  StockQuote, 
  NewsItem, 
  InsiderSentimentResponse, 
  StockPriceChange, 
  AiAnalysisResponse 
} from '../types';

export const stockApi = {
  getQuote: (symbol: string) => 
    fetchApi<StockQuote | string>(`/stocks/quote?symbol=${symbol}`),
  
  getNews: (symbol: string) => 
    fetchApi<NewsItem[]>(`/stocks/news?symbol=${symbol}`),
  
  getInsiderSentiment: (symbol: string) => 
    fetchApi<InsiderSentimentResponse | string>(`/stocks/insider-sentiment?symbol=${symbol}`),
  
  getPriceChange: (symbol: string) => 
    fetchApi<StockPriceChange | any>(`/stocks/stock-data?symbol=${symbol}`),
  
  getAiAnalysis: (symbol: string) => 
    fetchApi<AiAnalysisResponse | string>(`/stocks/prediction?symbol=${symbol}`, {
      method: 'GET', // Fixed: Backend mapping shows @GetMapping
    }),
};
