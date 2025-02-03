# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1
WORKDIR /usr/src/app

COPY --chown=bun:bun package.json package-lock.json ./
RUN bun install

COPY --chown=bun:bun . .
RUN bun run build
RUN chown bun:bun /usr/src/app

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]
