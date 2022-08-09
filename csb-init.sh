#!/bin/sh
# Initialize CodeSandbox project
# ------------------------------

# Docker runs in a high-uid namespace and won't be able to
# create bind mounts and files unless we set these folders to
# world-writable
chmod o+w /project/knockoff/suborbital
chmod o+w /project/knockoff/suborbital/config

echo "SCC_ENV_TOKEN=$SCC_ENV_TOKEN" > /project/knockoff/suborbital/SCC.env

# Download and install `subo` into a folder that's already on the $PATH
# so we don't have to worry about updating the $PATH
mkdir -p /project/home/flaki/.nix-profile/bin
cd /project/home/flaki/.nix-profile/bin
wget https://github.com/suborbital/subo/releases/latest/download/subo-v0.5.4-linux-amd64.tar.gz
tar -xzf subo-v0.5.4-linux-amd64.tar.gz subo
rm subo-v0.5.4-linux-amd64.tar.gz

# ENV:
# HOSTNAME=[xxxxxx]
# CODESANDBOX_HOST=[xxxxxx]-$PORT.preview.csb.app
# App URL:
# https://[xxxxxx]-3000.preview.csb.app
