import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prediction, BookPrediction } from '../../services/prediction';

@Component({
  selector: 'app-predictor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './predictor.html',
  styleUrl: './predictor.scss',
})
export class Predictor implements OnInit {
  private predictionService = inject(Prediction);

  predictions = signal<BookPrediction[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  genreInput = '';
  limit = 10;

  // --- summary stats for the gradient cards (computed from the loaded list) ---
  topPick = computed<BookPrediction | null>(() => this.predictions()[0] ?? null);

  hottestGenre = computed<string | null>(() => {
    const totals = new Map<string, number>();
    for (const p of this.predictions()) {
      if (!p.genre) continue;
      totals.set(p.genre, (totals.get(p.genre) ?? 0) + p.score);
    }
    let best: string | null = null;
    let max = -1;
    for (const [genre, value] of totals) {
      if (value > max) {
        max = value;
        best = genre;
      }
    }
    return best;
  });

  availableCount = computed(() => this.predictions().filter((p) => p.available).length);

  ngOnInit(): void {
    this.loadTop();
  }

  loadTop(): void {
    this.loading.set(true);
    this.error.set(null);
    this.predictionService.getTop(this.limit).subscribe({
      next: (data) => {
        this.predictions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load predictions. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  runPrediction(): void {
    const genres = this.genreInput
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    this.loading.set(true);
    this.error.set(null);
    this.predictionService.predict({ genres, limit: this.limit }).subscribe({
      next: (data) => {
        this.predictions.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load predictions. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  clearFilter(): void {
    this.genreInput = '';
    this.loadTop();
  }
}