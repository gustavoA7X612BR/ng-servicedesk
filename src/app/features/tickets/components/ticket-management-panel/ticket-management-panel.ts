import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { DemoActor } from '../../../../core/models/demo-actor.model';
import { Ticket, TicketPriority, TicketStatus } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-management-panel',
  imports: [DatePipe, FormsModule],
  templateUrl: './ticket-management-panel.html',
  styleUrl: './ticket-management-panel.scss',
})
export class TicketManagementPanel {
  @Input({ required: true }) ticket!: Ticket;
  @Input({ required: true }) agents!: readonly DemoActor[];
  @Input() storageError: string | null = null;
  @Output() readonly statusChange = new EventEmitter<string>();
  @Output() readonly priorityChange = new EventEmitter<string>();
  @Output() readonly agentChange = new EventEmitter<string>();
  @Output() readonly resolveTicket = new EventEmitter<void>();
  @Output() readonly closeTicket = new EventEmitter<void>();

  readonly statuses = Object.values(TicketStatus);
  readonly priorities = Object.values(TicketPriority);

  requesterFor(ticket: Ticket): string {
    return ticket.origin === 'jsonplaceholder'
      ? `Usuário demonstrativo ${ticket.requester}`
      : ticket.requester;
  }

  agentName(agentId?: string): string {
    return (
      this.agents.find((agent) => agent.id === agentId)?.displayName ??
      (agentId ? 'Agente demonstrativo' : 'Não atribuído')
    );
  }
}
