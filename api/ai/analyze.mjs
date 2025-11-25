import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, amount } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(200).json({ 
        success: true,
        compliant: true,
        advice: 'Vérification IA indisponible.'
      });
    }

    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.models;

    const prompt = `Analyse cette demande de financement de formation au regard des critères standards des OPCOs (pertinence, coût, durée).

Données:
Titre: ${title}
Coût: ${amount}€
Description: ${description}

Réponds au format JSON:
{
  "compliant": boolean,
  "advice": "string (court conseil en français)"
}`;

    const result = await model.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });
    
    const analysis = JSON.parse(result.text || '{"compliant": true, "advice": "Erreur"}');

    return res.status(200).json({ 
      success: true,
      compliant: analysis.compliant,
      advice: analysis.advice
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(200).json({ 
      success: true,
      compliant: true,
      advice: 'Vérification IA indisponible.'
    });
  }
}
