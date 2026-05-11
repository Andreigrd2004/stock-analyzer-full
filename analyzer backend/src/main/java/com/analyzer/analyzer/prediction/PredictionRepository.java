package com.analyzer.analyzer.prediction;

import com.analyzer.analyzer.stock.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PredictionRepository extends JpaRepository <Prediction, Integer> {
    boolean existsPredictionByStock(Stock stock);

    Prediction getPredictionByStock(Stock stock);

    @Query("SELECT p FROM Prediction p WHERE p.stock = :stock AND p.validUntil > CURRENT_TIMESTAMP ORDER BY p.validUntil DESC LIMIT 1")
    Optional<Prediction> findValidPredictionByStock(@Param("stock") Stock stock);
}
