# Changelog

<!-- <START NEW CHANGELOG ENTRY> -->

## 1.2.0

This release updates to `jupyterlite 0.7.0` and `cockle 1.3.0`. The latter includes a fix for a significant bug when using the service worker for `stdin` when running interactive commands such as `vim`. For full details see the [Cockle changelog](https://github.com/jupyterlite/cockle/blob/main/CHANGELOG.md#130).

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v1.1.0...a9285fb3d615280f3d62502ff86e18a7ed874ec8))

### Enhancements made

- Update cockle from 1.2.0 to 1.3.0 [#85](https://github.com/jupyterlite/terminal/pull/85) ([@ianthomas23](https://github.com/ianthomas23))
- Add git2cpp to deployment [#76](https://github.com/jupyterlite/terminal/pull/76) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Update to jupyterlite 0.7.0 [#87](https://github.com/jupyterlite/terminal/pull/87) ([@ianthomas23](https://github.com/ianthomas23))
- Make ui-tests more robust [#86](https://github.com/jupyterlite/terminal/pull/86) ([@ianthomas23](https://github.com/ianthomas23))
- Add python 3.14, remove 3.9 [#84](https://github.com/jupyterlite/terminal/pull/84) ([@ianthomas23](https://github.com/ianthomas23))
- Enforce type imports [#82](https://github.com/jupyterlite/terminal/pull/82) ([@ianthomas23](https://github.com/ianthomas23))
- Update to jupyterlite 0.7.0rc0 and jupyterlab 4.5.0 [#81](https://github.com/jupyterlite/terminal/pull/81) ([@ianthomas23](https://github.com/ianthomas23))

### Documentation improvements

- Update README for 1.1.0 release [#80](https://github.com/jupyterlite/terminal/pull/80) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-10-27&to=2025-12-03&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Agithub-actions+updated%3A2025-10-27..2025-12-03&type=Issues) | [@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-10-27..2025-12-03&type=Issues)

<!-- <END NEW CHANGELOG ENTRY> -->

## 1.1.0

This updates from `cockle` 1.0.0 to 1.2.0 bringing the following enhancements:

- Support `termios` settings in `JavaScript` and `External` commands.
- New environment variable `COCKLE_DARK_MODE` to indicate if terminal is currently dark or light mode.
- Include `shellId` in all run and tab completion contexts.
- Various improvements to tab completion.

For full details see the [Cockle changelog](https://github.com/jupyterlite/cockle/blob/main/CHANGELOG.md).

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v1.0.1...dee237ce758e2bbfba208a6a9cffa55b4d95c61a))

### Enhancements made

- Update to cockle 1.2.0 [#77](https://github.com/jupyterlite/terminal/pull/77) ([@ianthomas23](https://github.com/ianthomas23))
- Pass on themeChanged boolean to cockle [#75](https://github.com/jupyterlite/terminal/pull/75) ([@ianthomas23](https://github.com/ianthomas23))
- Add terminalDisposed Signal to ILiteTerminalAPIClient [#74](https://github.com/jupyterlite/terminal/pull/74) ([@ianthomas23](https://github.com/ianthomas23))
- Support use of `lite_dir` when deploying [#70](https://github.com/jupyterlite/terminal/pull/70) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Update to cockle 1.1.0 [#72](https://github.com/jupyterlite/terminal/pull/72) ([@ianthomas23](https://github.com/ianthomas23))
- Add github action containing link to Read the Docs PR preview [#71](https://github.com/jupyterlite/terminal/pull/71) ([@ianthomas23](https://github.com/ianthomas23))
- Remove use of vercel for demo deployment [#69](https://github.com/jupyterlite/terminal/pull/69) ([@ianthomas23](https://github.com/ianthomas23))

### Documentation improvements

- Add log and favicon to docs [#73](https://github.com/jupyterlite/terminal/pull/73) ([@ianthomas23](https://github.com/ianthomas23))
- Add infrastructure for project docs [#68](https://github.com/jupyterlite/terminal/pull/68) ([@ianthomas23](https://github.com/ianthomas23))
- Update docs for 1.0.1 release [#66](https://github.com/jupyterlite/terminal/pull/66) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-09-03&to=2025-10-27&type=c))

[@github-actions](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Agithub-actions+updated%3A2025-09-03..2025-10-27&type=Issues) | [@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-09-03..2025-10-27&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2025-09-03..2025-10-27&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-09-03..2025-10-27&type=Issues)

## 1.0.1

This is a maintenance release to support JupyterLite 0.7 as well as 0.6.

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v1.0.0...84fedfaec1965a7d1ebac77b69c0543a63199495))

### Maintenance and upkeep improvements

- Run CI on earliest and latest supported jupyterlite-core [#65](https://github.com/jupyterlite/terminal/pull/65) ([@ianthomas23](https://github.com/ianthomas23))
- Allow for JupyterLite 0.7 pre-releases [#64](https://github.com/jupyterlite/terminal/pull/64) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-08-11&to=2025-09-03&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-08-11..2025-09-03&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2025-08-11..2025-09-03&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-08-11..2025-09-03&type=Issues)

## 1.0.0

This is a major release introducing support for tab completion in built-in, external and javascript commands via `CommandArguments` classes. There are also new built-in commands `false`, `true`, `help` and `which`, and support for handling theme changes.

The changes in external commands, command contexts and command argument classes are backwards incompatible, hence the major version bump.

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.2.2...07f77bd4f3c69d409cc668381cd613a87c5542e5))

### Enhancements made

- Update to cockle 1.0.0 [#63](https://github.com/jupyterlite/terminal/pull/63) ([@ianthomas23](https://github.com/ianthomas23))
- Pass on theme change to cockle [#62](https://github.com/jupyterlite/terminal/pull/62) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-06-27&to=2025-08-11&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-06-27..2025-08-11&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-06-27..2025-08-11&type=Issues)

## 0.2.2

This release adds support for the `less` command (with limitations), various enhancements to external commands (TypeScript commands that run in the main UI thread), and initial support to determine the terminal background color to identify dark mode.

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.2.1...5c8447f9b3c8a147b829d8e83fa8145f628cc9f0))

### Enhancements made

- Update to cockle 0.1.2 [#61](https://github.com/jupyterlite/terminal/pull/61) ([@ianthomas23](https://github.com/ianthomas23))

### Bugs fixed

- Revert PR 57 [#58](https://github.com/jupyterlite/terminal/pull/58) ([@ianthomas23](https://github.com/ianthomas23))
- Disable jupyterlab's terminal-manager extension [#57](https://github.com/jupyterlite/terminal/pull/57) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Add UI tests for `nano` and `vim` commands [#60](https://github.com/jupyterlite/terminal/pull/60) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-06-09&to=2025-06-27&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-06-09..2025-06-27&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2025-06-09..2025-06-27&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-06-09..2025-06-27&type=Issues)

## 0.2.1

This is a bug fix release to fix bugs in URLs and the use of ServiceWorker for `stdin` from `cockle 0.1.1`.

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.2.0...4a27983d45168a80eff58c4be27b606db6874088))

### Maintenance and upkeep improvements

- Bump cockle to 0.1.1 [#56](https://github.com/jupyterlite/terminal/pull/56) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-06-04&to=2025-06-09&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-06-04..2025-06-09&type=Issues)

## 0.2.0

This release is a significant rewrite to work with JupyterLite 0.6.0 and to add support for using the JupyterLite ServiceWorker to provide `stdin` whilst commands are running, as an alternative to the existing SharedArrayBuffer implementation. Use of a ServiceWorker means it is no longer necessary to serve the terminal extension using cross-origin headers.

If served with cross-origin headers both the SharedArrayBuffer and ServiceWorker stdin implementations will be available, with SharedArrayBuffer used by default. The user can switch between them at runtime using the shell command `cockle-config -s`.

([Full Changelog](https://github.com/jupyterlite/terminal/compare/312424ac...9b840f74385fda59b84fe68086a11bfb51e08a3c))

### Enhancements made

- Update to cockle 0.1.0 [#55](https://github.com/jupyterlite/terminal/pull/55) ([@ianthomas23](https://github.com/ianthomas23))
- Add experimental support for registering external commands [#54](https://github.com/jupyterlite/terminal/pull/54) ([@ianthomas23](https://github.com/ianthomas23))
- Implement extension using `ITerminalAPIClient` [#53](https://github.com/jupyterlite/terminal/pull/53) ([@ianthomas23](https://github.com/ianthomas23))
- Support use of service worker to handle stdin [#51](https://github.com/jupyterlite/terminal/pull/51) ([@ianthomas23](https://github.com/ianthomas23))
- Rewrite as JupyterLab frontend plugin [#49](https://github.com/jupyterlite/terminal/pull/49) ([@ianthomas23](https://github.com/ianthomas23))
- Update to cockle 0.0.18 to support nano and sed commands [#48](https://github.com/jupyterlite/terminal/pull/48) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Update to jupyterlite 0.6.0 [#52](https://github.com/jupyterlite/terminal/pull/52) ([@ianthomas23](https://github.com/ianthomas23))
- Remove micromamba pin in CI [#50](https://github.com/jupyterlite/terminal/pull/50) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-02-26&to=2025-06-04&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-02-26..2025-06-04&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2025-02-26..2025-06-04&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-02-26..2025-06-04&type=Issues)

## 0.2.0a0

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.6...24a17cd549c024b9f7325c11012c92c70ba6d038))

### Enhancements made

- Rewrite as JupyterLab frontend plugin [#49](https://github.com/jupyterlite/terminal/pull/49) ([@ianthomas23](https://github.com/ianthomas23))
- Update to cockle 0.0.18 to support nano and sed commands [#48](https://github.com/jupyterlite/terminal/pull/48) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Remove micromamba pin in CI [#50](https://github.com/jupyterlite/terminal/pull/50) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-02-26&to=2025-05-19&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-02-26..2025-05-19&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2025-02-26..2025-05-19&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2025-02-26..2025-05-19&type=Issues)

## 0.1.6

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.5...a3ffc6b6c3c9dfdd3d4920ae7f76435f3d0bc9f3))

### Enhancements made

- Build and use own shell web worker using DriveFS [#47](https://github.com/jupyterlite/terminal/pull/47) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2025-02-05&to=2025-02-26&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2025-02-05..2025-02-26&type=Issues)

## 0.1.5

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.4...02b85a5ca55ecdbe855deffafd4e3188f9f7395b))

### Enhancements made

- Implement terminal shutdown [#41](https://github.com/jupyterlite/terminal/pull/41) ([@ianthomas23](https://github.com/ianthomas23))
- Rename Terminals to TerminalManager [#40](https://github.com/jupyterlite/terminal/pull/40) ([@ianthomas23](https://github.com/ianthomas23))
- Update to jupyterlite 0.5.0 and jupyterlab 4.3.4 [#39](https://github.com/jupyterlite/terminal/pull/39) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Update to cockle 0.0.15 [#45](https://github.com/jupyterlite/terminal/pull/45) ([@ianthomas23](https://github.com/ianthomas23))
- Update to cockle 0.0.13 [#38](https://github.com/jupyterlite/terminal/pull/38) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-12-13&to=2025-02-05&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2024-12-13..2025-02-05&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2024-12-13..2025-02-05&type=Issues)

## 0.1.4

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.3...b314c09e9c24ef9c1ea881022724edfe27a66bf4))

### Enhancements made

- Update to cockle 0.0.12, adding tree and vim commands [#37](https://github.com/jupyterlite/terminal/pull/37) ([@ianthomas23](https://github.com/ianthomas23))
- Add some file system tests [#34](https://github.com/jupyterlite/terminal/pull/34) ([@ianthomas23](https://github.com/ianthomas23))
- Add some playwright ui tests [#33](https://github.com/jupyterlite/terminal/pull/33) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-10-29&to=2024-12-13&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2024-10-29..2024-12-13&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2024-10-29..2024-12-13&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2024-10-29..2024-12-13&type=Issues)

## 0.1.3

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.2...8f8a93f74b9dfd29775badf53e9dbd67406e2213))

### Enhancements made

- Support use of em-forge wasm files in standalone JupyterLite deployment [#31](https://github.com/jupyterlite/terminal/pull/31) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-10-23&to=2024-10-29&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2024-10-23..2024-10-29&type=Issues)

## 0.1.2

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.1...03a24763b3e14e04fe09373b8ed0f2ee040b729f))

### Enhancements made

- Update to cockle 0.0.10 [#30](https://github.com/jupyterlite/terminal/pull/30) ([@ianthomas23](https://github.com/ianthomas23))
- Obtain wasm packages from emscripten-forge when building deployment [#27](https://github.com/jupyterlite/terminal/pull/27) ([@ianthomas23](https://github.com/ianthomas23))

### Maintenance and upkeep improvements

- Add config files to deploy to Vercel with the COOP / COEP headers [#28](https://github.com/jupyterlite/terminal/pull/28) ([@jtpio](https://github.com/jtpio))

### Documentation improvements

- Update link to the demo, add demo files [#29](https://github.com/jupyterlite/terminal/pull/29) ([@jtpio](https://github.com/jtpio))
- Add use of static-handler to README [#26](https://github.com/jupyterlite/terminal/pull/26) ([@ianthomas23](https://github.com/ianthomas23))
- Update readme with screenshot and extra http headers [#25](https://github.com/jupyterlite/terminal/pull/25) ([@ianthomas23](https://github.com/ianthomas23))
- Add better screenshot [#24](https://github.com/jupyterlite/terminal/pull/24) ([@ianthomas23](https://github.com/ianthomas23))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-09-16&to=2024-10-23&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2024-09-16..2024-10-23&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2024-09-16..2024-10-23&type=Issues) | [@vercel](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Avercel+updated%3A2024-09-16..2024-10-23&type=Issues)

## 0.1.1

([Full Changelog](https://github.com/jupyterlite/terminal/compare/v0.1.0...f730b658ac11ee7299f697bb81781e2746c83655))

### Enhancements made

- Remove WebWorker code that is now in cockle [#21](https://github.com/jupyterlite/terminal/pull/21) ([@ianthomas23](https://github.com/ianthomas23))
- Replace postMessage from webworker with comlink callback [#16](https://github.com/jupyterlite/terminal/pull/16) ([@ianthomas23](https://github.com/ianthomas23))
- Use WASM commands running in webworker [#15](https://github.com/jupyterlite/terminal/pull/15) ([@ianthomas23](https://github.com/ianthomas23))

### Bugs fixed

- Fix listing of terminals [#11](https://github.com/jupyterlite/terminal/pull/11) ([@jtpio](https://github.com/jtpio))

### Maintenance and upkeep improvements

- Update jupyterlite to 0.4.0 and cockle to 0.0.5 [#18](https://github.com/jupyterlite/terminal/pull/18) ([@ianthomas23](https://github.com/ianthomas23))
- Support JupyterLite 0.4.0 packages [#14](https://github.com/jupyterlite/terminal/pull/14) ([@jtpio](https://github.com/jtpio))

### Documentation improvements

- Add JupyterLite badge to the README [#10](https://github.com/jupyterlite/terminal/pull/10) ([@jtpio](https://github.com/jtpio))
- Add workflow for deploying a demo to GitHub Pages [#9](https://github.com/jupyterlite/terminal/pull/9) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-05-29&to=2024-09-16&type=c))

[@ianthomas23](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Aianthomas23+updated%3A2024-05-29..2024-09-16&type=Issues) | [@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2024-05-29..2024-09-16&type=Issues)

## 0.1.0

([Full Changelog](https://github.com/jupyterlite/terminal/compare/1076c3fb09302a306d7084f72d2fb58ead8adc84...b3ae8d8409eaa8d883ad52eb829016951001790b))

### Enhancements made

- Add missing dependencies and handling of terminal clients [#2](https://github.com/jupyterlite/terminal/pull/2) ([@jtpio](https://github.com/jtpio))
- Skip the browser check for now [#1](https://github.com/jupyterlite/terminal/pull/1) ([@jtpio](https://github.com/jtpio))

### Maintenance and upkeep improvements

- Reset version for initial release [#8](https://github.com/jupyterlite/terminal/pull/8) ([@jtpio](https://github.com/jtpio))
- Rename package to `@jupyterlite/terminal` [#7](https://github.com/jupyterlite/terminal/pull/7) ([@jtpio](https://github.com/jtpio))

### Contributors to this release

([GitHub contributors page for this release](https://github.com/jupyterlite/terminal/graphs/contributors?from=2024-05-16&to=2024-05-29&type=c))

[@jtpio](https://github.com/search?q=repo%3Ajupyterlite%2Fterminal+involves%3Ajtpio+updated%3A2024-05-16..2024-05-29&type=Issues)
