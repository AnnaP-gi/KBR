/* Strona główna – odwzorowanie projektu KBR_Home.pdf */
KBR.pages = KBR.pages || {};
KBR.pages.home = function () {
  const ui = KBR.ui, C = KBR.content, H = KBR.data.home, I = KBR.icon, esc = ui.esc;
  const get = function (id) { return C.get(id); };
  const lead = get(H.lead);
  const subscribed = KBR.subscription.has('premium');

  const picks = H.picks.map(get);
  const pickFirst = '<article class="card">' + ui.media(picks[0]) + ui.topicLabel(picks[0]) +
    ui.titleLink(picks[0]) + '<p class="t-body card__lead">' + esc(picks[0].lead) + '</p><p class="t-meta card__author">' + ui.metaLine(picks[0]) + '</p></article>';
  const pickRest = picks.slice(1).map(function (m) { return ui.card(m, { noImage: true, date: false }); }).join('');
  const latest = H.latest.map(get).map(function (m) { return ui.card(m, { noImage: true, date: false }); }).join('');

  const premium = H.premium.map(get).map(function (m) { return ui.card(m, {}); }).join('');

  const issue = C.currentIssue();
  const toc = issue.toc.map(get);
  const tocHtml = toc.map(function (m, i) {
    return '<a class="toc-item" href="' + ui.materialUrl(m) + '" data-issue-item="' + m.id + '" data-active="' + (i === 0) + '">' +
      '<span class="toc-item__arrow">' + I('chevLeft', 22, 'stroke-width="2"') + '</span>' +
      '<span class="t-label">' + esc(C.topic(m.topic).name) + '</span><span class="t-title-card">' + esc(m.title) + (m.access === 'premium' ? '<span class="visually-hidden"> (Premium)</span>' : '') + '</span>' +
      '<span class="t-meta">' + esc(m.authors.filter(function (a) { return a.role === 'autor'; }).map(function (a) { return C.author(a.id).name; }).join(', ')) + '</span></a>';
  }).join('');

  const cases = H.cases.map(get).map(function (m) {
    return '<article class="card case-card">' + ui.media(m, { image: 'case-tlo.jpg', logo: m.caseLogo, formatBadge: 'Case studies', lock: false }) + ui.topicLabel(m) +
      ui.titleLink(m, 't-title-card--loose') + '<p class="t-meta card__author">' + esc(m.authors.filter(function (a) { return a.role === 'autor'; }).map(function (a) { return C.author(a.id).name; }).join(', ')) + '</p></article>';
  }).join('');

  const platforms = function (m) {
    return '<ul class="platforms" aria-label="Słuchaj i oglądaj w serwisach zewnętrznych">' +
      [['spotify', 'Spotify', 'https://open.spotify.com'], ['youtube', 'YouTube', 'https://www.youtube.com'], ['apple-podcasts', 'Apple Podcasts', 'https://podcasts.apple.com']].map(function (p) {
        return '<li><a href="' + p[2] + '" target="_blank" rel="noopener" aria-label="' + p[1] + ' – ' + esc(m.title) + ' (serwis zewnętrzny, adres odcinka do uzupełnienia)"><img src="assets/img/ikona-' + p[0] + '.png" alt=""></a></li>';
      }).join('') + '</ul>';
  };
  const media = H.media.map(get).map(function (m) {
    const f = C.format(m.format);
    return '<article class="card card--overlay card--media">' + ui.media(m, { formatBadge: m.format === 'podcast' ? f.badge : null, play: true, lock: false }) +
      '<p class="card__format"><span class="fmt-ico">' + I('play', 12) + '</span><strong>' + esc(f.name) + '</strong><span>• ' + m.duration + ' min</span></p>' +
      ui.topicLabel(m) + ui.titleLink(m, 't-title-card--loose') + '<p class="t-meta card__author">' + ui.metaLine(m) + '</p>' + platforms(m) + '</article>';
  }).join('');

  const events = KBR.data.events.map(function (e) {
    return '<article class="card event-card"><a class="card__media" href="#/wydarzenie/' + e.id + '" tabindex="-1" aria-hidden="true"><img src="' + ui.img(e.image) + '" alt="" loading="lazy"></a>' +
      '<span class="t-label card__cat">' + esc(e.category) + '</span>' +
      '<h3 class="card__title"><a class="t-title-card t-title-card--loose hover-title" href="#/wydarzenie/' + e.id + '">' + esc(e.title) + '</a></h3>' +
      '<div class="card__eventmeta"><div>' + I('calendar', 24) + '<span><span class="visually-hidden">Termin: </span>' + esc(e.date) + '</span></div><div>' + I('pin', 24) + '<span><span class="visually-hidden">Miejsce: </span>' + esc(e.place) + '</span></div></div>' +
      '<a class="btn btn--tint" href="#/wydarzenie/' + e.id + '" aria-label="Zapisz się: ' + esc(e.title) + '">Zapisz się' + I('chevRight', 16, 'stroke-width="2"') + '</a></article>';
  }).join('');

  const html = '' +
    '<h1 class="visually-hidden">Kozminski Business Review – strona główna</h1>' +
    '<div class="container"><div class="home-hero">' +
      '<article class="lead-story">' + ui.media(lead) +
        '<div class="lead-story__meta">' + ui.topicLabel(lead).replace('card__cat', '') + '</div>' +
        '<h2><a class="t-title-xl hover-title" href="' + ui.materialUrl(lead) + '">' + esc(lead.title) + '</a></h2>' +
        '<p class="t-lead">' + esc(lead.lead) + '</p><p class="t-meta">' + ui.metaLine(lead) + '</p>' +
      '</article>' +
      '<section class="picks" aria-labelledby="h-picks"><h2 class="t-section col-head" id="h-picks">Wybrane dla Ciebie</h2>' + pickFirst + pickRest + '</section>' +
      '<section class="latest" aria-labelledby="h-latest"><h2 class="t-section col-head" id="h-latest">Najnowsze</h2>' + latest + ui.newsletterForm('home') + '</section>' +
    '</div></div>' +

    '<section class="container home-section home-premium" aria-labelledby="h-premium">' + ui.sectionHead('Dla subskrybentów', { href: '#/artykuly?dostep=premium', label: 'Więcej treści premium' }, { id: 'h-premium' }) +
      '<div class="grid-4">' + premium + '</div></section>' +

    '<aside class="container" aria-label="Reklama">' + ui.promo() + '</aside>' +

    '<section class="magazine" aria-labelledby="h-magazine"><div class="container">' +
      '<div class="section-head section-head--strong section-head--icon"><h2 class="t-section" id="h-magazine">' + I('newspaper', 24, 'style="color:var(--c-text)"') + 'Magazyn</h2></div>' +
      '<div class="magazine__grid">' +
        '<div class="magazine__cover"><a href="#/magazyn" aria-label="Aktualny numer: ' + esc(issue.label) + '"><img src="' + ui.img(issue.cover) + '" alt="Okładka magazynu KBR ' + esc(issue.label) + ': ' + esc(issue.title) + '"></a>' +
          '<a class="t-link" href="#/magazyn">Aktualny numer' + I('chevRight', 16, 'stroke-width="2"') + '</a></div>' +
        '<div class="magazine__rule" aria-hidden="true"></div>' +
        '<div class="magazine__feature"><img id="issue-feature" src="' + ui.img(issue.featureImage[toc[0].id]) + '" alt=""></div>' +
        '<div class="magazine__toc"><h3 class="magazine__nr">' + esc(issue.label.toUpperCase()) + '</h3><nav aria-label="Spis treści numeru ' + esc(issue.label) + '">' + tocHtml + '</nav></div>' +
      '</div></div></section>' +

    '<section class="container home-cases" aria-labelledby="h-cases">' + ui.sectionHead('Studia przypadków', { href: '#/studia-przypadkow', label: 'Zobacz wszystkie' }, { id: 'h-cases' }) + '<div class="grid-4">' + cases + '</div></section>' +
    '<section class="container home-podcasts" aria-labelledby="h-pod">' + ui.sectionHead('Podcasty', { href: '#/podcasty', label: 'Zobacz wszystkie' }, { id: 'h-pod' }) + '<div class="grid-4">' + media + '</div></section>' +
    '<section class="container home-events" aria-labelledby="h-events">' + ui.sectionHead('Wydarzenia', { href: '#/wydarzenia', label: 'Zobacz wszystkie' }, { id: 'h-events' }) + '<div class="grid-4">' + events + '</div></section>' +

    '<div class="container cta-wide">' + (KBR.subscription.has('reports')
      ? '<a class="btn btn--primary btn--lg" href="#/artykuly?dostep=premium">Przeglądaj treści premium' + I('chevRight', 24, 'stroke-width="2.25"') + '</a>'
      : subscribed
        ? '<a class="btn btn--primary btn--lg" href="#/subskrypcja">Rozszerz subskrypcję o magazyn i raporty' + I('chevRight', 24, 'stroke-width="2.25"') + '</a>'
        : '<a class="btn btn--primary btn--lg" href="#/subskrypcja">Wybierz subskrypcję i czytaj bez ograniczeń' + I('chevRight', 24, 'stroke-width="2.25"') + '</a>') + '</div>' +

    '<section class="community" aria-labelledby="h-community"><div class="container"><div class="section-head section-head--strong"><h2 class="t-section" id="h-community" style="padding-left:16px">Społeczność &amp; Executive Education</h2></div>' +
      '<div class="community__grid">' +
        '<div class="community-card"><div><h3>Kluby</h3><p>Społeczności praktyków, liderów i absolwentów.</p></div><a class="t-link" href="#/kluby">Poznaj kluby' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div>' +
        '<div class="community-card"><div><h3>Strefa Kozminski Executive Education</h3><p>Programy MBA i podyplomowe</p></div><a class="t-link" href="#/executive-education">Zobacz ofertę' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div>' +
      '</div></div></section>';

  return {
    title: 'Kozminski Business Review',
    html: html,
    mount: function (root) {
      const feature = root.querySelector('#issue-feature');
      root.querySelectorAll('[data-issue-item]').forEach(function (a) {
        const activate = function () {
          root.querySelectorAll('[data-issue-item]').forEach(function (x) { x.dataset.active = String(x === a); });
          feature.src = ui.img(issue.featureImage[a.dataset.issueItem]);
        };
        a.addEventListener('mouseenter', activate); a.addEventListener('focus', activate);
      });
    }
  };
};
