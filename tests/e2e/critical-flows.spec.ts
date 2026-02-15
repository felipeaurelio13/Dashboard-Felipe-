import { test, expect } from '@playwright/test';

test('navega módulos críticos', async ({ page }) => {
  await page.goto('/today');
  await expect(page.getByText('Hoy · Semáforo 10')).toBeVisible();
  await page.goto('/week');
  await expect(page.getByText('Scoreboard semanal')).toBeVisible();
  await page.goto('/month');
  await expect(page.getByText('Close checklist')).toBeVisible();
  await page.goto('/logs');
  await expect(page.getByText('Logs')).toBeVisible();
  await page.goto('/settings');
  await expect(page.getByText('Ajustes')).toBeVisible();
});
