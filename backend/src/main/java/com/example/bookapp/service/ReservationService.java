package com.example.bookapp.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.bookapp.entity.Book;
import com.example.bookapp.entity.Member;
import com.example.bookapp.entity.Reservation;
import com.example.bookapp.repository.BookRepository;
import com.example.bookapp.repository.MemberRepository;
import com.example.bookapp.repository.ReservationRepository;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              BookRepository bookRepository,
                              MemberRepository memberRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    public List<Reservation> getAll() {
        return reservationRepository.findByOrderByRequestDateDesc();
    }

    /** A member requests a book -> creates a PENDING reservation. */
    public Reservation request(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        Reservation r = new Reservation();
        r.setBook(book);
        r.setMember(member);
        r.setRequestDate(LocalDate.now());
        r.setStatus("PENDING");
        return reservationRepository.save(r);
    }

    public Reservation approve(Long id) {
        return decide(id, "APPROVED");
    }

    public Reservation reject(Long id) {
        return decide(id, "REJECTED");
    }

    private Reservation decide(Long id, String status) {
        Reservation r = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
        r.setStatus(status);
        r.setDecisionDate(LocalDate.now());
        return reservationRepository.save(r);
    }
}
