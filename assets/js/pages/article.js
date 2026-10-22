/* Wspólny szablon strony materiału (artykuł, studium przypadku, podcast, wideo).
   Paywall jest STANEM tej strony, a nie osobną podstroną. */
KBR.pages.article = function (route) {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc;
  const m = C.get(route.params.id);
  if (!m) return KBR.pages.notFound();

  const user = KBR.auth.currentUser();
  const access = KBR.access.resolve(m, true);   // nalicza wyświetlenie w limicie

  const t = C.topic(m.topic), f = C.format(m.format);
  const issue = m.issue ? C.issue(m.issue) : null;
  const isMedia = C.isMedia(m);

  /* Treść */
  function block(b) {
    switch (b.t) {
      case 'p': return '<p>' + esc(b.x) + '</p>';
      case 'h2': return '<h2>' + esc(b.x) + '</h2>';
      case 'list': return '<ul>' + b.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
      case 'keypoints': return '<aside class="keypoints" aria-label="' + esc(b.title) + '"><h3>' + esc(b.title) + '</h3><ul>' + b.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></aside>';
      case 'quote': return '<blockquote><p>„' + esc(b.x) + '”</p><footer>' + esc(b.by) + '</footer></blockquote>';
      case 'figure': return '<figure><img src="' + ui.img(b.src) + '" alt="' + esc(b.alt) + '" loading="lazy"><figcaption>' + esc(b.cap) + '</figcaption></figure>';
      case 'steps': return '<figure class="figure-chart"><h3>' + esc(b.title) + '</h3><ol class="steps-figure">' +
        b.items.map(function (x, i) { return '<li><span class="n">' + (i + 1) + '</span><span>' + esc(x) + '</span></li>'; }).join('') + '</ol><figcaption>' + esc(b.cap) + '</figcaption></figure>';
      default: return '';
    }
  }
  const body = m.body || [];
  const previewCount = Math.min(2, body.length);
  const src = access.full ? body : body.slice(0, previewCount);
  const shown = src.map(block);
  if (access.full && src.length > 3) {
    let at = -1;
    const mid = Math.floor(src.length / 2);
    for (let i = 2; i < src.length; i++) {
      if (src[i - 1].t === 'p' && src[i].t === 'p' && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
    }
    if (at < 0) for (let i = 2; i < src.length; i++) { if (src[i - 1].t === 'p' && src[i].t !== 'h2' && src[i].t !== 'h3') { at = i; break; } }
    if (at < 0) at = src.length;
    shown.splice(at, 0, '<aside class="ad-slot ad-slot--inline" aria-label="Reklama"><span class="ad-slot__label">Reklama</span><div class="ad-slot__box"><span>Miejsce na reklamę</span><span class="ad-slot__size">728 × 90</span></div></aside>');
  }
  const bodyHtml = shown.join('');

  /* Metadane */
  const people = m.authors.map(function (a) { return { p: C.author(a.id), role: a.role }; });
  const authorsMeta = people.filter(function (x) { return x.role === 'autor'; }).map(function (x) { return '<a href="#/autor/' + x.p.id + '">' + esc(x.p.name) + '</a>'; }).join(', ');
  const expertsMeta = people.filter(function (x) { return x.role === 'ekspert'; }).map(function (x) { return '<a href="#/autor/' + x.p.id + '">' + esc(x.p.name) + '</a>'; }).join(', ');

  /* Bramka: logowanie (bezpłatny materiał po limicie) lub subskrypcja (Premium) */
  function paywall() {
    const back = encodeURIComponent(m.id);
    const subLink = '<p class="gate__foot">Nieograniczony dostęp do wszystkich treści KBR.<a href="#/subskrypcja?z=' + back + '">Zobacz opcje subskrypcji</a></p>';
    const terms = '<p class="gate__terms">Kontynuując, akceptujesz <a href="#/regulamin">Regulamin</a> i <a href="#/prywatnosc">Politykę prywatności</a>.</p>';
    if (access.kind === 'login-required') {
      return '<section class="gate" role="dialog" aria-modal="false" aria-labelledby="gate-title" id="paywall"><div class="gate__inner">' +
        '<h2 class="gate__title" id="gate-title">Ten materiał jest <strong>bezpłatny</strong>.</h2>' +
        '<p class="gate__sub">Zaloguj się, aby czytać dalej.</p>' +
        '<form class="gate__form" data-gate-form novalidate><label for="gate-email">Adres e-mail</label><input class="input" id="gate-email" type="email" autocomplete="email" inputmode="email" required>' +
        '<button class="btn btn--primary gate__btn" type="submit">Dalej</button></form>' +
        '<div class="gate__or"><span>lub</span></div>' + terms +
        '<div class="gate__social">' + (KBR.authProviders || []).map(function (p) { return '<a class="gate__soc" href="#/logowanie" data-action="auth-link">' + p[2] + 'Kontynuuj z ' + p[1] + '</a>'; }).join('') + '</div>' +
        '<p class="gate__reg">Nie masz konta? <a href="#/rejestracja" data-action="auth-link">Załóż bezpłatne konto</a></p>' +
        subLink + '</div></section>';
    }
    return '<section class="gate" role="dialog" aria-modal="false" aria-labelledby="gate-title" id="paywall"><div class="gate__inner">' +
      '<h2 class="gate__title" id="gate-title">To jest materiał <strong>Premium</strong>.</h2>' +
      '<p class="gate__sub">Wybierz subskrypcję, aby czytać dalej.</p>' +
      '<div class="gate__form"><a class="btn btn--primary gate__btn" href="#/subskrypcja?z=' + back + '">Zobacz opcje subskrypcji</a></div>' +
      (user
        ? '<p class="gate__foot">Zalogowano jako <strong>' + esc(user.email) + '</strong>. To konto nie ma aktywnej subskrypcji.</p>'
        : '<p class="gate__foot">Masz już subskrypcję?<a href="#/logowanie" data-action="auth-link">Zaloguj się</a></p>') +
      '</div></section>';
  }

  /* Pasek statusu dostępu nad treścią (tylko goście w ramach limitu) */
  let accessNote = '';
  if (access.kind === 'metered') {
    const left = Math.max(0, access.limit - access.used);
    accessNote = '<aside class="meter-box" aria-labelledby="h-meter"><div class="meter-box__head"><h2 class="t-label" id="h-meter">Bezpłatne materiały</h2>' + ui.meterDots(access.used, access.limit, true) +
      '<span class="meter-box__count">Wykorzystano ' + access.used + ' z ' + access.limit + '</span></div>' +
      '<p class="meter-box__main">' + (left ? 'Bez logowania ' + (left === 1 ? 'został Ci jeszcze <strong>1 materiał</strong>.' : 'zostały Ci jeszcze <strong>' + ui.plMat(left) + '</strong>.') : '<strong>To ostatni materiał bez logowania.</strong>') + '</p>' +
      '<p class="meter-box__text">Bez logowania masz ' + ui.plMat(access.limit) + '. Potem wystarczy bezpłatne konto, aby czytać dalej materiały bezpłatne.</p>' +
      '<a class="t-link" href="#/rejestracja" data-action="auth-link">Załóż bezpłatne konto' + I('chevRight', 14, 'stroke-width="2.25"') + '</a></aside>';
  }
  if (access.kind === 'subscriber' && m.access === 'premium') accessNote = '<p class="unlock-note" style="margin-top:0;margin-bottom:20px">' + I('unlock', 16) + 'Materiał Premium – masz dostęp dzięki subskrypcji</p>';

  /* Odtwarzacz (symulacja) */
  const isVideo = m.format === 'video';
  const subHref = '#/subskrypcja?z=' + encodeURIComponent(m.id);
  const lockedPlay = function (size, cls) { return '<a class="pp' + (cls ? ' ' + cls : '') + '" href="' + subHref + '" aria-label="Odtwórz: ' + esc(m.title) + ' – wymaga subskrypcji">' + I('play', size) + '</a>'; };
  const player = isMedia && !isVideo ? '<div class="media-player' + (access.full ? '' : ' is-locked') + '"' + (access.full ? ' data-player data-duration="' + m.duration + '"' : '') + '>' + (access.full ? '<button type="button" class="pp" data-action="player" aria-label="Odtwórz: ' + esc(m.title) + '">' + I('play', 26) + '</button>' : lockedPlay(26)) +
    '<div><div class="row"><span class="title">' + esc(f.name) + ' · ' + m.duration + ' min</span><span class="demo-tag" style="background:transparent;color:#ffe2b0;border-color:#c89a5b">Odtwarzacz demonstracyjny – brak pliku</span></div>' +
    '<div class="track" aria-hidden="true"><i></i></div><div class="row" style="margin-top:6px"><span data-time>0:00</span><span>' + m.duration + ':00</span></div></div></div>' : '';

  /* Serwisy streamingowe */
  const services = m.format === 'podcast'
    ? [['spotify', 'Spotify', 'https://open.spotify.com'], ['apple-podcasts', 'Apple Podcasts', 'https://podcasts.apple.com'], ['youtube', 'YouTube', 'https://www.youtube.com']]
    : [['youtube', 'YouTube', 'https://www.youtube.com'], ['spotify', 'Spotify', 'https://open.spotify.com']];
  const streaming = isMedia ? '<section class="streaming" aria-labelledby="h-streaming"><h2 class="t-label" id="h-streaming">' + (m.format === 'podcast' ? 'Słuchaj w serwisach' : 'Oglądaj w serwisach') + '</h2><ul>' +
    services.map(function (s) {
      return '<li><a class="streaming__btn" href="' + s[2] + '" target="_blank" rel="noopener"><img src="assets/img/ikona-' + s[0] + '.png" alt="" width="24" height="24"><span>' + s[1] + '</span>' + I('external', 16) + '<span class="visually-hidden"> (serwis zewnętrzny, otwiera się w nowej karcie)</span></a></li>';
    }).join('') + '</ul></section>' : '';

  /* Poprzednie odcinki (podcast) */
  let episodes = '';
  if (m.format === 'podcast') {
    const real = C.list({ formats: ['podcast'] }).filter(function (x) { return x.id !== m.id && x.date <= m.date; })
      .map(function (x) { return { title: x.title, date: x.date, duration: x.duration, href: ui.materialUrl(x), premium: x.access === 'premium' }; });
    const demo = [
      { title: 'Jak budować zespół w organizacji hybrydowej', date: '2026-07-22', duration: 41 },
      { title: 'Finanse rodzinnych firm w czasie sukcesji', date: '2026-06-18', duration: 37, premium: true },
      { title: 'Rozmowa o etyce sztucznej inteligencji w biznesie', date: '2026-05-14', duration: 48 }
    ].filter(function (x) { return x.date < m.date; });
    const list = real.concat(demo).sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 5);
    if (list.length) episodes = '<section class="episodes" aria-labelledby="h-episodes"><h2 class="t-section col-head" id="h-episodes">Poprzednie odcinki</h2><ol>' +
      list.map(function (e) {
        const inner = '<span class="episodes__play" aria-hidden="true">' + I('play', 14) + '</span><span class="episodes__body"><span class="episodes__title">' + esc(e.title) + '</span>' +
          '<span class="t-meta"><time datetime="' + e.date + '">' + ui.dateShort(e.date) + '</time> · ' + e.duration + ' min' + (e.premium ? ' · Premium' : '') + '</span></span>' + I('chevRight', 18, 'stroke-width="2"');
        return '<li><a class="episodes__row" href="' + (e.href || '#/podcasty') + '">' + inner + '</a></li>';
      }).join('') + '</ol><a class="t-link" href="#/podcasty">Wszystkie odcinki' + I('chevRight', 14, 'stroke-width="2.25"') + '</a></section>';
  }

  const tagList = C.tags(m);
  const tagsHtml = tagList.length ? '<nav class="chips tags-row" aria-label="Tagi" style="margin-top:20px;display:flex;flex-wrap:wrap;gap:8px">' + tagList.map(function (tg) { return '<a class="chip" style="width:auto;white-space:nowrap" href="#/tag/' + C.tagSlug(tg) + '">#' + esc(tg) + '</a>'; }).join('') + '</nav>' : '';
  const byRole = function (r) { return people.filter(function (x) { return x.role === r; }); };
  const credited = byRole('autor').slice(0, 2).concat(byRole('ekspert').slice(0, 1));
  const authorsTop = '<div class="byline-people">' + credited.map(function (x) {
    return '<div class="byline-person"><a href="#/autor/' + x.p.id + '" tabindex="-1" aria-hidden="true">' + ui.personPhoto(x.p, 'person-photo--56') + '</a>' +
      '<span class="byline-person__body"><span class="t-label">' + (x.role === 'ekspert' ? 'Specjalista' : 'Autor') + '</span>' +
      '<a class="byline-person__name" href="#/autor/' + x.p.id + '">' + esc(x.p.name) + '</a>' +
      (x.p.role ? '<span class="person-role">' + esc(x.p.role) + '</span>' : '') + ui.personContact(x.p) + '</span></div>';
  }).join('') + '</div>';
  const latest = C.list({ formats: ['article'] }).filter(function (x) { return x.id !== m.id; }).slice(0, 3);
  const related = C.related(m, 4);

  const authorBoxes = people.map(function (x) {
    return '<section class="author-box" aria-label="' + (x.role === 'ekspert' ? 'O ekspercie' : 'O autorze') + '">' + ui.personPhoto(x.p, 'person-photo--72') + '<div>' +
      '<span class="t-label">' + (x.role === 'ekspert' ? 'Specjalista' : 'Autor') + '</span><h2>' + esc(x.p.name) + '</h2>' + (x.p.role ? '<p class="person-role">' + esc(x.p.role) + '</p>' : '') + '<p>' + esc(x.p.bio) + '</p>' + ui.personContact(x.p) +
      '<a class="t-link" href="#/autor/' + x.p.id + '">Wszystkie materiały' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div></section>';
  }).join('');

  const shareMenu = '<div class="menu"><button type="button" class="save-btn" data-action="menu" aria-expanded="false" aria-controls="share-menu" aria-haspopup="true">' + I('share', 18) + 'Udostępnij</button>' +
    '<div class="menu__panel" id="share-menu" hidden>' +
    '<button type="button" data-action="copy-link">' + I('link', 18) + 'Kopiuj link</button>' +
    '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href) + '" target="_blank" rel="noopener">' + I('external', 18) + 'LinkedIn<span class="visually-hidden"> (otwiera się w nowej karcie)</span></a>' +
    '<a href="mailto:?subject=' + encodeURIComponent(m.title) + '&body=' + encodeURIComponent(location.href) + '">' + I('mail', 18) + 'E-mail</a>' +
    (navigator.share ? '<button type="button" data-action="native-share">' + I('share', 18) + 'Więcej opcji…</button>' : '') +
    '</div></div>';

  const shareRail = '<aside class="share-rail" aria-label="Udostępnij materiał">' +
    '<span class="share-rail__label" aria-hidden="true">Udostępnij</span>' +
    '<button type="button" class="share-rail__btn" data-action="copy-link" title="Kopiuj link">' + I('link', 18) + '<span class="visually-hidden">Kopiuj link</span></button>' +
    '<a class="share-rail__btn" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href) + '" target="_blank" rel="noopener" title="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 8.5h3V19H5zM6.5 4a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM10 8.5h2.9v1.4c.4-.8 1.4-1.6 3-1.6 3.2 0 3.8 2.1 3.8 4.8V19h-3v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V19h-3z"/></svg><span class="visually-hidden">LinkedIn (otwiera się w nowej karcie)</span></a>' +
    '<a class="share-rail__btn" href="mailto:?subject=' + encodeURIComponent(m.title) + '&body=' + encodeURIComponent(location.href) + '" title="E-mail">' + I('mail', 18) + '<span class="visually-hidden">E-mail</span></a>' +
    (navigator.share ? '<button type="button" class="share-rail__btn" data-action="native-share" title="Więcej opcji">' + I('share', 18) + '<span class="visually-hidden">Więcej opcji</span></button>' : '') +
    '</aside>';

  const html = shareRail + '<div class="container">' +
    '<header class="article-head">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: f.plural, href: f.route }, { label: t.name, href: '#/tematy/' + t.slug }, { label: m.title }]) +
      '<div class="article-head__inner">' +
        (m.access === 'premium' ? '<span class="badge badge--premium article-head__premium">' + I('lock', 13) + 'Premium</span>' : '') +
        '<div class="article-head__top">' + (m.format !== 'article' ? '<span class="badge badge--navy">' + esc(f.name) + '</span>' : '') +
          '<a class="t-label" href="#/tematy/' + t.slug + '"><span class="visually-hidden">Temat główny: </span>' + esc(t.name) + '</a>' +
          '<div style="margin-left:auto">' + shareMenu + '</div></div>' +
        '<h1>' + esc(m.title) + '</h1>' +
        '<p class="t-lead">' + esc(m.lead) + '</p>' +
        '<div class="article-meta"><time datetime="' + m.date + '">' + ui.dateLong(m.date) + '</time>' +
          (issue ? '<span class="dot" aria-hidden="true"></span><a href="#/magazyn">Z numeru ' + esc(issue.label) + '</a>' : '') + '</div>' +
        tagsHtml +
        '<div class="article-actions">' + authorsTop + '</div>' +
      '</div>' +
    '</header>' +
    (isVideo
      ? '<figure class="article-hero video-hero' + (access.full ? '' : ' is-locked') + '"' + (access.full ? ' data-player data-duration="' + m.duration + '"' : '') + '><div class="video-hero__frame"><img src="' + ui.img(m.image) + '" alt="' + esc(m.imageAlt) + '"' + (m.imagePos ? ' style="object-position:' + m.imagePos + '"' : '') + '>' +
          (access.full ? '<button type="button" class="pp video-hero__play" data-action="player" aria-label="Odtwórz wideo: ' + esc(m.title) + '">' + I('play', 34) + '</button>' : lockedPlay(34, 'video-hero__play') + '<span class="video-hero__lock">' + I('lock', 14) + 'Odtwarzanie dla subskrybentów</span>') +
          '<div class="video-hero__bar"><span data-time>0:00</span><div class="track" aria-hidden="true"><i></i></div><span>' + m.duration + ':00</span></div></div>' +
          '<figcaption>Odtwarzacz demonstracyjny – brak pliku wideo. Docelowo osadzony odtwarzacz (np. YouTube).</figcaption></figure>'
      : '<figure class="article-hero"><img src="' + ui.img(m.image) + '" alt="' + esc(m.imageAlt) + '"' + (m.imagePos ? ' style="object-position:' + m.imagePos + '"' : '') + '><figcaption>Fot. materiały Akademii Leona Koźmińskiego (zdjęcie z projektu strony, użyte poglądowo).</figcaption></figure>') +
    '<div class="article-layout"><div class="article-main">' +
      accessNote + player + streaming +
      '<div class="prose' + (access.full ? '' : ' paywall-fade') + '" id="article-body">' + bodyHtml + '</div>' +
      (access.full ? '' : paywall()) +
      (issue && access.full ? '<div class="notice" style="margin-top:40px">' + I('newspaper', 18) + '<span>Materiał ukazał się w numerze <strong>' + esc(issue.label) + '</strong>. <a class="link" href="#/magazyn">Wróć do spisu treści numeru</a></span></div>' : '') +
      episodes +
      '<p class="notice notice--demo demo-note">' + I('info', 18) + '<span>Treść demonstracyjna przygotowana na potrzeby prototypu. Nie jest publikacją KBR i nie zawiera wypowiedzi przywołanych osób.</span></p>' +
    '</div>' +
    '<aside class="article-aside" aria-label="Więcej z KBR"><div class="aside-sticky"><section class="latest" aria-labelledby="h-aside-latest"><h2 class="t-section col-head" id="h-aside-latest">Najnowsze</h2>' +
      latest.map(function (x) { return ui.card(x, { noImage: true, date: false }); }).join('') + '</section>' + '<div class="ad-slot" role="complementary" aria-label="Reklama"><span class="ad-slot__label">Reklama</span><div class="ad-slot__box"><span>Miejsce na reklamę</span><span class="ad-slot__size">300 × 225</span></div></div>' + '</div></aside>' +
    '</div>' +
    '<section class="related" aria-labelledby="h-related">' + ui.sectionHead('Powiązane materiały', { href: '#/tematy/' + t.slug, label: 'Więcej z tematu' }, { id: 'h-related' }) +
      '<div class="grid-4">' + related.map(function (x) { return ui.card(x, {}); }).join('') + '</div></section>' +
    '</div>';

  return {
    title: m.title + ' – Kozminski Business Review',
    html: html,
    mount: function (root) {
      const gate = root.querySelector('.gate');
      document.querySelectorAll('body > .gate, body > .gate-scrim').forEach(function (g) { g.remove(); });
      document.documentElement.classList.remove('has-gate');
      if (gate) {
        const scrim = document.createElement('div'); scrim.className = 'gate-scrim'; scrim.setAttribute('aria-hidden', 'true');
        document.body.appendChild(scrim);
        document.body.appendChild(gate);
        const cleanup = function () { gate.remove(); scrim.remove(); unlock(); window.removeEventListener('scroll', check); document.documentElement.classList.remove('has-gate'); window.removeEventListener('hashchange', cleanup); };
        window.addEventListener('hashchange', cleanup);
        const hero = root.querySelector('.article-hero');
        let opened = false;
        const open = function () {
          if (opened || !document.contains(gate)) return;
          opened = true;
          window.removeEventListener('scroll', check);
          ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) { window.removeEventListener(ev, markUser); });
          document.documentElement.classList.add('has-gate');
          gate.classList.add('is-open');
          /* limit w dół: dolna połowa zdjęcia tuż pod nagłówkiem */
          const hdr = document.querySelector('.site-header, header.hdr, .hdr');
          const hb = hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0;
          const hr = hero ? hero.getBoundingClientRect() : null;
          lockY = hr ? Math.max(window.scrollY, Math.round(window.scrollY + hr.top + hr.height / 2 - hb)) : window.scrollY;
          window.addEventListener('scroll', clamp, { passive: true });
          window.addEventListener('wheel', onWheel, { passive: false });
          window.addEventListener('touchstart', onTouchStart, { passive: true });
          window.addEventListener('touchmove', onTouchMove, { passive: false });
          window.addEventListener('keydown', onKey);
        };
        /* blokada przewijania w dół (w górę wolno) */
        let lockY = 0, ty = 0;
        const atLimit = function () { return window.scrollY >= lockY - 1; };
        const clamp = function () { if (!document.contains(gate)) return unlock(); if (window.scrollY > lockY) window.scrollTo({ top: lockY, behavior: 'instant' }); };
        const onWheel = function (e) { if (gate.contains(e.target)) return; if (e.deltaY > 0 && atLimit()) e.preventDefault(); };
        const onTouchStart = function (e) { ty = e.touches[0].clientY; };
        const onTouchMove = function (e) { if (gate.contains(e.target)) return; if (e.touches[0].clientY < ty && atLimit()) e.preventDefault(); };
        const onKey = function (e) { if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return; if (['ArrowDown', 'PageDown', 'End', ' '].indexOf(e.key) !== -1 && atLimit()) e.preventDefault(); };
        const unlock = function () {
          window.removeEventListener('scroll', clamp); window.removeEventListener('wheel', onWheel);
          window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchmove', onTouchMove); window.removeEventListener('keydown', onKey);
        };
        /* liczy się tylko przewinięcie wykonane przez czytelnika (nie przywrócenie pozycji przez przeglądarkę) */
        let byUser = false;
        const markUser = function () { byUser = true; };
        ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (ev) { window.addEventListener(ev, markUser, { passive: true }); });
        const check = function () {
          if (!hero) { open(); return; }
          if (!byUser) return;
          /* gdy dolna krawędź ekranu zrówna się z dolną krawędzią zdjęcia */
          if (hero.getBoundingClientRect().bottom <= window.innerHeight) open();
        };
        window.addEventListener('scroll', check, { passive: true });
        if (!hero) requestAnimationFrame(open);
        else if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
      }
      const gf = gate && gate.querySelector('[data-gate-form]');
      if (gf && KBR.rememberEmail) KBR.rememberEmail(gf, 'gate-email');
      if (gf) gf.addEventListener('submit', function (e) {
        e.preventDefault();
        const v = gf.querySelector('input').value.trim();
        KBR.flow.setReturn(location.hash);
        KBR.app.navigate('#/logowanie' + (v ? '?email=' + encodeURIComponent(v) : ''));
      });
      const rail = root.querySelector('.share-rail'), body = root.querySelector('#article-body');
      if (rail && body) {
        let ticking = false, shown = null;
        const update = function () {
          ticking = false;
          if (!document.contains(rail)) { window.removeEventListener('scroll', onScroll); return; }
          const r = body.getBoundingClientRect();
          const on = r.top < window.innerHeight * 0.6 && r.bottom > 120;
          if (on !== shown) { shown = on; rail.classList.toggle('is-visible', on); }
        };
        const onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
        window.addEventListener('scroll', onScroll, { passive: true });
        update();
      }
      const p = root.querySelector('[data-player]');
      if (p) {
        let t0 = 0, timer = null; const dur = +p.dataset.duration * 60;
        const btn = p.querySelector('[data-action="player"]');
        btn.addEventListener('click', function () {
          const sz = isVideo ? 34 : 26;
          if (timer) { clearInterval(timer); timer = null; p.classList.remove('is-playing'); btn.innerHTML = I('play', sz); btn.setAttribute('aria-label', 'Odtwórz'); return; }
          p.classList.add('is-playing'); btn.innerHTML = I('pause', sz); btn.setAttribute('aria-label', 'Wstrzymaj');
          timer = setInterval(function () {
            if (!document.contains(p)) { clearInterval(timer); return; }
            t0 = Math.min(dur, t0 + 1);
            p.querySelector('.track i').style.width = (t0 / dur * 100) + '%';
            p.querySelector('[data-time]').textContent = Math.floor(t0 / 60) + ':' + String(t0 % 60).padStart(2, '0');
          }, 1000);
        });
      }
    }
  };
};
