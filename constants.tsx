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
    tags: ['helpen', 'mensen', 'verzorgen', 'lief', 'doktertje', 'luisteren', 'voeding', 'uiterlijk'],
    jobs: [
      { id: 'nurse', title: 'Verpleegkundige', description: 'Je helpt zieke mensen in het ziekenhuis. Je geeft medicijnen en zorgt dat ze zich fijn voelen.', zone: 'Ziekenhuisheuvel' },
      { id: 'doctor', title: 'Arts', description: 'Je onderzoekt wat mensen mankeren en bedenkt een plan om ze beter te maken.', zone: 'Ziekenhuisheuvel' },
      { id: 'physio', title: 'Fysiotherapeut', description: 'Je helpt mensen weer goed bewegen als ze pijn hebben aan hun spieren.', zone: 'Ziekenhuisheuvel' },
      { id: 'dentist', title: 'Tandarts', description: 'Je controleert tanden en kiezen en maakt gaatjes weer heel.', zone: 'Ziekenhuisheuvel' },
      { id: 'pharmacist', title: 'Apotheker', description: 'Je maakt medicijnen klaar en legt mensen uit hoe ze die moeten gebruiken.', zone: 'Ziekenhuisheuvel' },
      
      // Voeding & Gezondheid
      { id: 'dietitian', title: 'Diëtist', description: 'Je weet alles over eten. Je helpt mensen om gezonder te worden of af te vallen met goede voeding.', zone: 'Gezondheidscentrum' },
      { id: 'lifestyle_coach', title: 'Leefstijlcoach', description: 'Je coacht mensen om gezonder te leven, meer te bewegen en goed te slapen.', zone: 'Gezondheidscentrum' },
      
      // Verzorging & Uiterlijk
      { id: 'hairdresser', title: 'Kapper', description: 'Je knipt, kleurt en stylet haren zodat mensen zich mooi en verzorgd voelen.', zone: 'Wellness & Verzorging' },
      { id: 'beautician', title: 'Schoonheidsspecialist', description: 'Je verzorgt de huid, nagels en make-up van mensen zodat ze kunnen ontspannen.', zone: 'Wellness & Verzorging' },

      { id: 'homecare', title: 'Thuiszorg medewerker', description: 'Je gaat bij mensen thuis langs om ze te wassen, aan te kleden en te helpen.', zone: 'Ouderenwijk' },
      { id: 'pedagogue', title: 'Pedagogisch Medewerker', description: 'Je werkt met kinderen op de opvang of school en zorgt voor een fijne sfeer.', zone: 'Kinderplein' },
      { id: 'logopedist', title: 'Logopedist', description: 'Je helpt kinderen en volwassenen om beter te praten en slikken.', zone: 'Kinderplein' },
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
      { id: 'pilot', title: 'Piloot', description: 'Je bestuurt vliegtuigen en brengt passagiers veilig naar verre landen.', zone: 'De Garage' },
      { id: 'programmer', title: 'Programmeur', description: 'Je schrijft computertaal om apps, websites en games te bouwen.', zone: 'Digi-Lab' },
      { id: 'game_developer', title: 'Game Developer', description: 'Je bedenkt en bouwt de werelden en regels van videogames.', zone: 'Digi-Lab' },
      { id: 'carpenter', title: 'Timmerman', description: 'Je bouwt huizen, meubels en daken van hout.', zone: 'Bouwplaats' },
      { id: 'electrician', title: 'Elektricien', description: 'Je zorgt dat overal het licht brandt en de stroom werkt.', zone: 'Energiecentrale' },
      { id: 'architect', title: 'Architect', description: 'Je bedenkt en tekent hoe nieuwe huizen en gebouwen eruit moeten zien.', zone: 'Bouwplaats' },
      { id: 'plumber', title: 'Loodgieter', description: 'Je repareert lekkende kranen en legt waterleidingen aan.', zone: 'Bouwplaats' },
    ]
  },
  {
    id: 'art',
    title: 'Kunst & Creatief',
    iconType: 'brush',
    color: 'purple',
    bgColor: '#f3e8ff',
    metafore: 'Creatief Eiland',
    description: 'Laat je fantasie de vrije loop. Muziek, mode, film, kunst en design.',
    tags: ['tekenen', 'knutselen', 'muziek', 'creatief', 'fantasie', 'ontwerpen', 'film', 'mode'],
    jobs: [
      // Design & Mode
      { id: 'designer', title: 'Grafisch Vormgever', description: 'Je ontwerpt posters, logo\'s en websites op de computer.', zone: 'Design & Mode' },
      { id: 'fashion_designer', title: 'Modeontwerper', description: 'Je bedenkt en tekent nieuwe kleding en modecollecties.', zone: 'Design & Mode' },
      { id: 'goldsmith', title: 'Edelsmid', description: 'Je maakt mooie sieraden van goud, zilver en edelstenen.', zone: 'Design & Mode' },
      
      // Film & Media
      { id: 'director', title: 'Regisseur', description: 'Je bent de baas op de filmset. Je bepaalt hoe de film eruitziet en wat acteurs doen.', zone: 'Film & Media' },
      { id: 'filmmaker', title: 'Filmmaker', description: 'Je bedenkt verhalen en maakt er zelf video\'s of films van met een camera.', zone: 'Film & Media' },
      { id: 'actor', title: 'Acteur', description: 'Je speelt rollen in films, series of in het theater.', zone: 'Film & Media' },
      { id: 'photographer', title: 'Fotograaf', description: 'Je maakt professionele foto\'s van mensen, de natuur of producten.', zone: 'Film & Media' },
      
      // Muziekstudio
      { id: 'musician', title: 'Muzikant', description: 'Je maakt muziek met een instrument (zoals gitaar of piano) of met je stem.', zone: 'Muziekstudio' },
      { id: 'rapper', title: 'Rapper', description: 'Je schrijft teksten en vertelt jouw verhaal op het ritme van een beat.', zone: 'Muziekstudio' },
      { id: 'producer', title: 'Muziekproducer', description: 'Je neemt liedjes op en zorgt met de computer dat de muziek perfect klinkt.', zone: 'Muziekstudio' },

      // Atelier & Street Art
      { id: 'visual_artist', title: 'Beeldend Vormgever', description: 'Je maakt kunstwerken, beelden of vormen om naar te kijken.', zone: 'Atelier & Street Art' },
      { id: 'graffiti', title: 'Graffiti Artist', description: 'Je maakt grote, kleurrijke kunstwerken met spuitbussen op muren.', zone: 'Atelier & Street Art' },
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
      { id: 'marketeer', title: 'Marketeer', description: 'Je bedenkt slimme reclames zodat mensen producten willen kopen.', zone: 'Kantoortoren' },
      { id: 'manager', title: 'Manager', description: 'Je bent de baas van een team en zorgt dat iedereen goed zijn werk kan doen.', zone: 'Kantoortoren' },
      { id: 'accountant', title: 'Boekhouder', description: 'Je houdt precies bij hoeveel geld er binnenkomt en uitgaat.', zone: 'De Bank' },
      { id: 'banker', title: 'Bankier', description: 'Je geeft advies over sparen, lenen en beleggen bij de bank.', zone: 'De Bank' },
      { id: 'entrepreneur', title: 'Ondernemer', description: 'Je begint je eigen bedrijf en bedenkt nieuwe ideeën.', zone: 'Start-up Garage' },
      { id: 'real_estate', title: 'Makelaar', description: 'Je helpt mensen bij het kopen en verkopen van huizen.', zone: 'Kantoortoren' },
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
      { id: 'veterinarian', title: 'Dierenarts', description: 'Je opereert zieke dieren en zorgt dat huisdieren gezond blijven.', zone: 'Dierenkliniek' },
      { id: 'vet', title: 'Dierenartsassistent', description: 'Je helpt de dierenarts bij het beter maken van zieke dieren.', zone: 'Dierenkliniek' },
      { id: 'gardener', title: 'Hovenier', description: 'Je legt tuinen aan en zorgt voor planten en bomen.', zone: 'Parken & Tuinen' },
      { id: 'forest_ranger', title: 'Boswachter', description: 'Je beschermt het bos en de dieren die er leven.', zone: 'Parken & Tuinen' },
      { id: 'researcher', title: 'Onderzoeker', description: 'Je doet proefjes in een laboratorium om nieuwe dingen te ontdekken.', zone: 'Science Lab' },
      { id: 'meteorologist', title: 'Weerman/vrouw', description: 'Je voorspelt het weer en vertelt of de zon gaat schijnen of dat het gaat regenen.', zone: 'Science Lab' },
      { id: 'biologist', title: 'Bioloog', description: 'Je bestudeert alles wat leeft, van kleine cellen tot grote dieren.', zone: 'Science Lab' },
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
    tags: ['praten', 'mensen', 'veiligheid', 'taal', 'reizen', 'samen', 'school', 'lesgeven'],
    jobs: [
      { id: 'teacher', title: 'Docent', description: 'Je geeft les op school en helpt leerlingen met leren.', zone: 'De School' },
      { id: 'school_principal', title: 'Schooldirecteur', description: 'Je bent de baas van de school en zorgt voor de leraren en leerlingen.', zone: 'De School' },
      { id: 'police', title: 'Politieagent', description: 'Je zorgt voor veiligheid op straat en helpt mensen in nood.', zone: 'Veiligheidsplein' },
      { id: 'lawyer', title: 'Advocaat', description: 'Je helpt mensen met wetten en regels als ze problemen hebben.', zone: 'Rechtbank' },
      { id: 'guide', title: 'Reisleider', description: 'Je laat toeristen mooie plekken zien en vertelt erover.', zone: 'Toeristenbureau' },
      { id: 'journalist', title: 'Journalist', description: 'Je zoekt nieuws en schrijft verhalen voor de krant of website.', zone: 'Media Centrum' },
      { id: 'librarian', title: 'Bibliotheekmedewerker', description: 'Je helpt mensen boeken vinden en organiseert activiteiten in de bieb.', zone: 'Media Centrum' },
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