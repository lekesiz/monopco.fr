-- Migration: Create users table for real authentication
-- Date: 2025-11-25

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  entreprise_siret VARCHAR(14),
  entreprise_nom VARCHAR(255),
  contact_nom VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_entreprise_siret ON users(entreprise_siret);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create refresh_tokens table for JWT refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- Insert default admin user (password: Admin123!)
INSERT INTO users (email, password_hash, contact_nom, role, email_verified)
VALUES (
  'admin@monopco.fr',
  '$2a$10$YourHashedPasswordHere',  -- This will be replaced by actual hash
  'Administrateur',
  'admin',
  TRUE
)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE users IS 'Table des utilisateurs avec authentification réelle';
COMMENT ON TABLE refresh_tokens IS 'Table des refresh tokens JWT';
