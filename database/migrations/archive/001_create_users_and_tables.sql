-- Migration 001: Create users table and update dossiers table
-- Date: 2025-11-25

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  entreprise_siret VARCHAR(14),
  entreprise_nom VARCHAR(255),
  entreprise_adresse TEXT,
  entreprise_effectif INTEGER,
  contact_nom VARCHAR(255),
  contact_prenom VARCHAR(255),
  contact_tel VARCHAR(20),
  role VARCHAR(50) DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on entreprise_siret
CREATE INDEX IF NOT EXISTS idx_users_siret ON users(entreprise_siret);

-- Add user_id to dossiers table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='user_id') THEN
    ALTER TABLE dossiers ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add payment fields to dossiers if not exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_status') THEN
    ALTER TABLE dossiers ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_date') THEN
    ALTER TABLE dossiers ADD COLUMN payment_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_amount') THEN
    ALTER TABLE dossiers ADD COLUMN payment_amount DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='validation_admin_date') THEN
    ALTER TABLE dossiers ADD COLUMN validation_admin_date TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='validation_admin_by') THEN
    ALTER TABLE dossiers ADD COLUMN validation_admin_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='envoi_opco_date') THEN
    ALTER TABLE dossiers ADD COLUMN envoi_opco_date TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='reponse_opco_date') THEN
    ALTER TABLE dossiers ADD COLUMN reponse_opco_date TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='motif_refus') THEN
    ALTER TABLE dossiers ADD COLUMN motif_refus TEXT;
  END IF;
END $$;

-- Create index on user_id in dossiers
CREATE INDEX IF NOT EXISTS idx_dossiers_user_id ON dossiers(user_id);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  url TEXT NOT NULL,
  taille INTEGER,
  uploaded_by INTEGER REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes on documents
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  template VARCHAR(100),
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'sent'
);

-- Create indexes on emails
CREATE INDEX IF NOT EXISTS idx_emails_dossier_id ON emails(dossier_id);
CREATE INDEX IF NOT EXISTS idx_emails_sent_at ON emails(sent_at);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  montant_attendu DECIMAL(10,2),
  montant_recu DECIMAL(10,2),
  date_reception DATE,
  reference VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes on payments
CREATE INDEX IF NOT EXISTS idx_payments_dossier_id ON payments(dossier_id);
CREATE INDEX IF NOT EXISTS idx_payments_statut ON payments(statut);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes on logs
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_entity ON logs(entity_type, entity_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for dossiers table
DROP TRIGGER IF EXISTS update_dossiers_updated_at ON dossiers;
CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
