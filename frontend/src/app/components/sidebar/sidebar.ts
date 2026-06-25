import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent {
  constructor(private router: Router, public authService: AuthService) {}

  openAddBook() { this.router.navigate(['/books'], { queryParams: { add: true } }); }
  openAddMember() { this.router.navigate(['/members'], { queryParams: { add: true } }); }
  generateReport() { this.router.navigate(['/reports']); }
  logout() { this.authService.logout(); }
}