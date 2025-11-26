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
    Je bent een inspirerende loopbaancoach voor leerlingen (12-16 jaar).
    
    ${context}

    Opdracht: Schrijf een compact en visueel aantrekkelijk 'Talentenprofiel'.
    Gebruik EXACT deze structuur met de volgende **dikgedrukte koppen**:

    **✨ Jouw Superkracht**
    [Beschrijf hier in 2 zinnen wat deze leerling uniek maakt]

    **⚡️ Hier ga jij van aan**
    [Waar krijgt de leerling energie van? Wat vinden ze leuk?]

    **🤝 Jouw Rol in een Team**
    [Ben je een leider, een maker, een denker of een helper? Leg kort uit.]

    **🚀 Tip van de Coach**
    [Eén krachtige, positieve zin als afsluiting]

    Schrijf direct tot de leerling ("Jij bent..."). Houd het positief en strak.
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
    Je bent een expert op het gebied van studiekeuze en loopbaanoriëntatie voor alle niveaus (MBO, HBO en WO).
    Je spreekt een leerling aan die net zijn interesses heeft verkend. Houd de taal begrijpelijk (B1 niveau).

    ${context}

    Opdracht: Geef een helder en overzichtelijk **Studie- en Toekomstadvies**.
    
    STRUCTUUR VAN JE ANTWOORD (Houd deze volgorde exact aan):

    DEEL 1: TOP 3 HOOFDADVIEZEN
    Geef direct de 3 beste richtingen/studies die bij deze leerling passen op basis van hun favoriete beroepen. 
    Zet dit in een genummerde lijst (1. 2. 3.).
    Zet direct hieronder de tekst: "===SPLIT==="

    DEEL 2: VERDIEPING
    Hierna volgt de rest van de uitleg. Gebruik de volgende koppen (dikgedrukt):
    
    1. Passende Profielen & Vakken
    (Welke profielen op de middelbare school passen hierbij? Bijv. Economie & Maatschappij, Zorg & Welzijn).

    2. Opleidingen Overzicht
    (Geef een lijstje met specifieke opleidingen per niveau. Bijv. "MBO: ...", "HBO: ...").

    3. Jouw Toekomst
    (Een korte, inspirerende afsluiting).

    Belangrijk:
    - Wees concreet.
    - Geen hashtags (#).
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