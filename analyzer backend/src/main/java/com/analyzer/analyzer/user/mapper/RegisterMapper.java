package com.analyzer.analyzer.user.mapper;

import com.analyzer.analyzer.user.User;
import com.analyzer.analyzer.user.auth.dtos.RegisterDto;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class RegisterMapper {

    public static User map(RegisterDto dto, PasswordEncoder passwordEncoder) {
        if (dto == null) {
            return null;
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole("USER");
        user.setCreatedAt(Instant.now());

        return user;
    }
}
