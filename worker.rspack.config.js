const path = require('path');
const { CopyRspackPlugin } = require('@rspack/core');

// Vendored copy of cockle's prepare_wasm tool, used by the JupyterLite add-on at deployment
// build time so that it matches the version of cockle that this extension was built against.
// prepare_wasm.js reads ../../cockle-config-base.json relative to its own directory, so the
// same directory structure is used here.
const cockleDir = path.dirname(require.resolve('@jupyterlite/cockle/package.json'));
const vendorDir = path.resolve(__dirname, 'jupyterlite_terminal', 'cockle');

const rules = [
  {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'source-map-loader'
  }
];

const resolve = {
  fallback: {
    fs: false,
    child_process: false,
    crypto: false
  },
  extensions: ['.js']
};

module.exports = [
  {
    entry: {
      ['coincident.worker']: './lib/coincident.worker.js',
      ['comlink.worker']: './lib/comlink.worker.js'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'lib')
    },
    module: {
      rules
    },
    devtool: 'source-map',
    resolve
  },
  {
    target: 'node',
    entry: {
      prepare_wasm: path.join(cockleDir, 'lib', 'tools', 'prepare_wasm.js')
    },
    output: {
      filename: '[name].js',
      path: path.join(vendorDir, 'lib', 'tools'),
      clean: true
    },
    node: {
      // Use the runtime __dirname so that cockle-config-base.json is found.
      __dirname: false
    },
    devtool: false,
    plugins: [
      new CopyRspackPlugin({
        patterns: [
          {
            from: path.join(cockleDir, 'cockle-config-base.json'),
            to: path.join(vendorDir, 'cockle-config-base.json')
          }
        ]
      })
    ]
  }
];
