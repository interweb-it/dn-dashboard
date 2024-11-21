# Use Node.js image for building and running the app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
# RUN npm install
RUN yarn install

COPY . .

# RUN npm run build
RUN yarn build

# Production stage
FROM node:18 AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./

EXPOSE 4000

CMD ["node", "dist/main.js"]
