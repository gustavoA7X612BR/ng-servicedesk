import {
  NewTicketInput,
  Ticket,
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';
import { createTicket } from '../../../core/models/ticket-factory';

const defaults: NewTicketInput = {
  title: 'Falha no acesso',
  description: 'O usuário não consegue entrar no sistema.',
  requester: 'Camila Nunes',
  requesterEmail: 'camila@example.com',
  category: TicketCategory.Access,
  priority: TicketPriority.High,
};

export function makeTestTicket(overrides: Partial<Ticket> = {}, id = 'ticket-1'): Ticket {
  const ticket = createTicket(
    defaults,
    'John Doe',
    '2026-10-29T12:00:00.000Z',
    (prefix) => `${prefix}-1`,
  );
  return {
    ...ticket,
    id,
    history: [{ ...ticket.history[0], id: `event-${id}` }, ...ticket.history.slice(1)],
    ...overrides,
  };
}

export function makeDemoTicket(id: number): Ticket {
  return makeTestTicket(
    {
      id: `demo-${id}`,
      title: `Publicação demonstrativa ${id}`,
      origin: TicketOrigin.JsonPlaceholder,
      externalPostId: id,
      status: TicketStatus.Open,
    },
    `demo-${id}`,
  );
}

export function changeTicketStatus(ticket: Ticket, status: TicketStatus): Ticket {
  const createdAt = '2026-10-30T12:00:00.000Z';
  return {
    ...ticket,
    status,
    updatedAt: createdAt,
    history: [
      ...ticket.history,
      {
        id: `event-${ticket.history.length + 1}`,
        type:
          status === TicketStatus.Resolved
            ? TicketHistoryEventType.Resolved
            : TicketHistoryEventType.StatusChanged,
        description: `Status alterado para “${status}”.`,
        author: 'John Doe',
        createdAt,
      },
    ],
  };
}
