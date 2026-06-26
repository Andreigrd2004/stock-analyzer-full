package com.analyzer.analyzer.brokers;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrokerClickRepository extends JpaRepository<BrokerClick, Integer> {
    List<BrokerClick> findByBrokerId(Integer brokerId);
}
