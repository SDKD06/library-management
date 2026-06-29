import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService, Reservation } from '../../services/reservation';
import { BookService } from '../../services/book';
import { MemberService } from '../../services/member';

@Component({
  selector: 'app-reservation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-list.html',
  styleUrl: './reservation-list.scss',
})
export class ReservationList implements OnInit {
  private reservationService = inject(ReservationService);
  private bookService = inject(BookService);
  private memberService = inject(MemberService);

  reservations = signal<Reservation[]>([]);
  books = signal<any[]>([]);
  members = signal<any[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  selectedBookId: number | null = null;
  selectedMemberId: number | null = null;

  pendingCount = computed(() => this.reservations().filter((r) => r.status === 'PENDING').length);

  ngOnInit(): void {
    this.load();
    this.bookService.getAll().subscribe({ next: (b) => this.books.set(b) });
    this.memberService.getAll().subscribe({ next: (m) => this.members.set(m) });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reservationService.getAll().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load reservations. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  submitRequest(): void {
    if (!this.selectedBookId || !this.selectedMemberId) {
      this.error.set('Please choose both a book and a member.');
      return;
    }
    this.reservationService.request(this.selectedBookId, this.selectedMemberId).subscribe({
      next: () => {
        this.selectedBookId = null;
        this.selectedMemberId = null;
        this.load();
      },
      error: () => this.error.set('Could not create the reservation.'),
    });
  }

  approve(r: Reservation): void {
    this.reservationService.approve(r.id).subscribe({ next: () => this.load() });
  }

  reject(r: Reservation): void {
    this.reservationService.reject(r.id).subscribe({ next: () => this.load() });
  }
}
