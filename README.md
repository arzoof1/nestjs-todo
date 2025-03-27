# Todo Application with NestJS, GraphQL, Redis, RabbitMQ, and ELK Stack

A modern, scalable, and robust Todo application built with NestJS for the backend and Next.js for the frontend. This project demonstrates best practices for DevOps, including containerization, message queues, caching, and logging.

## Features

- **Full-stack TypeScript Application**: End-to-end type safety with TypeScript
- **GraphQL API**: Built with NestJS and Apollo Server
- **MongoDB Database**: For persistent storage of todos
- **Redis Caching**: Efficient caching to minimize database queries
- **Message Queue**: Asynchronous task processing with RabbitMQ
- **ELK Stack Integration**: Comprehensive logging and monitoring
- **Docker Containerization**: Easy deployment and scaling
- **Responsive UI**: Modern React frontend with Apollo Client

## Project Structure

```
todoOnNestjsWithDevOps/
├── backend/                      # NestJS GraphQL API
│   ├── src/
│   │   ├── app.module.ts         # Main application module
│   │   ├── common/               # Shared utilities and modules
│   │   │   └── logger/           # Custom logger implementation
│   │   ├── graphql/              # GraphQL configuration
│   │   ├── rabbitmq/             # RabbitMQ service and configuration
│   │   ├── storage/              # File storage module
│   │   └── todos/                # Todo domain module
│   │       ├── cache/            # Redis cache service
│   │       ├── dto/              # Data Transfer Objects
│   │       ├── events/           # RabbitMQ event handlers and emitters
│   │       ├── todos.module.ts   # Todo module definition
│   │       ├── todos.resolver.ts # GraphQL resolver
│   │       ├── todos.schema.ts   # MongoDB schema
│   │       └── todos.service.ts  # Business logic
│   ├── test/                     # End-to-end tests
│   ├── Dockerfile                # NestJS container definition
│   └── package.json              # Backend dependencies
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                  # Next.js App Router
│   │   ├── components/           # React components
│   │   │   ├── CreateTodoForm.tsx
│   │   │   ├── TodoDetail.tsx
│   │   │   └── TodoList.tsx
│   │   ├── generated/            # Generated GraphQL types
│   │   └── graphql/              # GraphQL queries and mutations
│   ├── Dockerfile                # Frontend container definition
│   └── package.json              # Frontend dependencies
├── logstash-pipeline/            # Logstash configuration
│   └── logstash.conf             # Logstash pipeline definition
├── docker-compose.yml            # Docker Compose configuration
├── filebeat.yml                  # Filebeat configuration
├── setup-elastic.sh              # Elasticsearch setup script
└── README.md                     # Project documentation
```

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- npm or yarn

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/arzoof1/nestjs-todo.git
   cd nestjs-todo
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:4000/graphql
   - RabbitMQ Management: http://localhost:15672 (guest/guest)
   - Kibana Dashboard: http://localhost:5601 (elastic/elastic123)

## Development

### Backend Development

```bash
cd backend
npm install
npm run start:dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Key Technologies

- **Backend**:
  - NestJS: Progressive Node.js framework
  - GraphQL: API query language
  - MongoDB: NoSQL database
  - Redis: In-memory data structure store for caching
  - RabbitMQ: Message broker for async processing

- **Frontend**:
  - Next.js: React framework
  - Apollo Client: GraphQL client
  - Tailwind CSS: Utility-first CSS framework

- **DevOps & Monitoring**:
  - Docker & Docker Compose: Containerization
  - ELK Stack (Elasticsearch, Logstash, Kibana): Logging and monitoring
  - Filebeat: Log shipper

## Redis Caching Strategy

The application implements efficient caching using Redis:

- **Cache-Aside Pattern**: Data is first checked in the cache; if not found, it's retrieved from the database and then cached
- **TTL-Based Expiration**: Cached items expire after 5 minutes
- **Cache Invalidation**: Automatic invalidation when items are updated or deleted
- **Event-Driven Updates**: RabbitMQ events trigger cache updates across services

## Asynchronous Processing

RabbitMQ handles asynchronous tasks:

- **Todo Event Processing**: Events are emitted for todo creation, updates, and deletions
- **Image Processing**: Uploaded todo images are processed asynchronously
- **Cache Synchronization**: Events maintain cache consistency across instances

## Logging and Monitoring

The ELK Stack provides comprehensive logging and monitoring:

- **Structured Logging**: JSON-formatted logs for better searchability
- **Centralized Log Collection**: Filebeat collects container logs
- **Real-Time Dashboards**: Kibana visualizations for application insights
- **Error Tracking**: Quick identification and diagnosis of issues

## Docker Configuration

Each service is properly containerized with optimized resource limits and health checks:

- **Memory Optimization**: Appropriate memory limits for each service
- **Volume Mapping**: Persistent storage for databases and logs
- **Network Isolation**: Custom bridge network for inter-service communication
- **Health Checks**: Ensure service dependencies are met before startup

## Security Considerations

- **Authentication**: Token-based authentication for API access
- **Elasticsearch Security**: Built-in security with role-based access control
- **Environment Variables**: Sensitive configuration through environment variables
- **CORS Protection**: Configured to prevent unauthorized access

## License

This project is licensed under the MIT License. 
