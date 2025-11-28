import { Buffer } from 'node:buffer';
import { expect } from '@jupyterlab/galata';
import type { Page } from '@playwright/test';

export const INITIAL_WAIT_MS = 300;
export const WAIT_MS = 100;
export const TERMINAL_SELECTOR = '.jp-Terminal';

export function decode64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('binary');
}

export async function inputLine(
  page: Page,
  text: string,
  enter: boolean = true
) {
  await page.waitForTimeout(20);
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(20);
  }
  if (enter) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(20);
  }
}

async function refreshFilebrowser({ page }): Promise<void> {
  try {
    await page.filebrowser.refresh();
  } catch (e) {
    // no-op
  }
}

export async function fileContent(
  page: any,
  filename: string
): Promise<string | undefined> {
  await refreshFilebrowser({ page });
  expect(await page.filebrowser.isFileListedInBrowser(filename)).toBeTruthy();
  await page.filebrowser.open(filename);

  const clickMenuItem = async (command): Promise<void> => {
    await page.menu.openContextMenuLocator(
      `.jp-DirListing-content >> text="${filename}"`
    );
    await page.getByText(command).click();
  };

  const [newTab] = await Promise.all([
    page.waitForEvent('popup'),
    clickMenuItem('Open in New Browser Tab')
  ]);

  await newTab.waitForLoadState('networkidle');
  const content = await newTab.textContent('body');
  return content;
}
