package com.analyzer.analyzer.stock.DTO;

import java.util.ArrayList;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PredictionListResponse {
    ArrayList<PredictionDTO> predictions;
}
