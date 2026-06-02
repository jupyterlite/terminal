import { expect, test } from '@jupyterlab/galata';
import type { IJupyterLabPageFixture } from '@jupyterlab/galata';

const EXECUTE_SHELL = '@jupyterlite/terminal:execute-shell';
const START_SHELL = '@jupyterlite/terminal:start-shell';
const SHUTDOWN_SHELL = '@jupyterlite/terminal:shutdown-shell';
const LIST_SHELLS = '@jupyterlite/terminal:list-shells';

async function execute(
  page: IJupyterLabPageFixture,
  id: string,
  args: Record<string, any> = {}
) {
  return await page.evaluate(
    ({ id, args }) => window.galata.app.commands.execute(id, args),
    { id, args }
  );
}

test.describe('programmatic commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto();
  });

  test('execute-shell captures output and exit code', async ({ page }) => {
    const result = await execute(page, EXECUTE_SHELL, { code: 'echo hello' });
    expect(result.success).toBe(true);
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('hello');

    // The throwaway shell is disposed once the command finishes.
    const list = await execute(page, LIST_SHELLS);
    expect(list.count).toBe(0);
  });

  test('execute-shell reports a non-zero exit code', async ({ page }) => {
    const result = await execute(page, EXECUTE_SHELL, { code: 'false' });
    expect(result.success).toBe(false);
    expect(result.status).toBe('error');
    expect(result.exitCode).not.toBe(0);
  });

  test('start, reuse, list and shutdown a headless shell', async ({ page }) => {
    const started = await execute(page, START_SHELL);
    expect(started.success).toBe(true);
    const name = started.shellName;

    let list = await execute(page, LIST_SHELLS);
    expect(list.count).toBe(1);
    expect(list.shells[0].name).toBe(name);

    // State persists across calls on the same shell.
    await execute(page, EXECUTE_SHELL, { code: 'cd /', shellName: name });
    const pwd = await execute(page, EXECUTE_SHELL, {
      code: 'pwd',
      shellName: name
    });
    expect(pwd.output.trim()).toBe('/');

    await execute(page, SHUTDOWN_SHELL, { shellName: name });
    list = await execute(page, LIST_SHELLS);
    expect(list.count).toBe(0);
  });
});
