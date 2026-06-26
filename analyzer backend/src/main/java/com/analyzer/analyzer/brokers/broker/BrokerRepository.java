package com.analyzer.analyzer.brokers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface BrokerRepository extends JpaRepository<Broker, Integer> {
    boolean existsByUser_Id(Integer userId);

    Optional<Broker> findByUser_Id(Integer userId);

    @Query("select b.bidAmount from Broker b")
    List<BigDecimal> findAllBidAmounts();

    Optional<Broker> findBrokerByCompanyName(String companyName);
}
