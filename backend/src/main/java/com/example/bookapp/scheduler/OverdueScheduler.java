package com.example.bookapp.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.bookapp.entity.Transaction;
import com.example.bookapp.repository.TransactionRepository;

@Component
public class OverdueScheduler {

    private final TransactionRepository repository;

    public OverdueScheduler(TransactionRepository repository) {
        this.repository = repository;
    }

    // Runs once right after startup, so overdue books are caught up immediately
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        checkOverdueBooks();
    }

    // Still runs every day at midnight for long-running deployments
    @Scheduled(cron = "0 0 0 * * *")
    public void checkOverdueBooks() {
        List<Transaction> active = repository.findByStatus("ACTIVE");
        LocalDate today = LocalDate.now();

        for (Transaction t : active) {
            if (t.getBorrowDate() != null &&
                t.getBorrowDate().plusDays(14).isBefore(today)) {
                t.setStatus("OVERDUE");
                repository.save(t);
            }
        }
    }
}