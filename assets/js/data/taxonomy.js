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

/* Tagi artykułów (dane demonstracyjne). */
KBR.data.tags = {
  'gmina-plan-ogolny': ['Planowanie przestrzenne', 'Samorząd', 'Prawo administracyjne'],
  'wiarygodnosc-po-kryzysie': ['Reputacja', 'Kryzys', 'Media społecznościowe'],
  'project-manager-w-grze': ['Zarządzanie projektami', 'Symulacje', 'Rozwój kompetencji'],
  'scenariusze-zamiast-prognoz': ['Planowanie scenariuszowe', 'Niepewność', 'Zarząd'],
  'portfel-projektow-kiedy-stop': ['Zarządzanie projektami', 'Portfel projektów', 'Decyzje'],
  'controlling-strategiczny': ['Controlling', 'Budżetowanie', 'Średnie firmy'],
  'sukcesja-w-zarzadzie': ['Sukcesja', 'Zarząd', 'Rozwój talentów'],
  'liderzy-czytaja-wiersze': ['Przywództwo', 'Literatura', 'Uważność'],
  'szybki-urzad-dobry-urzad': ['Sektor publiczny', 'Automatyzacja', 'Jakość usług'],
  'cyberodpornosc-kompetencja-zarzadu': ['Cyberbezpieczeństwo', 'Zarząd', 'Kryzys'],
  'wybor-miedzy-slusznym-a-latwym': ['Etyka', 'Ład korporacyjny', 'Decyzje'],
  'ai-zdolnosc-organizacyjna': ['Sztuczna inteligencja', 'Transformacja cyfrowa', 'Rozwój kompetencji'],
  'nowy-kontrakt-lidera': ['Przywództwo', 'Zespoły', 'Kultura organizacyjna'],
  'ryzyko-modeli-rada-nadzorcza': ['Rada nadzorcza', 'Zarządzanie ryzykiem', 'Sztuczna inteligencja'],
  'zarzadzanie-portfelem-inwestycyjnym': ['Inwestycje', 'Płynność finansowa', 'Średnie firmy'],
  'analiza-finansowa-etapy': ['Analiza finansowa', 'Finansowanie dłużne', 'Bankowość'],
  'finansowanie-duzych-inwestycji': ['Finansowanie', 'Inwestycje', 'Infrastruktura']
};

/* Osoby są postaciami demonstracyjnymi – biogramy, funkcje, profile LinkedIn i adresy e-mail nie opisują prawdziwych osób.
   role = jedna linijka „kim jest”, photo = portret w assets/img.
   linkedin i email są OPCJONALNE – link pokazuje się tylko, gdy pole jest uzupełnione. */
KBR.data.authors = [
  { id: 'alk', name: 'Akademia Leona Koźmińskiego', initials: 'ALK', institution: true,
    bio: 'Materiały przygotowane przez zespół redakcyjny i ekspertów Akademii Leona Koźmińskiego.' },
  { id: 'anna-nowak', name: 'Anna Nowak', initials: 'AN', photo: 'portret-04.png', role: 'Analityczka transformacji cyfrowej, Akademia Leona Koźmińskiego',
    bio: 'Autorka analiz o transformacji cyfrowej i organizacji pracy z danymi. Biogram demonstracyjny.' },
  { id: 'piotr-nowak', name: 'Piotr Nowak', initials: 'PN', photo: 'portret-05.png', role: 'Ekspert ładu korporacyjnego, członek rad nadzorczych',
    bio: 'Pisze o ładzie korporacyjnym, zarządzaniu ryzykiem i pracy rad nadzorczych. Biogram demonstracyjny.' },
  { id: 'marta-wisniewska', name: 'dr Marta Wiśniewska', initials: 'MW', photo: 'portret-01.png', role: 'Adiunktka w Katedrze Zarządzania, Akademia Leona Koźmińskiego', linkedin: 'https://www.linkedin.com/in/marta-wisniewska-demo', email: 'marta.wisniewska@kozminski.edu.pl',
    bio: 'Badaczka przywództwa i kultury organizacyjnej, współpracuje z zespołami zarządczymi. Biogram demonstracyjny.' },
  { id: 'tomasz-zielinski', name: 'Tomasz Zieliński', initials: 'TZ', photo: 'portret-03.png', role: 'Doradca strategiczny, partner w firmie doradczej', linkedin: 'https://www.linkedin.com/in/tomasz-zielinski-demo',
    bio: 'Doradca strategiczny, specjalizuje się w planowaniu scenariuszowym i zarządzaniu portfelem projektów. Biogram demonstracyjny.' },
  { id: 'katarzyna-lewandowska', name: 'Katarzyna Lewandowska', initials: 'KL', photo: 'portret-02.png', role: 'Ekspertka cyberbezpieczeństwa i odporności operacyjnej', email: 'katarzyna.lewandowska@kozminski.edu.pl',
    bio: 'Zajmuje się cyberbezpieczeństwem i odpornością operacyjną organizacji. Biogram demonstracyjny.' },
  { id: 'pola-lea', name: 'Pola Amelia Lea', initials: 'PL',
    bio: 'Autorka materiału wideo z cyklu studenckich relacji. Opis demonstracyjny.' }
];
