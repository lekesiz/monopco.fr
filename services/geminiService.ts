import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const improveJustification = async (
  title: string, 
  rawDescription: string, 
  role: string = "Employee"
): Promise<string> => {
  try {
    const prompt = `
      Tu es un expert en financement de formation professionnelle (OPCO) en France.
      Améliore et reformule le texte de justification suivant pour qu'il soit professionnel, convaincant et maximise les chances d'acceptation par l'OPCO.
      Le texte doit mettre en avant l'acquisition de compétences et le retour sur investissement pour l'entreprise.
      
      Contexte:
      Titre de la formation: ${title}
      Demandeur: ${role}
      
      Texte brut à améliorer:
      "${rawDescription}"
      
      Réponds uniquement avec le texte amélioré, sans introduction ni conclusion.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || rawDescription;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback if API fails (or no key)
    return rawDescription;
  }
};

export const analyzeCompliance = async (dossierData: any): Promise<{compliant: boolean, advice: string}> => {
   try {
    const prompt = `
      Analyse cette demande de financement de formation au regard des critères standards des OPCOs (pertinence, coût, durée).
      
      Données:
      Titre: ${dossierData.title}
      Coût: ${dossierData.amount}€
      Description: ${dossierData.description}

      Réponds au format JSON:
      {
        "compliant": boolean,
        "advice": "string (court conseil en français)"
      }
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    
    return JSON.parse(response.text || '{"compliant": true, "advice": "Vérification indisponible."}');
   } catch (e) {
       return { compliant: true, advice: "Vérification IA indisponible." };
   }
}