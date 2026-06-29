package com.example.bookapp.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.bookapp.entity.Reservation;
import com.example.bookapp.service.ReservationService;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> getAll() {
        return reservationService.getAll();
    }

    // Body: { "bookId": 1, "memberId": 2 }
    @PostMapping
    public Reservation request(@RequestBody ReservationRequest req) {
        return reservationService.request(req.getBookId(), req.getMemberId());
    }

    @PutMapping("/{id}/approve")
    public Reservation approve(@PathVariable Long id) {
        return reservationService.approve(id);
    }

    @PutMapping("/{id}/reject")
    public Reservation reject(@PathVariable Long id) {
        return reservationService.reject(id);
    }

    public static class ReservationRequest {
        private Long bookId;
        private Long memberId;

        public Long getBookId() { return bookId; }
        public void setBookId(Long bookId) { this.bookId = bookId; }

        public Long getMemberId() { return memberId; }
        public void setMemberId(Long memberId) { this.memberId = memberId; }
    }
}
