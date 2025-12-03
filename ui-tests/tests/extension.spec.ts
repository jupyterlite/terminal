import { expect, test } from '@jupyterlab/galata';

import { LONG_WAIT_MS } from './utils/misc';

test.describe('Terminal extension', () => {
  test('should emit activation console messages', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', message => {
      logs.push(message.text());
    });

    await page.goto();
    await page.waitForTimeout(LONG_WAIT_MS);

    expect(
      logs.filter(s =>
        s.match(
          /^JupyterLite extension @jupyterlite\/terminal:manager activated/
        )
      )
    ).toHaveLength(1);
  });
});
