"""JupyterLite addon to manage obtaining Wasm packages when building deployment"""
import os
from pathlib import Path
import subprocess

from jupyterlite_core.addons.federated_extensions import FederatedExtensionAddon
from jupyterlite_core.constants import (
    FEDERATED_EXTENSIONS,
    JUPYTERLITE_JSON,
    LAB_EXTENSIONS,
    SHARE_LABEXTENSIONS,
    UTF8,
)


class TerminalAddon(FederatedExtensionAddon):
    __all__ = ["post_build"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def post_build(self, manager):
        lite_dir = manager.lite_dir
        output_dir = manager.output_dir

        # Vendored copy of cockle's prepare_wasm tool, bundled at build time so that it matches
        # the version of cockle that this extension was built against.
        cockleTool = Path(__file__).parent / "cockle" / "lib" / "tools" / "prepare_wasm.js"
        if not cockleTool.is_file():
            raise FileNotFoundError(f"TerminalAddon: cannot find vendored cockle tool {cockleTool}")

        assetDir = output_dir / "extensions" / "@jupyterlite" / "terminal" / "static" / "wasm"

        # Although cockle's prepare_wasm is perfectly capable of copying the wasm and associated
        # files to the asset directory, here we just get the list of required files and let the
        # add-on do the copying for consistency with other extensions.
        tempFilename = lite_dir / 'cockle-files.txt'
        cmd = ["node", str(cockleTool), "--list", str(tempFilename)]
        print("TerminalAddon:", " ".join(cmd))
        subprocess.run(cmd, check=True, cwd=lite_dir)

        with open(tempFilename, 'r') as f:
            for source in f:
                source = Path(source.strip())
                basename = source.name
                packageName = next(f).strip()
                yield dict(
                    name=f"copy:{basename}",
                    actions=[(self.copy_one, [lite_dir / source, assetDir / packageName / basename])],
                )

        os.remove(tempFilename)
