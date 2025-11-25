/**
 * SIRET Company Lookup API
 * Uses Pappers.fr API (primary) with fallback to French government API
 */

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

    let companyInfo;

    // Try Pappers API first (more detailed data)
    if (process.env.PAPPERS_API_KEY) {
      try {
        companyInfo = await fetchFromPappers(siret);
      } catch (error) {
        console.warn('[Pappers] API failed, falling back to government API:', error.message);
        companyInfo = await fetchFromGovernmentAPI(siret);
      }
    } else {
      console.warn('[Pappers] API key not configured, using government API');
      companyInfo = await fetchFromGovernmentAPI(siret);
    }

    // Detect OPCO
    const opco = await detectOPCO(siret, companyInfo.codeNaf);

    return res.status(200).json({
      success: true,
      company: {
        ...companyInfo,
        opco
      }
    });
  } catch (error) {
    console.error('[SIRET Lookup] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to lookup company information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Fetch company data from Pappers.fr API
 */
async function fetchFromPappers(siret) {
  const apiKey = process.env.PAPPERS_API_KEY;
  const apiUrl = `https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${apiKey}`;

  const response = await fetch(apiUrl);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Company not found');
    }
    throw new Error(`Pappers API request failed: ${response.status}`);
  }

  const data = await response.json();

  return {
    siret: data.siege?.siret || siret,
    siren: data.siren || siret.substring(0, 9),
    nom: data.nom_entreprise || data.denomination || 'N/A',
    adresse: data.siege?.adresse_ligne_1 || 'N/A',
    codePostal: data.siege?.code_postal || 'N/A',
    ville: data.siege?.ville || 'N/A',
    codeNaf: data.code_naf || 'N/A',
    libelleNaf: data.libelle_code_naf || 'N/A',
    formeJuridique: data.forme_juridique || 'N/A',
    dateCreation: data.date_creation || 'N/A',
    effectif: data.effectif || 'N/A',
    dirigeant: data.representants?.[0]?.nom_complet || 'N/A',
    capital: data.capital || 'N/A',
    statut: data.statut_rcs === 'Actif' ? 'Active' : 'Inactive',
    source: 'pappers'
  };
}

/**
 * Fetch company data from French government API (fallback)
 */
async function fetchFromGovernmentAPI(siret) {
  const apiUrl = `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/${siret}`;
  
  const response = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Company not found');
    }
    throw new Error(`Government API request failed: ${response.status}`);
  }

  const data = await response.json();
  const etablissement = data.etablissement;

  return {
    siret: etablissement.siret,
    siren: etablissement.siren,
    nom: etablissement.unite_legale?.denomination || 
         etablissement.unite_legale?.nom_complet ||
         'N/A',
    adresse: etablissement.geo_adresse || 'N/A',
    codePostal: etablissement.code_postal || 'N/A',
    ville: etablissement.libelle_commune || 'N/A',
    codeNaf: etablissement.unite_legale?.activite_principale || 'N/A',
    libelleNaf: 'N/A',
    formeJuridique: etablissement.unite_legale?.forme_juridique || 'N/A',
    dateCreation: etablissement.date_creation || 'N/A',
    effectif: etablissement.tranche_effectifs || 'N/A',
    dirigeant: 'N/A',
    capital: 'N/A',
    statut: etablissement.etat_administratif === 'A' ? 'Active' : 'Inactive',
    source: 'government'
  };
}

/**
 * Detect OPCO based on SIRET and NAF code
 * Uses CFADock API with fallback to NAF-based detection
 */
async function detectOPCO(siret, codeNaf) {
  try {
    // Try CFADock API first
    const response = await fetch(`https://www.cfadock.fr/api/opco/${siret}`, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.opco) {
        return data.opco;
      }
    }
  } catch (error) {
    console.warn('[CFADock] API failed, using NAF-based detection:', error.message);
  }

  // Fallback: NAF-based OPCO detection
  return detectOPCOByNAF(codeNaf);
}

/**
 * Detect OPCO based on NAF code (fallback method)
 */
function detectOPCOByNAF(codeNaf) {
  if (!codeNaf || codeNaf === 'N/A') {
    return 'OPCO EP'; // Default fallback
  }

  const nafPrefix = codeNaf.substring(0, 2);

  // OPCO mapping based on NAF code
  const opcoMapping = {
    // ATLAS - Services financiers et conseil
    '64': 'ATLAS', '65': 'ATLAS', '66': 'ATLAS', '69': 'ATLAS', '70': 'ATLAS',
    
    // AKTO - Services à forte intensité de main d'œuvre
    '78': 'AKTO', '79': 'AKTO', '80': 'AKTO', '90': 'AKTO', '91': 'AKTO', '93': 'AKTO',
    
    // OPCO Santé
    '86': 'OPCO Santé', '87': 'OPCO Santé', '88': 'OPCO Santé',
    
    // OPCO Commerce
    '45': 'OPCOMMERCE', '46': 'OPCOMMERCE', '47': 'OPCOMMERCE', '62': 'OPCOMMERCE', '63': 'OPCOMMERCE',
    
    // OPCO Mobilités
    '49': 'OPCO Mobilités', '50': 'OPCO Mobilités', '51': 'OPCO Mobilités',
    
    // OPCO Construction
    '41': 'OPCO Constructys', '42': 'OPCO Constructys', '43': 'OPCO Constructys',
    
    // OPCO 2i - Industrie
    '10': 'OPCO 2i', '11': 'OPCO 2i', '12': 'OPCO 2i', '13': 'OPCO 2i', '14': 'OPCO 2i',
    '15': 'OPCO 2i', '16': 'OPCO 2i', '17': 'OPCO 2i', '18': 'OPCO 2i', '19': 'OPCO 2i',
    '20': 'OPCO 2i', '21': 'OPCO 2i', '22': 'OPCO 2i', '23': 'OPCO 2i', '24': 'OPCO 2i',
    '25': 'OPCO 2i', '26': 'OPCO 2i', '27': 'OPCO 2i', '28': 'OPCO 2i', '29': 'OPCO 2i',
    '30': 'OPCO 2i', '31': 'OPCO 2i', '32': 'OPCO 2i', '33': 'OPCO 2i',
  };

  return opcoMapping[nafPrefix] || 'OPCO EP'; // Default to OPCO EP
}
