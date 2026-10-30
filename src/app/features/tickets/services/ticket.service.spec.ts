import { TestBed } from '@angular/core/testing';

import { TICKET_STORAGE, TicketStorageAdapter } from '../../../core/services/ticket-storage';
import {
  NewTicketInput,
  Ticket,
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from '../../../core/models/ticket.model';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let service: TicketService;
  let storageValues: Map<string, string>;

  const input: NewTicketInput = {
    title: 'Falha no monitor',
    description: 'A tela fica preta após alguns minutos.',
    requester: 'Camila Nunes',
    requesterEmail: 'camila@example.com',
    category: TicketCategory.Hardware,
    priority: TicketPriority.High,
  };

  function setup(): void {
    storageValues = new Map();
    const storage: TicketStorageAdapter = {
      getItem: (key) => storageValues.get(key) ?? null,
      setItem: (key, value) => storageValues.set(key, value),
      removeItem: (key) => storageValues.delete(key),
    };
    TestBed.configureTestingModule({ providers: [{ provide: TICKET_STORAGE, useValue: storage }] });
    service = TestBed.inject(TicketService);
  }

  function createTicket(): Ticket {
    return service.create(input, 'Rafael Martins');
  }

  it('creates and persists tickets with an initial creation event', () => {
    setup();
    const ticket = createTicket();

    expect(service.tickets()).toContain(ticket);
    expect(ticket.status).toBe(TicketStatus.Open);
    expect(ticket.history[0].type).toBe(TicketHistoryEventType.Created);
    expect(storageValues.get('ng-servicedesk.tickets')).toContain(ticket.id);
  });

  it('restores saved tickets when a new service instance is initialized', () => {
    setup();
    const savedTicket = createTicket();
    const savedValue = storageValues.get('ng-servicedesk.tickets');
    expect(savedValue).toBeDefined();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: TICKET_STORAGE,
          useValue: {
            getItem: () => savedValue ?? null,
            setItem: () => undefined,
            removeItem: () => undefined,
          },
        },
      ],
    });
    const restored = TestBed.inject(TicketService);

    expect(restored.tickets()).toEqual([savedTicket]);
  });

  it('updates status, priority, assignment, comments and their history', () => {
    setup();
    const ticket = createTicket();

    service.changeStatus(ticket.id, TicketStatus.InProgress, 'Rafael Martins');
    service.changePriority(ticket.id, TicketPriority.Critical, 'Rafael Martins');
    service.assignAgent(ticket.id, 'support-agent-01', 'Rafael Martins');
    service.addComment(ticket.id, '  Verificando o equipamento.  ', 'Rafael Martins');

    const updated = service.getById(ticket.id);
    expect(updated).toMatchObject({
      status: TicketStatus.InProgress,
      priority: TicketPriority.Critical,
      assignedAgent: 'support-agent-01',
    });
    expect(updated?.history.map((event) => event.type)).toEqual([
      TicketHistoryEventType.Created,
      TicketHistoryEventType.StatusChanged,
      TicketHistoryEventType.PriorityChanged,
      TicketHistoryEventType.AgentAssigned,
      TicketHistoryEventType.CommentAdded,
    ]);
    expect(updated?.history.at(-1)?.description).toBe('Verificando o equipamento.');
    expect(updated?.updatedAt).not.toBe(ticket.updatedAt);
  });

  it('resolves, closes and deletes tickets', () => {
    setup();
    const ticket = createTicket();

    service.resolve(ticket.id, 'Rafael Martins');
    expect(service.getById(ticket.id)?.status).toBe(TicketStatus.Resolved);
    expect(service.getById(ticket.id)?.history.at(-1)?.type).toBe(TicketHistoryEventType.Resolved);

    service.close(ticket.id, 'Rafael Martins');
    expect(service.getById(ticket.id)?.status).toBe(TicketStatus.Closed);
    expect(service.getById(ticket.id)?.history.at(-1)?.type).toBe(TicketHistoryEventType.Closed);

    service.delete(ticket.id);
    expect(service.tickets()).toEqual([]);
  });

  it('deduplicates imported tickets without replacing local tickets', () => {
    setup();
    const localTicket = createTicket();
    const importedTicket = {
      ...localTicket,
      id: 'demo-post-7',
      title: 'Post demonstrativo',
      externalPostId: 7,
      origin: TicketOrigin.JsonPlaceholder,
    };

    expect(service.importDemonstrationTickets([importedTicket])).toBe(1);
    expect(service.importDemonstrationTickets([{ ...importedTicket, title: 'Alterado' }])).toBe(0);
    expect(service.getById(localTicket.id)).toEqual(localTicket);
    expect(service.getById(importedTicket.id)?.title).toBe('Post demonstrativo');
  });

  it('deduplicates repeated references within the same import batch', () => {
    setup();
    const ticket = createTicket();
    const importedTicket = {
      ...ticket,
      id: 'demo-post-8',
      externalPostId: 8,
      origin: TicketOrigin.JsonPlaceholder,
    };

    expect(
      service.importDemonstrationTickets([
        importedTicket,
        { ...importedTicket, title: 'Duplicado' },
      ]),
    ).toBe(1);
    expect(service.tickets()).toHaveLength(2);
    expect(service.tickets().filter((item) => item.externalPostId === 8)).toHaveLength(1);
  });
});
