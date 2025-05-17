FROM alpine:3.19 as base

ENV USER=revobot
ENV HOME=/home/${USER}

RUN apk add --no-cache \
      curl \
      ffmpeg \
      python3 \
      py3-pip \
      py3-virtualenv \
      build-base \
      nodejs \
      npm \
      shadow && \
    addgroup -S ${USER} && adduser -S ${USER} -G ${USER}

USER ${USER}
WORKDIR ${HOME}

FROM base as build

COPY --chown=${USER}:${USER} . .

RUN npm ci && \
    npm run build && \
    rm -rf node_modules && \
    npm ci --omit=dev

FROM base as prod

RUN python3 -m venv ${HOME}/venv && ${HOME}/venv/bin/pip install --no-cache-dir spotdl

COPY --from=build --chown=${USER}:${USER} ${HOME}/package*.json ./
COPY --from=build --chown=${USER}:${USER} ${HOME}/node_modules ./node_modules
COPY --from=build --chown=${USER}:${USER} ${HOME}/dist ./dist
COPY --from=build --chown=${USER}:${USER} ${HOME}/imgs ./dist/imgs

USER ${USER}
WORKDIR ${HOME}

CMD ["node", "./dist/index.js"]
