import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DATABASE_URL should be set in Vercel environment variables
// For local development, you can set it manually here or use .env
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_SYJNrC1Xcf0x@ep-lingering-credit-af7wtrgd.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration(migrationFile) {
  const client = new pg.Client({ connectionString: DATABASE_URL });
  
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');
    
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executing migration...');
    await client.query(sql);
    console.log(`✅ Migration ${migrationFile} executed successfully`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Get migration file from command line argument or default to 001
const migrationFile = process.argv[2] || '001_create_users_and_tables.sql';
runMigration(migrationFile);
