import {
  Ticket,
  TicketCategory,
  TicketHistoryEventType,
  TicketOrigin,
  TicketPriority,
  TicketStatus,
} from '../../src/app/core/models/ticket.model';

export const STORAGE_KEY = 'ng-servicedesk.tickets';

export function ticketFixture(index: number, overrides: Partial<Ticket> = {}): Ticket {
  const createdAt = new Date(Date.UTC(2026, 0, index)).toISOString();
  return {
    id: `e2e-${index}`,
    title: `E2E ticket ${index}`,
    description: `Detalhes do ticket de teste ${index}.`,
    requester: index === 10 ? 'Camila Nunes' : `Solicitante ${index}`,
    requesterEmail: `solicitante-${index}@example.com`,
    category: index === 10 ? TicketCategory.Network : TicketCategory.Software,
    priority: index === 10 ? TicketPriority.Critical : TicketPriority.Medium,
    status: index === 10 ? TicketStatus.InProgress : TicketStatus.Open,
    createdAt,
    updatedAt: createdAt,
    history: [
      {
        id: `event-${index}`,
        type: TicketHistoryEventType.Created,
        description: 'Ticket criado.',
        author: 'John Doe',
        createdAt,
      },
    ],
    origin: TicketOrigin.Local,
    ...overrides,
  };
}

export async function seedTickets(
  page: import('@playwright/test').Page,
  tickets: Ticket[],
): Promise<void> {
  await page.goto('/tickets');
  await page.evaluate(
    ({ key, items }) => localStorage.setItem(key, JSON.stringify({ version: 1, tickets: items })),
    { key: STORAGE_KEY, items: tickets },
  );
  await page.reload();
}

export async function openTicketFromForm(
  page: import('@playwright/test').Page,
  input: {
    title: string;
    description: string;
    requester: string;
    requesterEmail: string;
    category?: string;
    priority?: string;
  },
): Promise<void> {
  await page.goto('/tickets/new');
  await page.getByLabel('Título').fill(input.title);
  await page.getByLabel('Descrição').fill(input.description);
  await page.getByLabel('Nome do solicitante').fill(input.requester);
  await page.getByLabel('E-mail').fill(input.requesterEmail);
  if (input.category) await page.getByLabel('Categoria').selectOption({ label: input.category });
  if (input.priority) await page.getByLabel('Prioridade').selectOption({ label: input.priority });
  await page.getByRole('button', { name: 'Criar ticket' }).click();
  await page.waitForURL(/\/tickets\/ticket-/);
}
