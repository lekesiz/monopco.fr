export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { siret } = req.query;

    if (!siret || typeof siret !== 'string') {
      return res.status(400).json({ error: 'SIRET is required' });
    }

    // Validate SIRET format (14 digits)
    if (!/^\d{14}$/.test(siret)) {
      return res.status(400).json({ error: 'Invalid SIRET format (must be 14 digits)' });
    }

    // Call French government API (API Entreprise or INSEE)
    const apiUrl = `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Company not found' });
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const etablissement = data.etablissement;

    // Extract relevant company information
    const companyInfo = {
      siret: etablissement.siret,
      siren: etablissement.siren,
      name: etablissement.unite_legale?.denomination || 
            etablissement.unite_legale?.nom_complet ||
            'N/A',
      address: {
        street: etablissement.geo_adresse || 'N/A',
        city: etablissement.libelle_commune || 'N/A',
        postal_code: etablissement.code_postal || 'N/A'
      },
      activity: etablissement.unite_legale?.activite_principale || 'N/A',
      legal_form: etablissement.unite_legale?.forme_juridique || 'N/A',
      creation_date: etablissement.date_creation || 'N/A',
      employees: etablissement.tranche_effectifs || 'N/A',
      status: etablissement.etat_administratif === 'A' ? 'Active' : 'Inactive'
    };

    return res.status(200).json({
      success: true,
      company: companyInfo
    });
  } catch (error) {
    console.error('SIRET lookup error:', error);
    return res.status(500).json({ 
      error: 'Failed to lookup company information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
