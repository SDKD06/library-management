import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../services/book';
import { MemberService } from '../../services/member';
import { TransactionService, Transaction } from '../../services/transaction';
import { Book } from '../../models/book.model';
import { Member } from '../../services/member';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class ReportsComponent implements OnInit {
  totalBooks = 0;
  totalMembers = 0;
  totalTransactions = 0;
  activeTransactions = 0;
  completedTransactions = 0;
  overdueTransactions = 0;

  topBooks: { book: Book; count: number }[] = [];
  topMembers: { member: Member; count: number }[] = [];
  overdueList: Transaction[] = [];
  allTransactions: Transaction[] = [];

  constructor(
    private bookService: BookService,
    private memberService: MemberService,
    private transactionService: TransactionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.bookService.getAll().subscribe({
      next: (books) => { this.totalBooks = books.length; this.cdr.detectChanges(); }
    });

    this.memberService.getAll().subscribe({
      next: (members) => { this.totalMembers = members.length; this.cdr.detectChanges(); }
    });

    this.transactionService.getAll().subscribe({
      next: (transactions) => {
        this.allTransactions = transactions;
        this.totalTransactions = transactions.length;
        this.activeTransactions = transactions.filter(t => t.status === 'ACTIVE').length;
        this.completedTransactions = transactions.filter(t => t.status === 'COMPLETED').length;
        this.overdueTransactions = transactions.filter(t => t.status === 'OVERDUE').length;
        this.overdueList = transactions.filter(t => t.status === 'OVERDUE');

        // Top borrowed books
        const bookCount: any = {};
        transactions.forEach(t => {
          const key = t.book.id;
          if (!bookCount[key]) bookCount[key] = { book: t.book, count: 0 };
          bookCount[key].count++;
        });
        this.topBooks = Object.values(bookCount)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5) as any;

        // Top active members
        const memberCount: any = {};
        transactions.forEach(t => {
          const key = t.member.id;
          if (!memberCount[key]) memberCount[key] = { member: t.member, count: 0 };
          memberCount[key].count++;
        });
        this.topMembers = Object.values(memberCount)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5) as any;

        this.cdr.detectChanges();
      }
    });
  }
}