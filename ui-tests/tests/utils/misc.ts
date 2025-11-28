import { Buffer } from 'node:buffer';
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
