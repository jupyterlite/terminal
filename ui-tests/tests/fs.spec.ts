import { expect, test } from '@jupyterlab/galata';

import { ContentsHelper } from './utils/contents';
import { TERMINAL_SELECTOR, decode64, inputLine } from './utils/misc';

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

    // Overwrite the (read-only) page.contents with our own ContentsHelper.
    // @ts-ignore
    page.contents = new ContentsHelper(page);

    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
  });

  test('should have initial files', async ({ page }) => {
    // Directory contents.
    const content = await page.contents.getContentMetadata('', 'directory');
    expect(content).not.toBeNull();
    const filenames = content?.content.map(item => item.name);
    expect(filenames).toEqual(
      expect.arrayContaining(['fact.lua', 'months.txt'])
    );

    // File contents.
    const months = await page.contents.getContentMetadata('months.txt');
    expect(months?.content).toEqual(MONTHS_TXT);

    // Note fact.lua contents are returned base64 encoded.
    const fact = await page.contents.getContentMetadata('fact.lua');
    expect(decode64(fact?.content)).toEqual(FACT_LUA);
  });

  test('should support cp', async ({ page }) => {
    await inputLine(page, 'cp months.txt other.txt');
    await page.filebrowser.refresh();

    expect(await page.contents.fileExists('months.txt')).toBeTruthy();
    expect(await page.contents.fileExists('other.txt')).toBeTruthy();

    const other = await page.contents.getContentMetadata('other.txt');
    expect(other?.content).toEqual(MONTHS_TXT);
  });

  // rm of files added via --contents is not reliable.
  test.skip('should support rm', async ({ page }) => {
    await inputLine(page, 'rm fact.lua');
    await page.filebrowser.refresh();

    expect(await page.contents.fileExists('fact.lua')).toBeFalsy();
  });

  test('should support touch', async ({ page }) => {
    await inputLine(page, 'touch touched.txt');
    await page.filebrowser.refresh();

    expect(await page.contents.fileExists('touched.txt')).toBeTruthy();

    const other = await page.contents.getContentMetadata('touched.txt');
    expect(other?.content).toEqual('');
  });
});
