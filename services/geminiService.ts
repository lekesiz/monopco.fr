/**
 * Gemini AI Service - Frontend wrapper for AI endpoints
 * Calls backend API endpoints to keep API keys secure
 */

export const improveJustification = async (
  title: string, 
  rawDescription: string
): Promise<string> => {
  try {
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description: rawDescription
      })
    });

    if (!response.ok) {
      console.error('AI improve API failed:', response.status);
      return rawDescription;
    }

    const data = await response.json();
    
    if (data.success && data.improvedText) {
      return data.improvedText;
    }

    return rawDescription;
  } catch (error) {
    console.error("AI improve error:", error);
    return rawDescription;
  }
};

export const analyzeCompliance = async (dossierData: any): Promise<{compliant: boolean, advice: string}> => {
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: dossierData.title,
        description: dossierData.description,
        amount: dossierData.amount
      })
    });

    if (!response.ok) {
      console.error('AI analyze API failed:', response.status);
      return { compliant: true, advice: "Vérification IA indisponible." };
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        compliant: data.compliant,
        advice: data.advice
      };
    }

    return { compliant: true, advice: "Vérification IA indisponible." };
  } catch (error) {
    console.error("AI analyze error:", error);
    return { compliant: true, advice: "Vérification IA indisponible." };
  }
};
