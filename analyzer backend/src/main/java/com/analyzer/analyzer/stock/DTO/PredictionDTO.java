package com.analyzer.analyzer.stock.DTO;

import com.analyzer.analyzer.prediction.Prediction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PredictionDTO {
    private String stockSymbol;
    private String summary;
    private String action;
    private Double currentPrice;
    private Instant createdAt;
    private Instant validUntil;
    private Float predicted;

    public static PredictionDTO fromEntity(Prediction p) {
        if (p == null) return null;
        String symbol = null;
        if (p.getStock() != null) {
            try {
                symbol = p.getStock().getSymbol();
            } catch (Exception ignored) {

            }
        }
        return new PredictionDTO(
                symbol,
                p.getSummary(),
                p.getAction(),
                p.getCurrentPrice(),
                p.getCreatedAt(),
                p.getValidUntil(),
                p.getPredicted()
        );
    }


    public static PredictionDTO fromEntity(Prediction p, String symbol) {
        if (p == null) return null;
        return new PredictionDTO(
                symbol,
                p.getSummary(),
                p.getAction(),
                p.getCurrentPrice(),
                p.getCreatedAt(),
                p.getValidUntil(),
                p.getPredicted()
        );
    }
}
