import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BookService } from '../../services/book';
import { MemberService } from '../../services/member';
import { TransactionService, Transaction } from '../../services/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  totalBooks = 0;
  totalMembers = 0;
  activeMembers = 0;
  borrowedBooks = 0;
  overdueBooks = 0;
  recentTransactions: Transaction[] = [];
  categories = [
    { name: 'Fiction', count: 0, percentage: 0, color: '#2563eb' },
    { name: 'Science', count: 0, percentage: 0, color: '#10b981' },
    { name: 'History', count: 0, percentage: 0, color: '#f59e0b' },
    { name: 'Romance', count: 0, percentage: 0, color: '#8b5cf6' },
    { name: 'Mystery', count: 0, percentage: 0, color: '#ef4444' },
    { name: 'Biography', count: 0, percentage: 0, color: '#06b6d4' },
  ];

  constructor(
    private bookService: BookService,
    private memberService: MemberService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.bookService.getAll().subscribe({
      next: (books) => {
        this.totalBooks = books.length;
        const genreColors: any = {
          'Fiction': '#2563eb',
          'Science': '#10b981',
          'History': '#f59e0b',
          'Romance': '#8b5cf6',
          'Mystery': '#ef4444',
          'Biography': '#06b6d4',
          'Technology': '#f97316',
          'Philosophy': '#84cc16'
        };
        const genreCounts: any = {};
        books.forEach(b => {
          if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
        });
        const max = Math.max(...Object.values(genreCounts) as number[], 1);
        this.categories = Object.keys(genreCounts).map(name => ({
      name,
      count: genreCounts[name],
      percentage: Math.round((genreCounts[name] / max) * 100),
       color: genreColors[name] || '#2563eb'
      }));
      this.cdr.detectChanges();
    }
  });

    this.memberService.getAll().subscribe({
      next: (members) => {
        this.totalMembers = members.length;
        this.activeMembers = members.filter(m => m.status === 'ACTIVE').length;
        this.cdr.detectChanges();
      }
    });

    this.transactionService.getAll().subscribe({
      next: (transactions) => {
        this.borrowedBooks = transactions.filter(t => t.status === 'ACTIVE' || t.status === 'OVERDUE').length;
        this.overdueBooks = transactions.filter(t => t.status === 'OVERDUE').length;
        this.recentTransactions = transactions.slice(-4).reverse();
        this.cdr.detectChanges();
      }
    });
  }
}