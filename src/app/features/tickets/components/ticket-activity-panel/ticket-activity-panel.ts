import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Ticket, TicketHistoryEventType } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-activity-panel',
  imports: [DatePipe],
  templateUrl: './ticket-activity-panel.html',
  styleUrl: './ticket-activity-panel.scss',
})
export class TicketActivityPanel {
  @Input({ required: true }) ticket!: Ticket;

  get history() {
    return [...this.ticket.history].reverse();
  }

  eventLabel(type: TicketHistoryEventType): string {
    const labels: Record<TicketHistoryEventType, string> = {
      [TicketHistoryEventType.Created]: 'Ticket criado',
      [TicketHistoryEventType.Imported]: 'Importação demonstrativa',
      [TicketHistoryEventType.StatusChanged]: 'Status atualizado',
      [TicketHistoryEventType.PriorityChanged]: 'Prioridade atualizada',
      [TicketHistoryEventType.AgentAssigned]: 'Responsável atualizado',
      [TicketHistoryEventType.CommentAdded]: 'Comentário',
      [TicketHistoryEventType.Resolved]: 'Ticket resolvido',
      [TicketHistoryEventType.Closed]: 'Ticket fechado',
    };
    return labels[type];
  }
}
