package com.analyzer.analyzer.stock.DTO;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class InsiderSentimentResponseDTO {
    private List<InsiderSentimentDTO> data;
    private String symbol;
}

