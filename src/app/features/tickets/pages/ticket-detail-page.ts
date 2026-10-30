import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEMO_ACTORS, ACTIVE_DEMO_ACTOR } from '../../../core/data/demo-actors';
import {
  Ticket,
  TicketHistoryEventType,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './ticket-detail-page.html',
  styleUrl: './ticket-detail-page.scss',
})
export class TicketDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ticketService = inject(TicketService);
  readonly ticketId = signal('');
  readonly createdNotice = signal(false);
  readonly actionError = signal('');
  readonly comment = signal('');
  readonly commentError = signal('');
  readonly statuses = Object.values(TicketStatus);
  readonly priorities = Object.values(TicketPriority);
  readonly agents = DEMO_ACTORS.filter((actor) => actor.role === 'Agente de suporte');
  readonly activeActor = ACTIVE_DEMO_ACTOR;
  readonly ticket = computed(() =>
    this.ticketService.tickets().find((item) => item.id === this.ticketId()),
  );
  readonly history = computed(() => [...(this.ticket()?.history ?? [])].reverse());
  readonly storageError = this.ticketService.storageError;

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.ticketId.set(params.get('id') ?? '');
      this.actionError.set('');
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.createdNotice.set(params.get('created') === '1');
    });
  }

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

  changeStatus(value: string): void {
    this.perform(() =>
      this.ticketService.changeStatus(
        this.ticketId(),
        value as TicketStatus,
        this.activeActor.displayName,
      ),
    );
  }
  changePriority(value: string): void {
    this.perform(() =>
      this.ticketService.changePriority(
        this.ticketId(),
        value as TicketPriority,
        this.activeActor.displayName,
      ),
    );
  }
  assignAgent(value: string): void {
    this.perform(() =>
      this.ticketService.assignAgent(this.ticketId(), value || null, this.activeActor.displayName),
    );
  }

  addComment(): void {
    this.commentError.set('');
    if (!this.comment().trim()) {
      this.commentError.set('Escreva um comentário antes de adicionar.');
      return;
    }
    try {
      this.ticketService.addComment(this.ticketId(), this.comment(), this.activeActor.displayName);
      this.comment.set('');
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    }
  }

  resolve(): void {
    this.changeStatus(TicketStatus.Resolved);
  }
  close(): void {
    this.changeStatus(TicketStatus.Closed);
  }

  deleteTicket(): void {
    if (
      !this.ticket() ||
      !globalThis.confirm('Excluir este ticket deste navegador? Esta ação não pode ser desfeita.')
    )
      return;
    try {
      this.ticketService.delete(this.ticketId());
      void this.router.navigate(['/tickets']);
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    }
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

  private perform(action: () => Ticket): void {
    this.actionError.set('');
    try {
      action();
    } catch (error) {
      this.actionError.set(this.errorMessage(error));
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Não foi possível atualizar o ticket.';
  }
}
