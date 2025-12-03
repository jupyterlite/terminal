import { Buffer } from 'node:buffer';
import type { Page } from '@playwright/test';

export const WAIT_MS = 100;

// Long wait such as for starting/stopping a complex WebAssembly command.
export const LONG_WAIT_MS = 300;

export const TERMINAL_SELECTOR = '.jp-Terminal';

export function decode64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('binary');
}

export async function inputLine(
  page: Page,
  text: string,
  enter: boolean = true
) {
  const ms = 20;
  await page.waitForTimeout(ms);
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(ms);
  }
  if (enter) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(ms);
  }
}
