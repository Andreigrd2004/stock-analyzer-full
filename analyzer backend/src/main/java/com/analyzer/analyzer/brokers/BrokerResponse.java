package com.analyzer.analyzer.brokers;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BrokerResponse {
    private Integer id;
    private Integer userId;
    private String companyName;
    private String redirectUrl;
    private BigDecimal bidAmount;
    private BigDecimal dailyBudget;
    private Boolean active;
}

