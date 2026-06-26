package com.analyzer.analyzer.brokers;

import java.math.BigDecimal;
import java.util.List;

public interface BrokerService {
    Broker createBroker(BrokerCreateRequest request);

    Broker getBroker(Integer brokerId);

    List<Broker> getAllBrokers();

    List<BigDecimal> getAllBidAmounts();

    Broker updateBroker(BrokerUpdateRequest request);
}
