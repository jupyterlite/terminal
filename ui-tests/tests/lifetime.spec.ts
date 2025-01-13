import { expect, test } from '@jupyterlab/galata';

import { TERMINAL_SELECTOR, inputLine } from './utils/misc';

const OPEN_TERMINAL_1 =
  'span.jp-RunningSessions-itemLabel:has-text("Terminal 1")';
const TERMINALS_1 = 'text=terminals/1';

test.describe('New', () => {
  test('should open via File menu', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
  });

  test('should appear in sidebar', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.sidebar.openTab('jp-running-sessions');

    await expect(page.locator(OPEN_TERMINAL_1)).toBeVisible();
    await expect(page.locator(TERMINALS_1)).toBeVisible();
  });

  test('should open via launcher', async ({ page }) => {
    await page.goto();
    await page
      .locator('.jp-LauncherCard-label >> p:has-text("Terminal")')
      .click();
    await page.locator(TERMINAL_SELECTOR).waitFor();
  });
});

test.describe('Shutdown', () => {
  test('should close via menu', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.sidebar.openTab('jp-running-sessions');
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.menu.clickMenuItem('File>Shutdown Terminal');
    await page.waitForTimeout(100);

    await expect(page.locator(OPEN_TERMINAL_1)).toHaveCount(0);
    await expect(page.locator(TERMINALS_1)).toHaveCount(0);
  });

  test('should close via exit command in terminal', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.sidebar.openTab('jp-running-sessions');
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await inputLine(page, 'exit');
    await page.waitForTimeout(100);

    await expect(page.locator(OPEN_TERMINAL_1)).toHaveCount(0);
    await expect(page.locator(TERMINALS_1)).toHaveCount(0);
  });
});
