import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Prediction, BookPrediction } from '../../services/prediction';
import { MemberService } from '../../services/member';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recommendations.html',
  styleUrl: './recommendations.scss',
})
export class Recommendations implements OnInit {
  private predictionService = inject(Prediction);
  private memberService = inject(MemberService);

  members = signal<any[]>([]);
  recommendations = signal<BookPrediction[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  hasSearched = signal(false);

  selectedMemberId: number | null = null;
  selectedMemberName = '';

  ngOnInit(): void {
    this.memberService.getAll().subscribe({
      next: (m) => this.members.set(m),
      error: () => this.error.set('Could not load members. Is the backend running?'),
    });
  }

  recommend(): void {
    if (!this.selectedMemberId) {
      this.error.set('Please choose a member first.');
      return;
    }
    const member = this.members().find((m) => m.id === this.selectedMemberId);
    this.selectedMemberName = member ? member.name : '';

    this.loading.set(true);
    this.error.set(null);
    this.hasSearched.set(true);
    this.predictionService.recommendForMember(this.selectedMemberId, 6).subscribe({
      next: (data) => {
        this.recommendations.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load recommendations.');
        this.loading.set(false);
      },
    });
  }
}
