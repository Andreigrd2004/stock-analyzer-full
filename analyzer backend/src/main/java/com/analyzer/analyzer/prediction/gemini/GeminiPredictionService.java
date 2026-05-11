package com.analyzer.analyzer.prediction.gemini;

import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeminiPredictionService {
    private static final String SYSTEM_INSTRUCTION = """
            You are an advanced Financial Market Analyst AI. Your role is to analyze raw financial data for a specific stock and provide a structured JSON output for an algorithmic trading system.
            
            ## ANALYSIS OBJECTIVES
            You must evaluate the stock on three timeframes based STRICTLY on the provided data:
            1. **Short Term (Days/Weeks):** Driven by News Sentiment, Insider Trading (if available), and immediate Price Action (Volatility, Day Change).
            2. **Medium Term (Months/1 Year):** Driven by recent Earnings Reports, Analyst Ratings, and Technical Trends (Moving Averages).
            3. **Long Term (Years):** Driven by Fundamental Data (PE Ratio, EPS, Revenue Growth, Debt).
            
            ## SCORING KEY
            - 0 (Bearish/Sell): Negative outlook, expecting price drop.
            - 1 (Neutral/Hold): Stable outlook, sideways movement expected.
            - 2 (Bullish/Buy): Positive outlook, expecting price growth.
            
            ## OUTPUT RULES
            1. **Format:** RETURN ONLY RAW JSON. Do not use Markdown blocks (```json).
            2. **Reasoning:** Your text explanation MUST cite specific numbers or news headlines from the input data. Example: "Bullish because PE ratio is 15 (undervalued)" instead of just "Bullish because it's cheap."
            Required Structure:
                {
                  "symbol": "{{STOCK_SYMBOL}}",
                  "short_term": {
                    "score": 0, 1, or 2,
                    "detailed_reasoning": "Explain based on News/Quote data."
                  },
                  "medium_term": {
                    "score": 0, 1, or 2,
                    "detailed_reasoning": "Explain based on Trends/History."
                  },
                  "long_term": {
                    "score": 0, 1, or 2,
                    "detailed_reasoning": "Explain based on Fundamentals (PE, EPS)."
                  }
                  "predicted": 100 (the model predicted price that was given)
                }
            """;

    private final ChatModel chatModel;

    public GeminiPredictionService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String generateStockAnalysis(String symbol, String quote, String news, String insiderSentiment, String history, String pricePredictionByModel) {
        String userPrompt = String.format("""
                Analyze the stock: %s
                
                Please process the following raw JSON data inputs:
                
                REAL-TIME QUOTE:
                %s
                
                MARKET NEWS & SENTIMENT:
                %s
                
                INSIDER'S SENTIMENTS (MSPR -100 to +100):
                %s
                
                HISTORICAL EVOLUTION:
                %s
                
                PRICE PREDICTED BY MY MODEL:
                %s

                GENERATE PREDICTION JSON NOW.
                """, symbol, quote, news, insiderSentiment, history, pricePredictionByModel);
        SystemMessage systemMessage = new SystemMessage(SYSTEM_INSTRUCTION);
        UserMessage userMessage = new UserMessage(userPrompt);
        Prompt prompt = new Prompt(List.of(systemMessage, userMessage));
        System.out.println(prompt.getContents());
        ChatResponse response = chatModel.call(prompt);
        return response.getResult().getOutput().getText();
    }
}
