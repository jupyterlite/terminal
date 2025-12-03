/**
 * Configuration for Playwright using default from @jupyterlab/galata
 */
const baseConfig = require('@jupyterlab/galata/lib/playwright-config');

module.exports = {
  ...baseConfig,
  use: {
    acceptDownloads: true,
    autoGoto: false,
    baseURL: 'http://localhost:8000'
  },
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  webServer: {
    command: 'jlpm start',
    port: 8000,
    timeout: 120 * 1000,
    reuseExistingServer: true
  }
};
