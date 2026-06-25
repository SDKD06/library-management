package com.example.bookapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.bookapp.entity.User;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}