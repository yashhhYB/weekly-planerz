# Build stage
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install http-server to serve the Angular app
RUN npm install -g http-server

COPY --from=builder /app/dist/weekly-planner ./dist

EXPOSE 4200

CMD ["http-server", "dist", "-p", "4200", "-c-1"]
