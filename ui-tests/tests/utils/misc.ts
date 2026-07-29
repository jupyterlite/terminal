import type { Page } from '@playwright/test';
import { expect } from '../options';

export const WAIT_MS = 100;

// Long wait such as for starting/stopping a complex WebAssembly command.
export const LONG_WAIT_MS = 300;

export const TERMINAL_SELECTOR = '.jp-Terminal';

export async function retrieveAndDeleteFile(page: Page, filename: string): Promise<string[]> {
  const fileItem = page.locator(`.jp-DirListing-item[title^="Name: ${filename}"]`);
  await fileItem.dblclick();
  await page.waitForTimeout(1000);

  const content = page.locator('.jp-FileEditor .cm-content .cm-line');
  await expect(content.first()).toBeVisible();
  const lines = await content.allTextContents();

  // Close file editor
  await page.locator(`[title="Close ${filename}"]`).click();

  // Delete file using terminal
  await page.locator('.lm-TabBar-tabLabel:has-text("Terminal 1")').click();
  await runCommand(page, `rm ${filename}`);

  return lines;
}

/**
 * Input text into the terminal, usually to run a command but it can be used for interactive stdin
 * using `enter: false`.
 */
export async function runCommand(
  page: Page,
  command: string,
  enter: boolean = true,
  timeoutMs: number = LONG_WAIT_MS
) {
  await page.locator('.lm-TabBar-tabLabel:has-text("Terminal 1")').click();
  const terminalInput = page.locator('.xterm-helper-textarea');
  await terminalInput.click();
  await terminalInput.type(command);
  if (enter) {
    await terminalInput.press('Enter');
  }
  await page.waitForTimeout(timeoutMs);
}

export async function setStdinOption(page: Page, stdinOption: string) {
  await runCommand(page, `cockle-config stdin ${stdinOption}`);
  await runCommand(page, `env|grep ? > exit.txt`);
  const exitCode = await retrieveAndDeleteFile(page, 'exit.txt');
  expect(exitCode[0]).toMatch('?=0');
}
