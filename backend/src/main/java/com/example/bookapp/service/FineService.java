package com.example.bookapp.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.bookapp.entity.Fine;
import com.example.bookapp.entity.Transaction;
import com.example.bookapp.repository.FineRepository;
import com.example.bookapp.repository.TransactionRepository;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final TransactionRepository transactionRepository;

    // tunable rules
    private static final int LOAN_DAYS = 14;      // must match OverdueScheduler
    private static final double DAILY_RATE = 5.0; // ₹5 per day overdue

    public FineService(FineRepository fineRepository,
                       TransactionRepository transactionRepository) {
        this.fineRepository = fineRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Fine> getAll() {
        return fineRepository.findByOrderByCreatedDateDesc();
    }

    /**
     * Scans OVERDUE transactions and creates a fine for any that don't have one yet.
     * Safe to run repeatedly - it skips transactions that already have a fine.
     */
    public List<Fine> generateOverdueFines() {
        List<Transaction> overdue = transactionRepository.findByStatus("OVERDUE");
        LocalDate today = LocalDate.now();

        for (Transaction t : overdue) {
            if (t.getId() == null || t.getBorrowDate() == null) continue;
            if (fineRepository.existsByTransactionId(t.getId())) continue;

            LocalDate dueDate = t.getBorrowDate().plusDays(LOAN_DAYS);
            long daysLate = ChronoUnit.DAYS.between(dueDate, today);
            if (daysLate <= 0) continue;

            Fine fine = new Fine();
            fine.setTransaction(t);
            fine.setDaysOverdue((int) daysLate);
            fine.setAmount(daysLate * DAILY_RATE);
            fine.setCreatedDate(today);
            fine.setStatus("UNPAID");
            fineRepository.save(fine);
        }

        return getAll();
    }

    public Fine pay(Long id) {
        return setStatus(id, "PAID");
    }

    public Fine waive(Long id) {
        return setStatus(id, "WAIVED");
    }

    private Fine setStatus(Long id, String status) {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fine not found: " + id));
        fine.setStatus(status);
        return fineRepository.save(fine);
    }
}
