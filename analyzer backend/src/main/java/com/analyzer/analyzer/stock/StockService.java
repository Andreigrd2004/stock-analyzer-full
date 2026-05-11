package com.analyzer.analyzer.stock;

import com.analyzer.analyzer.stock.DTO.ConversationRequest;
import com.analyzer.analyzer.stock.DTO.ConversationResponse;
import com.analyzer.analyzer.stock.DTO.NewsDTO;
import com.analyzer.analyzer.stock.DTO.StockDTO;

import java.util.List;

public interface StockService {
    StockDTO getStockData(String stockSymbol);
    String getQuote(String stockSymbol);
    List<NewsDTO> getNews(String stockSymbol);
    String getInsiderSentiment(String stockSymbol);
    String getPrediction(String stockSymbol);
    String getPriceVariation(String stockSymbol);
    ConversationResponse handleConversation(ConversationRequest request);
}
