import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FineService, Fine } from '../../services/fine';

@Component({
  selector: 'app-fine-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fine-list.html',
  styleUrl: './fine-list.scss',
})
export class FineList implements OnInit {
  private fineService = inject(FineService);

  fines = signal<Fine[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  unpaidTotal = computed(() =>
    this.fines()
      .filter((f) => f.status === 'UNPAID')
      .reduce((sum, f) => sum + f.amount, 0)
  );

  collectedTotal = computed(() =>
    this.fines()
      .filter((f) => f.status === 'PAID')
      .reduce((sum, f) => sum + f.amount, 0)
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.fineService.getAll().subscribe({
      next: (data) => {
        this.fines.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load fines. Is the backend running?');
        this.loading.set(false);
      },
    });
  }

  generate(): void {
    this.loading.set(true);
    this.fineService.generate().subscribe({
      next: (data) => {
        this.fines.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not generate fines.');
        this.loading.set(false);
      },
    });
  }

  pay(f: Fine): void {
    this.fineService.pay(f.id).subscribe({ next: () => this.load() });
  }

  waive(f: Fine): void {
    this.fineService.waive(f.id).subscribe({ next: () => this.load() });
  }
}
