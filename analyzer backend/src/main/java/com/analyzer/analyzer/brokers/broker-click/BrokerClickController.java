package com.analyzer.analyzer.brokers;

import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/broker-clicks")
@Validated
public class BrokerClickController {
    private final BrokerClickService brokerClickService;

    @PostMapping
    public BrokerClickResponse createBrokerClick(@RequestBody BrokerClickCreateRequest request) {
        return toResponse(brokerClickService.createBrokerClick(request));
    }

    @PutMapping("/{clickId}")
    public BrokerClickResponse updateBrokerClick(
            @PathVariable Integer clickId, @RequestBody BrokerClickUpdateRequest request) {
        return toResponse(brokerClickService.updateBrokerClick(clickId, request));
    }

    @GetMapping("/{clickId}")
    public BrokerClickResponse getBrokerClick(@PathVariable Integer clickId) {
        return toResponse(brokerClickService.getBrokerClick(clickId));
    }

    @GetMapping("/by-broker/{brokerId}")
    public List<BrokerClickResponse> getBrokerClicksByBroker(@PathVariable Integer brokerId) {
        return brokerClickService.getBrokerClicksByBroker(brokerId).stream()
                .map(this::toResponse)
                .toList();
    }

    private BrokerClickResponse toResponse(BrokerClick click) {
        return new BrokerClickResponse(
                click.getId(),
                click.getBroker() != null ? click.getBroker().getId() : null,
                click.getUser() != null ? click.getUser().getId() : null,
                click.getClickedAt(),
                click.getCostAtClick());
    }
}
