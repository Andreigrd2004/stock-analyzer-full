package com.analyzer.analyzer.user.interest;

import com.analyzer.analyzer.advice.exceptions.BadRequestException;
import com.analyzer.analyzer.stock.Stock;
import com.analyzer.analyzer.stock.StockRepository;
import com.analyzer.analyzer.user.User;
import com.analyzer.analyzer.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserStockInterestServiceImpl implements UserStockInterestService {

    private final UserStockInterestRepository userStockInterestRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;

    @Override
    @Transactional
    public AddInterestResponse addInterest(AddInterestRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        Stock stock = stockRepository.findBySymbol(request.getStockName())
                .orElseGet(() -> {
                    Stock newStock = new Stock();
                    newStock.setSymbol(request.getStockName());
                    return stockRepository.save(newStock);
                });

        UserStockInterestId id = new UserStockInterestId();
        id.setUserId(user.getId());
        id.setStockId(stock.getId());

        if (userStockInterestRepository.existsById(id)) {
            throw new BadRequestException("Stock interest already exists.");
        }

        UserStockInterest interest = new UserStockInterest();
        interest.setId(id);
        interest.setUser(user);
        interest.setStock(stock);
        interest.setAddedAt(Instant.now());

        userStockInterestRepository.save(interest);

        return new AddInterestResponse("Interest added successfully for stock: " + stock.getSymbol());
    }

    @Override
    public UserInterestsResponse getUserInterests() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        List<UserStockInterest> interests = userStockInterestRepository.findAllByUserId(user.getId());
        List<String> interestList = interests.stream()
                .map(interest -> interest.getStock().getSymbol())
                .collect(Collectors.toList());
        return new UserInterestsResponse(interestList);
    }

    @Override
    @Transactional
    public void deleteInterest(String stockName) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findUserByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));

        Stock stock = stockRepository.findBySymbol(stockName)
                .orElseThrow(() -> new BadRequestException("Stock not found with symbol/name: " + stockName));

        UserStockInterestId id = new UserStockInterestId();
        id.setUserId(user.getId());
        id.setStockId(stock.getId());

        if (!userStockInterestRepository.existsById(id)) {
            throw new BadRequestException("Stock interest does not exist.");
        }

        userStockInterestRepository.deleteById(id);
    }
}
