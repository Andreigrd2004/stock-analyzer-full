package com.analyzer.analyzer.stock.DTO;

import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;

@Getter
@Setter
public class PredictionsListRequest {
    ArrayList<String> stockSymbols;
}
