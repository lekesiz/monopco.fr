import { query } from '../_lib/db.mjs';
import { getUserFromRequest } from '../_lib/auth.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { dossierId, montant, description, dateEcheance } = req.body;

    if (!dossierId || !montant) {
      return res.status(400).json({ error: 'Dossier ID and montant are required' });
    }

    // Generate invoice number
    const year = new Date().getFullYear();
    const countResult = await query(
      'SELECT COUNT(*) as count FROM factures WHERE EXTRACT(YEAR FROM created_at) = $1',
      [year]
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    const numeroFacture = `F-${year}-${String(count).padStart(4, '0')}`;

    // Create facture
    const result = await query(
      `INSERT INTO factures (
        dossier_id, numero_facture, montant, description, 
        date_echeance, statut, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        dossierId,
        numeroFacture,
        montant,
        description || 'Bilan de compétences',
        dateEcheance || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        'en_attente'
      ]
    );

    const facture = result.rows[0];

    // Update dossier status to 'facture'
    await query(
      'UPDATE dossiers SET statut = $1, updated_at = NOW() WHERE id = $2',
      ['facture', dossierId]
    );

    return res.status(201).json({
      success: true,
      facture,
      message: 'Facture créée avec succès'
    });

  } catch (error) {
    console.error('Facture creation error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
