package com.example.bookapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.bookapp.entity.Fine;

public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByStatus(String status);
    List<Fine> findByOrderByCreatedDateDesc();
    boolean existsByTransactionId(Long transactionId);
}
