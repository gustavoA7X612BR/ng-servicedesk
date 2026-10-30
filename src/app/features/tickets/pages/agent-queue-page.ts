import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ACTIVE_DEMO_ACTOR } from '../../../core/data/demo-actors';
import { Ticket, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';

type QueueView = 'all' | 'mine' | 'unassigned';

@Component({
  selector: 'app-agent-queue-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './agent-queue-page.html',
  styleUrl: './agent-queue-page.scss',
})
export class AgentQueuePage {
  private readonly ticketService = inject(TicketService);
  readonly actor = ACTIVE_DEMO_ACTOR;
  readonly statuses = Object.values(TicketStatus);
  readonly storageError = this.ticketService.storageError;
  readonly actionError = signal('');
  readonly view = signal<QueueView>('all');
  readonly tickets = this.ticketService.tickets;
  readonly assignedCount = computed(
    () => this.tickets().filter((ticket) => ticket.assignedAgent === this.actor.id).length,
  );
  readonly unassignedCount = computed(
    () => this.tickets().filter((ticket) => !ticket.assignedAgent).length,
  );
  readonly visibleTickets = computed(() => {
    const current = this.tickets();
    if (this.view() === 'mine')
      return current.filter((ticket) => ticket.assignedAgent === this.actor.id);
    if (this.view() === 'unassigned') return current.filter((ticket) => !ticket.assignedAgent);
    return current;
  });

  setView(view: QueueView): void {
    this.view.set(view);
  }
  assignToMe(ticket: Ticket): void {
    this.perform(() =>
      this.ticketService.assignAgent(ticket.id, this.actor.id, this.actor.displayName),
    );
  }
  changeStatus(ticket: Ticket, status: string): void {
    this.perform(() =>
      this.ticketService.changeStatus(ticket.id, status as TicketStatus, this.actor.displayName),
    );
  }
  priorityKey(priority: TicketPriority): string {
    return {
      [TicketPriority.Critical]: 'critical',
      [TicketPriority.High]: 'high',
      [TicketPriority.Medium]: 'medium',
      [TicketPriority.Low]: 'low',
    }[priority];
  }

  private perform(action: () => Ticket): void {
    this.actionError.set('');
    try {
      action();
    } catch (error) {
      this.actionError.set(
        error instanceof Error ? error.message : 'Não foi possível atualizar o ticket.',
      );
    }
  }
}
