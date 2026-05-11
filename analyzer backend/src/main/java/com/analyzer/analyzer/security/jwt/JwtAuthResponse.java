package com.analyzer.analyzer.security.jwt;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

@NoArgsConstructor
@AllArgsConstructor
@Component
public class JwtAuthResponse {
    @Getter @Setter private String accessToken;
    @Getter private final String tokenType = "Bearer";
}
