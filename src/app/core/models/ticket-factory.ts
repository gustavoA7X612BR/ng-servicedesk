import {
  NewTicketInput,
  Ticket,
  TicketHistoryEvent,
  TicketHistoryEventType,
  TicketOrigin,
  TicketStatus,
} from './ticket.model';

export type TicketIdFactory = (prefix: string) => string;

export const createTicketId: TicketIdFactory = (prefix) => {
  const randomId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${randomId}`;
};

export function createHistoryEvent(
  type: TicketHistoryEventType,
  description: string,
  author: string,
  createdAt: string,
  idFactory: TicketIdFactory = createTicketId,
): TicketHistoryEvent {
  return { id: idFactory('event'), type, description, author, createdAt };
}

export function createTicket(
  input: NewTicketInput,
  author: string,
  createdAt = new Date().toISOString(),
  idFactory: TicketIdFactory = createTicketId,
): Ticket {
  return {
    ...input,
    id: idFactory('ticket'),
    status: TicketStatus.Open,
    createdAt,
    updatedAt: createdAt,
    history: [
      createHistoryEvent(
        TicketHistoryEventType.Created,
        'Ticket criado.',
        author,
        createdAt,
        idFactory,
      ),
    ],
    origin: TicketOrigin.Local,
  };
}
