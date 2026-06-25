package com.example.bookapp.controller;

import java.util.List;
import java.util.Set;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookapp.dto.BookPrediction;
import com.example.bookapp.service.PredictionService;

@RestController
@RequestMapping("/predictions") // CORS handled globally in SecurityConfig, so no @CrossOrigin here
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * Top trending books overall.
     * GET /predictions?limit=10
     */
    @GetMapping
    public List<BookPrediction> top(@RequestParam(defaultValue = "10") int limit) {
        return predictionService.predict(null, null, limit);
    }

    /**
     * Predictions biased toward a selection of books and/or genres.
     * POST /predictions
     * Body: { "bookIds": [1,2], "genres": ["Fiction"], "limit": 10 }
     */
    @PostMapping
    public List<BookPrediction> predict(@RequestBody PredictionRequest req) {
        int limit = req.getLimit() == 0 ? 10 : req.getLimit();
        return predictionService.predict(req.getBookIds(), req.getGenres(), limit);
    }

    public static class PredictionRequest {
        private Set<Long> bookIds;
        private Set<String> genres;
        private int limit;

        public Set<Long> getBookIds() { return bookIds; }
        public void setBookIds(Set<Long> bookIds) { this.bookIds = bookIds; }

        public Set<String> getGenres() { return genres; }
        public void setGenres(Set<String> genres) { this.genres = genres; }

        public int getLimit() { return limit; }
        public void setLimit(int limit) { this.limit = limit; }
    }
}