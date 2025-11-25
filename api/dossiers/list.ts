import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, status } = req.query;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    let queryText = 'SELECT * FROM dossiers WHERE user_id = $1';
    const params: any[] = [user_id];

    if (status && typeof status === 'string') {
      queryText += ' AND status = $2';
      params.push(status);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);

    return res.status(200).json({ dossiers: result.rows });
  } catch (error) {
    console.error('List dossiers error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
