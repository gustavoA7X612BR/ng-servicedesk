import { Routes } from '@angular/router';
import { AgentQueuePage } from './features/tickets/pages/agent-queue-page';
import { DashboardPage } from './features/tickets/pages/dashboard-page';
import { PostDetailPage } from './features/tickets/pages/post-detail-page';
import { PostsListPage } from './features/tickets/pages/posts-list-page';
import { TicketDetailPage } from './features/tickets/pages/ticket-detail-page';
import { TicketFormPage } from './features/tickets/pages/ticket-form-page';
import { TicketsListPage } from './features/tickets/pages/tickets-list-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'tickets', component: TicketsListPage },
  { path: 'tickets/new', component: TicketFormPage },
  { path: 'tickets/:id', component: TicketDetailPage },
  { path: 'service', component: AgentQueuePage },
  // Keep the original publication demo available at its previous routes.
  { path: 'posts', component: PostsListPage },
  { path: 'posts/:id', component: PostDetailPage },
  { path: '**', redirectTo: 'dashboard' },
];
