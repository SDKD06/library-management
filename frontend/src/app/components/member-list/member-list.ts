import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MemberService, Member } from '../../services/member';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-list.html',
  styleUrls: ['./member-list.scss']
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  showModal = false;
  isEditing = false;
  currentMember: Member = { name: '', email: '', phone: '', status: 'ACTIVE' };
  searchTerm = '';

  constructor(private memberService: MemberService, private cdr: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit() {
    this.loadMembers();
  this.route.queryParams.subscribe(p => { if (p['add']) this.openAdd(); });
  }

  loadMembers() {
    this.memberService.getAll().subscribe({
      next: (m) => { this.members = m; this.cdr.detectChanges(); },
      error: (err) => console.error('Error:', err)
    });
  }

  get filteredMembers() {
    return this.members.filter(m =>
      (m.name ?? '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (m.email ?? '').toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openAdd() { this.isEditing = false; this.currentMember = { name: '', email: '', phone: '', status: 'ACTIVE' }; this.showModal = true; }
  openEdit(member: Member) { this.isEditing = true; this.currentMember = { ...member }; this.showModal = true; }
  closeModal() { this.showModal = false; this.cdr.detectChanges(); }

  save() {
    if (!this.currentMember.name || !this.currentMember.email) return;
    if (this.isEditing && this.currentMember.id) {
      this.memberService.update(this.currentMember.id, this.currentMember).subscribe({
        next: () => { this.closeModal(); this.loadMembers(); },
        error: (err) => console.error('Error:', err)
      });
    } else {
      this.memberService.create(this.currentMember).subscribe({
        next: () => { this.closeModal(); this.loadMembers(); },
        error: (err) => console.error('Error:', err)
      });
    }
  }

  delete(id: number) {
    if (confirm('Delete this member?')) {
      this.memberService.delete(id).subscribe({
        next: () => this.loadMembers(),
        error: (err) => console.error('Error:', err)
      });
    }
  }
}