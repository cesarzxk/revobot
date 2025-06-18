# Etapa base com dependências mínimas para build
FROM alpine:3.19 AS base

ENV USER=revobot \
    HOME=/home/revobot

RUN apk add --no-cache \
      nodejs npm \
      python3 py3-pip \
      curl \
      ffmpeg \
      shadow && \
    addgroup -S ${USER} && adduser -S ${USER} -G ${USER}

USER ${USER}
WORKDIR ${HOME}

FROM base AS build

USER root
RUN apk add --no-cache build-base

COPY --chown=${USER}:${USER} . ./
USER ${USER}

RUN npm ci && npm run build

FROM base AS prod

RUN python3 -m venv /home/revobot/venv && \
    /home/revobot/venv/bin/pip install --no-cache-dir spotdl

COPY --from=build --chown=${USER}:${USER} /home/revobot/package*.json ./
COPY --from=build --chown=${USER}:${USER} /home/revobot/dist ./dist
COPY --from=build --chown=${USER}:${USER} /home/revobot/imgs ./dist/imgs

RUN npm ci --omit=dev

CMD ["node", "./dist/index.js"]
