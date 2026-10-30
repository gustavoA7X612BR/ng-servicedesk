import { TestBed } from '@angular/core/testing';

import { TICKET_STORAGE, TicketStorageAdapter } from '../../../core/services/ticket-storage';
import { TicketCategory, TicketHistoryEventType, TicketOrigin, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { TicketRepositoryService, TicketStorageError } from './ticket-repository.service';

describe('TicketRepositoryService', () => {
  let repository: TicketRepositoryService;
  let values: Map<string, string>;

  function setup(adapter?: Partial<TicketStorageAdapter>): void {
    values = new Map();
    const storage: TicketStorageAdapter = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
      removeItem: (key) => values.delete(key),
      ...adapter,
    };
    TestBed.configureTestingModule({ providers: [{ provide: TICKET_STORAGE, useValue: storage }] });
    repository = TestBed.inject(TicketRepositoryService);
  }

  const ticket = {
    id: 'ticket-local-1',
    title: 'VPN indisponível',
    description: 'Não conecta à VPN.',
    requester: 'Camila Nunes',
    requesterEmail: 'camila@example.com',
    category: TicketCategory.Network,
    priority: TicketPriority.High,
    status: TicketStatus.Open,
    createdAt: '2026-10-30T12:00:00.000Z',
    updatedAt: '2026-10-30T12:00:00.000Z',
    history: [
      {
        id: 'event-1',
        type: TicketHistoryEventType.Created,
        description: 'Ticket criado.',
        author: 'Rafael Martins',
        createdAt: '2026-10-30T12:00:00.000Z',
      },
    ],
    origin: TicketOrigin.Local,
  };

  it('loads an empty collection when no data has been saved', () => {
    setup();
    expect(repository.load()).toEqual([]);
  });

  it('persists and restores tickets using a versioned envelope', () => {
    setup();
    repository.save([ticket]);

    expect(repository.load()).toEqual([ticket]);
  });

  it('reports corrupt data and preserves the stored value', () => {
    setup();
    values.set('ng-servicedesk.tickets', '{broken');

    expect(() => repository.load()).toThrowError(TicketStorageError);
    expect(values.get('ng-servicedesk.tickets')).toBe('{broken');
  });

  it('reports incompatible schema versions without overwriting them', () => {
    setup();
    const oldData = JSON.stringify({ version: 7, tickets: [] });
    values.set('ng-servicedesk.tickets', oldData);

    expect(() => repository.load()).toThrowError(/incompatível/);
    expect(values.get('ng-servicedesk.tickets')).toBe(oldData);
  });

  it('rejects invalid tickets in storage', () => {
    setup();
    values.set('ng-servicedesk.tickets', JSON.stringify({ version: 1, tickets: [{ id: 'missing-fields' }] }));

    expect(() => repository.load()).toThrowError(/inválidos/);
  });

  it('rejects duplicate ticket IDs in storage', () => {
    setup();
    values.set('ng-servicedesk.tickets', JSON.stringify({ version: 1, tickets: [ticket, ticket] }));

    expect(() => repository.load()).toThrowError(/inválidos/);
  });

  it('surfaces storage write failures', () => {
    setup({ setItem: () => { throw new Error('quota'); } });

    expect(() => repository.save([ticket])).toThrowError(TicketStorageError);
  });
});
