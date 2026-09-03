-- Criar tabelas diretamente no Supabase SQL Editor
-- Execute este script no SQL Editor do Supabase

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  is_personal BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revenues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  received_at DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  partner1_share DECIMAL(5, 2) NOT NULL DEFAULT 50,
  partner2_share DECIMAL(5, 2) NOT NULL DEFAULT 50,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_day INTEGER,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed inicial
INSERT INTO companies (name, description, color, is_personal, active)
VALUES
  ('Vender.IA', 'Inteligência Comercial Automatizada', '#3b82f6', false, true),
  ('Gastos Pessoais', 'Despesas pessoais dos sócios', '#10b981', true, true)
ON CONFLICT (id) DO NOTHING;
