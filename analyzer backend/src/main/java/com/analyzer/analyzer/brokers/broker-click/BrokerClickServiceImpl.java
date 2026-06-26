package com.analyzer.analyzer.brokers;

import com.analyzer.analyzer.advice.exceptions.BadRequestException;
import com.analyzer.analyzer.advice.exceptions.NotFoundException;
import com.analyzer.analyzer.user.User;
import com.analyzer.analyzer.user.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrokerClickServiceImpl implements BrokerClickService {

    private final BrokerClickRepository brokerClickRepository;
    private final BrokerRepository brokerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BrokerClick createBrokerClick(BrokerClickCreateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        User user = getCurrentUser();
        Broker broker = brokerRepository.findBrokerByCompanyName(request.getBrokerName())
                .orElseThrow(() -> new NotFoundException("Broker not found for user."));

        BrokerClick click = new BrokerClick();
        click.setBroker(broker);
        click.setUser(user);
        click.setCostAtClick(broker.getBidAmount());

        return brokerClickRepository.save(click);
    }

    @Override
    @Transactional
    public BrokerClick updateBrokerClick(Integer clickId, BrokerClickUpdateRequest request) {
        if (request == null) {
            throw new BadRequestException("Request body is required.");
        }

        BrokerClick click = brokerClickRepository.findById(clickId)
                .orElseThrow(() -> new NotFoundException("Broker click not found."));

        User currentUser = getCurrentUser();
        if (!click.getBroker().getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You cannot modify this broker click.");
        }

        if (request.getCostAtClick() != null) {
            click.setCostAtClick(request.getCostAtClick());
        }

        return brokerClickRepository.save(click);
    }

    @Override
    public BrokerClick getBrokerClick(Integer clickId) {
        return brokerClickRepository.findById(clickId)
                .orElseThrow(() -> new NotFoundException("Broker click not found."));
    }

    @Override
    public List<BrokerClick> getBrokerClicksByBroker(Integer brokerId) {
        if (!brokerRepository.existsById(brokerId)) {
            throw new NotFoundException("Broker not found.");
        }
        return brokerClickRepository.findByBrokerId(brokerId);
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
}
