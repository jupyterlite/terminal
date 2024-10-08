#!/bin/bash

yum install wget -y

wget -qO- https://micro.mamba.pm/api/micromamba/linux-64/latest | tar -xvj bin/micromamba

export PATH="$PWD/bin:$PATH"
export MAMBA_ROOT_PREFIX="$PWD/micromamba"

# Initialize Micromamba shell
./bin/micromamba shell init -s bash --no-modify-profile -p $MAMBA_ROOT_PREFIX

# Source Micromamba environment directly
eval "$(./bin/micromamba shell hook -s bash)"

# Activate the Micromamba environment
micromamba create -n jupyterenv python=3.11 -c conda-forge -y
micromamba activate jupyterenv

# install the dependencies
python -m pip install -r requirements-deploy.txt

# build the JupyterLite site
jupyter lite --version
jupyter lite build --contents demo/contents --output-dir dist
