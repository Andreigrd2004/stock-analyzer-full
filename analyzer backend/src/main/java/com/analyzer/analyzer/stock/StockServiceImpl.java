package com.analyzer.analyzer.stock;

import com.analyzer.analyzer.prediction.Prediction;
import com.analyzer.analyzer.prediction.PredictionRepository;
import com.analyzer.analyzer.prediction.gemini.GeminiConversationService;
import com.analyzer.analyzer.stock.DTO.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.analyzer.analyzer.prediction.gemini.GeminiPredictionService;
import com.analyzer.analyzer.price_variation.PriceVariationService;

import java.time.temporal.ChronoUnit;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.gson.Gson;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.Instant;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {
    private final StockRepository stockRepository;
    private final PriceVariationService priceVariationService;
    private final GeminiPredictionService geminiPredictionService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PredictionRepository predictionRepository;
    private final GeminiConversationService geminiConversationService;

    @Value("${app.finnhub-api-key}")
    private String apiKey;

    @Value("${LLM_SERVICE_URL:http://localhost:5000}")
    private String llmServiceUrl;

    private static final String BASE_URL = "https://finnhub.io/api/v1/";

    public StockDTO getStockData(String stockSymbol) {
        String url = BASE_URL + "quote?symbol=" + stockSymbol + "&token=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, StockDTO.class);
    }

    public String getPrediction(String stockSymbol) {
        try {
            if (stockRepository.existsBySymbol(stockSymbol)) {
                Stock stock = stockRepository.getStockBySymbol(stockSymbol);
                Optional<Prediction> validPrediction = predictionRepository.findValidPredictionByStock(stock);
                if (validPrediction.isPresent()) {
                    return validPrediction.get().getSummary();
                }
            }
            String quote = getQuote(stockSymbol);
            String news = objectMapper.writeValueAsString(getNews(stockSymbol));
            String sentiment = getInsiderSentiment(stockSymbol);
            String priceChange = getPriceVariation(stockSymbol);
            String pricePredictionByModel = getPricePrediction(stockSymbol);
            String response = geminiPredictionService.generateStockAnalysis(stockSymbol, quote, news, sentiment, priceChange, pricePredictionByModel);
            savePrediction(stockSymbol, response, quote, Float.parseFloat(pricePredictionByModel));
            return response;
            } catch(JsonProcessingException e){
                throw new RuntimeException("Failed to serialize stock data to JSON", e);
            }
    }

    public String getPricePrediction(String stockSymbol) {
        RestTemplate restTemplate = new RestTemplate();
        String url = llmServiceUrl + "/api/v1/predictions/price?ticker=" + stockSymbol;
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        Object predictedPrice = response != null ? response.get("predictedPrice") : null;
        if (predictedPrice == null) {
            throw new IllegalStateException("Prediction response is missing 'predictedPrice'");
        }

        return String.valueOf(predictedPrice);
    }

    public String getQuote(String stockSymbol) {
        String url = BASE_URL + "quote?" + "symbol=" + stockSymbol + "&token=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();

        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        assert response != null;
        return response.get("c").toString();
    }

    public List<NewsDTO> getNews(String stockSymbol) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneWeekAgo = now.minusDays(1);
        String date = "&from=" + oneWeekAgo.format(formatter) + "&to=" + now.format(formatter);
        String url = BASE_URL + "company-news?symbol=" + stockSymbol + date + "&token=" + apiKey;
        RestTemplate restTemplate = new RestTemplate();

        NewsDTO[] response = restTemplate.getForObject(url, NewsDTO[].class);
        return response != null ? List.of(response) : List.of();
    }

    public String getInsiderSentiment(String stockSymbol) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String from = "2020-01-01";
        String to = now.format(formatter);

        String url = BASE_URL + "stock/insider-sentiment?symbol=" + stockSymbol
                + "&from=" + from
                + "&to=" + to
                + "&token=" + apiKey;

        RestTemplate restTemplate = new RestTemplate();
        InsiderSentimentResponseDTO response = restTemplate.getForObject(url, InsiderSentimentResponseDTO.class);
        System.out.println(response.getData());

        return summarizeInsiderSentiment(response);
    }

    private String summarizeInsiderSentiment(InsiderSentimentResponseDTO dto) {
        if (dto == null || dto.getData() == null || dto.getData().isEmpty()) {
            return "No insider sentiment data available.";
        }

        List<InsiderSentimentDTO> data = dto.getData();

        double avgMspr = data.stream()
                .mapToDouble(InsiderSentimentDTO::getMspr)
                .average()
                .orElse(0);

        InsiderSentimentDTO latest = data.getLast();
        InsiderSentimentDTO oldest = data.getFirst();
        double trend = latest.getMspr() - oldest.getMspr();

        return String.format(
                "Average MSPR: %.2f | Latest MSPR: %.2f (%d/%d) | Trend: %s | Data points: %d",
                avgMspr,
                latest.getMspr(),
                latest.getMonth(),
                latest.getYear(),
                trend > 0 ? "Improving" : trend < 0 ? "Deteriorating" : "Stable",
                data.size()
        );
    }
    public String getPriceVariation(String stockSymbol) {
        return priceVariationService.getPriceChange(stockSymbol);
    }

    private void savePrediction(String stockSymbol, String response, String quote, float predicted) throws JsonProcessingException {
        JsonNode rootNode = objectMapper.readTree(response);
        int shortTermScore = rootNode.path("short_term").path("score").asInt();
        String action = switch (shortTermScore) {
            case 0 -> "Sell";
            case 1 -> "Hold";
            case 2 -> "Buy";
            default -> throw new IllegalStateException("Unexpected value: " + shortTermScore);
        };
        Stock stock;
        if (stockRepository.existsBySymbol(stockSymbol)) {
            stock = stockRepository.getStockBySymbol(stockSymbol);
        } else {
            Stock newStock = new Stock();
            newStock.setSymbol(stockSymbol);
            stockRepository.save(newStock);
            stock = newStock;
        }
        Prediction prediction = new Prediction(null, stock, response, action, Double.parseDouble(quote), Instant.now(), Instant.now().plus(1, ChronoUnit.DAYS), new LinkedHashSet<>(), predicted);
        predictionRepository.save(prediction);
    }

    public ConversationResponse handleConversation(ConversationRequest request) {
        String response = geminiConversationService.generateResponse(request);
        return new ConversationResponse(response);
    }

}
