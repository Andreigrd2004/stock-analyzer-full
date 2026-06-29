import { fetchApi } from './apiClient';
import type { UserStockInterest } from '../types';

export interface AddInterestRequest {
  stockName: string;
}

export interface UserInterestsResponse {

  interests?: any[];
  [key: string]: any;
}

export const userApi = {
  getWatchlist: () =>
    fetchApi<any>('/interests'),

  addToWatchlist: (stockName: string) =>
    fetchApi<any>('/interests', {
      method: 'POST',
      body: JSON.stringify({ stockName }),
    }),

  removeFromWatchlist: (stockName: string) =>
    fetchApi<void>(`/interests/${stockName}`, {
      method: 'DELETE',
    }),
};
