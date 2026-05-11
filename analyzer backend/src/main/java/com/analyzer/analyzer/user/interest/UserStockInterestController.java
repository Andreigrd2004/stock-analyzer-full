package com.analyzer.analyzer.user.interest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/interests")
@RequiredArgsConstructor
public class UserStockInterestController {

    private final UserStockInterestService userStockInterestService;

    @PostMapping
    public ResponseEntity<AddInterestResponse> addInterest(@RequestBody AddInterestRequest request) {
        return ResponseEntity.ok(userStockInterestService.addInterest(request));
    }

    @GetMapping
    public ResponseEntity<UserInterestsResponse> getUserInterests() {
        return ResponseEntity.ok(userStockInterestService.getUserInterests());
    }

    @DeleteMapping("/{stockName}")
    public ResponseEntity<Void> deleteInterest(@PathVariable String stockName) {
        userStockInterestService.deleteInterest(stockName);
        return ResponseEntity.noContent().build();
    }
}
