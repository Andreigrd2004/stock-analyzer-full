package com.analyzer.analyzer.stock.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConversationRequest {
    public String userMessage;
    public String companyName;
    public String stockSymbol;
    public String currentPrice;
    public String conversationHistory;
}
