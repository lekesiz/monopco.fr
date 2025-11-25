import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId est requis'
      });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Pour l'instant, simuler la suppression
    // TODO: Remplacer par une vraie requête SQL quand la table users existera
    console.log(`Suppression de l'utilisateur ${userId} (simulé)`);

    // Quand la table users existera, utiliser cette requête:
    /*
    // Vérifier que l'utilisateur existe
    const userCheck = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Supprimer l'utilisateur
    await sql`
      DELETE FROM users WHERE id = ${userId}
    `;
    */

    return res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression de l\'utilisateur'
    });
  }
}
