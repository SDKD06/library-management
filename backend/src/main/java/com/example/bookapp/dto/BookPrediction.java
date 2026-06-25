package com.example.bookapp.dto;

/**
 * A single predicted book, returned by the demand predictor.
 * score is normalized 0-100.
 */
public class BookPrediction {

    private Long bookId;
    private String title;
    private String author;
    private String genre;
    private double score;          // 0-100, overall predicted demand
    private long recentBorrows;    // borrows within the recency window
    private boolean available;     // is a copy currently available
    private String reason;         // human-readable explanation

    public BookPrediction() {
    }

    public BookPrediction(Long bookId, String title, String author, String genre,
                          double score, long recentBorrows, boolean available, String reason) {
        this.bookId = bookId;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.score = score;
        this.recentBorrows = recentBorrows;
        this.available = available;
        this.reason = reason;
    }

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public long getRecentBorrows() { return recentBorrows; }
    public void setRecentBorrows(long recentBorrows) { this.recentBorrows = recentBorrows; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
