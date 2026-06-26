package com.analyzer.analyzer.brokers;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BrokerClickResponse {
    private Integer id;
    private Integer brokerId;
    private Integer userId;
    private Instant clickedAt;
    private BigDecimal costAtClick;
}

