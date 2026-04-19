// Random name pools for character creation, grouped per country/region for plausibility.
type Pool = { first: { male: string[]; female: string[] }; last: string[] };

const POOLS: Record<string, Pool> = {
  DE: {
    first: {
      male: ['Max', 'Leon', 'Paul', 'Felix', 'Lukas', 'Jonas', 'Ben', 'Elias', 'Noah', 'Finn', 'Tim', 'David', 'Niklas', 'Tom', 'Moritz'],
      female: ['Anna', 'Laura', 'Lisa', 'Marie', 'Lena', 'Sophie', 'Julia', 'Sarah', 'Emma', 'Mia', 'Hannah', 'Lea', 'Emily', 'Clara', 'Nina'],
    },
    last: ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf'],
  },
  AT: {
    first: { male: ['Lukas', 'Maximilian', 'Tobias', 'David'], female: ['Anna', 'Sarah', 'Hannah', 'Lena'] },
    last: ['Gruber', 'Huber', 'Bauer', 'Wagner', 'Pichler', 'Steiner', 'Moser', 'Mayer'],
  },
  CH: {
    first: { male: ['Luca', 'Noah', 'Liam', 'Leon'], female: ['Mia', 'Emma', 'Lina', 'Sofia'] },
    last: ['Müller', 'Meier', 'Schmid', 'Keller', 'Weber', 'Huber', 'Schneider'],
  },
  US: {
    first: {
      male: ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Mason', 'Michael', 'Ethan', 'Daniel', 'Jacob', 'Logan'],
      female: ['Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Evelyn', 'Harper', 'Luna', 'Camila', 'Gianna', 'Elizabeth', 'Eleanor'],
    },
    last: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'],
  },
  JP: {
    first: { male: ['Haruto', 'Yuto', 'Sota', 'Yuki', 'Hayato', 'Riku', 'Ren', 'Takumi'], female: ['Yui', 'Hina', 'Sakura', 'Aoi', 'Mio', 'Rin', 'Yuna', 'Akari'] },
    last: ['Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato'],
  },
  BR: {
    first: { male: ['Miguel', 'Arthur', 'Heitor', 'Bernardo', 'Davi', 'Lorenzo', 'Theo', 'Pedro'], female: ['Helena', 'Alice', 'Laura', 'Manuela', 'Valentina', 'Sophia', 'Isabella', 'Heloisa'] },
    last: ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Rodrigues'],
  },
  IT: {
    first: { male: ['Leonardo', 'Francesco', 'Lorenzo', 'Alessandro', 'Andrea', 'Mattia', 'Gabriele'], female: ['Sofia', 'Aurora', 'Giulia', 'Ginevra', 'Alice', 'Emma', 'Greta'] },
    last: ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco'],
  },
  FR: {
    first: { male: ['Gabriel', 'Léo', 'Raphaël', 'Arthur', 'Louis', 'Lucas', 'Adam', 'Jules'], female: ['Emma', 'Jade', 'Louise', 'Alice', 'Chloé', 'Lina', 'Mila', 'Léa'] },
    last: ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Petit', 'Richard', 'Durand', 'Leroy', 'Moreau'],
  },
  ES: {
    first: { male: ['Hugo', 'Martín', 'Lucas', 'Mateo', 'Leo', 'Daniel', 'Alejandro'], female: ['Lucía', 'Sofía', 'Martina', 'María', 'Julia', 'Paula', 'Valeria'] },
    last: ['García', 'Martínez', 'López', 'Sánchez', 'Pérez', 'González', 'Rodríguez', 'Fernández'],
  },
  GB: {
    first: { male: ['Oliver', 'George', 'Harry', 'Noah', 'Jack', 'Leo', 'Charlie'], female: ['Olivia', 'Amelia', 'Isla', 'Ava', 'Mia', 'Lily', 'Sophia'] },
    last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies'],
  },
  KR: {
    first: { male: ['Min-jun', 'Seo-jun', 'Do-yun', 'Ha-jun', 'Si-woo', 'Joon-woo'], female: ['Seo-yeon', 'Ha-yoon', 'Ji-woo', 'Soo-ah', 'Min-seo'] },
    last: ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon'],
  },
  CN: {
    first: { male: ['Wei', 'Jun', 'Hao', 'Lei', 'Yang', 'Bo', 'Tao'], female: ['Mei', 'Lin', 'Hui', 'Yan', 'Xia', 'Jing', 'Ling'] },
    last: ['Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Huang', 'Zhao'],
  },
  IN: {
    first: { male: ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Krishna', 'Ishaan'], female: ['Saanvi', 'Aanya', 'Aadhya', 'Diya', 'Pari', 'Anika', 'Myra'] },
    last: ['Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Reddy', 'Khan'],
  },
  NG: {
    first: { male: ['Chidi', 'Emeka', 'Tunde', 'Obi', 'Kelechi', 'Femi'], female: ['Adaeze', 'Ngozi', 'Chiamaka', 'Funmi', 'Yemi'] },
    last: ['Okafor', 'Adeyemi', 'Eze', 'Okonkwo', 'Balogun', 'Nwosu'],
  },
  ZA: {
    first: { male: ['Sipho', 'Thabo', 'Lwazi', 'Bongani', 'Jaco'], female: ['Naledi', 'Lerato', 'Zanele', 'Thandi', 'Anika'] },
    last: ['Naidoo', 'Botha', 'Van der Merwe', 'Dlamini', 'Mbeki', 'Khumalo'],
  },
  AU: {
    first: { male: ['Oliver', 'Jack', 'Noah', 'William', 'Lucas'], female: ['Charlotte', 'Olivia', 'Amelia', 'Isla', 'Mia'] },
    last: ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Taylor'],
  },
  CA: {
    first: { male: ['Liam', 'Noah', 'Oliver', 'William', 'Benjamin'], female: ['Olivia', 'Charlotte', 'Emma', 'Sophia', 'Ava'] },
    last: ['Smith', 'Brown', 'Tremblay', 'Martin', 'Roy', 'Wilson'],
  },
  MX: {
    first: { male: ['Santiago', 'Mateo', 'Sebastián', 'Diego', 'Leonardo'], female: ['Sofía', 'Valentina', 'Camila', 'Regina', 'Ximena'] },
    last: ['Hernández', 'García', 'Martínez', 'López', 'Rodríguez', 'Ramírez'],
  },
  RU: {
    first: { male: ['Alexander', 'Dmitri', 'Sergey', 'Ivan', 'Mikhail'], female: ['Anastasia', 'Maria', 'Anna', 'Ekaterina', 'Olga'] },
    last: ['Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Volkov'],
  },
  TR: {
    first: { male: ['Yusuf', 'Mehmet', 'Ahmet', 'Mustafa', 'Emir'], female: ['Zeynep', 'Elif', 'Ayşe', 'Fatma', 'Defne'] },
    last: ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız'],
  },
};

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomFirstName = (countryCode: string, gender: 'male' | 'female'): string => {
  const pool = POOLS[countryCode] || POOLS.DE;
  return pick(pool.first[gender]);
};

export const randomLastName = (countryCode: string): string => {
  const pool = POOLS[countryCode] || POOLS.DE;
  return pick(pool.last);
};

export const randomFullName = (countryCode: string, gender: 'male' | 'female'): { first: string; last: string } => {
  return { first: randomFirstName(countryCode, gender), last: randomLastName(countryCode) };
};
