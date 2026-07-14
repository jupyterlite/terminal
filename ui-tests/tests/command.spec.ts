import { expect, test } from './options';
import { ContentsHelper } from './utils/contents';
import { LONG_WAIT_MS, TERMINAL_SELECTOR, inputLine, setStdinOption } from './utils/misc';

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

  test.describe('cockle-config', () => {
    test(`should show worker type`, async ({ page, supportsSAB }) => {
      await inputLine(page, `cockle-config --worker > worker.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('worker.txt');
      if (supportsSAB) {
        expect(outputFile?.content).toMatch(/^coincident worker\n$/);
      } else {
        expect(outputFile?.content).toMatch(/^comlink worker\n$/);
      }
    });

    test(`should show stdin options`, async ({ page, supportsSAB }) => {
      await inputLine(page, `cockle-config stdin > stdin.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('stdin.txt');
      const lines = outputFile?.content.split('\n');
      expect(lines.length).toBe(7);
      expect(lines[1]).toEqual('│ synchronous stdin   │ short name │ available │ enabled │');
      if (supportsSAB) {
        expect(lines[3]).toEqual('│ shared array buffer │ sab        │ yes       │ yes     │');
        expect(lines[4]).toEqual('│ service worker      │ sw         │ yes       │         │');
      } else {
        expect(lines[3]).toEqual('│ shared array buffer │ sab        │           │         │');
        expect(lines[4]).toEqual('│ service worker      │ sw         │ yes       │ yes     │');
      }
    });

    test(`should support setting use of SW via cockle-config`, async ({ page, supportsSAB }) => {
      await inputLine(page, `cockle-config stdin sw > stdin.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('stdin.txt');
      const lines = outputFile?.content.split('\n');
      expect(lines.length).toBe(7);
      expect(lines[4]).toEqual('│ service worker      │ sw         │ yes       │ yes     │');
    });
  });

  test.describe('uname', () => {
    test(`should show emscripten build`, async ({ page }) => {
      await inputLine(page, `uname -a > uname.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('uname.txt');
      expect(outputFile?.content).toMatch(/^Emscripten emscripten .* wasm32 GNU\/Linux\n$/);
    });
  });

  test.describe('git2cpp', () => {
    test(`should print version`, async ({ page }) => {
      await inputLine(page, `git -v > git0.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      const outputFile = await page.contents.getContentMetadata('git0.txt');
      expect(outputFile?.content).toMatch(/^git2cpp version .* \(libgit2 .*\)\n$/);
    });

    test(`should run git init`, async ({ page }) => {
      await inputLine(page, `git init .`);
      await page.waitForTimeout(LONG_WAIT_MS);

      await inputLine(page, `ls .git > git1.txt 2> err1.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      let outputFile = await page.contents.getContentMetadata('git1.txt');
      expect(outputFile?.content).toBe('HEAD\nconfig\ndescription\nhooks\ninfo\nobjects\nrefs\n');
      outputFile = await page.contents.getContentMetadata('err1.txt');
      expect(outputFile?.content).toBe('');

      await inputLine(page, `git status > git2.txt 2> err2.txt`);
      await page.waitForTimeout(LONG_WAIT_MS);

      outputFile = await page.contents.getContentMetadata('git2.txt');
      expect(outputFile?.content).toMatch(/^On branch master\nNo commit yet/);
      outputFile = await page.contents.getContentMetadata('err2.txt');
      expect(outputFile?.content).toBe('');
    });
  });

  test.describe('nano', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({ page , supportsSAB}) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

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

      test(`should delete data from file using ${stdinOption} for stdin`, async ({ page, supportsSAB }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

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
      test(`should create new file using ${stdinOption} for stdin`, async ({ page, supportsSAB }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

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

      test(`should delete data from file using ${stdinOption} for stdin`, async ({ page, supportsSAB }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

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
