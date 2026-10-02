/* Komponenty: nagłówek, stopka, karty publikacji. */
(function (ui) {
  const I = KBR.icon, C = KBR.content, esc = ui.esc;

  /* ------------------------------------------------------------ Nagłówek */
  ui.header = function (route) {
    const user = KBR.auth.currentUser();
    const sub = user && KBR.subscription.isActive(user);
    const path = route ? route.path : '';
    const cur = function (p) { return path === p || path.indexOf(p + '/') === 0 ? ' aria-current="page"' : ''; };
    const topics = KBR.data.topics.map(function (t) { return '<li><a href="#/tematy/' + t.slug + '"' + cur('/tematy/' + t.slug) + '>' + esc(t.name) + '</a></li>'; }).join('');

    const account = user
      ? '<a class="hdr-link" href="#/konto/biblioteka">' + I('bookmark', 18) + '<span>Moja biblioteka</span></a>' +
        '<div class="menu"><button type="button" class="hdr-link" data-action="menu" aria-expanded="false" aria-controls="account-menu" aria-haspopup="true">' + I('userPlain', 20) +
        '<span>Moje konto</span>' + (sub ? '<span class="hdr-premium">Premium</span>' : '') + '<span class="chev">' + I('chevDown', 14) + '</span></button>' +
        '<div class="menu__panel" id="account-menu" hidden>' +
        '<div class="menu__head"><strong>' + esc(user.firstName || 'Czytelnik') + '</strong>' + esc(user.email) + '<br>' + (sub ? 'Subskrypcja aktywna' : 'Konto bez subskrypcji') + '</div>' +
        '<a href="#/konto/biblioteka">' + I('bookmark', 18) + 'Moja biblioteka</a>' +
        '<a href="#/konto/subskrypcja">' + I('card', 18) + 'Moja subskrypcja</a>' +
        '<a href="#/konto/dane">' + I('userPlain', 18) + 'Moje dane</a>' +
        '<a href="#/konto/platnosci">' + I('mail', 18) + 'Płatności i faktury</a>' +
        '<a href="#/konto/preferencje">' + I('info', 18) + 'Newslettery i preferencje</a>' +
        '<hr><button type="button" data-action="logout">' + I('logout', 18) + 'Wyloguj się</button></div></div>'
      : '<a class="hdr-link" href="#/logowanie" data-action="auth-link">' + I('user', 20) + '<span>Zaloguj się</span></a>';

    const subscribeBtn = sub ? '' : '<a class="btn btn--primary" href="#/subskrypcja"><span class="btn-long">Subskrybuj</span><span class="btn-short">Subskr.</span>' + I('chevRight', 16, 'stroke-width="2.25"') + '</a>';

    return '' +
      (KBR.storage.get('topbarClosed', false, 'session') ? '' : '<div class="topbar"><div class="container topbar__inner"><a href="#/magazyn"><span class="topbar__dot"></span><span class="topbar__strong">Nowe wydanie magazynu już dostępne</span><span class="topbar__divider"></span><span class="topbar__text">Technologie, AI i nowe spojrzenie na przywództwo. Odkryj tematy najnowszego numeru</span></a>' +
        '<button type="button" class="topbar__close" data-action="close-topbar" aria-label="Zamknij pasek informacyjny">' + I('close', 16, 'stroke-width="2"') + '</button></div></div>') +
      '<div class="container masthead">' +
        '<a class="logo" href="#/" aria-label="Kozminski Business Review – strona główna"><img class="logo__mark" src="assets/img/kbr-mark.png" alt="" width="85" height="74"><span class="logo__word" aria-hidden="true"><span>Kozminski</span><span>Business</span><span>Review</span></span></a>' +
        ui.searchForm('q-desktop') +
        '<div class="masthead__actions">' +
          '<div class="menu menu--lang"><button type="button" class="hdr-link" data-action="menu" aria-expanded="false" aria-controls="lang-menu" aria-haspopup="true"><span class="visually-hidden">Język: </span>' + I('globe', 20) + '<span>PL</span><span class="chev">' + I('chevDown', 14) + '</span></button>' +
            '<div class="menu__panel" id="lang-menu" hidden><span class="menu__static" aria-current="true" style="color:var(--c-navy);font-weight:700">' + I('check', 16) + 'Polski</span><span class="menu__static">English – wersja niedostępna w prototypie</span></div></div>' +
          account + subscribeBtn +
          '<button type="button" class="icon-btn" data-action="toggle-search" aria-expanded="false" aria-controls="mobile-search"><span class="visually-hidden">Szukaj</span>' + I('search', 22) + '</button>' +
          '<button type="button" class="icon-btn" data-action="toggle-drawer" aria-expanded="false" aria-controls="mobile-drawer"><span class="visually-hidden">Menu</span>' + I('menu', 24) + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="container mobile-search" id="mobile-search">' + ui.searchForm('q-mobile') + '</div>' +
      '<nav class="mainnav" aria-label="Menu główne"><div class="container"><ul class="mainnav__list">' +
        '<li><a class="mainnav__link" href="#/artykuly"' + cur('/artykuly') + '>Artykuły</a></li>' +
        '<li><a class="mainnav__link" href="#/magazyn"' + cur('/magazyn') + '>Magazyn</a></li>' +
        '<li class="menu mainnav__split"><a class="mainnav__link" href="#/tematy"' + (path.indexOf('/tematy') === 0 ? ' aria-current="page"' : '') + '>Tematy</a><button type="button" class="mainnav__link mainnav__chev" data-action="menu" aria-expanded="false" aria-controls="topics-menu" aria-haspopup="true" aria-label="Rozwiń listę tematów">' + I('chevDown', 16) + '</button>' +
          '<ul class="menu__panel" id="topics-menu" hidden style="min-width:340px">' + topics + '</ul></li>' +
        '<li><a class="mainnav__link" href="#/podcasty"' + cur('/podcasty') + '>Podcasty</a></li>' +
        '<li><a class="mainnav__link" href="#/studia-przypadkow"' + cur('/studia-przypadkow') + '>Studia przypadków</a></li>' +
        '<li><a class="mainnav__link" href="#/wydarzenia"' + cur('/wydarzenia') + '>Wydarzenia</a></li>' +
      '</ul></div></nav>' +
      '<nav class="mobile-drawer" id="mobile-drawer" aria-label="Menu główne (mobilne)"><div class="container"><ul class="mobile-drawer__list">' +
        '<li><a href="#/artykuly">Artykuły' + I('chevRight', 18) + '</a></li>' +
        '<li><a href="#/magazyn">Magazyn' + I('chevRight', 18) + '</a></li>' +
        '<li><button type="button" class="drawer-toggle" data-action="drawer-sub" aria-expanded="false" aria-controls="drawer-topics">Tematy' + I('chevDown', 18) + '</button><ul class="mobile-drawer__sub" id="drawer-topics" hidden>' + topics + '</ul></li>' +
        '<li><a href="#/podcasty">Podcasty' + I('chevRight', 18) + '</a></li>' +
        '<li><a href="#/studia-przypadkow">Studia przypadków' + I('chevRight', 18) + '</a></li>' +
        '<li><a href="#/wydarzenia">Wydarzenia' + I('chevRight', 18) + '</a></li>' +
      '</ul><div class="mobile-drawer__account">' +
        (user
          ? '<a class="btn btn--outline" href="#/konto/biblioteka">' + I('bookmark', 18) + 'Moja biblioteka</a><a class="btn btn--outline" href="#/konto/subskrypcja">' + I('card', 18) + 'Moja subskrypcja</a><button type="button" class="btn btn--ghost" data-action="logout">' + I('logout', 18) + 'Wyloguj się</button>'
          : '<a class="btn btn--outline" href="#/logowanie" data-action="auth-link">' + I('userPlain', 18) + 'Zaloguj się</a><a class="btn btn--ghost" href="#/rejestracja" data-action="auth-link">Załóż bezpłatne konto</a>') +
      '</div></div></nav>';
  };

  ui.searchForm = function (id, value) {
    const names = { 'q-desktop': 'Wyszukiwarka serwisu', 'q-mobile': 'Wyszukiwarka serwisu (mobilna)', 'q-page': 'Wyszukiwarka na stronie wyników' };
    return '<form class="search" role="search" aria-label="' + (names[id] || 'Wyszukiwarka') + '" data-form="search" action="#/wyszukiwanie"><label class="visually-hidden" for="' + id + '">Szukaj artykułów i tematów</label>' +
      '<span class="search__icon">' + I('search', 18) + '</span><input id="' + id + '" name="q" type="search" placeholder="Szukaj materiałów, osób, wydarzeń" autocomplete="off" value="' + esc(value || '') + '"></form>';
  };

  /* ------------------------------------------------------------ Stopka */
  ui.footer = function () {
    const socials = [['facebook', 'Facebook'], ['linkedin', 'LinkedIn'], ['x', 'X (Twitter)'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['flickr', 'Flickr']];
    return '<footer class="site-footer" aria-labelledby="footer-title"><h2 id="footer-title" class="visually-hidden">Stopka serwisu</h2><div class="container"><div class="footer-grid">' +
      '<div class="footer-brand">' +
        '<a class="logo" href="#/" aria-label="Kozminski Business Review – strona główna"><img class="logo__mark" src="assets/img/kbr-mark-light.png" alt="" width="85" height="74"><span class="logo__word" aria-hidden="true"><span>Kozminski</span><span>Business</span><span>Review</span></span></a>' +
        '<p>Polska platforma wiedzy biznesowej dla menedżerów, liderek i liderów, wydawana przez Akademię Leona Koźmińskiego.</p>' +
        '<ul class="socials" aria-label="Kanały społecznościowe">' + socials.map(function (s) { return '<li><a href="#/strona/kanaly" aria-label="' + s[1] + ' (adres do uzupełnienia)"><img src="assets/img/social-' + s[0] + '.png" alt=""></a></li>'; }).join('') + '</ul>' +
        '<div class="footer-cols">' +
          '<div><h2>O KBR</h2><ul><li><a href="#/strona/o-kbr">Misja i wizja</a></li><li><a href="#/strona/redakcja">Redakcja i rada programowa</a></li><li><a href="#/autorzy">Autorzy i eksperci</a></li><li><a href="#/strona/dla-autorow">Dla autorów</a></li><li><a href="#/strona/reklama">Reklama i partnerstwa</a></li><li><a href="#/strona/kontakt">Kontakt</a></li></ul></div>' +
          '<div><h2>Koźmiński</h2><ul>' +
            ['O uczelni', 'Studia i szkolenia', 'Nauka i badania', 'Dla biznesu'].map(function (t) { return '<li><a href="https://www.kozminski.edu.pl/pl" target="_blank" rel="noopener">' + t + '<span class="visually-hidden"> (serwis uczelni, otwiera się w nowej karcie)</span></a></li>'; }).join('') +
          '</ul></div>' +
          '<div><h2>Dostęp</h2><ul><li><a href="#/subskrypcja">Subskrypcja</a></li><li><a href="#/dostep/firmy">Dostęp dla firm</a></li><li><a href="#/dostep/akademicki">Dostęp akademicki</a></li></ul></div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-news">' + ui.newsletterForm('footer') + '</div>' +
      '</div>' +
      '<div class="footer-bottom"><ul>' +
        '<li><a href="#/strona/nota-prawna">Nota prawna</a></li><li><a href="#/strona/polityka-prywatnosci">Polityka prywatności (RODO)</a></li><li><a href="#/strona/regulamin-serwisu">Regulamin serwisu</a></li><li><a href="#/strona/regulamin-subskrypcji">Regulamin subskrypcji</a></li><li><a href="#/strona/informacje-wydawnicze">Informacje wydawnicze</a></li><li><button type="button" data-action="cookies">Ustawienia cookies</button></li>' +
      '</ul><p>© 2026 Akademia Leona Koźmińskiego · ISSN: [do uzupełnienia]</p></div>' +
      '</div></footer>';
  };

  ui.meterDots = function (used, limit, large) {
    if (limit > 10) return '';
    let h = '<span class="meter-dots' + (large ? ' meter-dots--lg' : '') + '" aria-hidden="true">';
    for (let i = 0; i < limit; i++) h += '<i' + (i < used ? ' class="is-used"' : '') + '></i>';
    return h + '</span>';
  };

  /* Newsletter – wariant w kolumnie strony głównej i w stopce */
  ui.newsletterForm = function (variant) {
    const id = 'nl-' + variant;
    if (variant === 'footer') {
      return '<form data-form="newsletter" novalidate aria-labelledby="' + id + '-title"><h2 class="label" id="' + id + '-title">Newsletter KBR</h2>' +
        '<p>Raz w tygodniu najnowsze artykuły, studia przypadków i podcasty Kozminski Business Review – wybór redakcji prosto na Twoją skrzynkę.</p>' +
        '<label class="check check--small" for="' + id + '-consent"><input type="checkbox" id="' + id + '-consent" name="consent"><span>Wyrażam zgodę na otrzymywanie za pośrednictwem poczty e-mail newslettera Kozminski Business Review. Administratorem Pani/Pana danych osobowych jest Akademia Leona Koźmińskiego. <a href="#/strona/polityka-prywatnosci">Szczegółowe informacje na temat przetwarzania Pani/Pana danych osobowych.</a> (wymagane)</span></label>' +
        '<div class="nl-row" data-error-anchor><label class="visually-hidden" for="' + id + '-email">Adres e-mail</label><input class="input input--dark" type="email" id="' + id + '-email" name="email" placeholder="Adres e-mail" autocomplete="email"><button class="btn btn--primary" type="submit">Zapisz się' + I('chevRight', 16, 'stroke-width="2" style="color:#e9aab9"') + '</button></div>' +
        '<div class="nl-status" role="status"></div></form>';
    }
    return '<form class="nl-box" data-form="newsletter" novalidate aria-labelledby="' + id + '-title"><h2 class="t-label" id="' + id + '-title">Newsletter KBR</h2>' +
      '<p>Wydarzenia, badania i nowe artykuły - dołącz do grona osób, które jako pierwsze otrzymują informacje prosto na swoją skrzynkę.</p>' +
      '<label class="check" for="' + id + '-consent"><input type="checkbox" id="' + id + '-consent" name="consent"><span>Wyrażam zgodę na otrzymywanie za pośrednictwem poczty e-mail powiadomień i informacji handlowych. Administratorem Pani/Pana danych osobowych jest Akademia Leona Koźmińskiego. <a href="#/strona/polityka-prywatnosci">Szczegółowe informacje na temat przetwarzania Pani/Pana danych osobowych.</a> (wymagane)</span></label>' +
      '<label class="visually-hidden" for="' + id + '-email">Adres e-mail</label><input class="input" type="email" id="' + id + '-email" name="email" placeholder="Adres e-mail" autocomplete="email">' +
      '<button class="btn btn--primary" type="submit">Zapisz się' + I('chevRight', 16, 'stroke-width="2" style="color:#e9aab9"') + '</button>' +
      '<div class="nl-status" role="status"></div></form>';
  };

  /* ------------------------------------------------------------ Karty */
  ui.topicLabel = function (m, tag) {
    const t = C.topic(m.topic);
    return '<a class="t-label card__cat" href="#/tematy/' + t.slug + '">' + esc(t.name) + '</a>';
  };
  ui.promo = function () {
    const I = KBR.icon;
    return '<div class="promo"><span class="promo__label">Reklama</span>' +
      '<img class="promo__img" src="assets/img/baner-executive.jpg" alt="Budynek Akademii Leona Koźmińskiego z rzeźbą lwa i logo Koźmiński University">' +
      '<div class="promo__body"><h2>Rozwijaj kompetencje, które zmieniają biznes</h2><p>Programy rozwojowe, studia podyplomowe i executive oparte na badaniach i doświadczeniu.</p><span class="promo__rule"></span>' +
      '<a class="btn btn--primary" href="#/executive-education">Poznaj programy i szkolenia' + I('chevRight', 16, 'stroke-width="2"') + '</a></div>' +
      '<span class="promo__adchoice" aria-hidden="true"><svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 1.5v7l6-3.5z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg><svg width="4" height="10" viewBox="0 0 4 10"><circle cx="2" cy="2" r="1" fill="currentColor"/><circle cx="2" cy="5" r="1" fill="currentColor"/><circle cx="2" cy="8" r="1" fill="currentColor"/></svg></span>' +
    '</div>';
  };
  ui.metaLine = function (m) { return esc(ui.authorLine(m)) + ' · <time datetime="' + m.date + '">' + ui.dateShort(m.date) + '</time>'; };
  ui.plMat = function (n) { const r = n % 10, r100 = n % 100; return n + ' ' + (n === 1 ? 'materiał' : (r >= 2 && r <= 4 && (r100 < 12 || r100 > 14)) ? 'materiały' : 'materiałów'); };
  ui.lockIcon = function (m, size) {
    if (m.access !== 'premium') return '';
    const open = KBR.subscription.has('premium');
    return '<span title="' + (open ? 'Masz dostęp do tego materiału' : 'Materiał Premium') + '">' + I(open ? 'unlock' : 'lock', size || 24) + '</span>';
  };
  ui.savedFlag = function (m) {
    const saved = KBR.auth.currentUser() && KBR.library.isSaved(m.id);
    return '<span class="card__saved" data-saved-flag="' + m.id + '"' + (saved ? '' : ' hidden') + '>' + I('bookmarkFill', 16) + '<span class="visually-hidden">Zapisano w bibliotece</span></span>';
  };
  ui.media = function (m, opts) {
    opts = opts || {};
    const badges = [];
    const lockInBadge = m.access === 'premium' && opts.premiumBadge !== false;
    if (lockInBadge) badges.push('<span class="badge badge--premium">' + (opts.lock === false ? '' : ui.lockIcon(m, 14)) + 'Premium</span>');
    if (opts.formatBadge) badges.push('<span class="badge badge--navy">' + (m.format === 'podcast' || m.format === 'video' ? I('play', 12) : '') + esc(opts.formatBadge) + '</span>');
    const img = opts.image || m.image;
    return '<a class="card__media" href="' + ui.materialUrl(m) + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + ui.img(img) + '" alt="" loading="lazy"' + (m.imagePos && !opts.image ? ' style="object-position:' + m.imagePos + '"' : '') + '>' +
      (opts.logo ? '<img class="case-logo" src="assets/img/case-logo-' + opts.logo + '.png" alt="" style="' + ui.caseLogoPos[opts.logo] + '">' : '') +
      (badges.length ? '<span class="card__badges">' + badges.join('') + '</span>' : '') +
      '<span class="card__corner">' + ui.savedFlag(m) + (opts.lock === false || lockInBadge ? '' : ui.lockIcon(m)) + '</span>' +
      (opts.play ? '<span class="play-dot">' + I('play', 26) + '</span>' : '') +
      '</a>';
  };
  /* Pozycje logotypów na kartach „Studia przypadków” (jak w projekcie) */
  ui.caseLogoPos = {
    1: 'left:3.3%;top:20.6%;width:36.2%;height:auto',
    2: 'left:4.6%;top:20.6%;width:17.1%;height:auto',
    3: 'left:2.6%;top:35.3%;width:54.6%;height:auto',
    4: 'left:2.6%;top:20.6%;width:16.4%;height:auto'
  };

  ui.titleLink = function (m, cls, tag) {
    tag = tag || 'h3';
    return '<' + tag + ' class="card__title"><a class="t-title-card ' + (cls || '') + ' hover-title" href="' + ui.materialUrl(m) + '">' + esc(m.title) + (m.access === 'premium' ? '<span class="visually-hidden"> (Premium)</span>' : '') + '</a></' + tag + '>';
  };

  /* Standardowa karta (Dla subskrybentów, powiązane, listy siatkowe) */
  ui.card = function (m, opts) {
    opts = opts || {};
    return '<article class="card">' +
      (opts.noImage ? '' : ui.media(m, opts)) +
      ui.topicLabel(m) +
      ui.titleLink(m, '', opts.tag) +
      (opts.lead ? '<p class="t-body card__lead">' + esc(m.lead) + '</p>' : '') +
      '<p class="t-meta card__author">' + ui.metaLine(m) + '</p>' +
      (opts.save ? '<div class="card__actions">' + ui.saveButton(m, { compact: true }) + '</div>' : '') +
      '</article>';
  };

  /* Wiersz listy: obraz z lewej, treść z prawej (zgodnie ze specyfikacją list) */
  ui.row = function (m) {
    const f = C.format(m.format), isAV = m.format === 'podcast' || m.format === 'video';
    const showFmt = isAV;
    return '<article class="row-item">' + ui.media(m, { formatBadge: m.format !== 'article' ? f.badge : null }) +
      '<div class="row-item__body">' + (showFmt ? '<p class="card__format row-item__format">' + (isAV ? '<span class="fmt-ico">' + I('play', 12) + '</span>' : '') + '<strong>' + esc(f.name) + '</strong>' + (isAV && m.duration ? '<span>• ' + m.duration + ' min</span>' : '') + '</p>' : '') +
      '<div class="row-item__top">' + ui.topicLabel(m).replace('card__cat', '') + '</div>' +
      '<h2 style="margin:0"><a class="t-title-card hover-title" href="' + ui.materialUrl(m) + '">' + esc(m.title) + (m.access === 'premium' ? '<span class="visually-hidden"> (Premium)</span>' : '') + '</a></h2>' +
      '<p class="t-body">' + esc(m.lead) + '</p>' +
      '<div class="row-item__foot"><p class="t-meta">' + ui.metaLine(m) + (!showFmt && m.duration ? ' · ' + m.duration + ' min' : '') + '</p>' + ui.saveButton(m, { compact: true }) + '</div>' +
      '</div></article>';
  };

  ui.sectionHead = function (title, link, opts) {
    opts = opts || {};
    return '<div class="section-head"><h2 class="t-section" id="' + (opts.id || '') + '">' + title + '</h2>' + (link ? '<a class="t-link" href="' + link.href + '">' + link.label + '' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a>' : '') + '</div>';
  };

  ui.crumbs = function (items) {
    return '<nav class="crumbs" aria-label="Ścieżka nawigacji"><ol>' + items.map(function (it, i) {
      return '<li>' + (it.href && i < items.length - 1 ? '<a href="' + it.href + '">' + esc(it.label) + '</a>' : '<span aria-current="page">' + esc(it.label) + '</span>') + '</li>';
    }).join('') + '</ol></nav>';
  };
})(KBR.ui);
