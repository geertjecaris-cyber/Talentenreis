import { GoogleGenAI } from "@google/genai";
import { UserProgress, ReflectionAnswers, RouteData } from "../types";
import { ROUTES } from "../constants";

// Initialize the Gemini AI client
// Note: In a real production app, ensure API_KEY is set in environment variables.
// If API_KEY is missing, we will gracefully handle it in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateMentorSummary = async (
  reflection: ReflectionAnswers,
  progress: UserProgress
): Promise<string> => {
  if (!ai) {
    return "AI Mentor functie is niet beschikbaar (geen API key).";
  }

  const likedRouteIds = Object.entries(progress.routeScores)
    .filter(([_, score]) => score >= 3)
    .map(([id]) => id);
    
  const likedRoutes = ROUTES.filter(r => likedRouteIds.includes(r.id)).map(r => r.title).join(", ");
  
  const likedJobs = progress.likedJobs.join(", ");

  const prompt = `
    Je bent een vriendelijke, bemoedigende loopbaancoach voor jonge leerlingen (12-14 jaar) en ISK leerlingen.
    Schrijf een korte, positieve samenvatting (max 100 woorden) voor de leerling gebaseerd op hun talentenreis.
    Gebruik eenvoudige taal (B1 niveau).
    
    Gegevens leerling:
    - Omschrijving zelf: ${reflection.whoAmI}
    - Vindt leuk: ${reflection.likes.join(", ")}
    - Goed in: ${reflection.goodAt}
    - Favoriete routes: ${likedRoutes || "Nog geen favoriete routes"}
    - Favoriete beroepen: ${likedJobs || "Nog geen specifieke beroepen"}
    
    Richt je tot de leerling ("Jij..."). Geef een compliment en een tip voor de toekomst.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Kon geen samenvatting genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is iets misgegaan bij het ophalen van het advies.";
  }
};
