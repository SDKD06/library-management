package com.example.bookapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookapp.entity.Transaction;
import com.example.bookapp.service.BookService;
import com.example.bookapp.service.MemberService;
import com.example.bookapp.service.TransactionService;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService service;
    private final BookService bookService;
    private final MemberService memberService;

    public TransactionController(TransactionService service, BookService bookService, MemberService memberService) {
        this.service = service;
        this.bookService = bookService;
        this.memberService = memberService;
    }

    @GetMapping
    public List<Transaction> getAll() { return service.getAll(); }

    @PostMapping
    public Transaction create(@RequestBody Transaction transaction) {
        return service.save(transaction);
    }

    @PutMapping("/{id}")
    public Transaction update(@PathVariable Long id, @RequestBody Transaction transaction) {
        Transaction existing = service.getById(id);
        existing.setStatus(transaction.getStatus());
        existing.setReturnDate(transaction.getReturnDate());
        return service.save(existing);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}