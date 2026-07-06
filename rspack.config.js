module.exports = {
  optimization: {
    // Disable realContentHash to avoid "circular hash dependency" error
    // when bundling worker files that contain hash-like strings
    // TODO: remove if handled upstream? https://github.com/jupyterlab/jupyterlab/issues/18245
    realContentHash: false,
  }
};
