FROM node:20-alpine

# Set Node options for improved memory management
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=development

WORKDIR /app/backend

COPY package*.json ./

# Combine RUN commands to reduce layers and use production-only dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund && \
    npm install @nestjs/cache-manager@^2.0.0 cache-manager@^5.2.3 @types/cache-manager@^4.0.2 --legacy-peer-deps --no-audit --no-fund && \
    npm install @nestjs/microservices amqplib amqp-connection-manager --legacy-peer-deps --no-audit --no-fund

COPY . .

EXPOSE 4000

# Use npm ci for production builds
CMD ["npm", "run", "start:dev"]