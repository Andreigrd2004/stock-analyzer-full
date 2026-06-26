package com.analyzer.analyzer.brokers;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/brokers")
@Validated
public class BrokerController {
    private final BrokerService brokerService;

    @PostMapping
    public BrokerResponse createBroker(@RequestBody BrokerCreateRequest request) {
        return toResponse(brokerService.createBroker(request));
    }

    @PutMapping()
    public BrokerResponse updateBroker( @RequestBody BrokerUpdateRequest request) {
        return toResponse(brokerService.updateBroker(request));
    }

    @GetMapping("/{brokerId}")
    public BrokerResponse getBroker(@PathVariable Integer brokerId) {
        return toResponse(brokerService.getBroker(brokerId));
    }

    @GetMapping
    public List<BrokerResponse> getAllBrokers() {
        return brokerService.getAllBrokers().stream().map(this::toResponse).toList();
    }

    @GetMapping("/bid-amounts")
    public List<BigDecimal> getAllBidAmounts() {
        return brokerService.getAllBidAmounts();
    }

    private BrokerResponse toResponse(Broker broker) {
        return new BrokerResponse(
                broker.getId(),
                broker.getUser() != null ? broker.getUser().getId() : null,
                broker.getCompanyName(),
                broker.getRedirectUrl(),
                broker.getBidAmount(),
                broker.getDailyBudget(),
                broker.getActive());
    }
}
