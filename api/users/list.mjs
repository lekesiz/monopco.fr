import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Pour l'instant, retourner des utilisateurs mock
    // TODO: Remplacer par une vraie requête SQL quand la table users existera
    const mockUsers = [
      {
        id: 1,
        email: 'admin@monopco.fr',
        entreprise_siret: '84899333300018',
        entreprise_nom: 'Netz Informatique',
        contact_nom: 'Pierre Durand',
        role: 'admin',
        email_verified: true,
        created_at: '2025-01-15T10:00:00Z',
        updated_at: '2025-01-15T10:00:00Z'
      },
      {
        id: 2,
        email: 'entreprise@demo.fr',
        entreprise_siret: '12345678901234',
        entreprise_nom: 'TechSolutions SARL',
        contact_nom: 'Sophie Martin',
        role: 'user',
        email_verified: true,
        created_at: '2025-02-01T14:30:00Z',
        updated_at: '2025-02-01T14:30:00Z'
      },
      {
        id: 3,
        email: 'rh@techsolutions.fr',
        entreprise_siret: '12345678901234',
        entreprise_nom: 'TechSolutions SARL',
        contact_nom: 'Sophie Martin',
        role: 'user',
        email_verified: true,
        created_at: '2025-02-10T09:15:00Z',
        updated_at: '2025-02-10T09:15:00Z'
      },
      {
        id: 4,
        email: 'contact@khmer-toy.fr',
        entreprise_siret: '84899333300018',
        entreprise_nom: 'KHMER TOY',
        contact_nom: 'Jeremy Nhim',
        role: 'user',
        email_verified: false,
        created_at: '2025-03-05T16:45:00Z',
        updated_at: '2025-03-05T16:45:00Z'
      },
      {
        id: 5,
        email: 'mehmet@test.fr',
        entreprise_siret: '98765432109876',
        entreprise_nom: 'Test Company',
        contact_nom: 'Mehmet Tuzcu',
        role: 'user',
        email_verified: true,
        created_at: '2025-03-12T11:20:00Z',
        updated_at: '2025-03-12T11:20:00Z'
      }
    ];

    // Quand la table users existera, utiliser cette requête:
    /*
    const users = await sql`
      SELECT 
        id,
        email,
        entreprise_siret,
        entreprise_nom,
        contact_nom,
        role,
        email_verified,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    */

    return res.status(200).json({
      success: true,
      users: mockUsers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la récupération des utilisateurs'
    });
  }
}
