import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      user_id,
      company_name,
      siret,
      opco_name,
      formation_type,
      formation_title,
      formation_start_date,
      formation_end_date,
      formation_cost,
      beneficiary_name,
      beneficiary_email
    } = req.body;

    // Validate required fields
    if (!user_id || !company_name || !siret || !opco_name) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, company_name, siret, opco_name' 
      });
    }

    // Insert dossier
    const result = await query(
      `INSERT INTO dossiers (
        user_id, company_name, siret, opco_name, 
        formation_type, formation_title, 
        formation_start_date, formation_end_date, 
        formation_cost, beneficiary_name, beneficiary_email,
        status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING *`,
      [
        user_id, company_name, siret, opco_name,
        formation_type || null, formation_title || null,
        formation_start_date || null, formation_end_date || null,
        formation_cost || null, beneficiary_name || null, 
        beneficiary_email || null, 'draft'
      ]
    );

    const dossier = result.rows[0];

    return res.status(201).json({ dossier });
  } catch (error) {
    console.error('Create dossier error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
