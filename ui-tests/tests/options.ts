import { test as base } from '@jupyterlab/galata';

type TestOptions = {
  supportsSAB: boolean;
};

export const test = base.extend<TestOptions>({
  supportsSAB: [
    // Playwright fixtures require an object destructuring pattern as the first argument
    // eslint-disable-next-line no-empty-pattern
    async ({}, use, testInfo) => {
      await use(testInfo.project.use.supportsSAB as boolean);
    },
    { option: true }
  ]
});

export { expect } from '@jupyterlab/galata';
