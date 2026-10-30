import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Ticket, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';
import { TicketDetailPage } from './ticket-detail-page';
import { changeTicketStatus, makeTestTicket } from './ticket-page-test-helpers';

describe('TicketDetailPage', () => {
  it('reacts to an ID change on the same route instance and applies ticket actions', async () => {
    const first = makeTestTicket({ title: 'Primeiro atendimento' }, 'ticket-1');
    const second = makeTestTicket({ title: 'Segundo atendimento' }, 'ticket-2');
    const tickets = signal<Ticket[]>([first, second]);
    const service = {
      tickets,
      storageError: signal(null),
      changeStatus: vi.fn((id: string, status: TicketStatus) =>
        tickets.update((items) =>
          items.map((ticket) => (ticket.id === id ? changeTicketStatus(ticket, status) : ticket)),
        ),
      ),
      changePriority: vi.fn(),
      assignAgent: vi.fn(),
      addComment: vi.fn(),
      delete: vi.fn(),
    };
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'tickets/:id', component: TicketDetailPage }]),
        { provide: TicketService, useValue: service },
      ],
    }).compileComponents();

    const harness = await RouterTestingHarness.create();
    const firstPage = await harness.navigateByUrl('/tickets/ticket-1', TicketDetailPage);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Primeiro atendimento',
    );
    const secondPage = await harness.navigateByUrl('/tickets/ticket-2', TicketDetailPage);
    expect(secondPage).toBe(firstPage);
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain(
      'Segundo atendimento',
    );
    expect(harness.routeNativeElement?.textContent).toContain('Histórico de atividades');
    expect(harness.routeNativeElement?.textContent).toContain('Ticket criado');
    expect(harness.routeNativeElement?.textContent).toContain('Dados do solicitante');
    expect(harness.routeNativeElement?.textContent).toContain('Camila Nunes');

    secondPage.changeStatus(TicketStatus.InProgress);
    secondPage.changePriority(TicketPriority.Critical);
    secondPage.assignAgent('support-agent-01');
    secondPage.comment.set('Estou verificando.');
    secondPage.addComment();
    expect(service.changeStatus).toHaveBeenCalledWith(
      'ticket-2',
      TicketStatus.InProgress,
      'John Doe',
    );
    expect(service.changePriority).toHaveBeenCalledWith(
      'ticket-2',
      TicketPriority.Critical,
      'John Doe',
    );
    expect(service.assignAgent).toHaveBeenCalledWith(
      'ticket-2',
      'support-agent-01',
      'John Doe',
    );
    expect(service.addComment).toHaveBeenCalledWith(
      'ticket-2',
      'Estou verificando.',
      'John Doe',
    );
  });

  it('shows a clear not-found state for an unknown local ticket', async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'tickets/:id', component: TicketDetailPage }]),
        { provide: TicketService, useValue: { tickets: signal([]), storageError: signal(null) } },
      ],
    }).compileComponents();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/tickets/missing', TicketDetailPage);
    expect(harness.routeNativeElement?.textContent).toContain('Ticket não encontrado');
  });
});
