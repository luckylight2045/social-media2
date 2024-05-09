FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY --chown=node:node package*.json pnpm-lock.yaml /usr/src/app/

RUN pnpm install --ignore-scripts

COPY --chown=node:node . .

EXPOSE 8085

CMD ["pnpm", "run", "start:dev"]
