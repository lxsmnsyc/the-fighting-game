import { expect, test } from '@playwright/test';

// A fixed seed, so the first shop always has something affordable
const SEED = 'e2e';

test('picks an ability, buys cards in the shop and fights a battle', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  await page.goto(`/?seed=${SEED}`);

  const rows = page.locator('main > section');

  // The run opens with an ability draft
  const abilities = rows.nth(0).getByTestId('ability-offer');
  await expect(abilities).toHaveCount(5);
  await abilities.first().hover();
  await expect(rows.nth(0).getByRole('tooltip')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('draft-hover.png') });
  await abilities.first().getByRole('button').click();

  const offers = rows.nth(0).getByTestId('card');
  const start = page.getByRole('button', { name: 'Start battle' });
  await expect(start).toBeVisible();
  await expect(rows.nth(1).getByTestId('ability-badge')).toHaveCount(1);

  await offers.first().hover();
  await expect(rows.nth(0).getByRole('tooltip')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('shop-hover.png') });

  // From the last offer back, since a bought slot stops being a card
  const count = await offers.count();
  for (let index = count - 1; index >= 0; index--) {
    await offers.nth(index).click();
  }
  await page.mouse.move(0, 0);
  await expect(rows.nth(2).getByTestId('card').first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('shop-bought.png') });

  await start.click();

  const timer = page.getByTestId('battle-timer');
  await expect(timer).toHaveText(/^[1-3]$/);
  await expect(rows.nth(1).getByTestId('ability-badge')).toHaveCount(1);
  await page.screenshot({ path: testInfo.outputPath('countdown.png') });

  // The countdown gives way to the time limit
  await expect(timer).toHaveText(/^(60|59|58|57)$/);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: testInfo.outputPath('battle.png') });

  expect(errors).toEqual([]);
});
