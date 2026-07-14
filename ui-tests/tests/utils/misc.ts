import { Buffer } from 'node:buffer';
import type { Page } from '@playwright/test';
import { expect } from '../options';

export const WAIT_MS = 100;

// Long wait such as for starting/stopping a complex WebAssembly command.
export const LONG_WAIT_MS = 300;

export const TERMINAL_SELECTOR = '.jp-Terminal';

export function decode64(encoded: string): string {
  return Buffer.from(encoded, 'base64').toString('binary');
}

export async function inputLine(page: Page, text: string, enter: boolean = true) {
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

export async function setStdinOption(page: Page, stdinOption: string) {
  await inputLine(page, `cockle-config stdin ${stdinOption}`);
  await page.waitForTimeout(LONG_WAIT_MS);
  await inputLine(page, `env|grep ? > exit.txt`);
  await page.waitForTimeout(LONG_WAIT_MS);
  const exitCodeFile = await page.contents.getContentMetadata('exit.txt');
  expect(exitCodeFile?.content).toBe('?=0\n');
}
