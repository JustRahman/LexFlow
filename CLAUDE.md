# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LexFlow is a micro-SaaS platform for legal client intake and e-signing. It uses a **monorepo structure** with a FastAPI backend and Next.js frontend, designed for multi-tenant law firm use.

**Key Features:**
- Client intake form builder
- E-signature workflow integration (DocuSign/HelloSign)
- Payment processing via Stripe
- Multi-tenant architecture with firm-level data isolation
- Document storage in S3-compatible storage

## Development Commands

### Docker (Recommended for Development)

Start all services:
```bash
docker-compose up -d
```

View logs:
```bash
docker-compose logs -f [service]  # backend, frontend, postgres, redis, celery-worker
```

Stop services:
```bash
docker-compose down
```

### Backend (FastAPI)

Start dev server:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Run database migrations:
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

Run tests:
```bash
pytest
pytest --cov=app tests/  # with coverage
```

Code quality:
```bash
black app/              # format
ruff check app/         # lint
mypy app/              # type check
```

### Frontend (Next.js)

Start dev server:
```bash
cd frontend
npm run dev
```

Build for production:
```bash
npm run build
npm run start
```

Lint and type-check:
```bash
npm run lint
npm run type-check
```

## Architecture

### Backend Structure

```
backend/app/
├── api/v1/          # API endpoints organized by resource
├── core/            # Config, security, dependencies
├── db/              # Database session management
├── models/          # SQLAlchemy ORM models
├── schemas/         # Pydantic request/response schemas
├── services/        # Business logic layer
└── main.py          # FastAPI app initialization
```

**Key Patterns:**
- All API routes go in `api/v1/endpoints/`
- Database models use UUID primary keys
- Async/await for all database operations
- Row-level security enforced at application layer via `firm_id`

### Frontend Structure

```
frontend/
├── app/             # Next.js App Router pages
├── components/      # Reusable React components
└── lib/             # Utilities, API clients, helpers
```

**Key Patterns:**
- Server components by default, use "use client" when needed
- API calls to backend at `NEXT_PUBLIC_API_URL`
- Tailwind CSS for styling

## Database Models

**Multi-Tenancy Model:**
- `Firm` - Law firm (tenant root)
- `User` - Attorneys/staff (scoped to firm)
- `Client` - End clients submitting intake forms
- `IntakeForm` - Form templates created by firms
- `IntakeSubmission` - Client submissions with signature/payment tracking
- `Document` - Stored files (signed retainers, attachments)

**Critical Relationships:**
- Most models have `firm_id` foreign key for tenant isolation
- `IntakeSubmission` links `Client`, `IntakeForm`, and `Document`
- Payment and signature status tracked on `IntakeSubmission`

**When adding new models:**
1. Create model in `backend/app/models/`
2. Import in `backend/app/models/__init__.py`
3. Create Alembic migration: `alembic revision --autogenerate -m "add model"`
4. Apply migration: `alembic upgrade head`

## Configuration & Environment

**Backend** (`.env`):
- `DATABASE_URL` - PostgreSQL connection (use asyncpg driver)
- `REDIS_URL` - Redis for caching/sessions
- `STRIPE_SECRET_KEY` - Stripe payments
- `DOCUSIGN_*` or HelloSign credentials
- `S3_*` - S3-compatible storage credentials

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## Testing

**Backend:**
- Use `pytest` with `pytest-asyncio` for async tests
- Mock external services (Stripe, DocuSign, S3)
- Test files in `backend/tests/` mirror app structure

**Frontend:**
- (TBD - testing framework not yet configured)

## Deployment

- Dockerized for easy deployment
- Production targets: Fly.io or Railway
- Requires: PostgreSQL 16+, Redis
- Background tasks via Celery worker

## Common Tasks

**Add a new API endpoint:**
1. Create route in `backend/app/api/v1/endpoints/[resource].py`
2. Define Pydantic schemas in `backend/app/schemas/`
3. Implement business logic in `backend/app/services/`
4. Include router in `backend/app/api/v1/router.py`

**Add a new frontend page:**
1. Create route in `frontend/app/[route]/page.tsx`
2. Add components in `frontend/components/`
3. Use `fetch` or HTTP client to call backend API

**Modify database schema:**
1. Update model in `backend/app/models/`
2. Run `alembic revision --autogenerate -m "change description"`
3. Review generated migration in `backend/alembic/versions/`
4. Apply with `alembic upgrade head`

## Important Notes

- **Multi-tenancy:** Always filter queries by `firm_id` to prevent data leaks
- **Async everywhere:** Backend uses async/await - don't mix sync code
- **Type safety:** Backend uses Python type hints + mypy; frontend uses TypeScript
- **API versioning:** All endpoints under `/api/v1/` prefix
- **Security:** Never expose Stripe secret keys or DocuSign credentials to frontend
