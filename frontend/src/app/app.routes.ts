import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { BookListComponent } from './components/book-list/book-list';
import { MemberListComponent } from './components/member-list/member-list';
import { TransactionListComponent } from './components/transaction-list/transaction-list';
import { ReportsComponent } from './components/reports/reports';
import { LoginComponent } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { Predictor } from './components/predictor/predictor';
import { ReservationList } from './components/reservation-list/reservation-list';
import { FineList } from './components/fine-list/fine-list';
import { Recommendations } from './components/recommendations/recommendations';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'predictor', component: Predictor, canActivate: [authGuard] },
  { path: 'books', component: BookListComponent, canActivate: [authGuard] },
  { path: 'members', component: MemberListComponent, canActivate: [authGuard] },
  { path: 'transactions', component: TransactionListComponent, canActivate: [authGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [authGuard] },
  { path: 'reservations', component: ReservationList, canActivate: [authGuard] },
  { path: 'fines', component: FineList, canActivate: [authGuard] },
  { path: 'recommendations', component: Recommendations, canActivate: [authGuard] },
];