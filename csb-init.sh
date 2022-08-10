#!/bin/sh
# Initialize CodeSandbox project
# ------------------------------

cd "$WORKSPACE_PATH/suborbital"

# Docker runs in a high-uid namespace and won't be able to
# create bind mounts and files unless we set these folders to
# world-writable
chmod 777 . ./config

if [ $(stat -c '%a' .) != 777 ]; then
    echo "--------"
    echo "WARNING!"
    echo "$(pwd) should be world-writable for Docker mounts to work. We tried changing the permissions but it didn't work, check if you are the owner of the folder. Until permissions are fixed you may have trouble running docker-compose up!"
    echo "========"
fi

# The builder needs this file to exist
touch .who

# Download and install `subo` into a folder that's already on the $PATH
# so we don't have to worry about updating the $PATH
which subo > /dev/null
if [ $? -eq 0 ]; then
    echo 'The subo CLI is already installed'
else
    curl -L https://github.com/suborbital/subo/releases/latest/download/subo-v0.5.4-linux-amd64.tar.gz | tar -xzf - -C /usr/local/bin/ subo
fi

# Use a special version of the SCN Control Plane that is
# immune to telemetry issues
docker image inspect suborbital/scc-control-plane:heartbreak > /dev/null
if [ $? -eq 0 ]; then
    echo 'Custom control plane already downloaded'
else
    curl -s https://s3.flak.is/public/scc-heartbreak.tar.gz | gzip -dc - > scc-heartbreak.tar
    docker load -i scc-heartbreak.tar # => suborbital/scc-control-plane:heartbreak
    rm scc-heartbreak.tar
fi

# An SCN Environment token must be already saved to the CodeSandbox Env
if [ ! -e SCC.env ]; then
    # If there is a token on the environment, use that
    if [ ! -z "$SCC_ENV_TOKEN" ]; then
        echo "SCC_ENV_TOKEN=$SCC_ENV_TOKEN" > SCC.env
    fi
fi

# If there is still no token, offer the user to create one
if [ ! -e SCC.env ]; then
    echo "You will need a Compute Environment Token to use Suborbital Compute."
    echo "Enter your email address below to receive one, or hit Enter if you want to use an existing token (you will be asked to enter it when starting up Compute)."
    read -p "Email address: " email
    if [ ! -z "$email" ]; then
        subo compute create token $email
    fi
fi

echo 'Successfully initialized'

# ENV:
# HOSTNAME=[xxxxxx]
# CODESANDBOX_HOST=[xxxxxx]-$PORT.preview.csb.app
# App URL:
# https://[xxxxxx]-3000.preview.csb.app
