-- LexFlow Database Setup for Supabase
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create firms table
CREATE TABLE IF NOT EXISTS firms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'attorney',
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create intake_forms table
CREATE TABLE IF NOT EXISTS intake_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    fields JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    public_url_slug VARCHAR(255) UNIQUE,
    retainer_template_url VARCHAR(500),
    payment_required BOOLEAN DEFAULT false,
    retainer_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create intake_submissions table
CREATE TABLE IF NOT EXISTS intake_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES intake_forms(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    form_data JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'submitted',
    signature_status VARCHAR(50) DEFAULT 'pending',
    signed_at TIMESTAMP WITH TIME ZONE,
    docusign_envelope_id VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_amount VARCHAR(50),
    paid_at TIMESTAMP WITH TIME ZONE,
    stripe_payment_intent_id VARCHAR(255),
    stripe_checkout_session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES intake_submissions(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    s3_key VARCHAR(500) NOT NULL,
    s3_bucket VARCHAR(255),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firm_id ON users(firm_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_clients_firm_id ON clients(firm_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_intake_forms_firm_id ON intake_forms(firm_id);
CREATE INDEX IF NOT EXISTS idx_intake_forms_slug ON intake_forms(public_url_slug);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_form_id ON intake_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_client_id ON intake_submissions(client_id);
CREATE INDEX IF NOT EXISTS idx_intake_submissions_status ON intake_submissions(status);
CREATE INDEX IF NOT EXISTS idx_documents_firm_id ON documents(firm_id);
CREATE INDEX IF NOT EXISTS idx_documents_submission_id ON documents(submission_id);

-- Create alembic_version table (for migration tracking)
CREATE TABLE IF NOT EXISTS alembic_version (
    version_num VARCHAR(32) NOT NULL,
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Insert current migration version
INSERT INTO alembic_version (version_num) VALUES ('adb8c05a7ce8')
ON CONFLICT (version_num) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ LexFlow database tables created successfully!';
    RAISE NOTICE 'Tables: firms, users, clients, intake_forms, intake_submissions, documents';
END $$;
