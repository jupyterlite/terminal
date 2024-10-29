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
        cockleTool = Path("node_modules", "@jupyterlite", "cockle", "lib", "tools", "prepare_wasm.js")
        if not cockleTool.is_file():
            cockleTool = ".cockle_temp" / cockleTool
            cmd = ["npm", "install", "--no-save", "--prefix", cockleTool.parts[0], "@jupyterlite/cockle"]
            print("TerminalAddon:", " ".join(cmd))
            subprocess.run(cmd, check=True)

        assetDir = Path(self.manager.output_dir) / "extensions" / "@jupyterlite" / "terminal" / "static" / "wasm"

        # Although cockle's prepare_wasm is perfectly capable of copying the wasm and associated
        # files to the asset directory, here we just get the list of required files and let the
        # add-on do the copying for consistency with other extensions.
        tempFilename = 'cockle-files.txt'
        cmd = ["node", str(cockleTool), "--list", tempFilename]
        print("TerminalAddon:", " ".join(cmd))
        subprocess.run(cmd, check=True)

        with open(tempFilename, 'r') as f:
            for source in f:
                source = Path(source.strip())
                basename = source.name
                yield dict(
                    name=f"copy:{basename}",
                    actions=[(self.copy_one, [source, assetDir / basename])],
                )

        os.remove(tempFilename)
