FROM node:20-alpine

# Set Node options for improved memory management
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV=development

WORKDIR /app/frontend

COPY package*.json ./

# Optimize npm install
RUN npm cache clean --force && \
    npm install --legacy-peer-deps --no-audit --no-fund

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]