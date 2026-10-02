/* ==========================================================================
   Konfiguracja prototypu – JEDNO miejsce na założenia wymagające zatwierdzenia.
   Wszystkie nazwy, ceny, okresy i uprawnienia planów są DANYMI DEMONSTRACYJNYMI,
   a nie zatwierdzoną ofertą KBR.
   ========================================================================== */
window.KBR = window.KBR || {};

KBR.config = {
  storagePrefix: 'kbr.proto.v1.',

  /* Miękki paywall (licznik darmowych materiałów).
     Docelowy limit, zasady naliczania i dostępność dla niezalogowanych są DO USTALENIA.
     Wartość jest założeniem prototypu i można ją zmienić w panelu „Narzędzia demo”.
     0 = licznik wyłączony (materiały „w ramach limitu” są wtedy otwarte). */
  meter: {
    defaultLimit: 3,
    period: 'miesiąc kalendarzowy',
    appliesTo: 'gość i konto bez subskrypcji'
  },

  currency: 'zł',

  /* Trzy warianty subskrypcji – DANE DEMONSTRACYJNE. */
  plans: [
    {
      id: 'cyfrowy',
      name: 'Cyfrowy',
      description: 'Pełny dostęp do treści Premium w serwisie.',
      prices: { month: 39, year: 390 },
      entitlements: ['premium'],
      features: [
        { text: 'Wszystkie artykuły i analizy Premium', included: true },
        { text: 'Studia przypadków i podcasty Premium', included: true },
        { text: 'Moja biblioteka i historia czytania', included: true },
        { text: 'Cyfrowe wydania magazynu KBR', included: false },
        { text: 'Drukowane wydanie magazynu KBR', included: false },
        { text: 'Raporty i materiały specjalne', included: false }
      ]
    },
    {
      id: 'cyfrowy-magazyn',
      name: 'Cyfrowy + Magazyn',
      description: 'Treści Premium, cyfrowe wydania kwartalnika oraz raporty.',
      prices: { month: 59, year: 590 },
      entitlements: ['premium', 'magazine', 'reports'],
      featured: true,
      features: [
        { text: 'Wszystkie artykuły i analizy Premium', included: true },
        { text: 'Studia przypadków i podcasty Premium', included: true },
        { text: 'Moja biblioteka i historia czytania', included: true },
        { text: 'Cyfrowe wydania magazynu KBR', included: true },
        { text: 'Drukowane wydanie magazynu KBR', included: false },
        { text: 'Raporty i materiały specjalne', included: true }
      ]
    },
    {
      id: 'pelny',
      name: 'Pełny dostęp',
      description: 'Wszystkie treści, raporty i drukowane wydanie magazynu KBR.',
      prices: { month: 89, year: 890 },
      entitlements: ['premium', 'magazine', 'reports'],
      print: true,
      features: [
        { text: 'Wszystkie artykuły i analizy Premium', included: true },
        { text: 'Studia przypadków i podcasty Premium', included: true },
        { text: 'Moja biblioteka i historia czytania', included: true },
        { text: 'Cyfrowe wydania magazynu KBR', included: true },
        { text: 'Drukowane wydanie magazynu KBR', included: true },
        { text: 'Raporty i materiały specjalne', included: true }
      ]
    }
  ],

  /* Wysyłka drukowanego wydania – DANE DEMONSTRACYJNE. */
  printShipping: {
    short: 'Wysyłka drukowanego wydania raz na kwartał – w pierwszym tygodniu marca, czerwca, września i grudnia.',
    details: 'Kwartalnik wysyłamy Pocztą Polską w pierwszym tygodniu miesiąca wydania (marzec, czerwiec, wrzesień, grudzień). Pierwszy egzemplarz otrzymasz z najbliższej wysyłki po opłaceniu zamówienia. Dostawa na terenie Polski trwa 3–5 dni roboczych.',
    next: '1–7 grudnia 2026 (Nr 04 / 2026)'
  },

  periods: {
    month: { label: 'Miesięcznie', unit: 'mies.', months: 1 },
    year: { label: 'Rocznie', unit: 'rok', months: 12 }
  },

  /* Konto demonstracyjne używane przez przełącznik stanów w panelu demo. */
  demoAccount: { firstName: 'Anna', lastName: 'Kowalska', email: 'anna.kowalska@example.com' },

  /* Minimalne wymagania hasła (założenie prototypu). */
  password: { minLength: 8 }
};
