import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DEMO_ACTORS, ACTIVE_DEMO_ACTOR } from '../../../core/data/demo-actors';
import {
  Ticket,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';
import { TicketActivityPanel } from '../components/ticket-activity-panel/ticket-activity-panel';
import { TicketManagementPanel } from '../components/ticket-management-panel/ticket-management-panel';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-ticket-detail-page',
  imports: [FormsModule, RouterLink, TicketActivityPanel, TicketManagementPanel],
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
  readonly agents = DEMO_ACTORS.filter((actor) => actor.role === 'Agente de suporte');
  readonly activeActor = ACTIVE_DEMO_ACTOR;
  readonly ticket = computed(() =>
    this.ticketService.tickets().find((item) => item.id === this.ticketId()),
  );
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
