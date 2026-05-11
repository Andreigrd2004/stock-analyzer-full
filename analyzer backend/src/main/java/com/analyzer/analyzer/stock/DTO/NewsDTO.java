package com.analyzer.analyzer.stock.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NewsDTO {
    private String category;
    private long datetime;
    private String headline;
    private String image;
    private String related;
    private String source;
    private String summary;
    private String url;
}
