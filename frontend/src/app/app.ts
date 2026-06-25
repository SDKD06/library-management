import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="app-layout">
      <app-sidebar *ngIf="authService.isLoggedIn()"></app-sidebar>
      <main [class.main-content]="authService.isLoggedIn()">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class App {
  constructor(public authService: AuthService) {}
}