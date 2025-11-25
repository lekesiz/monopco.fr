import { query } from './_lib/db.mjs';

export default async function handler(req, res) {
  try {
    // Get all tables
    const tables = await query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );

    // Get users table schema
    const usersSchema = await query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
       ORDER BY ordinal_position`
    );

    // Get dossiers table schema (if exists)
    const dossiersSchema = await query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'dossiers' 
       ORDER BY ordinal_position`
    );

    return res.status(200).json({
      success: true,
      tables: tables.rows,
      users_schema: usersSchema.rows,
      dossiers_schema: dossiersSchema.rows,
      message: 'Database schema retrieved successfully'
    });
  } catch (error) {
    console.error('Schema test error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
