import { expect, test } from './options';
import { LONG_WAIT_MS, TERMINAL_SELECTOR, WAIT_MS, runCommand } from './utils/misc';

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

    expect(logs.filter(s => s.match(/^Service worker supports terminal stdin/))).toHaveLength(1);
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

    const term = page.locator('div.xterm-viewport');
    expect(await term.screenshot()).toMatchSnapshot('initial.png');
  });

  test('should run various commands', async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await runCommand(page, 'ls'); // avoid timestamps
    await runCommand(page, 'cp months.txt other.txt');
    await runCommand(page, 'ls'); // avoid timestamps
    await runCommand(page, 'una\t'); // tab complete command name

    await runCommand(page, 'grep ember mon\t'); // tab complete filename
    await page.keyboard.press('Tab'); // list all commands
    await page.waitForTimeout(WAIT_MS);

    await runCommand(page, 'abc'); // no such command
    await page.waitForTimeout(WAIT_MS);

    // Hide modification times.
    const modified = page.locator('span.jp-DirListing-itemModified');
    await modified.evaluateAll(els => els.map(el => (el.innerHTML = '')));

    const term = page.locator('div.xterm-viewport');
    expect(await term.screenshot()).toMatchSnapshot('various-commands.png');
  });

  test('should support both SharedArrayBuffer and ServiceWorker for stdin', async ({
    page,
    supportsSAB
  }) => {
    test.skip(!supportsSAB, 'SAB not available');

    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await runCommand(page, 'cockle-config stdin');

    const term = page.locator('div.xterm-viewport');
    expect(await term.screenshot()).toMatchSnapshot('both-sab-and-sw.png');
  });

  test('should support setting ServiceWorker for stdin', async ({ page, supportsSAB }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);

    await runCommand(page, 'cockle-config stdin sw');

    const term = page.locator('div.xterm-viewport');
    const snapshot = supportsSAB ? 'set-sw-stdin-with-sab.png' : 'set-sw-stdin-no-sab.png';
    expect(await term.screenshot()).toMatchSnapshot(snapshot);
  });

  const stdinOptions = ['sab', 'sw'];
  stdinOptions.forEach(stdinOption => {
    test(`should support using ${stdinOption} for stdin`, async ({ page, supportsSAB }) => {
      test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');

      await page.goto();
      await page.waitForTimeout(LONG_WAIT_MS);
      await page.menu.clickMenuItem('File>New>Terminal');
      await page.locator(TERMINAL_SELECTOR).waitFor();
      await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
      await page.waitForTimeout(LONG_WAIT_MS);

      await runCommand(page, `cockle-config stdin ${stdinOption}`);
      await page.waitForTimeout(WAIT_MS);

      // Start interactive grep command.
      await runCommand(page, 'grep o');

      await runCommand(page, 'abcod');
      await runCommand(page, 'def');
      await runCommand(page, 'oogoo');

      // Finish interactive grep command.
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(WAIT_MS);

      const term = page.locator('div.xterm-viewport');
      const extra = stdinOption === 'sw' ? (supportsSAB ? '-with-sab' : '-no-sab') : '';
      expect(await term.screenshot()).toMatchSnapshot(`stdin-${stdinOption}${extra}.png`);
    });
  });
});
