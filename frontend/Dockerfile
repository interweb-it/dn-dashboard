# Use project root as build context for monorepo/workspaces
ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-slim AS base

ARG PORT=3000
ARG GRAPHQL_API_URL=http://localhost:3000/graphql

WORKDIR /app

# Build
FROM base AS build

# Copy root package files and all workspace packages
COPY --link package.json yarn.lock ./
COPY --link .yarn .yarn
COPY --link .yarnrc.yml ./
COPY --link common ./common
COPY --link frontend ./frontend

# Enable and prepare Yarn
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# Install all workspace dependencies
RUN yarn install #--immutable

# Build only the frontend package
WORKDIR /app/frontend
RUN yarn run build

# Run
FROM base

ENV PORT=$PORT
ENV NODE_ENV=production
ENV GRAPHQL_API_URL=$GRAPHQL_API_URL

WORKDIR /app/frontend
COPY --from=build /app/frontend/.output ./.output
# Optional, only needed if you rely on unbundled dependencies
# COPY --from=build /app/node_modules /app/node_modules

CMD [ "node", ".output/server/index.mjs" ]
