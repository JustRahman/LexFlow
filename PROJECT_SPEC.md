# Project: LexFlow

## Overview
LexFlow is a micro-SaaS platform that streamlines client intake and e-signing for solo attorneys and small law firms. It replaces manual onboarding workflows (PDFs, phone calls, mailed forms) with a secure, paperless flow that automates:
- Client information collection
- Retainer agreement e-signatures
- Initial payment processing

## Core Goals
- Save lawyers time by automating client intake.
- Improve client experience with an easy, mobile-friendly process.
- Ensure legal and data compliance (audit logs, secure document storage).
- Be affordable and simple to adopt for small firms (2–10 attorneys).

## Architecture Overview
**Backend:** FastAPI (Python 3.12+)  
**Frontend:** Next.js 14+ (React + TypeScript)  
**Database:** PostgreSQL 16+ (row-level security for multi-tenancy)  
**Storage:** S3-compatible (AWS/Backblaze)  
**Payments:** Stripe  
**E-Sign:** DocuSign or HelloSign  
**Queue:** Redis + Celery/BullMQ  
**Deploy:** Docker + Fly.io or Railway

## Key Features
1. Secure client intake form builder  
2. Integrated e-signature workflow  
3. Stripe retainer payment collection  
4. Admin dashboard for managing submissions and documents  

## Future Plans
- Add custom branding per law firm
- Enable multiple intake templates per tenant
- Support PDF auto-generation and template variables
