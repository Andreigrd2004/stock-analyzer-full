package com.analyzer.analyzer.stock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

import org.springframework.web.multipart.MultipartFile;

@Service
public class StockDataImportService {

    private static final Logger log = LoggerFactory.getLogger(StockDataImportService.class);

    private final StockRepository stockRepository;
    private final StockHistoryRepository stockHistoryRepository;

    public StockDataImportService(StockRepository stockRepository, StockHistoryRepository stockHistoryRepository) {
        this.stockRepository = stockRepository;
        this.stockHistoryRepository = stockHistoryRepository;
    }

    @Transactional
    public void importFromFile(MultipartFile file) {
        if (file.isEmpty()) {
            log.info("Uploaded file is empty");
            return;
        }

        log.info("Processing uploaded file: {}", file.getOriginalFilename());
        Map<String, StockHistory> monthlyRecords = new HashMap<>();

        long linesProcessed = 0;
        long lastLoggedTime = System.currentTimeMillis();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            boolean isFirstLine = true;

            while ((line = br.readLine()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; // Skip header
                }

                linesProcessed++;
                if (linesProcessed % 100000 == 0) {
                    long now = System.currentTimeMillis();
                    log.info("Processed {} lines so far... (last 100k took {} ms)", linesProcessed, now - lastLoggedTime);
                    lastLoggedTime = now;
                }

                String[] parts = line.split(",", -1);
                if (parts.length < 6) continue;

                try {
                    String dateStr = parts[0].trim();
                    // Some CSVs have datetime like "2010-01-04 00:00:00-05:00", so we substring to get "YYYY-MM-DD"
                    if (dateStr.length() > 10) {
                        dateStr = dateStr.substring(0, 10);
                    }
                    LocalDate date = LocalDate.parse(dateStr);

                    // Filter: Only take data >= 2010
                    if (date.getYear() < 2010) {
                        continue;
                    }

                    String ticker = parts[1].trim();
                    Double open = parts[2].trim().isEmpty() ? 0.0 : Double.parseDouble(parts[2].trim());
                    Double high = parts[3].trim().isEmpty() ? 0.0 : Double.parseDouble(parts[3].trim());
                    Double low = parts[4].trim().isEmpty() ? 0.0 : Double.parseDouble(parts[4].trim());
                    Double close = parts[5].trim().isEmpty() ? 0.0 : Double.parseDouble(parts[5].trim());

                    // Fix dirty data where float precision or typos make close/open fall outside low/high bounds
                    if (open > high) high = open;
                    if (close > high) high = close;
                    if (open < low) low = open;
                    if (close < low) low = close;

                    YearMonth ym = YearMonth.from(date);
                    String key = ticker + "_" + ym;

                    StockHistory currentRecord = monthlyRecords.get(key);
                    if (currentRecord == null || date.isBefore(currentRecord.getId().getDate())) {
                        StockHistoryId id = new StockHistoryId();
                        id.setDate(date);
                        id.setTicker(ticker);

                        StockHistory history = new StockHistory(id, open, high, low, close);
                        monthlyRecords.put(key, history);
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse line in file {}: {} - Error: {}", file.getOriginalFilename(), line, e.getMessage());
                }
            }

            // Save records
            log.info("Finished reading file. Found {} unique monthly records to save. Starting database insert...", monthlyRecords.size());
            Set<String> processedTickers = new HashSet<>();
            List<StockHistory> recordsToSave = new ArrayList<>();
            for (StockHistory record : monthlyRecords.values()) {
                String ticker = record.getId().getTicker();

                // Ensure Stock entity exists
                if (processedTickers.add(ticker)) {
                    ensureStockExists(ticker);
                }
                recordsToSave.add(record);
            }

            log.info("Finished ensuring stocks exist. Proceeding to save stock history records...");
            if (!recordsToSave.isEmpty()) {
                // Save in batches to avoid overwhelming the memory/database all at once during merge
                int batchSize = 10000;
                for (int i = 0; i < recordsToSave.size(); i += batchSize) {
                    int end = Math.min(recordsToSave.size(), i + batchSize);
                    List<StockHistory> batch = recordsToSave.subList(i, end);
                    stockHistoryRepository.saveAll(batch);
                    stockHistoryRepository.flush(); // Assuming you extend JpaRepository we can flush
                    log.info("Saved batch {} to {} of {}", i, end, recordsToSave.size());
                }
                log.info("Successfully finished saving all {} monthly records from {}", recordsToSave.size(), file.getOriginalFilename());
            }

        } catch (IOException e) {
            log.error("Error reading file {}", file.getOriginalFilename(), e);
        }
    }

    private void ensureStockExists(String ticker) {
        stockRepository.findBySymbol(ticker).orElseGet(() -> {
            Stock newStock = new Stock();
            newStock.setSymbol(ticker);
            return stockRepository.save(newStock);
        });
    }
}
