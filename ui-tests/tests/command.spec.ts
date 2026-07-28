import { expect, test } from './options';
import {
  LONG_WAIT_MS,
  TERMINAL_SELECTOR,
  retrieveAndDeleteFile,
  runCommand,
  setStdinOption
} from './utils/misc';

test.describe('individual command', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);

    await page.menu.clickMenuItem('File>New>Terminal');
    await page.locator(TERMINAL_SELECTOR).waitFor();
    await page.locator('div.xterm-screen').click(); // sets focus for keyboard input
    await page.waitForTimeout(LONG_WAIT_MS);
  });

  test.describe('cockle-config', () => {
    test(`should show worker type`, async ({ page, supportsSAB }) => {
      await runCommand(page, `cockle-config --worker > worker.txt`);
      const output = await retrieveAndDeleteFile(page, 'worker.txt');
      if (supportsSAB) {
        expect(output[0]).toEqual('coincident worker');
      } else {
        expect(output[0]).toEqual('comlink worker');
      }
    });

    test(`should show stdin options`, async ({ page, supportsSAB }) => {
      await runCommand(page, `cockle-config stdin > stdin.txt`);
      const lines = await retrieveAndDeleteFile(page, 'stdin.txt');
      expect(lines).toHaveLength(7);
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
      await runCommand(page, `cockle-config stdin sw > stdin.txt`);
      const lines = await retrieveAndDeleteFile(page, 'stdin.txt');
      expect(lines.length).toBe(7);
      expect(lines[4]).toEqual('│ service worker      │ sw         │ yes       │ yes     │');
    });
  });

  test.describe('uname', () => {
    test(`should show emscripten build`, async ({ page }) => {
      await runCommand(page, `uname -a > uname.txt`);

      const output = await retrieveAndDeleteFile(page, 'uname.txt');
      expect(output[0]).toMatch(/^Emscripten emscripten .* wasm32 GNU\/Linux$/);
    });
  });

  test.describe('git2cpp', () => {
    test(`should print version`, async ({ page }) => {
      await runCommand(page, `git -v > git0.txt`);
      const output = await retrieveAndDeleteFile(page, 'git0.txt');
      expect(output[0]).toMatch(/^git2cpp version .* \(libgit2 .*\)$/);
    });

    test(`should run git init`, async ({ page }) => {
      await runCommand(page, 'git init .');
      await runCommand(page, 'tree -afi .git > git1.txt 2> err1.txt');

      let output = await retrieveAndDeleteFile(page, 'git1.txt');
      expect(output).toEqual([
        '.git',
        '.git/HEAD',
        '.git/config',
        '.git/description',
        '.git/hooks',
        '.git/hooks/README.sample',
        '.git/info',
        '.git/info/exclude',
        '.git/objects',
        '.git/objects/info',
        '.git/objects/pack',
        '.git/refs',
        '.git/refs/heads',
        '.git/refs/tags',
        '',
        '9 directories, 5 files',
        ''
      ]);
      output = await retrieveAndDeleteFile(page, 'err1.txt');
      expect(output).toEqual(['']);

      await runCommand(page, `git status > git2.txt 2> err2.txt`);
      output = await retrieveAndDeleteFile(page, 'git2.txt');
      expect(output.slice(0, 2)).toEqual(['On branch master', 'No commit yet']);
      output = await retrieveAndDeleteFile(page, 'err2.txt');
      expect(output).toEqual(['']);

      await runCommand(page, 'rm -rf .git');
      await runCommand(page, 'ls .git 2> err3.txt');

      output = await retrieveAndDeleteFile(page, 'err3.txt');
      expect(output).toEqual(["ls: cannot access '.git': No such file or directory", ""]);
    });

    test('should run git init --bare', async ({ page }) => {
      // Run twice to check PROXYFS.rename https://github.com/emscripten-forge/recipes/pull/6067
      for (let repeat = 0; repeat < 2; repeat++) {
        await runCommand(page, 'git init . --bare');
        await runCommand(page, 'tree -afi > git1.txt 2> err1.txt');

        let output = await retrieveAndDeleteFile(page, 'git1.txt');
        expect(output).toEqual([
          '.',
          './HEAD',
          './config',
          './description',
          './fact.lua',
          './hooks',
          './hooks/README.sample',
          './info',
          './info/exclude',
          './months.txt',
          './objects',
          './objects/info',
          './objects/pack',
          './refs',
          './refs/heads',
          './refs/tags',
          '',
          '9 directories, 7 files',
          ''
        ]);
        output = await retrieveAndDeleteFile(page, 'err1.txt');
        expect(output).toEqual(['']);

        await runCommand(page, 'rm -rf *');
        await runCommand(page, 'ls * > git2.txt 2> err2.txt');

        output = await retrieveAndDeleteFile(page, 'git2.txt');
        expect(output).toEqual(['fact.lua', 'months.txt', '']);

        output = await retrieveAndDeleteFile(page, 'err2.txt');
        expect(output).toEqual(['']);

        await runCommand(page, 'rm -rf *');
      }
    });

    test('should clone remote repository', async ({ page }) => {
      // Note: uses CORS proxy to access github repo.
      // Run twice to check PROXYFS.rename https://github.com/emscripten-forge/recipes/pull/6067
      for (let repeat = 0; repeat < 2; repeat++) {
        await runCommand(page, 'git clone https://github.com/ianthomas23/cockle-playground');
        await runCommand(page, 'tree -afi cockle-playground > git1.txt 2> err1.txt');

        let output = await retrieveAndDeleteFile(page , 'git1.txt');
        // Do not match all of the files as some contain hashes.
        expect(output).toContainEqual('cockle-playground/LICENSE');
        expect(output).toContainEqual('cockle-playground/README.md');
        expect(output).toContainEqual('cockle-playground/package.json');
        expect(output).toContainEqual('cockle-playground/.git');
        expect(output).toContainEqual('cockle-playground/.git/FETCH_HEAD');
        expect(output).toContainEqual('cockle-playground/.git/HEAD');
        expect(output).toContainEqual('cockle-playground/.git/config');
        expect(output).toContainEqual('cockle-playground/.git/description');
        expect(output).toContainEqual('cockle-playground/.git/hooks');
        expect(output).toContainEqual('cockle-playground/.git/hooks/README.sample');
        expect(output).toContainEqual('cockle-playground/.git/index');
        expect(output).toContainEqual('cockle-playground/.git/info');
        expect(output).toContainEqual('cockle-playground/.git/info/exclude');
        expect(output).toContainEqual('cockle-playground/.git/logs');
        expect(output).toContainEqual('cockle-playground/.git/logs/HEAD');
        expect(output).toContainEqual('cockle-playground/.git/logs/refs');
        expect(output).toContainEqual('cockle-playground/.git/logs/refs/heads');
        expect(output).toContainEqual('cockle-playground/.git/logs/refs/heads/main');
        expect(output).toContainEqual('cockle-playground/.git/logs/refs/remotes');
        expect(output).toContainEqual('cockle-playground/.git/objects');
        expect(output).toContainEqual('cockle-playground/.git/objects/info');
        expect(output).toContainEqual('cockle-playground/.git/objects/pack');
        expect(output).toContainEqual('cockle-playground/.git/refs');
        expect(output).toContainEqual('cockle-playground/.git/refs/heads');
        expect(output).toContainEqual('cockle-playground/.git/refs/heads/main');
        expect(output).toContainEqual('cockle-playground/.git/refs/remotes');
        expect(output).toContainEqual('cockle-playground/.git/refs/tags');

        output = await retrieveAndDeleteFile(page, 'err1.txt');
        expect(output).toEqual(['']);

        await runCommand(page, 'rm -rf cockle-playground *.txt');
      }
    });
  });

  test.describe('nano', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({
        page,
        supportsSAB
      }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

        await runCommand(page, 'nano a.txt');

        // Insert new characters.
        await runCommand(page, 'mnopqrst', false);

        // Save and quit.
        await page.keyboard.press('Control+x');
        await runCommand(page, 'y');

        const output = await retrieveAndDeleteFile(page, 'a.txt');
        expect(output).toEqual(['mnopqrst', '']);
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page,
        supportsSAB
      }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

        // Prepare file to delete from.
        await runCommand(page, 'echo mnopqrst > b.txt');

        await runCommand(page, 'nano b.txt');

        // Delete first 4 characters.
        for (let i = 0; i < 4; i++) {
          await page.keyboard.press('Delete');
        }

        // Save and quit.
        await page.keyboard.press('Control+x');
        await runCommand(page, 'y');

        const output = await retrieveAndDeleteFile(page, 'b.txt');
        expect(output).toEqual(['qrst', '']);
      });
    });
  });

  test.describe('vim', () => {
    const stdinOptions = ['sab', 'sw'];
    stdinOptions.forEach(stdinOption => {
      test(`should create new file using ${stdinOption} for stdin`, async ({
        page,
        supportsSAB
      }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

        await runCommand(page, 'vim c.txt');

        // Insert new characters.
        await runCommand(page, 'iabcdefgh', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await runCommand(page, ':wq');

        const output = await retrieveAndDeleteFile(page, 'c.txt');
        expect(output).toEqual(['abcdefgh', '']);
      });

      test(`should delete data from file using ${stdinOption} for stdin`, async ({
        page,
        supportsSAB
      }) => {
        test.skip(stdinOption === 'sab' && !supportsSAB, 'SAB not available');
        await setStdinOption(page, stdinOption);

        // Prepare file to delete from.
        await runCommand(page, 'echo abcdefgh > d.txt');

        await runCommand(page, 'vim d.txt');

        // Delete first 4 characters.
        await runCommand(page, 'd4l', false);

        // Save and quit.
        await page.keyboard.press('Escape');
        await runCommand(page, ':wq');

        const output = await retrieveAndDeleteFile(page, 'd.txt');
        expect(output).toEqual(['efgh', '']);
      });
    });
  });
});
