from datetime import date
import json
from pathlib import Path

PACKAGE_JSON_FILENAME = Path(__file__).parent.parent / "package.json"
PACKAGE_JSON = json.loads(PACKAGE_JSON_FILENAME.read_text(encoding="utf-8"))

project = 'JupyterLite Terminal'
author = PACKAGE_JSON["author"]["name"]
copyright = f"2024-{date.today().year}, {author}"
release = PACKAGE_JSON["version"]

extensions = [
    "myst_parser"
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

html_static_path = ['_static']
html_theme = "pydata_sphinx_theme"
html_theme_options = {
    "github_url": PACKAGE_JSON["homepage"],
}
html_title = "JupyterLite Terminal"
