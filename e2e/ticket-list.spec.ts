import { expect, test } from '@playwright/test';
import { seedTickets, ticketFixture } from './support/ticket-fixtures';

test('combines filters, sorts, paginates, and resets to page one after a search change', async ({
  page,
}) => {
  await seedTickets(
    page,
    Array.from({ length: 10 }, (_, index) => ticketFixture(index + 1)),
  );
  await expect(page.getByRole('heading', { name: 'Tickets', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(8);

  await page.getByRole('button', { name: 'Próxima' }).click();
  await expect(page.getByText('Página 2 de 2')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'E2E ticket 1' })).toBeVisible();

  await page.getByLabel('Pesquisar').fill('ticket 10');
  await expect(page.getByText('Página 1 de 1')).toBeVisible();
  await page.getByLabel('Status').selectOption({ label: 'Em atendimento' });
  await page.getByLabel('Filtrar por prioridade').selectOption({ label: 'Crítica' });
  await page.getByLabel('Categoria').selectOption({ label: 'Rede' });
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'E2E ticket 10' })).toBeVisible();

  await page.getByRole('button', { name: 'Limpar filtros' }).click();
  await page.getByLabel('Ordenar por').selectOption('oldest');
  await expect(page.locator('tbody tr').first()).toContainText('E2E ticket 1');
  await page.getByLabel('Ordenar por').selectOption('priority');
  await expect(page.locator('tbody tr').first()).toContainText('E2E ticket 10');
});

test('distinguishes an empty list from a search with no matching results', async ({ page }) => {
  await page.goto('/tickets');
  await expect(page.getByRole('heading', { name: 'Nenhum ticket por aqui' })).toBeVisible();

  await seedTickets(page, [ticketFixture(1)]);
  await page.getByLabel('Pesquisar').fill('não existe');
  await expect(page.getByRole('heading', { name: 'Nenhum resultado encontrado' })).toBeVisible();
});
