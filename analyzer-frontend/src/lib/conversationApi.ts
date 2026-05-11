import { fetchApi } from './apiClient';

export interface ConversationRequest {
  userMessage: string;
  companyName: string;
  stockSymbol: string;
  currentPrice: string;
  conversationHistory: string;
}

export interface ConversationResponse {
  message: string;
}

export const conversationApi = {
  sendMessage: (payload: ConversationRequest): Promise<ConversationResponse> =>
    fetchApi<ConversationResponse>('/stocks/conversation', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
