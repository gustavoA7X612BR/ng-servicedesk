import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoPostImportService } from '../services/demo-post-import.service';
import { TicketService } from '../services/ticket.service';
import { TicketPriority, TicketStatus } from '../../../core/models/ticket.model';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly ticketsService = inject(TicketService);
  private readonly demoImport = inject(DemoPostImportService);

  readonly tickets = this.ticketsService.tickets;
  readonly storageError = this.ticketsService.storageError;
  readonly importing = signal(false);
  readonly importMessage = signal('');
  readonly importError = signal('');
  readonly metrics = computed(() => {
    const tickets = this.tickets();
    return [
      { label: 'Total de tickets', value: tickets.length, tone: 'blue' },
      {
        label: 'Abertos',
        value: tickets.filter((ticket) => ticket.status === TicketStatus.Open).length,
        tone: 'slate',
      },
      {
        label: 'Em atendimento',
        value: tickets.filter((ticket) => ticket.status === TicketStatus.InProgress).length,
        tone: 'amber',
      },
      {
        label: 'Aguardando solicitante',
        value: tickets.filter((ticket) => ticket.status === TicketStatus.WaitingForRequester)
          .length,
        tone: 'violet',
      },
      {
        label: 'Resolvidos',
        value: tickets.filter((ticket) => ticket.status === TicketStatus.Resolved).length,
        tone: 'green',
      },
      {
        label: 'Prioridade crítica',
        value: tickets.filter((ticket) => ticket.priority === TicketPriority.Critical).length,
        tone: 'red',
      },
    ];
  });

  importDemonstrations(): void {
    if (this.importing()) return;
    this.importing.set(true);
    this.importMessage.set('');
    this.importError.set('');
    this.demoImport.importPosts().subscribe({
      next: (count) => {
        this.importMessage.set(
          count
            ? `${count} publicações demonstrativas importadas como tickets.`
            : 'Os tickets demonstrativos já estão atualizados.',
        );
      },
      error: () => {
        this.importError.set('Não foi possível carregar os dados demonstrativos. Tente novamente.');
        this.importing.set(false);
      },
      complete: () => this.importing.set(false),
    });
  }
}
