-- MonOPCO Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'entreprise', 'salarie')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entreprises table
CREATE TABLE IF NOT EXISTS entreprises (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE NOT NULL,
  adresse TEXT,
  telephone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salaries table
CREATE TABLE IF NOT EXISTS salaries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entreprise_id INTEGER REFERENCES entreprises(id) ON DELETE CASCADE,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  poste VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dossiers table
CREATE TABLE IF NOT EXISTS dossiers (
  id SERIAL PRIMARY KEY,
  entreprise_id INTEGER REFERENCES entreprises(id) ON DELETE CASCADE,
  salarie_id INTEGER REFERENCES salaries(id) ON DELETE SET NULL,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  montant DECIMAL(10, 2),
  statut VARCHAR(20) NOT NULL DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'soumis', 'en_cours', 'valide', 'refuse')),
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  url TEXT NOT NULL,
  taille INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_entreprises_siret ON entreprises(siret);
CREATE INDEX IF NOT EXISTS idx_dossiers_entreprise ON dossiers(entreprise_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_salarie ON dossiers(salarie_id);
CREATE INDEX IF NOT EXISTS idx_documents_dossier ON documents(dossier_id);

-- Insert demo data
INSERT INTO users (email, password_hash, nom, prenom, role) VALUES
  ('admin@monopco.fr', '$2a$10$YourHashHere', 'Admin', 'MonOPCO', 'admin'),
  ('contact@netz-informatique.fr', '$2a$10$YourHashHere', 'NETZ', 'Informatique', 'entreprise')
ON CONFLICT (email) DO NOTHING;
