// Auto-events: events that just happen, single "Weiter" option, no choices.
import { GameEvent, EventOption } from '@/types/game';

const id = () => Math.random().toString(36).substring(2, 12);

const continueOpt = (
  resultText: string,
  effects: EventOption['effects'] = {}
): EventOption => ({
  id: id(),
  label: 'Weiter',
  effects,
  resultText,
});

// Random sibling/baby names for narrative substitution
const babyNames = ['Lena', 'Max', 'Mia', 'Ben', 'Lara', 'Noah', 'Emma', 'Finn', 'Hanna', 'Leon', 'Sophie', 'Tim'];
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const newSibling = (): GameEvent => {
  const name = pick(babyNames);
  return {
    id: id(),
    title: 'Neues Geschwisterchen!',
    text: `Deine Eltern haben überraschend ein neues Baby bekommen. Das Kind heißt ${name}.`,
    minAge: 4, maxAge: 14,
    category: 'auto',
    weight: 0.3,
    tags: ['family', 'auto', 'sibling'],
    options: [continueOpt(`Du hast jetzt ein neues Geschwisterchen namens ${name}!`)],
  };
};

const auto = (
  title: string, text: string, minAge: number, maxAge: number,
  resultText: string, effects: EventOption['effects'] = {}, weight = 0.5, tags: string[] = []
): GameEvent => ({
  id: id(), title, text, minAge, maxAge,
  category: 'auto', weight,
  tags: ['auto', ...tags],
  options: [continueOpt(resultText, effects)],
});

export const autoEvents: GameEvent[] = [
  newSibling(),
  newSibling(), // Multiple instances → randomized name pool
  newSibling(),
  auto('Erkältung', 'Du hast dich erkältet und musstest eine Woche im Bett bleiben.', 2, 80,
    'Nach einer Woche Bettruhe geht es dir wieder besser.', { healthDelta: -3 }, 0.8, ['health']),
  auto('Wachstumsschub', 'Du wächst plötzlich um mehrere Zentimeter!', 6, 16,
    'Deine Klamotten passen alle nicht mehr.', { healthDelta: 2 }, 0.6, ['growth']),
  auto('Familienfoto', 'Eure Familie hat ein professionelles Familienfoto machen lassen.', 3, 18,
    'Ein schönes Erinnerungsstück hängt jetzt im Wohnzimmer.', { luckDelta: 1 }, 0.4, ['family']),
  auto('Umzug', 'Deine Familie ist in eine neue Wohnung umgezogen.', 0, 17,
    'Neues Zuhause, neue Nachbarschaft – aufregend!', {}, 0.4, ['family']),
  auto('Haustier verstorben', 'Euer Familienhund ist friedlich eingeschlafen.', 5, 25,
    'Du bist sehr traurig, aber er hatte ein schönes Leben.', { healthDelta: -2, luckDelta: -2 }, 0.3, ['family', 'pet']),
  auto('Neues Haustier', 'Deine Eltern haben eine Katze adoptiert.', 4, 16,
    'Die Katze schnurrt schon auf deinem Schoß.', { luckDelta: 2 }, 0.4, ['family', 'pet']),
  auto('Großeltern-Besuch', 'Deine Großeltern waren zu Besuch.', 3, 30,
    'Du hast viele schöne Geschichten gehört und Süßigkeiten bekommen.', { luckDelta: 1 }, 0.5, ['family']),
  auto('Schulausflug', 'Deine Klasse war auf einem Tagesausflug ins Museum.', 7, 16,
    'Du hast viel Neues gelernt.', { iqDelta: 2 }, 0.5, ['school']),
  auto('Schneetag', 'Es hat so stark geschneit, dass die Schule ausfiel!', 6, 16,
    'Ein freier Tag – endlich Schlitten fahren!', { luckDelta: 2 }, 0.3, ['school', 'weather']),
  auto('Sommerferien', 'Die Sommerferien haben begonnen!', 6, 18,
    'Sechs Wochen frei – herrlich.', { healthDelta: 1, luckDelta: 1 }, 0.6, ['school']),
  auto('Klassenfoto', 'Heute war Klassenfoto-Tag.', 6, 18,
    'Deine Frisur sitzt perfekt.', {}, 0.3, ['school']),
  auto('Zahn verloren', 'Dir ist ein Milchzahn ausgefallen.', 5, 11,
    'Die Zahnfee hat 2€ unter dein Kissen gelegt.', { moneyDelta: 2 }, 0.5, ['milestone']),
  auto('Geburtstagsparty', 'Du hattest eine kleine Geburtstagsparty mit Freunden.', 4, 18,
    'Es war ein toller Tag.', { luckDelta: 2 }, 0.5, ['social']),
  auto('Erste Liebe (Schwarm)', 'Du hast einen heimlichen Schwarm in der Schule.', 11, 16,
    'Schmetterlinge im Bauch!', { looksDelta: 1, luckDelta: 1 }, 0.5, ['romance']),
  auto('Inflation', 'Die Inflation hat dieses Jahr deutlich angezogen.', 18, 99,
    'Dein Geld ist etwas weniger wert geworden.', { moneyDelta: -50 }, 0.4, ['economy']),
  auto('Steuererklärung', 'Du hast deine Steuererklärung gemacht und etwas zurückbekommen.', 18, 70,
    'Eine kleine Rückzahlung vom Finanzamt.', { moneyDelta: 200 }, 0.4, ['financial']),
  auto('Gefundenes Geld', 'Du hast einen Geldschein auf der Straße gefunden.', 8, 99,
    'Glücklicher Zufall!', { moneyDelta: 20, luckDelta: 1 }, 0.4, ['random']),
  auto('Verschlafen', 'Du hast verschlafen und kamst zu spät.', 6, 70,
    'Ein peinlicher Morgen.', {}, 0.4, ['random']),
  auto('Schöner Sonnenuntergang', 'Du hast einen wunderschönen Sonnenuntergang gesehen.', 0, 99,
    'Manchmal sind es die kleinen Dinge.', { luckDelta: 1 }, 0.3, ['random']),
  auto('Spinne im Bad', 'Du hast eine riesige Spinne im Bad entdeckt!', 4, 99,
    'Du hast überlebt – knapp.', {}, 0.3, ['random']),
  auto('Stromausfall', 'Es gab einen Stromausfall im ganzen Viertel.', 6, 99,
    'Ein Abend bei Kerzenlicht.', {}, 0.3, ['random']),
  auto('Lieblingsband Konzert', 'Deine Lieblingsband hat ein Album veröffentlicht.', 12, 60,
    'Du hörst es in Dauerschleife.', { luckDelta: 2 }, 0.3, ['social']),
  auto('Erkältungswelle', 'Eine Erkältungswelle ging durch deine Schule/Arbeit.', 6, 70,
    'Du bist verschont geblieben.', { healthDelta: 1 }, 0.3, ['health']),
  auto('Weisheitszahn raus', 'Dir wurden die Weisheitszähne gezogen.', 17, 25,
    'Geschwollene Backen für eine Woche.', { healthDelta: -3, moneyDelta: -100 }, 0.3, ['health']),
  auto('Graue Haare', 'Du hast die ersten grauen Haare entdeckt.', 28, 50,
    'Das Älterwerden geht weiter.', { looksDelta: -1 }, 0.4, ['aging']),
  auto('Rückenschmerzen', 'Du hattest Rückenschmerzen.', 30, 90,
    'Wahrscheinlich die schlechte Haltung.', { healthDelta: -2 }, 0.4, ['aging']),
  auto('Brille gebraucht', 'Du brauchst plötzlich eine Brille.', 35, 60,
    'Ab jetzt siehst du wieder klar.', { moneyDelta: -150, looksDelta: -1 }, 0.3, ['aging']),
];
