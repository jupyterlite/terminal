import type { Contents } from '@jupyterlab/services';
import type { Page } from '@playwright/test';

/**
 * Helper class to interact with JupyterLite contents manager.
 *
 * A subset of the functionality of galata's implementation
 */
export class ContentsHelper {
  constructor(readonly page: Page) {}

  async directoryExists(dirPath: string): Promise<boolean> {
    const content = await this._get(dirPath, false, 'directory');
    return content?.type === 'directory';
  }

  async fileExists(filePath: string): Promise<boolean> {
    const content = await this._get(filePath, false);
    return content?.type === 'notebook' || content?.type === 'file';
  }

  async getContentMetadata(
    path: string,
    type: 'file' | 'directory' = 'file',
    format: Contents.FileFormat = 'text'
  ): Promise<Contents.IModel | null> {
    return await this._get(path, true, type, format);
  }

  private async _get(
    path: string,
    wantContents: boolean,
    type?: 'file' | 'directory',
    format?: Contents.FileFormat
  ): Promise<Contents.IModel | null> {
    type = type ?? 'file';
    const model = await this.page.evaluate(
      async ({ path, wantContents, format, type }) => {
        const contents = window.galata.app.serviceManager.contents;
        const options: Contents.IFetchOptions = {
          type,
          content: wantContents,
          format
        };
        try {
          return await contents.get(path, options);
        } catch (error) {
          return null;
        }
      },
      { path, wantContents, type, format }
    );
    return model;
  }
}
