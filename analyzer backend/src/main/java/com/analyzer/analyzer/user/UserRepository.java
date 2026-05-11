package com.analyzer.analyzer.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    List<User> findUserByEmail(String email);

    Optional<User> findUserByUsername(String username);

    boolean existsByUsername(String username);
}
