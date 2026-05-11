package com.analyzer.analyzer.user.interest;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStockInterestRepository extends JpaRepository<UserStockInterest, UserStockInterestId> {
    List<UserStockInterest> findAllByUserId(Integer userId);
}
