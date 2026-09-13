import { expect, test } from '@playwright/test';

test('starts a seeded Hardcore run from the main menu', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto('/');
  await page.screenshot({ path: testInfo.outputPath('main-menu.png') });
  await page.getByRole('button', { name: 'Start', exact: true }).click();

  const hardcore = page.getByTestId('game-mode').filter({ hasText: 'Hardcore' });
  await hardcore.click();
  await expect(hardcore).toHaveAttribute('aria-pressed', 'true');

  // A seeded run cannot begin without a seed
  const begin = page.getByRole('button', { name: 'Begin run' });
  await page.getByRole('button', { name: 'Seeded run' }).click();
  await expect(begin).toBeDisabled();
  await page.getByLabel('Seed').fill('e2e');
  await page.screenshot({ path: testInfo.outputPath('start-screen.png') });
  await begin.click();

  await expect(page.getByTestId('ability-offer')).toHaveCount(5);
  await expect(page.getByTestId('life')).toHaveCount(1);

  expect(errors).toEqual([]);
});

test('keeps options after a reload', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Options' }).click();

  const shake = page.getByRole('switch', { name: /^Shake/ });
  await expect(shake).toHaveAttribute('aria-checked', 'true');
  await shake.click();
  await expect(shake).toHaveAttribute('aria-checked', 'false');
  await page.screenshot({ path: testInfo.outputPath('options.png') });

  await page.reload();
  await page.getByRole('button', { name: 'Options' }).click();
  await expect(page.getByRole('switch', { name: /^Shake/ })).toHaveAttribute(
    'aria-checked',
    'false',
  );

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
});
