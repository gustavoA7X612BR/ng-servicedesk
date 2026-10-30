import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketCategory, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tickets-list-page',
  imports: [DatePipe, FormsModule, RouterLink, PaginationComponent],
  templateUrl: './tickets-list-page.html',
  styleUrl: './tickets-list-page.scss',
})
export class TicketsListPage {
  private readonly ticketService = inject(TicketService);
  readonly tickets = this.ticketService.tickets;
  readonly storageError = this.ticketService.storageError;
  readonly categories = Object.values(TicketCategory);
  readonly priorities = Object.values(TicketPriority);
  readonly statuses = Object.values(TicketStatus);
  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly priorityFilter = signal('');
  readonly categoryFilter = signal('');
  readonly sortBy = signal<'newest' | 'oldest' | 'priority'>('newest');
  readonly currentPage = signal(1);
  readonly pageSize = 8;

  readonly filteredTickets = computed(() => {
    const query = this.search().trim().toLocaleLowerCase('pt-BR');
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const category = this.categoryFilter();
    const priorityRank: Record<TicketPriority, number> = {
      [TicketPriority.Critical]: 0,
      [TicketPriority.High]: 1,
      [TicketPriority.Medium]: 2,
      [TicketPriority.Low]: 3,
    };
    return [...this.tickets()]
      .filter(
        (ticket) =>
          !query ||
          [ticket.title, ticket.description, ticket.requester, ticket.id].some((value) =>
            value.toLocaleLowerCase('pt-BR').includes(query),
          ),
      )
      .filter((ticket) => !status || ticket.status === status)
      .filter((ticket) => !priority || ticket.priority === priority)
      .filter((ticket) => !category || ticket.category === category)
      .sort((a, b) => {
        if (this.sortBy() === 'priority')
          return (
            priorityRank[a.priority] - priorityRank[b.priority] ||
            Date.parse(b.createdAt) - Date.parse(a.createdAt)
          );
        const dateOrder = Date.parse(a.createdAt) - Date.parse(b.createdAt);
        return this.sortBy() === 'newest' ? -dateOrder : dateOrder;
      });
  });
  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.filteredTickets().length / this.pageSize)),
  );
  readonly visibleTickets = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredTickets().slice(start, start + this.pageSize);
  });

  setSearch(value: string): void {
    this.search.set(value);
    this.currentPage.set(1);
  }
  setStatus(value: string): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }
  setPriority(value: string): void {
    this.priorityFilter.set(value);
    this.currentPage.set(1);
  }
  setCategory(value: string): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }
  setSort(value: 'newest' | 'oldest' | 'priority'): void {
    this.sortBy.set(value);
    this.currentPage.set(1);
  }
  clearFilters(): void {
    this.search.set('');
    this.statusFilter.set('');
    this.priorityFilter.set('');
    this.categoryFilter.set('');
    this.sortBy.set('newest');
    this.currentPage.set(1);
  }
  changePage(page: number): void {
    this.currentPage.set(page);
  }
  priorityKey(priority: TicketPriority): string {
    return {
      [TicketPriority.Critical]: 'critical',
      [TicketPriority.High]: 'high',
      [TicketPriority.Medium]: 'medium',
      [TicketPriority.Low]: 'low',
    }[priority];
  }
}
