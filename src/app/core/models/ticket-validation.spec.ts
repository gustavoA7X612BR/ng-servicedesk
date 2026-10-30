import {
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from './ticket.model';
import { isTicket } from './ticket-validation';

describe('isTicket', () => {
  const validTicket = {
    id: 'ticket-1',
    title: 'Acesso indisponível',
    description: 'Não consigo acessar a ferramenta.',
    requester: 'Camila Nunes',
    requesterEmail: 'camila@example.com',
    category: TicketCategory.Access,
    priority: TicketPriority.Medium,
    status: TicketStatus.Open,
    createdAt: '2026-10-30T12:00:00.000Z',
    updatedAt: '2026-10-30T12:00:00.000Z',
    history: [
      {
        id: 'event-1',
        type: TicketHistoryEventType.Created,
        description: 'Ticket criado.',
        author: 'John Doe',
        createdAt: '2026-10-30T12:00:00.000Z',
      },
    ],
    origin: TicketOrigin.Local,
  };

  it('accepts a valid ticket and optional agent', () => {
    expect(isTicket(validTicket)).toBe(true);
    expect(isTicket({ ...validTicket, assignedAgent: 'support-agent-01' })).toBe(true);
  });

  it('rejects unknown enum values and invalid history events', () => {
    expect(isTicket({ ...validTicket, status: 'waiting' })).toBe(false);
    expect(isTicket({ ...validTicket, history: [{ ...validTicket.history[0], type: 'random' }] })).toBe(false);
  });

  it('rejects malformed values', () => {
    expect(isTicket(null)).toBe(false);
    expect(isTicket({ ...validTicket, createdAt: 'not a date' })).toBe(false);
    expect(isTicket({ ...validTicket, requesterEmail: 'not-an-email' })).toBe(false);
    expect(isTicket({ ...validTicket, title: '   ' })).toBe(false);
  });
});
