package com.example.bookapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookapp.entity.Fine;
import com.example.bookapp.service.FineService;

@RestController
@RequestMapping("/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @GetMapping
    public List<Fine> getAll() {
        return fineService.getAll();
    }

    // Generates fines for any overdue books that don't have one yet.
    @PostMapping("/generate")
    public List<Fine> generate() {
        return fineService.generateOverdueFines();
    }

    @PutMapping("/{id}/pay")
    public Fine pay(@PathVariable Long id) {
        return fineService.pay(id);
    }

    @PutMapping("/{id}/waive")
    public Fine waive(@PathVariable Long id) {
        return fineService.waive(id);
    }
}
