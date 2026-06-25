import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: number;
  book: { id: number; title?: string; author?: string };
  member: { id: number; name?: string };
  borrowDate: string;
  returnDate?: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/transactions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Transaction[]> { return this.http.get<Transaction[]>(this.apiUrl); }
  create(t: Transaction): Observable<Transaction> { return this.http.post<Transaction>(this.apiUrl, t); }
  update(id: number, t: Transaction): Observable<Transaction> { return this.http.put<Transaction>(`${this.apiUrl}/${id}`, t); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}