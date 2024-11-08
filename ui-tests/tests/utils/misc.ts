import { Buffer } from 'node:buffer';

export const WAIT_MS = 100;
export const TERMINAL_SELECTOR = '.jp-Terminal';

export function decode64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('binary');
}

export async function inputLine(page, text: string) {
  for (const char of text) {
    await page.keyboard.type(char);
    await page.waitForTimeout(10);
  }
  await page.keyboard.press('Enter');
}
