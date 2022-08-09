#!/bin/sh
# Initialize CodeSandbox project
# ------------------------------

cd /project/knockoff/suborbital

# Docker runs in a high-uid namespace and won't be able to
# create bind mounts and files unless we set these folders to
# world-writable
chmod o+w . ./config

# The builder needs this file to exist
touch .who

# An SCN Environment token must be already saved to the CodeSandbox Env
echo "SCC_ENV_TOKEN=$SCC_ENV_TOKEN" > /project/knockoff/suborbital/SCC.env

# Download and install `subo` into a folder that's already on the $PATH
# so we don't have to worry about updating the $PATH
curl -L https://github.com/suborbital/subo/releases/latest/download/subo-v0.5.4-linux-amd64.tar.gz | tar -xzf - -C /usr/local/bin/ subo

# ENV:
# HOSTNAME=[xxxxxx]
# CODESANDBOX_HOST=[xxxxxx]-$PORT.preview.csb.app
# App URL:
# https://[xxxxxx]-3000.preview.csb.app
