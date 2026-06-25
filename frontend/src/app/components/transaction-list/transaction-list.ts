import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService, Transaction } from '../../services/transaction';
import { BookService } from '../../services/book';
import { Book } from '../../models/book.model';
import { MemberService, Member } from '../../services/member';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrls: ['./transaction-list.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  books: Book[] = [];
  members: Member[] = [];
  showModal = false;
  currentTransaction: Transaction = { book: { id: 0 }, member: { id: 0 }, borrowDate: '', status: 'ACTIVE' };

  constructor(
    private transactionService: TransactionService,
    private bookService: BookService,
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.transactionService.getAll().subscribe({ next: (t) => { this.transactions = t; this.cdr.detectChanges(); } });
    this.bookService.getAll().subscribe({ next: (b) => this.books = b });
    this.memberService.getAll().subscribe({ next: (m) => this.members = m });
  }

  openAdd() {
    this.currentTransaction = { book: { id: 0 }, member: { id: 0 }, borrowDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.cdr.detectChanges(); }

  save() {
    if (!this.currentTransaction.book.id || !this.currentTransaction.member.id) return;
    this.transactionService.create(this.currentTransaction).subscribe({
      next: () => { this.closeModal(); this.loadAll(); },
      error: (err) => console.error('Error:', err)
    });
  }

  returnBook(t: Transaction) {
    const updated = { ...t, status: 'COMPLETED', returnDate: new Date().toISOString().split('T')[0] };
    this.transactionService.update(t.id!, updated).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Error:', err)
    });
  }

  delete(id: number) {
    if (confirm('Delete this transaction?')) {
      this.transactionService.delete(id).subscribe({ next: () => this.loadAll() });
    }
  }

  getStatusClass(status: string) {
    if (status === 'ACTIVE') return 'active';
    if (status === 'COMPLETED') return 'completed';
    return 'overdue';
  }
}