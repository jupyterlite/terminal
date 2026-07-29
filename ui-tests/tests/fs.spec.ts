import { expect, test } from './options';
import {
  LONG_WAIT_MS,
  TERMINAL_SELECTOR,
  WAIT_MS,
  decode64,
  retrieveAndDeleteFile,
  runCommand
} from './utils/misc';

const MONTHS_TXT =
  'January\nFebruary\nMarch\nApril\nMay\nJune\nJuly\nAugust\nSeptember\nOctober\nNovember\nDecember\n';
const FACT_LUA =
  'function fact(n, acc)\n' +
  '  acc = acc or 1\n' +
  '  if n == 0 then\n' +
  '    return acc\n' +
  '  end\n' +
  '  return fact(n-1, n*acc)\n' +
  'end\n' +
  'print(fact(tonumber(arg[1])))\n';

test.describe('Filesystem', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);

    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(WAIT_MS);
  });

  test('should have initial files', async ({ page }) => {
    await runCommand(page, 'ls -ld /drive/* > out.txt');

    // Shared drive contents.
    const output = await retrieveAndDeleteFile(page, 'out.txt');
    expect(output).toHaveLength(3);
    expect(output[0]).toMatch(/^-rw-rw-rw- .* fact.lua$/);
    expect(output[1]).toMatch(/^-rw-rw-rw- .* months.txt$/);

    // File contents.
    const months_txt = await retrieveAndDeleteFile(page, 'months.txt');
    expect(months_txt).toEqual(MONTHS_TXT.split('\n'));

    const fact_lua = await retrieveAndDeleteFile(page, 'fact.lua');

    const jupyterliteVersion = await page.evaluate(() => {
      const el = document.getElementById('jupyter-config-data');
      return JSON.parse(el?.textContent || '{}').appVersion;
    });
    if (jupyterliteVersion === '0.7.0') {
      expect(decode64(fact_lua.join('\n'))).toEqual(FACT_LUA);
    } else {
      expect(fact_lua).toEqual(FACT_LUA.split('\n'));
    }
  });

  test('should create a new file', async ({ page }) => {
    await runCommand(page, 'echo Hello > out.txt');
    const output = await retrieveAndDeleteFile(page, 'out.txt');
    expect(output).toEqual(['Hello', '']);
  });

  test('should support cp', async ({ page }) => {
    await runCommand(page, 'cp months.txt other.txt');
    const other = await retrieveAndDeleteFile(page, 'other.txt');
    expect(other).toEqual(MONTHS_TXT.split('\n'));
  });

  test('should support touch', async ({ page }) => {
    await runCommand(page, 'touch touched.txt');
    const other = await retrieveAndDeleteFile(page, 'touched.txt');
    expect(other).toEqual(['']);
  });
});
