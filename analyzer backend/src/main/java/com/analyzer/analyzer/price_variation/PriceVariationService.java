package com.analyzer.analyzer.price_variation;

import com.analyzer.analyzer.price_variation.DTO.StockPriceChangeDTO;

public interface PriceVariationService {
    public String getPriceChange(String stockSymbol);
}
