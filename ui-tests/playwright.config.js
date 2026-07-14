/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  use: {
    acceptDownloads: true,
    autoGoto: false,
  },
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  projects: [
    {
      name: 'no-coi',
      use: {
        baseURL: 'http://localhost:8000',
        supportsSAB: false
      }
    },
    {
      name: 'coi',
      use: {
        baseURL: 'http://localhost:8001',
        supportsSAB: true
      }
    }
  ],
  webServer: {
    command: 'jlpm start',
    url: 'http://localhost:8000',
    timeout: 120 * 1000,
    reuseExistingServer: true
  }
};
