import { GoogleGenAI } from "@google/genai";
import { UserProgress, ReflectionAnswers, RouteData } from "../types";
import { ROUTES } from "../constants";

// Initialize the Gemini AI client
// Note: In a real production app, ensure API_KEY is set in environment variables.
// If API_KEY is missing, we will gracefully handle it in the UI.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const formatField = (field: string[], custom: string) => {
  const combined = [...field];
  if (custom) combined.push(custom);
  return combined.join(", ");
};

const buildContext = (reflection: ReflectionAnswers, progress: UserProgress) => {
  const likedRouteIds = Object.entries(progress.routeScores)
    .filter(([_, score]) => score >= 3)
    .map(([id]) => id);
    
  const likedRoutes = ROUTES.filter(r => likedRouteIds.includes(r.id)).map(r => r.title).join(", ");
  const likedJobs = progress.likedJobs.join(", ");

  return `
    Hier zijn de antwoorden van de leerling uit hun Talentenreis:
    1. Wie ben ik: ${formatField(reflection.whoAmI, reflection.customAnswers.whoAmI)}
    2. Wat vind ik leuk: ${formatField(reflection.likes, reflection.customAnswers.likes)}
    3. Waar ben ik goed in: ${formatField(reflection.goodAt, reflection.customAnswers.goodAt)}
    4. Wat deed ik graag als kind: ${formatField(reflection.childhood, reflection.customAnswers.childhood)}
    5. Waar krijg ik energie van: ${formatField(reflection.energy, reflection.customAnswers.energy)}
    6. Wat zeggen anderen over mij: ${formatField(reflection.othersSay, reflection.customAnswers.othersSay)}
    
    Favoriete routes in de app: ${likedRoutes || "Nog geen specifieke voorkeur"}
    Favoriete beroepen: ${likedJobs || "Nog geen specifieke beroepen"}
  `;
};

export const generateMentorSummary = async (
  reflection: ReflectionAnswers,
  progress: UserProgress
): Promise<string> => {
  if (!ai) return "AI Mentor functie is niet beschikbaar (geen API key).";

  const context = buildContext(reflection, progress);

  const prompt = `
    Je bent een inspirerende loopbaancoach voor leerlingen (12-16 jaar) en ISK-leerlingen.
    
    ${context}

    Opdracht: Schrijf een mooi, persoonlijk 'Talentenprofiel'.
    
    Geef een diepgaande beschrijving van de persoonlijkheid en unieke krachten van deze leerling. Combineer de antwoorden tot een samenhangend verhaal. Leg verbanden tussen wie ze zijn, wat ze vroeger deden en waar ze nu energie van krijgen.
    
    Begin het verhaal met "Jij bent iemand die...".
    
    Belangrijk:
    - Focus PUUR op de persoonlijkheid en talenten.
    - Geef GEEN studieadvies of beroepskeuze-advies (dat komt later).
    - Gebruik alinea's en witregels voor een nette, rustige opmaak.
    - Gebruik GEEN hashtags (#) in de tekst.
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

export const generateStudyAdvice = async (
  reflection: ReflectionAnswers,
  progress: UserProgress
): Promise<string> => {
  if (!ai) return "AI functie is niet beschikbaar.";

  const context = buildContext(reflection, progress);

  const prompt = `
    Je bent een expert op het gebied van opleidingen en beroepen voor jongeren (VMBO/MBO/HAVO niveau).
    De doelgroep zijn leerlingen die Nederlands leren (B1 niveau), dus gebruik duidelijke taal.

    ${context}

    Opdracht: Geef concreet **Studie- en Toekomstadvies** op basis van het profiel hierboven.
    
    Verdeel je antwoord in drie duidelijke kopjes (zonder hashtags, gebruik dikgedrukte tekst of hoofdletters):

    1. Welke profielen passen bij jou?
    (Noem specifieke profielen zoals Zorg & Welzijn, Techniek, Economie & Ondernemen, etc. en leg kort uit waarom).

    2. Mogelijke Opleidingen
    (Geef voorbeelden van concrete opleidingen die ze later kunnen kiezen, bijv. Verzorgende IG, Software Developer, Commercieel Medewerker, etc.).

    3. Jouw Toekomst
    (Een korte, inspirerende zin over hoe hun toekomst eruit kan zien).

    Belangrijk:
    - Gebruik een overzichtelijke opmaak met opsommingstekens.
    - Geen hashtags (#).
    - Houd het positief en bemoedigend.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Kon geen studieadvies genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is iets misgegaan bij het ophalen van het studieadvies.";
  }
};