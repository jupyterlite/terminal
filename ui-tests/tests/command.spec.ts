import { expect, test } from '@jupyterlab/galata';

//import { ContentsHelper } from './utils/contents';
import {
  INITIAL_WAIT_MS,
  TERMINAL_SELECTOR,
  WAIT_MS,
  inputLine,
  fileContent
} from './utils/misc';

// Long wait such as for starting/stopping a complex WebAssembly command.
export const LONG_WAIT_MS = 300;

test.describe('individual command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();

    // Overwrite the (read-only) page.contents with our own ContentsHelper.
    // @ts-ignore
    //page.contents = new ContentsHelper(page);

    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(INITIAL_WAIT_MS);
  });

  test.describe('which', () => {
    test(`should support nano and vim`, async ({ page }) => {
      await inputLine(page, 'which nano vim > out.txt');
      await page.waitForTimeout(LONG_WAIT_MS);

      const content = await fileContent(page, 'out.txt');
      expect(content).toEqual('nano\nvim\n');
    });
  });

  test.describe('nano', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(WAIT_MS);

        const filename = 'a.txt';

        await inputLine(page, `nano ${filename}`);
        await page.waitForTimeout(LONG_WAIT_MS);

        // Insert new characters.
        await inputLine(page, 'mnopqrst', false);

        // Save and quit.
        await page.keyboard.press('Control+x');
        await inputLine(page, 'y', true);
        await page.waitForTimeout(LONG_WAIT_MS);

        const content = await fileContent(page, filename);
        expect(content).toEqual('mnopqrst\n');
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(WAIT_MS);

        // Prepare file to delete from.
        await inputLine(page, 'echo mnopqrst > b.txt');
        await page.waitForTimeout(WAIT_MS);

        await inputLine(page, 'nano b.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Delete first 4 characters.
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Delete');
          await page.waitForTimeout(20);
        }

        // Save and quit.
        await page.keyboard.press('Control+x');
        await inputLine(page, 'y', true);
        await page.waitForTimeout(LONG_WAIT_MS);

        const content = await fileContent(page, 'b.txt');
        expect(content).toEqual('qrst\n');
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
        await page.waitForTimeout(WAIT_MS);

        await inputLine(page, 'vim c.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Insert new characters.
        await inputLine(page, 'iabcdefgh', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await inputLine(page, ':wq');
        await page.waitForTimeout(LONG_WAIT_MS);

        const content = await fileContent(page, 'c.txt');
        expect(content).toEqual('abcdefgh\n');
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page
      }) => {
        await inputLine(page, `cockle-config stdin ${stdinOption}`);
        await page.waitForTimeout(WAIT_MS);

        // Prepare file to delete from.
        await inputLine(page, 'echo abcdefgh > d.txt');
        await page.waitForTimeout(WAIT_MS);

        await inputLine(page, 'vim d.txt');
        await page.waitForTimeout(LONG_WAIT_MS);

        // Delete first 4 characters.
        await inputLine(page, 'd4l', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await inputLine(page, ':wq');
        await page.waitForTimeout(LONG_WAIT_MS);

        const content = await fileContent(page, 'd.txt');
        expect(content).toEqual('efgh\n');
      });
    });
  });
});
