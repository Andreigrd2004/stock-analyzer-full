package com.analyzer.analyzer.stock;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stock_history")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StockHistory {
    @EmbeddedId
    private StockHistoryId id;

    @NotNull
    @Column(name = "open", nullable = false)
    private Double open;

    @NotNull
    @Column(name = "high", nullable = false)
    private Double high;

    @NotNull
    @Column(name = "low", nullable = false)
    private Double low;

    @NotNull
    @Column(name = "close", nullable = false)
    private Double close;

}
