// Database seeding utility for GitLife events
import { supabase } from '@/integrations/supabase/client';

// All seed events - will be migrated to database
export const allSeedEvents = [
  // === BABY (0-5) ===
  {
    title: 'Erste Schritte',
    text: 'Du hast gerade deine ersten Schritte gemacht! Deine Eltern sind überglücklich.',
    min_age: 1,
    max_age: 2,
    category: 'random',
    weight: 1.5,
    tags: ['milestone', 'baby'],
    options: [
      { id: 'fs1', label: 'Weiterlaufen', effects: { fitnessDelta: 5, healthDelta: 2 }, resultText: 'Du wirst immer sicherer auf den Beinen!' },
      { id: 'fs2', label: 'Hinfallen', effects: { healthDelta: -2, fitnessDelta: 2 }, resultText: 'Autsch! Aber so lernt man.' },
    ],
  },
  {
    title: 'Sprechen lernen',
    text: 'Du versuchst, deine ersten Wörter zu sagen.',
    min_age: 1,
    max_age: 3,
    category: 'education',
    weight: 1.2,
    tags: ['milestone', 'baby'],
    options: [
      { id: 'sp1', label: 'Mama sagen', effects: { iqDelta: 3 }, resultText: 'Mama! Deine Mutter ist gerührt.' },
      { id: 'sp2', label: 'Papa sagen', effects: { iqDelta: 3 }, resultText: 'Papa! Dein Vater strahlt vor Freude.' },
      { id: 'sp3', label: 'Nein sagen', effects: { iqDelta: 2, luckDelta: 1 }, resultText: 'NEIN! Du zeigst schon früh Charakter.' },
    ],
  },
  {
    title: 'Kindergarten',
    text: 'Dein erster Tag im Kindergarten steht bevor.',
    min_age: 3,
    max_age: 5,
    category: 'social',
    weight: 1.3,
    tags: ['milestone', 'social'],
    options: [
      { id: 'kg1', label: 'Freunde finden', effects: { luckDelta: 5, healthDelta: 2 }, resultText: 'Du hast neue Freunde gefunden!' },
      { id: 'kg2', label: 'Weinen', effects: { healthDelta: -2 }, resultText: 'Du vermisst deine Eltern...' },
      { id: 'kg3', label: 'Spielen', effects: { fitnessDelta: 3, iqDelta: 1 }, resultText: 'Du spielst den ganzen Tag und hast Spaß!' },
    ],
  },

  // === SCHULE (6-12) ===
  {
    title: 'Mathetest in der Schule',
    text: 'Heute ist der große Mathetest! Wie gut bist du vorbereitet?',
    min_age: 6,
    max_age: 12,
    category: 'school',
    weight: 2.0,
    tags: ['school', 'math', 'test'],
    options: [
      { id: 'mt1', label: 'Test machen', effects: { iqDelta: 0 }, resultText: 'Los geht\'s! Rechne richtig für Bonus-IQ.', minigame: 'math' },
      { id: 'mt2', label: 'Abschreiben versuchen', effects: { iqDelta: -5, luckDelta: -3 }, resultText: 'Du wirst erwischt und bekommst Ärger!' },
      { id: 'mt3', label: 'Krank machen', effects: { healthDelta: -5 }, resultText: 'Du bleibst zu Hause, aber der Test muss nachgeholt werden.' },
    ],
  },
  {
    title: 'Englisch-Test',
    text: 'In der Schule steht ein Englisch-Vokabeltest an!',
    min_age: 8,
    max_age: 14,
    category: 'school',
    weight: 1.8,
    tags: ['school', 'english', 'test'],
    options: [
      { id: 'en1', label: 'Test machen', effects: { iqDelta: 0 }, resultText: 'Zeig dein Englisch!', minigame: 'english' },
      { id: 'en2', label: 'Nicht gelernt', effects: { iqDelta: -3 }, resultText: 'Du hast nicht gelernt und schreibst eine schlechte Note.' },
    ],
  },
  {
    title: 'Deutsch-Diktat',
    text: 'Heute schreibt ihr ein Diktat in Deutsch.',
    min_age: 7,
    max_age: 14,
    category: 'school',
    weight: 1.8,
    tags: ['school', 'german', 'test'],
    options: [
      { id: 'de1', label: 'Diktat schreiben', effects: { iqDelta: 0 }, resultText: 'Konzentriere dich!', minigame: 'german' },
      { id: 'de2', label: 'Schludern', effects: { iqDelta: -4 }, resultText: 'Viele Fehler... der Lehrer ist enttäuscht.' },
    ],
  },
  {
    title: 'Sportfest',
    text: 'Die Schule veranstaltet ein großes Sportfest!',
    min_age: 6,
    max_age: 12,
    category: 'school',
    weight: 1.5,
    tags: ['school', 'sport', 'fitness'],
    options: [
      { id: 'sf1', label: 'Flappy Bird Challenge', effects: { fitnessDelta: 0, moneyDelta: 0 }, resultText: 'Zeig was du kannst!', minigame: 'flappy' },
      { id: 'sf2', label: 'Beim Laufen mitmachen', effects: { fitnessDelta: 5, healthDelta: 2 }, resultText: 'Du gibst alles und wirst besser!' },
      { id: 'sf3', label: 'Zuschauen', effects: { fitnessDelta: -2 }, resultText: 'Du sitzt auf der Bank und langweilst dich.' },
    ],
  },
  {
    title: 'Schulfreund',
    text: 'Ein neuer Schüler ist in deine Klasse gekommen.',
    min_age: 6,
    max_age: 12,
    category: 'social',
    weight: 1.3,
    tags: ['school', 'social'],
    options: [
      { id: 'scf1', label: 'Freundschaft anbieten', effects: { luckDelta: 5, healthDelta: 2 }, resultText: 'Ihr werdet beste Freunde!' },
      { id: 'scf2', label: 'Ignorieren', effects: { luckDelta: -2 }, resultText: 'Du verpasst die Chance auf eine Freundschaft.' },
      { id: 'scf3', label: 'Ärgern', effects: { luckDelta: -5, looksDelta: -2 }, resultText: 'Andere Kinder finden das nicht cool.' },
    ],
  },
  {
    title: 'Hausaufgaben',
    text: 'Du hast heute viele Hausaufgaben auf.',
    min_age: 6,
    max_age: 12,
    category: 'school',
    weight: 1.8,
    tags: ['school', 'education'],
    options: [
      { id: 'ha1', label: 'Fleißig arbeiten', effects: { iqDelta: 3 }, resultText: 'Du lernst viel und bekommst gute Noten!' },
      { id: 'ha2', label: 'Puzzle lösen statt lernen', effects: { iqDelta: 0 }, resultText: 'Lass uns ein Puzzle machen!', minigame: 'puzzle' },
      { id: 'ha3', label: 'Vergessen', effects: { iqDelta: -3 }, resultText: 'Der Lehrer ist nicht begeistert...' },
    ],
  },
  {
    title: 'Memory Spiel im Unterricht',
    text: 'Euer Lehrer macht ein Gedächtnisspiel mit der Klasse.',
    min_age: 6,
    max_age: 12,
    category: 'school',
    weight: 1.5,
    tags: ['school', 'memory', 'game'],
    options: [
      { id: 'mem1', label: 'Memory spielen', effects: { iqDelta: 0 }, resultText: 'Teste dein Gedächtnis!', minigame: 'memory' },
      { id: 'mem2', label: 'Nicht mitmachen', effects: { iqDelta: -2 }, resultText: 'Du verpasst den Spaß.' },
    ],
  },
  {
    title: 'Merkspiel-Test',
    text: 'Der Schulpsychologe testet dein Kurzzeitgedächtnis.',
    min_age: 8,
    max_age: 16,
    category: 'school',
    weight: 1.2,
    tags: ['school', 'memory', 'test'],
    options: [
      { id: 'seq1', label: 'Test mitmachen', effects: { iqDelta: 0 }, resultText: 'Merke dir die Reihenfolge!', minigame: 'sequence' },
      { id: 'seq2', label: 'Nervös werden', effects: { iqDelta: -2 }, resultText: 'Du bist zu nervös für den Test.' },
    ],
  },
  {
    title: 'Taschengeld',
    text: 'Deine Eltern bieten dir Taschengeld für gute Noten an.',
    min_age: 7,
    max_age: 12,
    category: 'financial',
    weight: 1.2,
    tags: ['money', 'school'],
    options: [
      { id: 'tg1', label: 'Fleißig lernen', effects: { moneyDelta: 20, iqDelta: 2 }, resultText: 'Du bekommst €20 für deine guten Noten!' },
      { id: 'tg2', label: 'Lieber spielen', effects: { fitnessDelta: 2 }, resultText: 'Spaß ist dir wichtiger als Geld.' },
    ],
  },

  // === TEEN (13-17) ===
  {
    title: 'Erster Nebenjob',
    text: 'Der Supermarkt um die Ecke sucht Aushilfen.',
    min_age: 14,
    max_age: 17,
    category: 'career',
    weight: 1.5,
    tags: ['job', 'money', 'teen'],
    options: [
      { id: 'nj1', label: 'Bewerben', effects: { moneyDelta: 200, fitnessDelta: -2 }, resultText: 'Du bekommst den Job! €200 pro Monat.' },
      { id: 'nj2', label: 'Snake spielen stattdessen', effects: { moneyDelta: 0 }, resultText: 'Zock lieber ein bisschen!', minigame: 'snake' },
      { id: 'nj3', label: 'Ablehnen', effects: { fitnessDelta: 2 }, resultText: 'Du hast mehr Zeit für Sport.' },
    ],
  },
  {
    title: 'Pfandflaschen sammeln',
    text: 'Du siehst viele leere Flaschen im Park. Eine Gelegenheit!',
    min_age: 10,
    max_age: 25,
    category: 'minigame',
    weight: 1.3,
    tags: ['money', 'minigame'],
    options: [
      { id: 'pf1', label: 'Flaschen sammeln', effects: { moneyDelta: 0 }, resultText: 'Sammle so viele wie möglich!', minigame: 'bottles' },
      { id: 'pf2', label: 'Ignorieren', effects: { luckDelta: -1 }, resultText: 'Du gehst vorbei.' },
    ],
  },
  {
    title: 'Schulparty',
    text: 'Die große Schulparty steht an! Alle werden da sein.',
    min_age: 13,
    max_age: 17,
    category: 'social',
    weight: 1.8,
    tags: ['party', 'social', 'teen'],
    options: [
      { id: 'sp1', label: 'Hingehen und feiern', effects: { luckDelta: 5, looksDelta: 2 }, resultText: 'Du hast viel Spaß und lernst neue Leute kennen!' },
      { id: 'sp2', label: 'Zuhause bleiben', effects: { iqDelta: 2, luckDelta: -3 }, resultText: 'Du lernst stattdessen.' },
      { id: 'sp3', label: 'Party crashen', effects: { luckDelta: -5, looksDelta: -3 }, resultText: 'Das war keine gute Idee...' },
    ],
  },
  {
    title: 'Mathe-Abitur Vorbereitung',
    text: 'Der Mathe-Test wird schwieriger. Zeit zum Lernen!',
    min_age: 15,
    max_age: 17,
    category: 'school',
    weight: 2.0,
    tags: ['school', 'math', 'exam'],
    options: [
      { id: 'abi1', label: 'Mathetest ablegen', effects: { iqDelta: 0 }, resultText: 'Zeig was du gelernt hast!', minigame: 'math' },
      { id: 'abi2', label: 'Mit Freunden lernen', effects: { iqDelta: 3, luckDelta: 2 }, resultText: 'Gemeinsam lernt es sich besser!' },
      { id: 'abi3', label: 'Nicht lernen', effects: { iqDelta: -5 }, resultText: 'Du fällst durch den Test.' },
    ],
  },
  {
    title: 'Erste Beziehung',
    text: 'Jemand aus deiner Klasse interessiert sich für dich.',
    min_age: 14,
    max_age: 17,
    category: 'relationship',
    weight: 1.4,
    tags: ['relationship', 'teen'],
    options: [
      { id: 'bz1', label: 'Zusammenkommen', effects: { luckDelta: 8, looksDelta: 2 }, resultText: 'Ihr seid jetzt zusammen! 💕' },
      { id: 'bz2', label: 'Ablehnen', effects: { luckDelta: -2 }, resultText: 'Du bist noch nicht bereit.' },
      { id: 'bz3', label: 'Freunde bleiben', effects: { luckDelta: 3 }, resultText: 'Ihr bleibt gute Freunde.' },
    ],
  },
  {
    title: 'Führerschein',
    text: 'Du bist alt genug für den Führerschein!',
    min_age: 17,
    max_age: 17,
    category: 'education',
    weight: 1.5,
    tags: ['milestone', 'driving'],
    options: [
      { id: 'fs1', label: 'Führerschein machen', effects: { moneyDelta: -2000, iqDelta: 3 }, resultText: 'Du hast bestanden! Kosten: €2000' },
      { id: 'fs2', label: 'Später machen', effects: { moneyDelta: 0 }, resultText: 'Du wartest noch ein Jahr.' },
    ],
  },

  // === JUNGER ERWACHSENER (18-25) ===
  {
    title: 'Studium oder Ausbildung?',
    text: 'Die Schule ist vorbei. Was nun?',
    min_age: 18,
    max_age: 19,
    category: 'education',
    weight: 2.0,
    tags: ['milestone', 'career', 'education'],
    options: [
      { id: 'stud1', label: 'Studium beginnen', effects: { moneyDelta: -5000, iqDelta: 10 }, resultText: 'Du schreibst dich an der Uni ein. Kosten: €5000' },
      { id: 'stud2', label: 'Ausbildung starten', effects: { moneyDelta: 500, iqDelta: 5 }, resultText: 'Du beginnst eine Ausbildung mit Gehalt!' },
      { id: 'stud3', label: 'Erstmal chillen', effects: { fitnessDelta: 2, iqDelta: -3 }, resultText: 'Gap Year! Du entspannst dich.' },
    ],
  },
  {
    title: 'Erste eigene Wohnung',
    text: 'Du ziehst von zu Hause aus!',
    min_age: 18,
    max_age: 25,
    category: 'random',
    weight: 1.5,
    tags: ['milestone', 'living'],
    options: [
      { id: 'woh1', label: 'Eigene Wohnung', effects: { moneyDelta: -800, luckDelta: 5 }, resultText: 'Freiheit! Miete: €800/Monat' },
      { id: 'woh2', label: 'WG', effects: { moneyDelta: -400, luckDelta: 3 }, resultText: 'Du teilst dir eine WG. Günstiger!' },
      { id: 'woh3', label: 'Bei Eltern bleiben', effects: { moneyDelta: 0, luckDelta: -3 }, resultText: 'Du sparst Geld, aber...' },
    ],
  },
  {
    title: 'Casino Einladung',
    text: 'Deine Freunde wollen ins Casino. Du bist jetzt alt genug!',
    min_age: 18,
    max_age: 25,
    category: 'minigame',
    weight: 1.3,
    tags: ['casino', 'gambling'],
    options: [
      { id: 'cas1', label: 'Blackjack spielen', effects: { moneyDelta: 0 }, resultText: 'Setz dein Geld ein!', minigame: 'blackjack' },
      { id: 'cas2', label: 'Nur zuschauen', effects: { luckDelta: -2 }, resultText: 'Du schaust nur zu.' },
      { id: 'cas3', label: 'Ablehnen', effects: { luckDelta: 1 }, resultText: 'Du bleibst vernünftig.' },
    ],
  },
  {
    title: 'Space Shooter Turnier',
    text: 'Es gibt ein Arcade-Turnier mit Preisgeld!',
    min_age: 16,
    max_age: 40,
    category: 'minigame',
    weight: 1.2,
    tags: ['game', 'arcade', 'money'],
    options: [
      { id: 'sst1', label: 'Mitmachen', effects: { moneyDelta: 0 }, resultText: 'Zeig deine Skills!', minigame: 'shooter' },
      { id: 'sst2', label: 'Nur zuschauen', effects: { luckDelta: 1 }, resultText: 'Du schaust den Profis zu.' },
    ],
  },
  {
    title: 'Praktikum Angebot',
    text: 'Ein großes Unternehmen bietet dir ein Praktikum an.',
    min_age: 20,
    max_age: 25,
    category: 'career',
    weight: 1.6,
    tags: ['job', 'career'],
    options: [
      { id: 'prak1', label: 'Annehmen', effects: { moneyDelta: 600, iqDelta: 5 }, resultText: 'Du sammelst wertvolle Erfahrung! €600/Monat' },
      { id: 'prak2', label: 'Ablehnen', effects: { luckDelta: -2 }, resultText: 'Du verpasst die Chance.' },
    ],
  },

  // === ERWACHSENER (26-60) ===
  {
    title: 'Beförderung',
    text: 'Dein Chef bietet dir eine Beförderung an!',
    min_age: 26,
    max_age: 50,
    category: 'career',
    weight: 1.5,
    tags: ['job', 'career', 'money'],
    options: [
      { id: 'bef1', label: 'Annehmen', effects: { moneyDelta: 2000, fitnessDelta: -2 }, resultText: 'Mehr Gehalt! +€2000/Monat, aber mehr Stress.' },
      { id: 'bef2', label: 'Ablehnen', effects: { luckDelta: -3 }, resultText: 'Du bleibst in deiner Position.' },
      { id: 'bef3', label: 'Verhandeln', effects: { moneyDelta: 3000, iqDelta: 2 }, resultText: 'Du verhandelst geschickt! +€3000/Monat' },
    ],
  },
  {
    title: 'Investment Möglichkeit',
    text: 'Ein Freund hat einen heißen Aktientipp.',
    min_age: 25,
    max_age: 60,
    category: 'financial',
    weight: 1.4,
    tags: ['money', 'investment'],
    options: [
      { id: 'inv1', label: '€1000 investieren', effects: { moneyDelta: 0, luckDelta: 0 }, resultText: 'Risiko! 50% Chance auf Verdoppelung.' },
      { id: 'inv2', label: 'Nicht investieren', effects: { luckDelta: 1 }, resultText: 'Du bleibst vorsichtig.' },
      { id: 'inv3', label: 'Alles investieren', effects: { moneyDelta: 0, luckDelta: -5 }, resultText: 'Sehr riskant!' },
    ],
  },
  {
    title: 'Fitness Studio',
    text: 'Du überlegst, ins Fitness Studio zu gehen.',
    min_age: 20,
    max_age: 60,
    category: 'health',
    weight: 1.3,
    tags: ['fitness', 'health'],
    options: [
      { id: 'fit1', label: 'Mitgliedschaft abschließen', effects: { moneyDelta: -50, fitnessDelta: 8, healthDelta: 3 }, resultText: 'Du trainierst regelmäßig!' },
      { id: 'fit2', label: 'Zuhause trainieren', effects: { fitnessDelta: 4 }, resultText: 'Günstiger, aber weniger effektiv.' },
      { id: 'fit3', label: 'Gar nicht trainieren', effects: { fitnessDelta: -3, healthDelta: -2 }, resultText: 'Du wirst fauler.' },
    ],
  },
  {
    title: 'Schönheits-OP',
    text: 'Du überlegst, dein Aussehen zu verbessern.',
    min_age: 25,
    max_age: 55,
    category: 'health',
    weight: 0.8,
    tags: ['looks', 'health'],
    options: [
      { id: 'sop1', label: 'OP machen', effects: { moneyDelta: -5000, looksDelta: 15, healthDelta: -5 }, resultText: 'Du siehst besser aus! Kosten: €5000' },
      { id: 'sop2', label: 'Nur Hautpflege', effects: { moneyDelta: -200, looksDelta: 5 }, resultText: 'Natürliche Verbesserung.' },
      { id: 'sop3', label: 'Akzeptieren wie du bist', effects: { luckDelta: 3 }, resultText: 'Selbstakzeptanz!' },
    ],
  },
  {
    title: 'Krankheit',
    text: 'Du fühlst dich nicht gut...',
    min_age: 30,
    max_age: 80,
    category: 'health',
    weight: 1.2,
    tags: ['health', 'illness'],
    options: [
      { id: 'kra1', label: 'Zum Arzt gehen', effects: { moneyDelta: -100, healthDelta: 10 }, resultText: 'Der Arzt hilft dir!' },
      { id: 'kra2', label: 'Aussitzen', effects: { healthDelta: -15 }, resultText: 'Es wird schlimmer...' },
      { id: 'kra3', label: 'Alternative Medizin', effects: { moneyDelta: -50, healthDelta: 5, luckDelta: -2 }, resultText: 'Teils wirksam.' },
    ],
  },
  {
    title: 'Lotterie',
    text: 'Du siehst einen Lottoschein im Laden.',
    min_age: 18,
    max_age: 90,
    category: 'random',
    weight: 1.0,
    tags: ['luck', 'gambling'],
    options: [
      { id: 'lot1', label: 'Einen Schein kaufen', effects: { moneyDelta: -5, luckDelta: 0 }, resultText: 'Vielleicht gewinnst du? (1% Chance auf €10000)' },
      { id: 'lot2', label: 'Nicht spielen', effects: { luckDelta: 0 }, resultText: 'Du sparst €5.' },
    ],
  },
  {
    title: 'Immobilien',
    text: 'Du überlegst, ein Haus zu kaufen.',
    min_age: 30,
    max_age: 55,
    category: 'financial',
    weight: 1.2,
    tags: ['money', 'investment', 'living'],
    options: [
      { id: 'imm1', label: 'Haus kaufen', effects: { moneyDelta: -50000, luckDelta: 10 }, resultText: 'Du bist Hausbesitzer! Kredit: €50000' },
      { id: 'imm2', label: 'Weiter mieten', effects: { luckDelta: -2 }, resultText: 'Du bleibst flexibel.' },
    ],
  },

  // === SENIOR (61+) ===
  {
    title: 'Rente',
    text: 'Du gehst in Rente!',
    min_age: 65,
    max_age: 67,
    category: 'career',
    weight: 2.0,
    tags: ['milestone', 'retirement'],
    options: [
      { id: 'ren1', label: 'Rente genießen', effects: { moneyDelta: 2000, fitnessDelta: -3 }, resultText: 'Endlich Ruhestand! €2000/Monat Rente.' },
      { id: 'ren2', label: 'Nebenjob behalten', effects: { moneyDelta: 3000, healthDelta: -5 }, resultText: 'Du arbeitest weiter.' },
    ],
  },
  {
    title: 'Gesundheitscheck',
    text: 'Zeit für den jährlichen Gesundheitscheck.',
    min_age: 60,
    max_age: 100,
    category: 'health',
    weight: 1.5,
    tags: ['health', 'senior'],
    options: [
      { id: 'ges1', label: 'Zum Check gehen', effects: { moneyDelta: -100, healthDelta: 5 }, resultText: 'Alles in Ordnung!' },
      { id: 'ges2', label: 'Überspringen', effects: { healthDelta: -10 }, resultText: 'Du ignorierst mögliche Probleme.' },
    ],
  },
  {
    title: 'Enkelkinder',
    text: 'Deine Kinder haben Kinder bekommen!',
    min_age: 55,
    max_age: 80,
    category: 'random',
    weight: 1.3,
    tags: ['family', 'milestone'],
    options: [
      { id: 'enk1', label: 'Zeit mit ihnen verbringen', effects: { luckDelta: 10, healthDelta: 3 }, resultText: 'Du bist ein glücklicher Großelternteil!' },
      { id: 'enk2', label: 'Geschenke schicken', effects: { moneyDelta: -200, luckDelta: 5 }, resultText: 'Die Kleinen freuen sich!' },
    ],
  },
  {
    title: 'Erbschaft',
    text: 'Ein entfernter Verwandter ist verstorben und hat dir etwas hinterlassen.',
    min_age: 40,
    max_age: 90,
    category: 'financial',
    weight: 0.7,
    tags: ['money', 'luck'],
    options: [
      { id: 'erb1', label: 'Erbe annehmen', effects: { moneyDelta: 15000, luckDelta: 5 }, resultText: 'Du erbst €15000!' },
      { id: 'erb2', label: 'Spenden', effects: { moneyDelta: 0, luckDelta: 10 }, resultText: 'Du spendest alles. Gutes Karma!' },
    ],
  },
  {
    title: 'Betrugsversuch',
    text: 'Jemand ruft an und behauptet, du hast gewonnen...',
    min_age: 50,
    max_age: 100,
    category: 'random',
    weight: 0.8,
    tags: ['scam', 'money'],
    options: [
      { id: 'bet1', label: 'Auflegen', effects: { luckDelta: 3 }, resultText: 'Gute Entscheidung! Es war ein Betrug.' },
      { id: 'bet2', label: 'Glauben', effects: { moneyDelta: -2000, luckDelta: -10 }, resultText: 'Du wirst um €2000 betrogen!' },
    ],
  },
  {
    title: 'Gedächtnistraining',
    text: 'Du merkst, dass dein Gedächtnis nachlässt.',
    min_age: 60,
    max_age: 100,
    category: 'health',
    weight: 1.2,
    tags: ['health', 'memory', 'senior'],
    options: [
      { id: 'ged1', label: 'Memory spielen', effects: { iqDelta: 0 }, resultText: 'Trainiere dein Gehirn!', minigame: 'memory' },
      { id: 'ged2', label: 'Rätsel lösen', effects: { iqDelta: 3 }, resultText: 'Regelmäßiges Training hilft!' },
      { id: 'ged3', label: 'Nichts tun', effects: { iqDelta: -5 }, resultText: 'Es wird schlimmer.' },
    ],
  },

  // === ALLGEMEINE EVENTS ===
  {
    title: 'Glückstag',
    text: 'Heute ist dein Glückstag! Alles läuft super.',
    min_age: 0,
    max_age: 100,
    category: 'random',
    weight: 0.5,
    tags: ['luck', 'random'],
    options: [
      { id: 'gl1', label: 'Genießen', effects: { luckDelta: 10, healthDelta: 5 }, resultText: 'Was für ein toller Tag!' },
    ],
  },
  {
    title: 'Unfall',
    text: 'Du hattest einen kleinen Unfall.',
    min_age: 5,
    max_age: 100,
    category: 'health',
    weight: 0.6,
    tags: ['accident', 'health'],
    options: [
      { id: 'unf1', label: 'Zum Arzt', effects: { moneyDelta: -200, healthDelta: -10 }, resultText: 'Nichts Schlimmes, aber es kostet.' },
      { id: 'unf2', label: 'Aussitzen', effects: { healthDelta: -20 }, resultText: 'Es heilt von selbst... langsam.' },
    ],
  },
  {
    title: 'Gaming Session',
    text: 'Lust auf ein Spiel?',
    min_age: 8,
    max_age: 80,
    category: 'minigame',
    weight: 1.0,
    tags: ['game', 'fun'],
    options: [
      { id: 'gam1', label: 'Flappy Bird', effects: { moneyDelta: 0 }, resultText: 'Lass uns spielen!', minigame: 'flappy' },
      { id: 'gam2', label: 'Snake', effects: { moneyDelta: 0 }, resultText: 'Klassiker!', minigame: 'snake' },
      { id: 'gam3', label: 'Memory', effects: { iqDelta: 0 }, resultText: 'Trainiere dein Gehirn!', minigame: 'memory' },
      { id: 'gam4', label: 'Puzzle', effects: { iqDelta: 0 }, resultText: 'Kniffelig!', minigame: 'puzzle' },
    ],
  },
  {
    title: 'Diät',
    text: 'Du überlegst, eine Diät zu machen.',
    min_age: 15,
    max_age: 70,
    category: 'health',
    weight: 1.0,
    tags: ['health', 'fitness'],
    options: [
      { id: 'di1', label: 'Strenge Diät', effects: { fitnessDelta: 5, looksDelta: 5, healthDelta: -2 }, resultText: 'Du nimmst ab, aber es ist anstrengend.' },
      { id: 'di2', label: 'Gesünder essen', effects: { fitnessDelta: 2, healthDelta: 3 }, resultText: 'Langfristig besser!' },
      { id: 'di3', label: 'Weiter so', effects: { fitnessDelta: -2 }, resultText: 'Keine Veränderung.' },
    ],
  },
  {
    title: 'Urlaub',
    text: 'Zeit für einen Urlaub!',
    min_age: 18,
    max_age: 80,
    category: 'random',
    weight: 1.1,
    tags: ['vacation', 'fun'],
    options: [
      { id: 'url1', label: 'Luxusurlaub', effects: { moneyDelta: -3000, healthDelta: 10, luckDelta: 5 }, resultText: 'Entspannung pur! Kosten: €3000' },
      { id: 'url2', label: 'Camping', effects: { moneyDelta: -200, fitnessDelta: 5, luckDelta: 2 }, resultText: 'Günstig und gesund!' },
      { id: 'url3', label: 'Staycation', effects: { moneyDelta: 0, healthDelta: 3 }, resultText: 'Zu Hause entspannen.' },
    ],
  },
  {
    title: 'Kopfrechnen Challenge',
    text: 'Dein Freund fordert dich zum Kopfrechnen heraus!',
    min_age: 8,
    max_age: 50,
    category: 'education',
    weight: 1.0,
    tags: ['math', 'challenge'],
    options: [
      { id: 'kr1', label: 'Annehmen', effects: { iqDelta: 0 }, resultText: 'Los geht\'s!', minigame: 'math' },
      { id: 'kr2', label: 'Ablehnen', effects: { luckDelta: -2 }, resultText: 'Du kneiferst...' },
    ],
  },
  {
    title: 'Mathe-Olympiade',
    text: 'Die Schule sucht Teilnehmer für die Mathe-Olympiade.',
    min_age: 10,
    max_age: 18,
    category: 'school',
    weight: 0.8,
    tags: ['math', 'competition'],
    options: [
      { id: 'mo1', label: 'Teilnehmen', effects: { iqDelta: 0, moneyDelta: 0 }, resultText: 'Zeig was du kannst!', minigame: 'math' },
      { id: 'mo2', label: 'Nicht interessiert', effects: { luckDelta: -1 }, resultText: 'Du lässt es.' },
    ],
  },
  {
    title: 'Arcade Halle',
    text: 'Du findest eine alte Arcade Halle!',
    min_age: 10,
    max_age: 60,
    category: 'minigame',
    weight: 1.0,
    tags: ['game', 'arcade'],
    options: [
      { id: 'arc1', label: 'Flappy spielen', effects: { moneyDelta: -5 }, resultText: 'Retro Gaming!', minigame: 'flappy' },
      { id: 'arc2', label: 'Snake zocken', effects: { moneyDelta: -5 }, resultText: 'Der Klassiker!', minigame: 'snake' },
      { id: 'arc3', label: 'Space Shooter', effects: { moneyDelta: -5 }, resultText: 'Pew pew!', minigame: 'shooter' },
      { id: 'arc4', label: 'Weitergehen', effects: { luckDelta: 0 }, resultText: 'Du gehst vorbei.' },
    ],
  },
  {
    title: 'Puzzle Wettbewerb',
    text: 'Es gibt einen Puzzle-Wettbewerb mit Preisgeld!',
    min_age: 12,
    max_age: 70,
    category: 'minigame',
    weight: 0.9,
    tags: ['puzzle', 'competition'],
    options: [
      { id: 'puz1', label: 'Teilnehmen', effects: { iqDelta: 0 }, resultText: 'Puzzle Zeit!', minigame: 'puzzle' },
      { id: 'puz2', label: 'Zuschauen', effects: { luckDelta: 1 }, resultText: 'Du schaust nur.' },
    ],
  },
  {
    title: 'Jobwechsel',
    text: 'Ein Headhunter bietet dir einen neuen Job an.',
    min_age: 25,
    max_age: 55,
    category: 'career',
    weight: 1.2,
    tags: ['job', 'career'],
    options: [
      { id: 'jw1', label: 'Wechseln', effects: { moneyDelta: 1500, luckDelta: 3 }, resultText: 'Neuer Job, mehr Gehalt! +€1500' },
      { id: 'jw2', label: 'Bleiben', effects: { luckDelta: 2 }, resultText: 'Du bleibst loyal.' },
      { id: 'jw3', label: 'Verhandeln für mehr', effects: { moneyDelta: 2500, iqDelta: 2 }, resultText: 'Du holst mehr raus! +€2500' },
    ],
  },
  {
    title: 'Eigenes Unternehmen',
    text: 'Du träumst davon, dein eigenes Unternehmen zu gründen.',
    min_age: 25,
    max_age: 50,
    category: 'career',
    weight: 0.8,
    tags: ['business', 'career'],
    options: [
      { id: 'eu1', label: 'Gründen', effects: { moneyDelta: -10000, luckDelta: 0 }, resultText: 'Riskant! Investition: €10000' },
      { id: 'eu2', label: 'Weiter angestellt', effects: { luckDelta: 1 }, resultText: 'Sicherheit ist dir wichtiger.' },
    ],
  },
  {
    title: 'Haustier',
    text: 'Du überlegst, dir ein Haustier anzuschaffen.',
    min_age: 10,
    max_age: 70,
    category: 'random',
    weight: 1.0,
    tags: ['pet', 'fun'],
    options: [
      { id: 'pet1', label: 'Hund adoptieren', effects: { moneyDelta: -500, luckDelta: 8, fitnessDelta: 5 }, resultText: 'Du hast einen neuen Freund!' },
      { id: 'pet2', label: 'Katze adoptieren', effects: { moneyDelta: -300, luckDelta: 6 }, resultText: 'Schnurr!' },
      { id: 'pet3', label: 'Kein Haustier', effects: { luckDelta: 0 }, resultText: 'Vielleicht später.' },
    ],
  },
  {
    title: 'Soziales Engagement',
    text: 'Eine Hilfsorganisation sucht Freiwillige.',
    min_age: 16,
    max_age: 80,
    category: 'social',
    weight: 0.9,
    tags: ['volunteer', 'social'],
    options: [
      { id: 'soz1', label: 'Mitmachen', effects: { luckDelta: 10, healthDelta: 2 }, resultText: 'Du hilfst anderen und fühlst dich gut!' },
      { id: 'soz2', label: 'Spenden', effects: { moneyDelta: -100, luckDelta: 5 }, resultText: 'Geld statt Zeit.' },
      { id: 'soz3', label: 'Ablehnen', effects: { luckDelta: -2 }, resultText: 'Du hast keine Zeit.' },
    ],
  },
  {
    title: 'Musik lernen',
    text: 'Du überlegst, ein Instrument zu lernen.',
    min_age: 6,
    max_age: 60,
    category: 'education',
    weight: 1.0,
    tags: ['music', 'hobby'],
    options: [
      { id: 'mus1', label: 'Gitarre lernen', effects: { moneyDelta: -300, iqDelta: 5, looksDelta: 3 }, resultText: 'Du lernst Gitarre spielen!' },
      { id: 'mus2', label: 'Klavier lernen', effects: { moneyDelta: -500, iqDelta: 7 }, resultText: 'Klassisch und elegant!' },
      { id: 'mus3', label: 'Kein Interesse', effects: { luckDelta: 0 }, resultText: 'Musik ist nichts für dich.' },
    ],
  },
  {
    title: 'Sport Team',
    text: 'Ein lokales Sportteam sucht Mitspieler.',
    min_age: 10,
    max_age: 50,
    category: 'health',
    weight: 1.1,
    tags: ['sport', 'fitness', 'social'],
    options: [
      { id: 'spt1', label: 'Beitreten', effects: { fitnessDelta: 10, luckDelta: 5, healthDelta: 3 }, resultText: 'Du wirst fit und findest Freunde!' },
      { id: 'spt2', label: 'Ablehnen', effects: { luckDelta: -1 }, resultText: 'Sport ist nicht dein Ding.' },
    ],
  },
  {
    title: 'Kochkurs',
    text: 'Es gibt einen lokalen Kochkurs.',
    min_age: 16,
    max_age: 70,
    category: 'education',
    weight: 0.9,
    tags: ['cooking', 'hobby'],
    options: [
      { id: 'koch1', label: 'Teilnehmen', effects: { moneyDelta: -100, healthDelta: 5, iqDelta: 2 }, resultText: 'Du lernst gesund zu kochen!' },
      { id: 'koch2', label: 'Selber lernen', effects: { healthDelta: 2, iqDelta: 1 }, resultText: 'YouTube Tutorials!' },
    ],
  },
];

// Check if events are already seeded
export const checkIfSeeded = async (): Promise<boolean> => {
  const { count, error } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error('Error checking seed status:', error);
    return false;
  }
  
  return (count || 0) >= 40; // If we have 40+ events, assume seeded
};

// Seed all events to database
export const seedEventsToDatabase = async (): Promise<{ success: boolean; count: number; error?: string }> => {
  try {
    // Check if already seeded
    const alreadySeeded = await checkIfSeeded();
    if (alreadySeeded) {
      return { success: true, count: 0 };
    }

    const eventsToInsert = allSeedEvents.map(event => ({
      title: event.title,
      text: event.text,
      min_age: event.min_age,
      max_age: event.max_age,
      category: event.category,
      weight: event.weight,
      tags: event.tags,
      options: event.options,
      is_active: true,
    }));

    const { data, error } = await supabase
      .from('events')
      .insert(eventsToInsert)
      .select();

    if (error) {
      console.error('Error seeding events:', error);
      return { success: false, count: 0, error: error.message };
    }

    return { success: true, count: data?.length || 0 };
  } catch (err) {
    console.error('Seeding error:', err);
    return { success: false, count: 0, error: String(err) };
  }
};
