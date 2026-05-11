package com.analyzer.analyzer.price_variation;

import com.analyzer.analyzer.price_variation.DTO.StockPriceChangeDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PriceVariationServiceImpl implements PriceVariationService {

    @Value("${app.financialmodelingprep-api-key}")
    private String fmpApiKey;

    private static final String FMP_BASE_URL = "https://financialmodelingprep.com/stable/";
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getPriceChange(String stockSymbol) {
        String url = FMP_BASE_URL + "stock-price-change?symbol=" + stockSymbol + "&apikey=" + fmpApiKey;
        RestTemplate restTemplate = new RestTemplate();

        StockPriceChangeDTO[] response = restTemplate.getForObject(url, StockPriceChangeDTO[].class);

        if (response == null || response.length == 0) {
            throw new RuntimeException("No price change data found for symbol: " + stockSymbol);
        }

        try {
            return objectMapper.writeValueAsString(response[0]);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize price change data to JSON", e);
        }
    }
}
