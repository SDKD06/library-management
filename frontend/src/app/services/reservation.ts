import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
  book: { id: number; title: string; author?: string; genre?: string };
  member: { id: number; name: string };
  requestDate: string;
  decisionDate?: string;
  status: string; // PENDING, APPROVED, REJECTED
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/reservations';

  getAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.base);
  }

  request(bookId: number, memberId: number): Observable<Reservation> {
    return this.http.post<Reservation>(this.base, { bookId, memberId });
  }

  approve(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.base}/${id}/approve`, {});
  }

  reject(id: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.base}/${id}/reject`, {});
  }
}
