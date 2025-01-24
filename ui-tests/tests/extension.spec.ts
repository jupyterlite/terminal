import { expect, test } from '@jupyterlab/galata';

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
