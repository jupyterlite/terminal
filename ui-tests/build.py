# Build jupyterlite deployment containing terminal extension for playwright tests.

from pathlib import Path
from subprocess import run

import jupyterlab

extra_labextensions_path = str(Path(jupyterlab.__file__).parent / "galata")
cmd = [
    "jupyter",
    "lite",
    "build",
    "--contents",
    "contents",
    f"--FederatedExtensionAddon.extra_labextensions_path={extra_labextensions_path}",
]
run(cmd, check=True)
