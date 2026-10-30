import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TicketPriority, TicketStatus } from '../../../core/models/ticket.model';
import { DashboardPage } from './dashboard-page';
import { makeDemoTicket, makeTestTicket } from './ticket-page-test-helpers';
import { TicketService } from '../services/ticket.service';
import { DemoPostImportService } from '../services/demo-post-import.service';

describe('DashboardPage', () => {
  it('calculates its indicators from the current local tickets', async () => {
    const tickets = signal([
      makeTestTicket({ status: TicketStatus.Open }),
      makeTestTicket(
        { status: TicketStatus.InProgress, priority: TicketPriority.Critical },
        'ticket-2',
      ),
      makeTestTicket({ status: TicketStatus.WaitingForRequester }, 'ticket-3'),
      makeTestTicket({ status: TicketStatus.Resolved }, 'ticket-4'),
    ]);
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        { provide: TicketService, useValue: { tickets, storageError: signal(null) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tickets recentes');
    expect(fixture.nativeElement.querySelectorAll('.metric-card strong').length).toBe(6);
    expect(fixture.nativeElement.querySelector('.metric-card strong')?.textContent).toBe('4');
    expect(fixture.nativeElement.textContent).toContain('Em atendimento');
    expect(fixture.nativeElement.textContent).toContain('Aguardando solicitante');
  });

  it('imports demonstration posts and reports how many were added', async () => {
    const importer = { importPosts: vi.fn(() => of(2)) };
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        {
          provide: TicketService,
          useValue: { tickets: signal([makeDemoTicket(9)]), storageError: signal(null) },
        },
        { provide: DemoPostImportService, useValue: importer },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    const button = [...fixture.nativeElement.querySelectorAll('button')].find((item) =>
      item.textContent.includes('Importar exemplos'),
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(importer.importPosts).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('2 publicações demonstrativas importadas');
  });
});
