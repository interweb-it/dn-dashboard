# Use project root as build context for monorepo/workspaces
ARG NODE_VERSION=20.18.0
ARG PORT=3000

FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app

# Build
FROM base AS build

# Copy root package files and all workspace packages
COPY --link package.json yarn.lock ./
COPY --link .yarn .yarn
COPY --link .yarnrc.yml ./
COPY --link common ./common
COPY --link backend ./backend

# Enable and prepare Yarn
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# Install all workspace dependencies
RUN yarn install #--immutable

# Build all workspaces
RUN yarn workspaces foreach -A run build

# Run
FROM base

WORKDIR /app/backend
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/common /app/common
COPY --from=build /app/backend/src ./src

ENV PORT=$PORT
ENV MONGO_HOST=$MONGO_HOST
ENV MONGO_PORT=$MONGO_PORT
ENV MONGO_USERNAME=$MONGO_USERNAME
ENV MONGO_PASSWORD=$MONGO_PASSWORD
ENV MONGO_DATABASE=$MONGO_DATABASE
ENV NODE_ENV=production

EXPOSE ${PORT}

CMD ["node", "dist/main.js"]
