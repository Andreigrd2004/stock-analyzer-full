package com.analyzer.analyzer.prediction.accuracy;

import com.analyzer.analyzer.prediction.Prediction;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "prediction_accuracy", schema = "public")
public class PredictionAccuracy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id")
    private Prediction prediction;

    @Column(name = "price_after_5_days")
    private Double priceAfter5Days;

    @Column(name = "is_accurate")
    private Boolean isAccurate;

}