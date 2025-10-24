# LexFlow

A micro-SaaS platform that streamlines client intake and e-signing for solo attorneys and small law firms.

## Features

- 🔒 Secure client intake form builder
- ✍️ Integrated e-signature workflow (DocuSign/HelloSign)
- 💳 Stripe retainer payment collection
- 📊 Admin dashboard for managing submissions and documents
- 🏢 Multi-tenant architecture with firm-level isolation
- 📱 Mobile-friendly responsive design

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (React + TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** TBD (React Context / Zustand)
- **Forms:** TBD (React Hook Form)

### Backend
- **Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL 16+
- **Cache/Queue:** Redis
- **Task Queue:** Celery
- **Storage:** S3-compatible (AWS/Backblaze)
- **Payments:** Stripe
- **E-Sign:** DocuSign or HelloSign

### Infrastructure
- **Containerization:** Docker
- **Orchestration:** Docker Compose (dev), Fly.io/Railway (production)

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.12+ (for local backend development)

### Quick Start with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd LexFlow
```

2. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your configuration
```

3. Start all services:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
docker-compose exec backend alembic upgrade head
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/docs

### Local Development (without Docker)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

## Project Structure

```
LexFlow/
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utilities and helpers
│   └── public/           # Static assets
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── db/           # Database configuration
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # Database migrations
│   └── tests/            # Backend tests
├── docker-compose.yml     # Docker orchestration
└── PROJECT_SPEC.md       # Project specification
```

## Development Workflow

### Running Tests

Backend:
```bash
cd backend
pytest
pytest --cov=app tests/  # With coverage
```

Frontend:
```bash
cd frontend
npm test
```

### Code Quality

Backend:
```bash
cd backend
black app/              # Format code
ruff check app/         # Lint code
mypy app/              # Type checking
```

Frontend:
```bash
cd frontend
npm run lint           # ESLint
npm run type-check     # TypeScript checking
```

### Database Migrations

Create a new migration:
```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
docker-compose exec backend alembic upgrade head
```

Rollback migration:
```bash
docker-compose exec backend alembic downgrade -1
```

## Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories for required environment variables.

Key configuration areas:
- Database connection
- Redis connection
- Stripe API keys
- DocuSign/HelloSign credentials
- S3 storage credentials
- CORS origins

## Deployment

### Using Fly.io

TBD - Deployment guide coming soon

### Using Railway

TBD - Deployment guide coming soon

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linters
4. Submit a pull request

## License

TBD

## Support

For issues and questions, please open an issue on GitHub.
