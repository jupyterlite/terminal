import { expect, test } from '@jupyterlab/galata';

import { ContentsHelper } from './utils/contents';
import {
  LONG_WAIT_MS,
  TERMINAL_SELECTOR,
  WAIT_MS,
  inputLine
} from './utils/misc';

test.describe('individual command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);

    // Overwrite the (read-only) page.contents with our own ContentsHelper.
    // @ts-ignore
    page.contents = new ContentsHelper(page);

    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);
  });

  test.describe('uname', () => {
    test(`should show emscripten build`, async ({ page }) => {
      await inputLine(page, `uname -a > uname.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('uname.txt');
      expect(outputFile?.content).toMatch(
        /^Emscripten emscripten .* wasm32 GNU\/Linux\n$/
      );
    });
  });

  test.describe('git2cpp', () => {
    test(`should print version`, async ({ page }) => {
      await inputLine(page, `git -v > git0.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('git0.txt');
      expect(outputFile?.content).toMatch(
        /^git2cpp version .* \(libgit2 .*\)\n$/
      );
    });

    test(`should run git init`, async ({ page }) => {
      await inputLine(page, `git init .`);
      await page.waitForTimeout(LONG_WAIT_MS);

      await inputLine(page, `ls .git > git1.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('git1.txt');
      expect(outputFile?.content).toMatch(
        /^HEAD\nconfig\ndescription\nhooks\ninfo\nobjects\nrefs\n$/
      );
    });
  });

  test.describe('nano', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(LONG_WAIT_MS);

        await inputLine(page, 'nano a.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Insert new characters.
        await inputLine(page, 'mnopqrst', false);

        // Save and quit.
        await page.keyboard.press('Control+x');
        await inputLine(page, 'y');
        await page.waitForTimeout(LONG_WAIT_MS);

        const outputFile = await page.contents.getContentMetadata('a.txt');
        expect(outputFile?.content).toEqual('mnopqrst\n');
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(LONG_WAIT_MS);

        // Prepare file to delete from.
        await inputLine(page, 'echo mnopqrst > b.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        await inputLine(page, 'nano b.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Delete first 4 characters.
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Delete');
        }

        // Save and quit.
        await page.keyboard.press('Control+x');
        await inputLine(page, 'y');
        await page.waitForTimeout(LONG_WAIT_MS);

        const outputFile = await page.contents.getContentMetadata('b.txt');
        expect(outputFile?.content).toEqual('qrst\n');
      });
    });
  });

  test.describe('vim', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(LONG_WAIT_MS);

        await inputLine(page, 'vim c.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Insert new characters.
        await inputLine(page, 'iabcdefgh', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await inputLine(page, ':wq');
        await page.waitForTimeout(LONG_WAIT_MS);

        const outputFile = await page.contents.getContentMetadata('c.txt');
        expect(outputFile?.content).toEqual('abcdefgh\n');
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(LONG_WAIT_MS);

        // Prepare file to delete from.
        await inputLine(page, 'echo abcdefgh > d.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        await inputLine(page, 'vim d.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Delete first 4 characters.
        await inputLine(page, 'd4l', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await inputLine(page, ':wq');
        await page.waitForTimeout(LONG_WAIT_MS);

        const outputFile = await page.contents.getContentMetadata('d.txt');
        expect(outputFile?.content).toEqual('efgh\n');
      });
    });
  });
});
