import { expect, test } from '@jupyterlab/galata';

import {
  LONG_WAIT_MS,
  TERMINAL_SELECTOR,
  WAIT_MS,
  inputLine
} from './utils/misc';

test.describe('Terminal', () => {
  test('should emit service worker console message', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', message => {
      logs.push(message.text());
    });

    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.waitForTimeout(LONG_WAIT_MS);

    expect(
      logs.filter(s => s.match(/^Service worker supports terminal stdin/))
    ).toHaveLength(1);
  });

  test('should show initial prompt', async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    // Hide modification times.
    const modified = page.locator('span.jp-DirListing-itemModified');
    await modified.evaluateAll(els => els.map(el => (el.innerHTML = '')));

    const imageName = 'initial.png';
    expect(await page.screenshot()).toMatchSnapshot('initial.png');
  });

  test('should run various commands', async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await inputLine(page, 'ls'); // avoid timestamps
    await page.waitForTimeout(WAIT_MS);

    await inputLine(page, 'cp months.txt other.txt');
    await page.waitForTimeout(WAIT_MS);

    await inputLine(page, 'ls'); // avoid timestamps
    await page.waitForTimeout(WAIT_MS);

    await inputLine(page, 'una\t'); // tab complete command name
    await page.waitForTimeout(WAIT_MS);

    await inputLine(page, 'grep ember mon\t'); // tab complete filename
    await page.waitForTimeout(WAIT_MS);

    await page.keyboard.press('Tab'); // list all commands
    await page.waitForTimeout(WAIT_MS);

    await inputLine(page, 'abc'); // no such command
    await page.waitForTimeout(WAIT_MS);

    // Hide modification times.
    const modified = page.locator('span.jp-DirListing-itemModified');
    await modified.evaluateAll(els => els.map(el => (el.innerHTML = '')));

    const imageName = 'various-commands.png';
    expect(await page.screenshot()).toMatchSnapshot('various-commands.png');
  });

  test('should support both SharedArrayBuffer and ServiceWorker for stdin', async ({
    page
  }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await inputLine(page, 'cockle-config stdin');
    await page.waitForTimeout(WAIT_MS);

    const term = page.locator('div.xterm-viewport');
    expect(await term.screenshot()).toMatchSnapshot('both-sab-and-sw.png');
  });

  test('should support setting ServiceWorker for stdin', async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await inputLine(page, 'cockle-config stdin sw');
    await page.waitForTimeout(WAIT_MS);

    const term = page.locator('div.xterm-viewport');
    expect(await term.screenshot()).toMatchSnapshot('set-sw-stdin.png');
  });

  const stdinOptions = ['sab', 'sw'];
  stdinOptions.forEach(stdinOption => {
    test(`should support using ${stdinOption} for stdin`, async ({ page }) => {
      await page.goto();
      await page.waitForTimeout(LONG_WAIT_MS);
      await page.menu.clickMenuItem('File>New>Terminal');
      await page.locator(TERMINAL_SELECTOR).waitFor();
      await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
      await page.waitForTimeout(LONG_WAIT_MS);

      await inputLine(page, `cockle-config stdin ${stdinOption}`);
      await page.waitForTimeout(WAIT_MS);

      // Start interactive grep command.
      await inputLine(page, 'grep o');
      await page.waitForTimeout(WAIT_MS);

      await inputLine(page, 'abcod');
      await page.waitForTimeout(WAIT_MS);
      await inputLine(page, 'def');
      await page.waitForTimeout(WAIT_MS);
      await inputLine(page, 'oogoo');
      await page.waitForTimeout(WAIT_MS);

      // Finish interactive grep command.
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(WAIT_MS);

      const term = page.locator('div.xterm-viewport');
      expect(await term.screenshot()).toMatchSnapshot(
        `stdin-${stdinOption}.png`
      );
    });
  });
});
