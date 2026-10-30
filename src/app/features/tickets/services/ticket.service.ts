import { Injectable, inject, signal } from '@angular/core';

import { createHistoryEvent, createTicket } from '../../../core/models/ticket-factory';
import {
  NewTicketInput,
  Ticket,
  TicketHistoryEventType,
  TicketList,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';
import { TicketRepositoryService, TicketStorageError } from './ticket-repository.service';

@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly repository = inject(TicketRepositoryService);

  readonly tickets = signal<TicketList>([]);
  readonly storageError = signal<string | null>(null);

  constructor() {
    this.reload();
  }

  reload(): void {
    try {
      this.tickets.set(this.repository.load());
      this.storageError.set(null);
    } catch (error) {
      this.storageError.set(this.getErrorMessage(error));
    }
  }

  create(input: NewTicketInput, author: string): Ticket {
    const ticket = createTicket(input, author);
    this.commit([ticket, ...this.tickets()]);
    return ticket;
  }

  importDemonstrationTickets(importedTickets: Ticket[]): number {
    const existingReferences = new Set(
      this.tickets()
        .filter(
          (ticket) =>
            ticket.origin === TicketOrigin.JsonPlaceholder && ticket.externalPostId !== undefined,
        )
        .map((ticket) => ticket.externalPostId),
    );
    const additions = importedTickets.filter((ticket) => {
      if (
        ticket.origin !== TicketOrigin.JsonPlaceholder ||
        ticket.externalPostId === undefined ||
        existingReferences.has(ticket.externalPostId)
      ) {
        return false;
      }
      existingReferences.add(ticket.externalPostId);
      return true;
    });
    if (additions.length === 0) return 0;

    this.commit([...additions, ...this.tickets()]);
    return additions.length;
  }

  changeStatus(ticketId: string, status: TicketStatus, author: string): Ticket {
    const eventType =
      status === TicketStatus.Resolved
        ? TicketHistoryEventType.Resolved
        : status === TicketStatus.Closed
          ? TicketHistoryEventType.Closed
          : TicketHistoryEventType.StatusChanged;
    return this.update(
      ticketId,
      author,
      `Status alterado para “${status}”.`,
      eventType,
      (ticket) => ({
        ...ticket,
        status,
      }),
    );
  }

  changePriority(ticketId: string, priority: TicketPriority, author: string): Ticket {
    return this.update(
      ticketId,
      author,
      `Prioridade alterada para “${priority}”.`,
      TicketHistoryEventType.PriorityChanged,
      (ticket) => ({ ...ticket, priority }),
    );
  }

  assignAgent(ticketId: string, agentId: string | null, author: string): Ticket {
    const description = agentId
      ? `Ticket atribuído ao agente ${agentId}.`
      : 'Agente removido do ticket.';
    return this.update(
      ticketId,
      author,
      description,
      TicketHistoryEventType.AgentAssigned,
      (ticket) => ({ ...ticket, assignedAgent: agentId ?? undefined }),
    );
  }

  addComment(ticketId: string, comment: string, author: string): Ticket {
    const normalizedComment = comment.trim();
    if (!normalizedComment) throw new Error('O comentário não pode ficar vazio.');
    return this.update(
      ticketId,
      author,
      normalizedComment,
      TicketHistoryEventType.CommentAdded,
      (ticket) => ticket,
    );
  }

  resolve(ticketId: string, author: string): Ticket {
    return this.changeStatus(ticketId, TicketStatus.Resolved, author);
  }

  close(ticketId: string, author: string): Ticket {
    return this.changeStatus(ticketId, TicketStatus.Closed, author);
  }

  delete(ticketId: string): void {
    const ticket = this.getById(ticketId);
    if (!ticket) return;
    this.commit(this.tickets().filter((current) => current.id !== ticketId));
  }

  getById(ticketId: string): Ticket | undefined {
    return this.tickets().find((ticket) => ticket.id === ticketId);
  }

  private update(
    ticketId: string,
    author: string,
    description: string,
    eventType: TicketHistoryEventType,
    apply: (ticket: Ticket) => Ticket,
  ): Ticket {
    const existing = this.getById(ticketId);
    if (!existing) throw new Error('Ticket não encontrado.');
    const updatedAt = new Date(
      Math.max(Date.now(), Date.parse(existing.updatedAt) + 1),
    ).toISOString();
    const event = createHistoryEvent(eventType, description, author, updatedAt);
    const updated: Ticket = {
      ...apply(existing),
      updatedAt,
      history: [...existing.history, event],
    };

    this.commit(this.tickets().map((ticket) => (ticket.id === ticketId ? updated : ticket)));
    return updated;
  }

  private commit(tickets: TicketList): void {
    if (this.storageError()) {
      throw new TicketStorageError(
        'unavailable',
        this.storageError() ?? 'Armazenamento indisponível.',
      );
    }

    try {
      this.repository.save(tickets);
      this.tickets.set(tickets);
    } catch (error) {
      this.storageError.set(this.getErrorMessage(error));
      throw error;
    }
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha inesperada no armazenamento local.';
  }
}
