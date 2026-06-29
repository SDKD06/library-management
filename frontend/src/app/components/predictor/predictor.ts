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

  // --- summary stats for the gradient cards ---
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

  // --- bar-chart geometry (plain SVG, no library) ---
  private readonly CHART = { w: 720, h: 320, padL: 44, padR: 16, padT: 28, padB: 64 };
  private readonly GENRE_COLORS: Record<string, string> = {
    fiction: '#2563eb',
    science: '#10b981',
    history: '#f59e0b',
    romance: '#8b5cf6',
    mystery: '#ef4444',
    biography: '#06b6d4',
    technology: '#f97316',
    philosophy: '#84cc16',
  };
  private readonly PALETTE = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#84cc16'];

  chart = computed(() => {
    const preds = this.predictions();
    const { w, h, padL, padR, padT, padB } = this.CHART;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const maxScore = 100; // scores are normalized 0-100

    // assign a stable colour per genre
    const genreColor = new Map<string, string>();
    let pi = 0;
    for (const p of preds) {
      const key = (p.genre ?? '').trim().toLowerCase();
      if (!genreColor.has(key)) {
        genreColor.set(key, this.GENRE_COLORS[key] ?? this.PALETTE[pi++ % this.PALETTE.length]);
      }
    }

    const n = preds.length;
    const slot = n > 0 ? plotW / n : plotW;
    const barW = Math.min(54, slot * 0.6);

    const bars = preds.map((p, i) => {
      const key = (p.genre ?? '').trim().toLowerCase();
      const barH = (p.score / maxScore) * plotH;
      return {
        x: padL + slot * i + (slot - barW) / 2,
        y: padT + (plotH - barH),
        w: barW,
        h: barH,
        color: genreColor.get(key)!,
        score: p.score,
        labelX: padL + slot * i + slot / 2,
        label: this.truncate(p.title, 9),
        title: p.title,
        genre: p.genre,
        top: i === 0,
      };
    });

    const ticks = [0, 25, 50, 75, 100].map((v) => ({
      v,
      y: padT + plotH - (v / maxScore) * plotH,
    }));

    const legend = Array.from(genreColor.entries())
      .filter(([k]) => k.length > 0)
      .map(([k, color]) => ({ color, name: this.capitalize(k) }));

    return { w, h, padL, padR, padT, padB, plotW, plotH, bars, ticks, legend, baselineY: padT + plotH };
  });

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

  private truncate(s: string, n: number): string {
    if (!s) return '';
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  private capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  }
}
