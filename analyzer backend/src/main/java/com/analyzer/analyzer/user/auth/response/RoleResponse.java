package com.analyzer.analyzer.user.auth.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleResponse {
    private String role;

    public RoleResponse(String role) {
        this.role = role;
    }
}
