package com.analyzer.analyzer.advice.response;

import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@Builder
public class ErrorResponse {

    private final int statusCode;
    private final String message;
}
