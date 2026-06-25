package com.example.bookapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.bookapp.entity.Transaction;
import com.example.bookapp.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository repository;

    public TransactionService(TransactionRepository repository) {
        this.repository = repository;
    }

    public Transaction save(Transaction transaction) { return repository.save(transaction); }
    public List<Transaction> getAll() { return repository.findAll(); }
    public Transaction getById(Long id) { return repository.findById(id).orElseThrow(); }
    public void delete(Long id) { repository.deleteById(id); }
    public List<Transaction> getByStatus(String status) { return repository.findByStatus(status); }
}