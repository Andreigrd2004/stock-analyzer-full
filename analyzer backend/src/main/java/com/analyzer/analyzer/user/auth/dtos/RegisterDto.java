package com.analyzer.analyzer.user.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterDto implements Serializable {
    @Email
    private String email;

    @NotBlank
    private String displayName;

    @Size(min = 4, max = 20)
    private String password;

    @NotBlank
    private String username;
}

