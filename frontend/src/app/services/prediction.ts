import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BookPrediction {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  score: number;
  recentBorrows: number;
  available: boolean;
  reason: string;
}

@Injectable({ providedIn: 'root' })
export class Prediction {
  private http = inject(HttpClient);

  // Align this with the base URL your other services (book.ts, transaction.ts) use.
  private base = 'http://localhost:8080/predictions';

  /** Overall trending books. */
  getTop(limit = 10): Observable<BookPrediction[]> {
    return this.http.get<BookPrediction[]>(`${this.base}?limit=${limit}`);
  }

  /** Predictions biased toward selected books and/or genres. */
  predict(payload: { bookIds?: number[]; genres?: string[]; limit?: number }): Observable<BookPrediction[]> {
    return this.http.post<BookPrediction[]>(this.base, payload);
  }
}