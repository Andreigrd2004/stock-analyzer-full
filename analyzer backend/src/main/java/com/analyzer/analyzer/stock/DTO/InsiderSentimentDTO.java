package com.analyzer.analyzer.stock.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InsiderSentimentDTO {
    private String symbol;
    private int year;
    private int month;
    private int change;
    private double mspr;
}

