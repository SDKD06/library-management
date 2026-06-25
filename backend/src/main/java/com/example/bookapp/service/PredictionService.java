package com.example.bookapp.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.bookapp.dto.BookPrediction;
import com.example.bookapp.entity.Book;
import com.example.bookapp.entity.Transaction;
import com.example.bookapp.repository.BookRepository;
import com.example.bookapp.repository.TransactionRepository;

/**
 * Predicts which books are most likely to be borrowed next.
 *
 * It combines three signals:
 *   1. the book's own recency-weighted borrow momentum,
 *   2. how "hot" the book's genre is overall,
 *   3. similarity to the genres the user is currently focusing on.
 *
 * No ML library required - this is a transparent, explainable heuristic
 * that runs over your existing Transaction history.
 */
@Service
public class PredictionService {

    private final BookRepository bookRepository;
    private final TransactionRepository transactionRepository;

    // --- tunable parameters ---
    private static final double HALF_LIFE_DAYS   = 30.0; // a borrow's weight halves every 30 days
    private static final int    RECENT_WINDOW_DAYS = 30; // window for the "recentBorrows" counter
    private static final double W_BOOK_TREND  = 0.45;    // weight: the book's own borrow momentum
    private static final double W_GENRE_TREND = 0.35;    // weight: how hot the book's genre is
    private static final double W_SIMILARITY  = 0.20;    // weight: matches the selected genres

    public PredictionService(BookRepository bookRepository,
                             TransactionRepository transactionRepository) {
        this.bookRepository = bookRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<BookPrediction> predict(Set<Long> selectedBookIds,
                                        Set<String> selectedGenres,
                                        int limit) {

        List<Book> books = bookRepository.findAll();
        List<Transaction> transactions = transactionRepository.findAll();
        LocalDate today = LocalDate.now();

        // 1. recency-weighted borrow score per book and per genre
        Map<Long, Double> bookTrend = new HashMap<>();
        Map<String, Double> genreTrend = new HashMap<>();
        Map<Long, Long> recentBorrows = new HashMap<>();
        Set<Long> onLoanBookIds = new HashSet<>();

        for (Transaction t : transactions) {
            Book b = bookOf(t);
            if (b == null) continue;

            // a book is currently out if it has a loan that hasn't been returned
            if (isOpenLoan(t)) onLoanBookIds.add(b.getId());

            LocalDate when = borrowDateOf(t);
            if (when == null) continue;

            long ageDays = ChronoUnit.DAYS.between(when, today);
            if (ageDays < 0) ageDays = 0;
            double weight = Math.pow(0.5, ageDays / HALF_LIFE_DAYS);

            bookTrend.merge(b.getId(), weight, Double::sum);

            String g = genreOf(b);
            if (g != null) genreTrend.merge(g, weight, Double::sum);

            if (ageDays <= RECENT_WINDOW_DAYS) {
                recentBorrows.merge(b.getId(), 1L, Long::sum);
            }
        }

        // 2. resolve target genres (explicit list, or derived from the selected books).
        //    Stored lowercased/trimmed so matching is case-insensitive ("science" == "Science").
        Set<String> targetGenres = new HashSet<>();
        if (selectedGenres != null) {
            selectedGenres.stream()
                    .filter(Objects::nonNull)
                    .map(s -> s.trim().toLowerCase())
                    .filter(s -> !s.isEmpty())
                    .forEach(targetGenres::add);
        }
        if (selectedBookIds != null && !selectedBookIds.isEmpty()) {
            for (Book b : books) {
                if (selectedBookIds.contains(b.getId()) && genreOf(b) != null) {
                    targetGenres.add(genreOf(b).trim().toLowerCase());
                }
            }
        }

        // 3. normalizers so each signal is on a 0-1 scale
        double maxBookTrend  = bookTrend.values().stream().mapToDouble(d -> d).max().orElse(1.0);
        double maxGenreTrend = genreTrend.values().stream().mapToDouble(d -> d).max().orElse(1.0);
        if (maxBookTrend  == 0) maxBookTrend  = 1.0;
        if (maxGenreTrend == 0) maxGenreTrend = 1.0;

        // 4. score every candidate book
        List<BookPrediction> results = new ArrayList<>();
        for (Book b : books) {
            // don't recommend books the user already selected
            if (selectedBookIds != null && selectedBookIds.contains(b.getId())) continue;

            String g = genreOf(b);
            double bookComponent  = bookTrend.getOrDefault(b.getId(), 0.0) / maxBookTrend;
            double genreComponent = (g == null ? 0.0 : genreTrend.getOrDefault(g, 0.0)) / maxGenreTrend;
            double similarity     = (g != null && targetGenres.contains(g.trim().toLowerCase())) ? 1.0 : 0.0;

            double raw = W_BOOK_TREND  * bookComponent
                       + W_GENRE_TREND * genreComponent
                       + W_SIMILARITY  * similarity;

            double score = Math.round(raw * 1000.0) / 10.0; // 0-100, one decimal
            long recent = recentBorrows.getOrDefault(b.getId(), 0L);

            results.add(new BookPrediction(
                    b.getId(), b.getTitle(), b.getAuthor(), g,
                    score, recent, !onLoanBookIds.contains(b.getId()),
                    buildReason(g, recent, similarity > 0, genreComponent)
            ));
        }

        // 5. sort by score (then prefer available copies) and take the top N
        return results.stream()
                .sorted(Comparator.comparingDouble(BookPrediction::getScore).reversed()
                        .thenComparing(p -> !p.isAvailable()))
                .limit(limit <= 0 ? 10 : limit)
                .collect(Collectors.toList());
    }

    private String buildReason(String genre, long recent, boolean matchesSelection, double genreComponent) {
        List<String> parts = new ArrayList<>();
        if (recent > 0) {
            parts.add(recent + " borrow" + (recent == 1 ? "" : "s") + " in the last " + RECENT_WINDOW_DAYS + " days");
        }
        if (genre != null && genreComponent > 0.6) parts.add(genre + " is trending");
        if (matchesSelection) parts.add("matches your selected genre");
        if (parts.isEmpty()) parts.add("steady long-term demand");
        return String.join("; ", parts);
    }

    // ---------------------------------------------------------------------
    // ENTITY ADAPTERS - matched to your Book / Transaction entities.
    // ---------------------------------------------------------------------
    private Book bookOf(Transaction t)            { return t.getBook(); }
    private LocalDate borrowDateOf(Transaction t) { return t.getBorrowDate(); }
    private String genreOf(Book b)                { return b.getGenre(); }
    private boolean isOpenLoan(Transaction t)     { return t.getReturnDate() == null; } // not yet returned => currently on loan
}