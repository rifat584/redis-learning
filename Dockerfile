FROM node:24-alpine

WORKDIR /redis-docker

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm run build

CMD [ "node", "dist/index.js" ]