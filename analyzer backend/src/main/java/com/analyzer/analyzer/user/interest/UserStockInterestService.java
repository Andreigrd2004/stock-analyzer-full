package com.analyzer.analyzer.user.interest;

import java.util.List;

public interface UserStockInterestService {
    AddInterestResponse addInterest(AddInterestRequest request);
    UserInterestsResponse getUserInterests();
    void deleteInterest(String stockName);
}
