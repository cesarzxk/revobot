FROM ubuntu:22.04 as base

ENV USER=evobot

RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential && \
    apt-get purge -y --auto-remove && \
    rm -rf /var/lib/apt/lists/*
  
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN groupadd -r ${USER} && \
    useradd --create-home --home /home/evobot -r -g ${USER} ${USER}

USER ${USER}
WORKDIR /home/evobot

FROM base as build

COPY --chown=${USER}:${USER}  . .


RUN npm ci
RUN npm run build

RUN rm -rf node_modules && \
    npm ci --omit=dev

FROM ubuntu:22.04 as prod

RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

COPY --chown=${USER}:${USER} package*.json ./
COPY --from=build --chown=${USER}:${USER} /home/evobot/node_modules ./node_modules
COPY --from=build --chown=${USER}:${USER} /home/evobot/dist ./dist
COPY --from=build --chown=${USER}:${USER} /home/evobot/imgs ./dist/imgs

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /venv && /venv/bin/pip install --no-cache-dir spotdl

CMD [ "node", "./dist/index.js" ]