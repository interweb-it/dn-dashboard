# Use Node.js image for building and running the app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
COPY . .

# RUN npm install
RUN yarn install

# RUN npm run build
RUN rm -rf dist
RUN yarn build

# Production stage
FROM node:18 AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 4000

CMD ["node", "dist/main.js"]
