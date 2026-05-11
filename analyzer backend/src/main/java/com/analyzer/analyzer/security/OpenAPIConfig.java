package com.analyzer.analyzer.security;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecuritySchemes;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(title = "NearbyFinder", version = "v1"),
        security = {@SecurityRequirement(name = "bearerAuth")})
@SecuritySchemes(
        value = {
                @SecurityScheme(
                        name = "bearerAuth",
                        description = "JWT authentication",
                        scheme = "bearer",
                        type = SecuritySchemeType.HTTP,
                        bearerFormat = "JWT",
                        in = SecuritySchemeIn.HEADER)
        })
public class OpenAPIConfig {}
