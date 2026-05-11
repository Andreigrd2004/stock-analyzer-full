package com.analyzer.analyzer.stock;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Integer> {
    java.util.Optional<Stock> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);

    Stock getStockBySymbol(String symbol);
}
