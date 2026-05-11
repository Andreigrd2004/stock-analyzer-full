package com.analyzer.analyzer.price_variation.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class StockPriceChangeDTO {
    private String symbol;

    @JsonProperty("1D")
    private double oneDay;

    @JsonProperty("5D")
    private double fiveDay;

    @JsonProperty("1M")
    private double oneMonth;

    @JsonProperty("3M")
    private double threeMonth;

    @JsonProperty("6M")
    private double sixMonth;

    @JsonProperty("ytd")
    private double ytd;

    @JsonProperty("1Y")
    private double oneYear;

    @JsonProperty("3Y")
    private double threeYear;

    @JsonProperty("5Y")
    private double fiveYear;

    @JsonProperty("10Y")
    private double tenYear;

    @JsonProperty("max")
    private double max;
}

