import {
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from './ticket.model';
import { createTicket } from './ticket-factory';

describe('createTicket', () => {
  it('creates a local open ticket with a creation history event', () => {
    const idFactory = (prefix: string) => `${prefix}-test`;
    const ticket = createTicket(
      {
        title: 'Notebook não inicia',
        description: 'O equipamento não liga após a atualização.',
        requester: 'Camila Nunes',
        requesterEmail: 'camila@example.com',
        category: TicketCategory.Hardware,
        priority: TicketPriority.High,
      },
      'John Doe',
      '2026-10-30T12:00:00.000Z',
      idFactory,
    );

    expect(ticket).toMatchObject({
      id: 'ticket-test',
      status: TicketStatus.Open,
      origin: TicketOrigin.Local,
      createdAt: '2026-10-30T12:00:00.000Z',
      updatedAt: '2026-10-30T12:00:00.000Z',
    });
    expect(ticket.history).toHaveLength(1);
    expect(ticket.history[0]).toMatchObject({
      id: 'event-test',
      type: TicketHistoryEventType.Created,
      author: 'John Doe',
    });
  });
});
