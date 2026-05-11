package com.analyzer.analyzer.stock;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StockHistoryRepository extends JpaRepository<StockHistory, StockHistoryId> {
}

