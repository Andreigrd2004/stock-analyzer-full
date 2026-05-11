package com.analyzer.analyzer.user.auth;

import com.analyzer.analyzer.security.jwt.JwtAuthResponse;
import com.analyzer.analyzer.user.auth.dtos.LoginDto;
import com.analyzer.analyzer.user.auth.dtos.RegisterDto;
import com.analyzer.analyzer.user.auth.response.RoleResponse;

public interface AuthService {
    JwtAuthResponse login(LoginDto loginDto);

    JwtAuthResponse register(RegisterDto registerDto);

    RoleResponse getCurrentUserRole();
}