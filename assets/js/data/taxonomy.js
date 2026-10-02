/* Taksonomia: tematy, formaty, autorzy (dane demonstracyjne). */
KBR.data = KBR.data || {};

KBR.data.topics = [
  { id: 'ai', slug: 'sztuczna-inteligencja', name: 'Sztuczna inteligencja & nowe technologie' },
  { id: 'innowacja', slug: 'zmiana-i-innowacja', name: 'Zmiana i innowacja' },
  { id: 'przywodztwo', slug: 'przywodztwo', name: 'Przywództwo & kapitał ludzki' },
  { id: 'strategia', slug: 'strategia-i-zarzadzanie', name: 'Strategia & zarządzanie' },
  { id: 'finanse', slug: 'finanse-ryzyko-lad', name: 'Finanse, ryzyko & ład korporacyjny' }
];

KBR.data.formats = {
  article: { id: 'article', name: 'Artykuł', plural: 'Artykuły i analizy', route: '#/artykuly' },
  case: { id: 'case', name: 'Studium przypadku', plural: 'Studia przypadków', route: '#/studia-przypadkow', badge: 'Case studies' },
  podcast: { id: 'podcast', name: 'Podcast', plural: 'Podcasty i wideo', route: '#/podcasty', badge: 'Podcast' },
  video: { id: 'video', name: 'Wideo', plural: 'Podcasty i wideo', route: '#/podcasty', badge: 'Wideo' }
};

/* Osoby są postaciami demonstracyjnymi – biogramy nie opisują prawdziwych osób. */
KBR.data.authors = [
  { id: 'alk', name: 'Akademia Leona Koźmińskiego', initials: 'ALK', institution: true,
    bio: 'Materiały przygotowane przez zespół redakcyjny i ekspertów Akademii Leona Koźmińskiego.' },
  { id: 'anna-nowak', name: 'Anna Nowak', initials: 'AN',
    bio: 'Autorka analiz o transformacji cyfrowej i organizacji pracy z danymi. Biogram demonstracyjny.' },
  { id: 'piotr-nowak', name: 'Piotr Nowak', initials: 'PN',
    bio: 'Pisze o ładzie korporacyjnym, zarządzaniu ryzykiem i pracy rad nadzorczych. Biogram demonstracyjny.' },
  { id: 'marta-wisniewska', name: 'dr Marta Wiśniewska', initials: 'MW',
    bio: 'Badaczka przywództwa i kultury organizacyjnej, współpracuje z zespołami zarządczymi. Biogram demonstracyjny.' },
  { id: 'tomasz-zielinski', name: 'Tomasz Zieliński', initials: 'TZ',
    bio: 'Doradca strategiczny, specjalizuje się w planowaniu scenariuszowym i zarządzaniu portfelem projektów. Biogram demonstracyjny.' },
  { id: 'katarzyna-lewandowska', name: 'Katarzyna Lewandowska', initials: 'KL',
    bio: 'Zajmuje się cyberbezpieczeństwem i odpornością operacyjną organizacji. Biogram demonstracyjny.' },
  { id: 'pola-lea', name: 'Pola Amelia Lea', initials: 'PL',
    bio: 'Autorka materiału wideo z cyklu studenckich relacji. Opis demonstracyjny.' }
];
