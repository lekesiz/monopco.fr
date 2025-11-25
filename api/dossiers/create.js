const { query } = require('../_lib/db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      user_id,
      title,
      description,
      company_id,
      status = 'draft'
    } = req.body;

    // Validate required fields
    if (!user_id || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, title' 
      });
    }

    // Insert dossier
    const result = await query(
      `INSERT INTO dossiers (
        user_id, title, description, company_id, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [
        user_id, title, description || null, company_id || null, status
      ]
    );

    const dossier = result.rows[0];

    return res.status(201).json({ 
      success: true,
      dossier,
      message: 'Dossier created successfully'
    });
  } catch (error) {
    console.error('Create dossier error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};
