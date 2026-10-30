import { expect, test } from '@playwright/test';
import { openTicketFromForm, seedTickets, ticketFixture } from './support/ticket-fixtures';

test('assigns an unassigned ticket from the queue and adds a comment in its details', async ({
  page,
}) => {
  await seedTickets(page, [ticketFixture(1)]);
  await page.goto('/service');
  await expect(page.getByRole('heading', { name: 'Fila de atendimento' })).toBeVisible();
  await page.getByRole('button', { name: 'Atribuir a mim' }).click();
  await expect(page.getByText('Responsável:')).toContainText('você');
  await page.getByLabel('Status').selectOption({ label: 'Em atendimento' });
  await page.getByRole('button', { name: /Atribuídos a mim/ }).click();
  await expect(page.getByRole('link', { name: 'E2E ticket 1' })).toBeVisible();
  await page.getByRole('link', { name: 'Abrir atendimento' }).click();

  await page
    .getByRole('textbox', { name: 'Comentário' })
    .fill('A fila confirmou o início do atendimento.');
  await page.getByRole('button', { name: 'Adicionar comentário' }).click();
  await expect(page.getByText('A fila confirmou o início do atendimento.')).toBeVisible();
  await expect(page.getByLabel('Agente responsável')).toHaveValue('support-agent-01');
});

test('imports JSONPlaceholder examples once without replacing local tickets', async ({ page }) => {
  await openTicketFromForm(page, {
    title: 'Ticket criado localmente',
    description: 'Este registro deve permanecer após a importação.',
    requester: 'João Silva',
    requesterEmail: 'joao@example.com',
  });
  await page.goto('/dashboard');
  await page.route('https://jsonplaceholder.typicode.com/posts', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          userId: 5,
          id: 101,
          title: 'Post para demonstração',
          body: 'Conteúdo de origem do JSONPlaceholder.',
        },
      ]),
    }),
  );

  await page.getByRole('button', { name: 'Importar exemplos' }).click();
  await expect(page.getByRole('status')).toContainText('1 publicações demonstrativas importadas');
  await page.getByRole('button', { name: 'Importar exemplos' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Os tickets demonstrativos já estão atualizados',
  );
  await page.getByRole('link', { name: 'Ver todos' }).click();

  await expect(page.getByText('2 de 2 tickets')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ticket criado localmente' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Post para demonstração' })).toBeVisible();
  await page.getByRole('link', { name: 'Post para demonstração' }).click();
  await expect(page.getByText(/Dado demonstrativo · publicação 101/)).toBeVisible();
});
