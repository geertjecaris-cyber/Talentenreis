import { RouteData } from './types';
import { Heart, Cog, Palette, DollarSign, Leaf, MessageCircle } from 'lucide-react';
import React from 'react';

export const REFLECTION_QUESTIONS = [
  {
    id: 'whoAmI',
    question: "Wie ben ik nu?",
    placeholder: "Ik ben iemand die...",
    options: ["Vrolijk", "Rustig", "Druk", "Nieuwsgierig", "Behulpzaam"]
  },
  {
    id: 'likes',
    question: "Wat vind ik leuk?",
    placeholder: "Kies of typ zelf...",
    options: ["Met handen werken", "Met mensen praten", "Puzzels oplossen", "Sporten", "Tekenen/Muziek", "Gamen"]
  },
  {
    id: 'goodAt',
    question: "Waar ben ik goed in?",
    placeholder: "Ik ben goed in...",
    options: ["Luisteren", "Maken", "Organiseren", "Rekenen", "Taal", "Verzorgen"]
  },
  {
    id: 'childhood',
    question: "Wat deed ik graag als kind?",
    placeholder: "Vroeger speelde ik vaak...",
    options: ["Met lego/blokken", "Doktertje", "Winkeltje", "Buiten in de natuur", "Boeken lezen", "Knutselen"]
  },
  {
    id: 'energy',
    question: "Waar krijg ik energie van?",
    placeholder: "Ik word blij als...",
    options: ["Ik iemand help", "Iets af is", "Ik iets nieuws leer", "Ik samenwerk", "Ik buiten ben"]
  },
  {
    id: 'othersSay',
    question: "Wat zeggen anderen over mij?",
    placeholder: "Mijn vrienden zeggen dat ik...",
    options: ["Grappig ben", "Slim ben", "Lief ben", "Creatief ben", "Sterk ben"]
  }
];

export const ROUTES: RouteData[] = [
  {
    id: 'care',
    title: 'Zorg & Mensen helpen',
    iconType: 'heart',
    color: 'rose',
    bgColor: '#ffe4e6',
    metafore: 'Zorgstad',
    description: 'Hier draait alles om mensen helpen, gezondheid en verzorging.',
    tags: ['helpen', 'mensen', 'verzorgen', 'lief', 'doktertje', 'luisteren'],
    jobs: [
      { id: 'nurse', title: 'Verpleegkundige', description: 'Je helpt zieke mensen in het ziekenhuis. Je geeft medicijnen en zorgt dat ze zich fijn voelen.', zone: 'Ziekenhuisheuvel' },
      { id: 'doctor', title: 'Arts', description: 'Je onderzoekt wat mensen mankeren en bedenkt een plan om ze beter te maken.', zone: 'Ziekenhuisheuvel' },
      { id: 'homecare', title: 'Thuiszorg medewerker', description: 'Je gaat bij mensen thuis langs om ze te wassen, aan te kleden en te helpen.', zone: 'Ouderenwijk' },
      { id: 'pedagogue', title: 'Pedagogisch Medewerker', description: 'Je werkt met kinderen op de opvang of school en zorgt voor een fijne sfeer.', zone: 'Kinderplein' },
    ]
  },
  {
    id: 'tech',
    title: 'Techniek & Dingen maken',
    iconType: 'gear',
    color: 'blue',
    bgColor: '#dbeafe',
    metafore: 'Tech-eiland',
    description: 'Voor de makers, de bouwers en de uitvinders.',
    tags: ['handen', 'maken', 'lego', 'bouwen', 'repareren', 'techniek', 'auto'],
    jobs: [
      { id: 'mechanic', title: 'Automonteur', description: 'Je repareert auto\'s en zorgt dat ze veilig de weg op kunnen.', zone: 'De Garage' },
      { id: 'programmer', title: 'Programmeur', description: 'Je schrijft computertaal om apps, websites en games te bouwen.', zone: 'Digi-Lab' },
      { id: 'carpenter', title: 'Timmerman', description: 'Je bouwt huizen, meubels en daken van hout.', zone: 'Bouwplaats' },
      { id: 'electrician', title: 'Elektricien', description: 'Je zorgt dat overal het licht brandt en de stroom werkt.', zone: 'Energiecentrale' },
    ]
  },
  {
    id: 'art',
    title: 'Kunst & Creatief',
    iconType: 'brush',
    color: 'purple',
    bgColor: '#f3e8ff',
    metafore: 'Creatief Eiland',
    description: 'Laat je fantasie de vrije loop. Dans, muziek, beeld en ontwerp.',
    tags: ['tekenen', 'knutselen', 'muziek', 'creatief', 'fantasie', 'ontwerpen'],
    jobs: [
      { id: 'designer', title: 'Grafisch Vormgever', description: 'Je ontwerpt posters, logo\'s en websites op de computer.', zone: 'Design Studio' },
      { id: 'actor', title: 'Acteur', description: 'Je speelt rollen in films, series of in het theater.', zone: 'Theaterplein' },
      { id: 'hairdresser', title: 'Kapper', description: 'Je knipt en kleurt haren zodat mensen er mooi uitzien.', zone: 'Fashionstraat' },
      { id: 'photographer', title: 'Fotograaf', description: 'Je maakt mooie foto\'s van mensen, natuur of spullen.', zone: 'Media-stad' },
    ]
  },
  {
    id: 'business',
    title: 'Geld, Handel & Organiseren',
    iconType: 'money',
    color: 'yellow',
    bgColor: '#fef9c3',
    metafore: 'Handelsstad',
    description: 'Regelen, verkopen, rekenen en ondernemen.',
    tags: ['winkeltje', 'rekenen', 'organiseren', 'verkopen', 'geld', 'leider'],
    jobs: [
      { id: 'shopkeeper', title: 'Winkelmedewerker', description: 'Je helpt klanten in de winkel en zorgt dat de schappen vol zijn.', zone: 'Winkelcentrum' },
      { id: 'manager', title: 'Manager', description: 'Je bent de baas van een team en zorgt dat iedereen goed zijn werk kan doen.', zone: 'Kantoortoren' },
      { id: 'accountant', title: 'Boekhouder', description: 'Je houdt precies bij hoeveel geld er binnenkomt en uitgaat.', zone: 'De Bank' },
      { id: 'entrepreneur', title: 'Ondernemer', description: 'Je begint je eigen bedrijf en bedenkt nieuwe ideeën.', zone: 'Start-up Garage' },
    ]
  },
  {
    id: 'nature',
    title: 'Natuur, Onderzoek & Milieu',
    iconType: 'leaf',
    color: 'green',
    bgColor: '#dcfce7',
    metafore: 'Groene Vallei',
    description: 'Werken met dieren, planten, de aarde of in het lab.',
    tags: ['dieren', 'buiten', 'natuur', 'onderzoek', 'planten', 'biologie'],
    jobs: [
      { id: 'vet', title: 'Dierenartsassistent', description: 'Je helpt de dierenarts bij het beter maken van zieke dieren.', zone: 'Dierenkliniek' },
      { id: 'gardener', title: 'Hovenier', description: 'Je legt tuinen aan en zorgt voor planten en bomen.', zone: 'Parken & Tuinen' },
      { id: 'researcher', title: 'Onderzoeker', description: 'Je doet proefjes in een laboratorium om nieuwe dingen te ontdekken.', zone: 'Science Lab' },
      { id: 'farmer', title: 'Boer', description: 'Je zorgt voor koeien, varkens of verbouwt groenten op het land.', zone: 'De Boerderij' },
    ]
  },
  {
    id: 'society',
    title: 'Taal, Mensen & Samenleving',
    iconType: 'speech',
    color: 'orange',
    bgColor: '#ffedd5',
    metafore: 'Samenleving Centrum',
    description: 'Veiligheid, recht, toerisme en mensen verbinden.',
    tags: ['praten', 'mensen', 'veiligheid', 'taal', 'reizen', 'samen'],
    jobs: [
      { id: 'police', title: 'Politieagent', description: 'Je zorgt voor veiligheid op straat en helpt mensen in nood.', zone: 'Veiligheidsplein' },
      { id: 'lawyer', title: 'Advocaat', description: 'Je helpt mensen met wetten en regels als ze problemen hebben.', zone: 'Rechtbank' },
      { id: 'guide', title: 'Reisleider', description: 'Je laat toeristen mooie plekken zien en vertelt erover.', zone: 'Toeristenbureau' },
      { id: 'socialworker', title: 'Maatschappelijk Werker', description: 'Je helpt mensen die problemen hebben thuis of met geld.', zone: 'Buurthuis' },
    ]
  }
];

export const getIcon = (type: string, size = 24, className = "") => {
  const props = { size, className };
  switch (type) {
    case 'heart': return <Heart {...props} />;
    case 'gear': return <Cog {...props} />;
    case 'brush': return <Palette {...props} />;
    case 'money': return <DollarSign {...props} />;
    case 'leaf': return <Leaf {...props} />;
    case 'speech': return <MessageCircle {...props} />;
    default: return <Heart {...props} />;
  }
};
