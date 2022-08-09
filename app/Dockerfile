# Get Javy
FROM ghcr.io/suborbital/javy:v0.3.0 as javy

# Get Subo
FROM suborbital/subo:latest as subo


# Build JS components (backend, editor)
FROM node:latest AS js

# Enable pnpm
RUN corepack enable

# Build the backend
WORKDIR /tmp
COPY backend/package*.json /tmp/backend/

RUN cd backend && pnpm install

# Build the editor
COPY editor /tmp/editor
RUN cd editor/monaco && \
    pnpm install && \
    node build.js /editor


# pnpm package cache for creating runnables
FROM node:latest as pnpmcache
WORKDIR /tmp
RUN corepack enable && \
    mkdir mod && \
    cd mod && \
    echo -n '{"name":"rxxx","dependencies":{"@flaki/runnable":"0.16.1","esbuild-wasm":"0.14.51"}}' > package.json && \
    pnpm install && \
    tar -czf /tmp/pnpm-cache.tar.gz $(pnpm store path) && \
    cd /tmp && rm -rf /tmp/mod && mkdir pnpm-cache && cp -r $(pnpm store path)/. /tmp/pnpm-cache/ && \
    ls -lah /tmp/pnpm-cache && ls -lah $(pnpm store path)


# Run the app
FROM node:latest
WORKDIR /application

#COPY --from=tooling /tmp/javysrc/target/release/javy /usr/local/bin/
COPY --from=javy /usr/local/bin/javy /usr/local/bin
#COPY --from=tooling /tmp/subo /usr/local/bin/
COPY --from=subo /go/bin/subo /usr/local/bin
#COPY --from=tooling /tmp/sat /usr/local/bin/
RUN curl -L https://github.com/suborbital/sat/releases/download/v0.1.4/sat-v0.1.4-linux-amd64.tar.gz | tar -xzf - -C /usr/local/bin/ sat

COPY www www
COPY wasm wasm
COPY backend backend
COPY --from=js /tmp/backend backend
COPY --from=js /tmp/editor/monaco/dist www/editor

# Enable pnpm
RUN corepack enable
# Restore pnpm package cache
COPY --from=pnpmcache /tmp/pnpm-cache /root/.local/share/pnpm/store/v3

CMD ["node","/application/backend/index.js"]
