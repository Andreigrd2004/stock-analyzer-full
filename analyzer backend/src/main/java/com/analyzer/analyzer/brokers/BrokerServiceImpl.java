package com.analyzer.analyzer.brokers;

import com.analyzer.analyzer.advice.exceptions.BadRequestException;
import com.analyzer.analyzer.advice.exceptions.NotFoundException;
import com.analyzer.analyzer.user.User;
import com.analyzer.analyzer.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BrokerServiceImpl implements BrokerService {

    private final BrokerRepository brokerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Broker createBroker(BrokerCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }
        if (request.getUserId() == null) {
            throw new BadRequestException("User id is required.");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new NotFoundException("User not found."));

        if (brokerRepository.existsByUser_Id(user.getId())) {
            throw new BadRequestException("Broker already exists for this user.");
        }

        Broker broker = new Broker();
        broker.setUser(user);
        broker.setCompanyName(request.getCompanyName());
        broker.setRedirectUrl(request.getRedirectUrl());
        broker.setBidAmount(defaultAmount(request.getBidAmount()));
        broker.setDailyBudget(defaultAmount(request.getDailyBudget()));
        broker.setActive(defaultActive(request.getActive()));

        user.setRole("BROKER");
        userRepository.save(user);

        return brokerRepository.save(broker);
    }

    @Override
    @Transactional
    public Broker updateBroker(BrokerUpdateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }
        User currentUser = getCurrentUser();
        Broker broker = brokerRepository.findByUser_Id(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Broker not found."));

        if (request.getCompanyName() != null) {
            broker.setCompanyName(request.getCompanyName());
        }
        if (request.getRedirectUrl() != null) {
            broker.setRedirectUrl(request.getRedirectUrl());
        }
        if(request.getBidAmount() != null) {
            broker.setBidAmount(request.getBidAmount());
        }
        if(request.getDailyBudget() != null) {
            broker.setDailyBudget(request.getDailyBudget());
        }
        if(request.getActive() != null) {
            broker.setActive(request.getActive());
        }

        return brokerRepository.save(broker);
    }

    @Override
    public Broker getBroker(Integer brokerId) {
        return brokerRepository.findById(brokerId)
                .orElseThrow(() -> new NotFoundException("Broker not found."));
    }

    @Override
    public List<Broker> getAllBrokers() {
        return brokerRepository.findAll();
    }

    @Override
    public List<BigDecimal> getAllBidAmounts() {
        return brokerRepository.findAllBidAmounts();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User is not authenticated.");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        if (principal instanceof UserDetails userDetails) {
            return userRepository.findUserByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new NotFoundException("User not found."));
        }

        throw new BadRequestException("User is not authenticated.");
    }

    private BigDecimal defaultAmount(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Boolean defaultActive(Boolean value) {
        return value == null ? Boolean.FALSE : value;
    }
}
