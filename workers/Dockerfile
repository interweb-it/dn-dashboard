# Use project root as build context for monorepo/workspaces
ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-slim AS base

# Build time arguments
ARG PORT=3000

WORKDIR /app

# Build
FROM base AS build

# Copy root package files and all workspace packages
COPY --link package.json yarn.lock ./
COPY --link .yarn .yarn
COPY --link .yarnrc.yml ./
COPY --link common ./common
COPY --link workers ./workers

# Enable and prepare Yarn
RUN corepack enable && corepack prepare yarn@4.5.2 --activate

# Install all workspace dependencies
RUN yarn install #--immutable

# Build only the workers package
WORKDIR /app/workers
RUN yarn run build

# Run
FROM base

# Run time environment variables
ENV PORT=$PORT
# ENV MONGO_HOST=$MONGO_HOST
# ENV MONGO_PORT=$MONGO_PORT
# ENV MONGO_USERNAME=$MONGO_USERNAME
# ENV MONGO_PASSWORD=$MONGO_PASSWORD
# ENV MONGO_DATABASE=$MONGO_DATABASE
ENV MONGO_URI=$MONGO_URI
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV NODE_ENV=$NODE_ENV

WORKDIR /app/workers
COPY --from=build /app/workers/dist ./dist
COPY --from=build /app/node_modules /app/node_modules

EXPOSE $PORT

CMD [ "node", "dist/index.js" ]
