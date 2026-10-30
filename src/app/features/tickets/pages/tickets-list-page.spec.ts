import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TicketCategory, TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { TicketService } from '../services/ticket.service';
import { TicketsListPage } from './tickets-list-page';
import { makeTestTicket } from './ticket-page-test-helpers';

describe('TicketsListPage', () => {
  it('combines search and filters and returns to the first page when criteria change', async () => {
    const tickets = signal(
      Array.from({ length: 12 }, (_, index) =>
        makeTestTicket(
          {
            title: index === 10 ? 'Rede da Camila indisponível' : `Falha de sistema ${index}`,
            requester: index === 10 ? 'Camila Nunes' : 'João Silva',
            status: index === 10 ? TicketStatus.InProgress : TicketStatus.Open,
            category: index === 10 ? TicketCategory.Network : TicketCategory.Software,
            createdAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
          },
          `ticket-${index}`,
        ),
      ),
    );
    await TestBed.configureTestingModule({
      imports: [TicketsListPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { tickets, storageError: signal(null) } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(TicketsListPage);
    const page = fixture.componentInstance;
    page.changePage(2);
    page.setSearch('camila');
    page.setStatus(TicketStatus.InProgress);
    page.setCategory(TicketCategory.Network);
    fixture.detectChanges();

    expect(page.currentPage()).toBe(1);
    expect(page.filteredTickets().map((ticket) => ticket.id)).toEqual(['ticket-10']);
    expect(fixture.nativeElement.textContent).toContain('1 de 12 tickets');
  });

  it('sorts a copied collection by priority without mutating the service array and paginates', async () => {
    const initial = [
      makeTestTicket(
        { title: 'Baixa', priority: TicketPriority.Low, createdAt: '2026-01-03T00:00:00.000Z' },
        'low',
      ),
      makeTestTicket(
        {
          title: 'Crítica',
          priority: TicketPriority.Critical,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        'critical',
      ),
      makeTestTicket(
        { title: 'Alta', priority: TicketPriority.High, createdAt: '2026-01-02T00:00:00.000Z' },
        'high',
      ),
    ];
    const source = signal(initial);
    await TestBed.configureTestingModule({
      imports: [TicketsListPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { tickets: source, storageError: signal(null) } },
      ],
    }).compileComponents();
    const page = TestBed.createComponent(TicketsListPage).componentInstance;
    page.setSort('priority');
    expect(page.filteredTickets().map((ticket) => ticket.id)).toEqual(['critical', 'high', 'low']);
    expect(source()).toEqual(initial);
    expect(page.pageCount()).toBe(1);
  });
});
