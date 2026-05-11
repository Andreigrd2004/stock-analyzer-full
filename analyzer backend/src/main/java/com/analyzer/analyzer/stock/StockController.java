package com.analyzer.analyzer.stock;

import com.analyzer.analyzer.stock.DTO.ConversationRequest;
import com.analyzer.analyzer.stock.DTO.ConversationResponse;
import com.analyzer.analyzer.stock.DTO.NewsDTO;
import com.analyzer.analyzer.stock.DTO.StockDTO;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@AllArgsConstructor
@RequestMapping("/stocks")
@Validated
public class StockController {
    private final StockService stockService;
    private final StockDataImportService stockDataImportService;

    @GetMapping("/stock-data")
    public StockDTO getStockData(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getStockData(symbol);
    }

    @GetMapping("/quote")
    public String getQuote(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getQuote(symbol);
    }

    @GetMapping("/news")
    public List<NewsDTO> getNews(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getNews(symbol);
    }

    @GetMapping("/insider-sentiment")
    public String getInsiderSentiment(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getInsiderSentiment(symbol);
    }

    @GetMapping("/prediction")
    public String getPrediction(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getPrediction(symbol);
    }

    @PostMapping("/conversation")
    public ConversationResponse getConversation(@RequestBody ConversationRequest request) {
        return stockService.handleConversation(request);
    }

    @GetMapping("/price-variation")
    public String getPriceVariation(@RequestParam(defaultValue = "AAPL") String symbol) {
        return stockService.getPriceVariation(symbol);
    }

    @PostMapping(value = "/import-archive", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> importArchive(@RequestParam("file") MultipartFile file) {
        stockDataImportService.importFromFile(file);
        return ResponseEntity.ok("Import triggered for file: " + file.getOriginalFilename());
    }
}
