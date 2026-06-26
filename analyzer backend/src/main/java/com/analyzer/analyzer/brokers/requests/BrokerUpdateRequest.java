package com.analyzer.analyzer.brokers;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BrokerUpdateRequest {
    private String companyName;
    private String redirectUrl;
    private Boolean active;
    private BigDecimal bidAmount;
    private BigDecimal dailyBudget;
}

