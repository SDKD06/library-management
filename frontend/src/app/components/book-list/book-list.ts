import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookService } from '../../services/book';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.scss']
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  showModal = false;
  isEditing = false;
  currentBook: Book = { title: '', author: '', genre: '' };
  searchTerm = '';

  constructor(private bookService: BookService, private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadBooks();
    this.route.queryParams.subscribe(p => { if (p['add']) this.openAdd(); });
  }

  loadBooks() {
    this.bookService.getAll().subscribe({
      next: (b) => { this.books = b; this.cdr.detectChanges(); },
      error: (err) => console.error('Error:', err)
    });
  }

  get filteredBooks() {
    return this.books.filter(b =>
      (b.title ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.author ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (b.genre ?? '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openAdd() { this.isEditing = false; this.currentBook = { title: '', author: '', genre: '' }; this.showModal = true; }
  openEdit(book: Book) { this.isEditing = true; this.currentBook = { ...book }; this.showModal = true; }
  closeModal() { this.showModal = false; this.cdr.detectChanges(); }

  save() {
    if (!this.currentBook.title || !this.currentBook.author) return;
    if (this.isEditing && this.currentBook.id) {
      this.bookService.update(this.currentBook.id, this.currentBook).subscribe({
        next: () => { this.closeModal(); this.loadBooks(); },
        error: (err) => console.error('Error:', err)
      });
    } else {
      this.bookService.create(this.currentBook).subscribe({
        next: () => { this.closeModal(); this.loadBooks(); },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this book?')) {
      this.bookService.delete(id).subscribe({
        next: () => this.loadBooks(),
        error: (err) => console.error('Error:', err)
      });
    }
  }
}