const path = require('path');
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.NormalModuleReplacementPlugin(
      // Use pre-bundled shell_worker.
      /\/cockle\/lib\/shell_worker.js$/,
      path.resolve(
        __dirname,
        'node_modules/@jupyterlite/cockle/lib/worker_bundle/shell_worker.js'
      )
    )
  ]
};
