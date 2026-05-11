package com.analyzer.analyzer.prediction;

import com.analyzer.analyzer.prediction.accuracy.PredictionAccuracy;
import com.analyzer.analyzer.stock.Stock;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@AllArgsConstructor
@Table(name = "predictions", schema = "public")
@NoArgsConstructor
public class Prediction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id")
    private Stock stock;

    @Column(name = "summary", length = Integer.MAX_VALUE)
    private String summary;

    @Size(max = 20)
    @Column(name = "action", length = 20)
    private String action;

    @Column(name = "current_price")
    private Double currentPrice;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "valid_until")
    private Instant validUntil;

    @OneToMany(mappedBy = "prediction")
    private Set<PredictionAccuracy> predictionAccuracies = new LinkedHashSet<>();

    @Column(name = "predicted")
    private Float predicted;

}