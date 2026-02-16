import { test, expect } from '@playwright/test';

test('navega módulos críticos', async ({ page }) => {
  await page.goto('/today');
  await expect(page.getByText('Hoy · Panel ejecutivo')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeVisible();

  await expect(page.getByText('Resumen automático')).toBeVisible();
  await expect(page.getByLabel('Caja hoy')).toBeVisible();

  await page.goto('/week');
  await expect(page.getByText('Scoreboard semanal')).toBeVisible();
  await expect(page.getByText('Verde ≤ 5%, amarillo ≤ 10%, rojo > 10% de variación.')).toBeVisible();

  await page.goto('/month');
  await expect(page.getByText('Close checklist')).toBeVisible();

  await page.goto('/logs');
  await expect(page.getByText('Logs')).toBeVisible();

  await page.goto('/settings');
  await expect(page.getByText('Ajustes')).toBeVisible();
  await expect(page.getByLabel('Moneda por defecto')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ajustes' })).toHaveAttribute('aria-current', 'page');
});

test('en today permite editar y muestra estado claro cuando falta sesión', async ({ page }) => {
  await page.goto('/today');

  const cashToday = page.getByLabel('Caja hoy');
  await cashToday.fill('1.500.000');
  await expect(cashToday).toHaveValue('1.500.000');

  await page.getByRole('button', { name: 'Registrar reporte diario' }).click();
  await expect(page.getByText('Necesitas iniciar sesión para guardar tus datos. Ve a /auth y vuelve a intentar.')).toBeVisible();
});
