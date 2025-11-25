import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(200).json({ 
        success: true,
        improvedText: description // Fallback: return original text
      });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    const prompt = `Tu es un expert en financement de formation professionnelle (OPCO) en France.
Améliore et reformule le texte de justification suivant pour qu'il soit professionnel, convaincant et maximise les chances d'acceptation par l'OPCO.
Le texte doit mettre en avant l'acquisition de compétences et le retour sur investissement pour l'entreprise.

Contexte:
Titre de la formation: ${title}

Texte brut à améliorer:
"${description}"

Réponds uniquement avec le texte amélioré, sans introduction ni conclusion.`;

    const result = await model.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });
    const improvedText = result.text || description;

    return res.status(200).json({ 
      success: true,
      improvedText: improvedText || description
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({ 
      success: true,
      improvedText: req.body.description // Fallback on error
    });
  }
}
