import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TicketStatus } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';
import { AgentQueuePage } from './agent-queue-page';
import { makeTestTicket } from './ticket-page-test-helpers';

describe('AgentQueuePage', () => {
  it('filters to assigned and unassigned tickets and assigns to the active demo agent', async () => {
    const assigned = makeTestTicket({ assignedAgent: 'support-agent-01' }, 'assigned');
    const unassigned = makeTestTicket({}, 'unassigned');
    const tickets = signal([assigned, unassigned]);
    const service = {
      tickets,
      storageError: signal(null),
      assignAgent: vi.fn(),
      changeStatus: vi.fn(),
    };
    await TestBed.configureTestingModule({
      imports: [AgentQueuePage],
      providers: [provideRouter([]), { provide: TicketService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(AgentQueuePage);
    const page = fixture.componentInstance;

    expect(page.visibleTickets()).toHaveLength(2);
    page.setView('mine');
    expect(page.visibleTickets().map((ticket) => ticket.id)).toEqual(['assigned']);
    page.setView('unassigned');
    expect(page.visibleTickets().map((ticket) => ticket.id)).toEqual(['unassigned']);
    page.assignToMe(unassigned);
    page.changeStatus(unassigned, TicketStatus.InProgress);
    expect(service.assignAgent).toHaveBeenCalledWith(
      'unassigned',
      'support-agent-01',
      'Rafael Martins',
    );
    expect(service.changeStatus).toHaveBeenCalledWith(
      'unassigned',
      TicketStatus.InProgress,
      'Rafael Martins',
    );
    fixture.destroy();
  });
});
