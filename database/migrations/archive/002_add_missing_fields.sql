-- Migration 002: Add missing fields to existing tables
-- Date: 2025-11-25

-- Add missing fields to dossiers table
DO $$
BEGIN
  -- Add type_formation field
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='type_formation') THEN
    ALTER TABLE dossiers ADD COLUMN type_formation VARCHAR(50) DEFAULT 'formation';
  END IF;
  
  -- Add beneficiaire fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='beneficiaire_nom') THEN
    ALTER TABLE dossiers ADD COLUMN beneficiaire_nom VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='beneficiaire_prenom') THEN
    ALTER TABLE dossiers ADD COLUMN beneficiaire_prenom VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='beneficiaire_email') THEN
    ALTER TABLE dossiers ADD COLUMN beneficiaire_email VARCHAR(255);
  END IF;
  
  -- Add company fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='entreprise_siret') THEN
    ALTER TABLE dossiers ADD COLUMN entreprise_siret VARCHAR(14);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='entreprise_nom') THEN
    ALTER TABLE dossiers ADD COLUMN entreprise_nom VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='entreprise_adresse') THEN
    ALTER TABLE dossiers ADD COLUMN entreprise_adresse TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='entreprise_effectif') THEN
    ALTER TABLE dossiers ADD COLUMN entreprise_effectif INTEGER;
  END IF;
  
  -- Add OPCO fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='opco_nom') THEN
    ALTER TABLE dossiers ADD COLUMN opco_nom VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='opco_contact_email') THEN
    ALTER TABLE dossiers ADD COLUMN opco_contact_email VARCHAR(255);
  END IF;
  
  -- Add financial fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='cout_total_ht') THEN
    ALTER TABLE dossiers ADD COLUMN cout_total_ht DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='montant_estime') THEN
    ALTER TABLE dossiers ADD COLUMN montant_estime DECIMAL(10,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='montant_valide') THEN
    ALTER TABLE dossiers ADD COLUMN montant_valide DECIMAL(10,2);
  END IF;
  
  -- Add payment fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_status') THEN
    ALTER TABLE dossiers ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_date') THEN
    ALTER TABLE dossiers ADD COLUMN payment_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='payment_amount') THEN
    ALTER TABLE dossiers ADD COLUMN payment_amount DECIMAL(10,2);
  END IF;
  
  -- Add validation fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='validation_admin_date') THEN
    ALTER TABLE dossiers ADD COLUMN validation_admin_date TIMESTAMP;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='validation_admin_by') THEN
    ALTER TABLE dossiers ADD COLUMN validation_admin_by INTEGER;
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
  
  -- Add training fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='formation_titre') THEN
    ALTER TABLE dossiers ADD COLUMN formation_titre VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='formation_objectifs') THEN
    ALTER TABLE dossiers ADD COLUMN formation_objectifs TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='formation_organisme') THEN
    ALTER TABLE dossiers ADD COLUMN formation_organisme VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='dossiers' AND column_name='formation_duree_heures') THEN
    ALTER TABLE dossiers ADD COLUMN formation_duree_heures INTEGER;
  END IF;
END $$;

-- Create documents table if not exists
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  url TEXT NOT NULL,
  taille INTEGER,
  uploaded_by INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes on documents
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);

-- Create emails table if not exists
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

-- Create payments table if not exists
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

-- Create logs table if not exists
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
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
