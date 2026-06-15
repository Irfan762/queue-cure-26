# Queue Cure '26 - Real-Time Patient Queue Management System

A complete full-stack web application for managing patient queues in clinics with real-time updates.

## Features

- **Receptionist Dashboard**: Manage patient queue with token generation
- **Patient Display**: Real-time queue position and wait time
- **Real-Time Sync**: Socket.IO powered instant updates
- **Concurrency Safe**: Multi-receptionist support with database-level locking
- **Scalable**: Multi-clinic deployment ready

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Redux Toolkit
- **Backend**: Node.js + Express.js + Socket.IO
- **Database**: PostgreSQL
- **Caching**: Redis
- **Deployment**: Docker + Docker Compose

## Quick Start

```bash
# Clone repository
git clone https://github.com/Irfan762/queue-cure-26.git
cd queue-cure-26

# Start with Docker Compose
docker-compose up -d

# Application will be available at:
# Receptionist Dashboard: http://localhost:5173
# Patient Display: http://localhost:5173/patient
# API: http://localhost:5000/api
```

## Project Structure

```
queue-cure-26/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript UI
├── nginx/            # Reverse proxy configuration
├── docker-compose.yml
└── docs/             # Documentation
```

## Documentation

- [API Documentation](./docs/API_DOCS.md)
- [Socket.IO Events](./docs/SOCKET_EVENTS.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## License

MIT
