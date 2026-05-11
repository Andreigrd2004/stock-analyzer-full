package com.analyzer.analyzer.user.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserDto {
    @NotBlank
    private Integer id;

    @NotBlank
    private String username;

    @Email
    private String email;

    @NotBlank
    private String passwordHash;

    @NotBlank
    private String role;
}
