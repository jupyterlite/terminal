import { expect, test } from '@jupyterlab/galata';
import { TERMINAL_SELECTOR, WAIT_MS, inputLine } from './utils/misc';

test.describe('Terminal extension', () => {
  test('should emit activation console messages', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', message => {
      logs.push(message.text());
    });

    await page.goto();

    expect(
      logs.filter(s =>
        s.match(/^JupyterLite extension @jupyterlite\/terminal:.*is activated!/)
      )
    ).toHaveLength(2);
  });
});

test.describe('Terminal', () => {
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
    await expect(page.locator('text=terminals/1')).toBeVisible();
  });

  test('should open via launcher', async ({ page }) => {
    await page.goto();
    await page
      .locator('.jp-LauncherCard-label >> p:has-text("Terminal")')
      .click();
    await page.locator(TERMINAL_SELECTOR).waitFor();
  });

  test('should create a new file', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input

    await inputLine(page, 'echo Hello > out.txt');
    await page.getByTitle('Name: out.txt').waitFor();
  });
});

test.describe('Images', () => {
  test('initial', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input

    // Hide modification times.
    const modified = page.locator('span.jp-DirListing-itemModified');
    await modified.evaluateAll(els => els.map(el => (el.innerHTML = '')));

    const imageName = 'initial.png';
    expect(await page.screenshot()).toMatchSnapshot(imageName.toLowerCase());
  });

  test('various commands', async ({ page }) => {
    await page.goto();
    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input

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
    expect(await page.screenshot()).toMatchSnapshot(imageName.toLowerCase());
  });
});
