package com.analyzer.analyzer.stock.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class NewsListDTO {
    List<NewsDTO> newsList;
}
