import { expect, test } from '@playwright/test';
import { STORAGE_KEY, openTicketFromForm } from './support/ticket-fixtures';

test('opens a ticket, records service actions, and restores its history after reload', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Painel de atendimento' })).toBeVisible();
  await openTicketFromForm(page, {
    title: 'Acesso ao sistema financeiro',
    description: 'A tela de acesso retorna uma mensagem de erro.',
    requester: 'Camila Nunes',
    requesterEmail: 'camila@example.com',
    category: 'Acesso e permissões',
    priority: 'Alta',
  });

  await expect(page.getByRole('status')).toContainText('Ticket criado e salvo neste navegador');
  await expect(page.getByRole('heading', { name: 'Acesso ao sistema financeiro' })).toBeVisible();
  await page.getByLabel('Status').selectOption({ label: 'Em atendimento' });
  await page.getByLabel('Prioridade').selectOption({ label: 'Crítica' });
  await page.getByLabel('Agente responsável').selectOption({ label: 'John Doe' });
  await page
    .getByRole('textbox', { name: 'Comentário' })
    .fill('Estou investigando a falha de acesso.');
  await page.getByRole('button', { name: 'Adicionar comentário' }).click();
  await expect(page.getByText('Estou investigando a falha de acesso.')).toBeVisible();

  await page.getByRole('button', { name: 'Marcar como resolvido' }).click();
  await page.getByRole('button', { name: 'Fechar ticket' }).click();
  await expect(page.locator('.description-panel .status-badge')).toHaveText('Fechado');
  await expect(page.locator('.info-panel dd').nth(3)).toHaveText('John Doe');

  const ticketUrl = page.url();
  await page.reload();
  await expect(page).toHaveURL(ticketUrl);
  await expect(page.getByRole('heading', { name: 'Acesso ao sistema financeiro' })).toBeVisible();
  await expect(page.getByLabel('Status')).toHaveValue('Fechado');
  await expect(page.getByText('Estou investigando a falha de acesso.')).toBeVisible();
  await expect(page.locator('.timeline-item')).toHaveCount(7);

  const savedTickets = await page.evaluate((key) => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored).tickets : [];
  }, STORAGE_KEY);
  expect(savedTickets).toHaveLength(1);
});

test('shows validation feedback and prevents submission of an invalid ticket', async ({ page }) => {
  await page.goto('/tickets/new');
  await page.getByLabel('E-mail').fill('endereco-invalido');
  await page.getByRole('button', { name: 'Criar ticket' }).click();

  await expect(page.getByText('Informe um título.')).toBeVisible();
  await expect(page.getByText('Informe os detalhes da solicitação.')).toBeVisible();
  await expect(page.getByText('Informe um endereço de e-mail válido.')).toBeVisible();
  await expect(page).toHaveURL(/\/tickets\/new$/);
  await expect(page.locator('.form-card')).toBeVisible();
});
