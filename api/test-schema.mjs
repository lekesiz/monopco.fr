import { query } from './_lib/db.mjs';

export default async function handler(req, res) {
  try {
    // Get users table schema
    const result = await query(
      `SELECT column_name, data_type, is_nullable 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
       ORDER BY ordinal_position`
    );

    return res.status(200).json({
      success: true,
      schema: result.rows,
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
