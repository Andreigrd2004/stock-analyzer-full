package com.analyzer.analyzer.brokers;

import java.util.List;

public interface BrokerClickService {
    BrokerClick createBrokerClick(BrokerClickCreateRequest request);

    BrokerClick updateBrokerClick(Integer clickId, BrokerClickUpdateRequest request);

    BrokerClick getBrokerClick(Integer clickId);

    List<BrokerClick> getBrokerClicksByBroker(Integer brokerId);
}

