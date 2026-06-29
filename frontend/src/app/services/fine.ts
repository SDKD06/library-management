import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Fine {
  id: number;
  transaction: {
    id: number;
    book: { title: string };
    member: { name: string };
    borrowDate?: string;
  };
  amount: number;
  daysOverdue: number;
  createdDate: string;
  status: string; // UNPAID, PAID, WAIVED
}

@Injectable({ providedIn: 'root' })
export class FineService {
  private http = inject(HttpClient);
  private base = 'http://localhost:8080/fines';

  getAll(): Observable<Fine[]> {
    return this.http.get<Fine[]>(this.base);
  }

  generate(): Observable<Fine[]> {
    return this.http.post<Fine[]>(`${this.base}/generate`, {});
  }

  pay(id: number): Observable<Fine> {
    return this.http.put<Fine>(`${this.base}/${id}/pay`, {});
  }

  waive(id: number): Observable<Fine> {
    return this.http.put<Fine>(`${this.base}/${id}/waive`, {});
  }
}
