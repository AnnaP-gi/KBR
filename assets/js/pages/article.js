/* Wspólny szablon strony materiału (artykuł, studium przypadku, podcast, wideo).
   Paywall jest STANEM tej strony, a nie osobną podstroną. */
KBR.pages.article = function (route) {
  const ui = KBR.ui, C = KBR.content, I = KBR.icon, esc = ui.esc;
  const m = C.get(route.params.id);
  if (!m) return KBR.pages.notFound();

  const user = KBR.auth.currentUser();
  const access = KBR.access.resolve(m, true);   // nalicza wyświetlenie w limicie
  if (access.full && user) KBR.library.recordRead(m.id);

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

  /* Paywall */
  function paywall() {
    const back = encodeURIComponent(m.id);
    const exhausted = access.kind === 'meter-exhausted';
    const who = user ? '<p>Jesteś zalogowana/y jako <strong>' + esc(user.email) + '</strong>. To konto nie ma aktywnej subskrypcji.</p>' : '';
    return '<section class="paywall" aria-labelledby="paywall-title" id="paywall">' +
      '<span class="paywall__label">' + (exhausted ? '<span class="badge badge--navy">' + I('lock', 14) + 'Limit bezpłatnych materiałów</span>' : '<span class="badge badge--premium">' + I('lock', 14) + 'Premium</span>') + '</span>' +
      '<h2 id="paywall-title">' + (exhausted ? 'Wykorzystano bezpłatne materiały w tym miesiącu' : 'Przeczytaj cały materiał z subskrypcją KBR') + '</h2>' +
      '<p>' + (exhausted
        ? 'W prototypie przyjęto limit ' + access.limit + ' bezpłatnych materiałów miesięcznie (wartość konfigurowalna, do zatwierdzenia). Subskrypcja daje nieograniczony dostęp.'
        : 'Ten materiał jest dostępny dla subskrybentów. Wybierz wariant subskrypcji, aby czytać dalej – wrócisz tutaj zaraz po zakupie.') + '</p>' +
      '<ul><li>' + I('check', 18) + 'Pełny dostęp do artykułów, analiz i studiów przypadków Premium</li><li>' + I('check', 18) + 'Moja biblioteka: zapisane materiały i historia czytania</li><li>' + I('check', 18) + 'Cyfrowe wydania magazynu KBR w wybranych wariantach</li></ul>' +
      '<div class="btn-row"><a class="btn btn--primary" href="#/subskrypcja?z=' + back + '">Wybierz subskrypcję' + I('chevRight', 16, 'stroke-width="2"') + '</a>' +
      (user ? '' : '<a class="btn btn--outline" href="#/logowanie" data-action="auth-link">Mam subskrypcję – zaloguj się</a>') + '</div>' +
      '<div class="paywall__alt">' + who +
        '<span>Dostęp dla zespołu? <a href="#/dostep/firmy">Skontaktuj się z doradcą</a></span>' +
        '<span>Studiujesz lub pracujesz w ALK? <a href="#/dostep/akademicki">Sprawdź dostęp akademicki</a></span></div>' +
      '</section>';
  }

  /* Pasek statusu dostępu nad treścią */
  let accessNote = '';
  if (access.kind === 'metered') {
    const left = Math.max(0, access.limit - access.used);
    const next = new Date(); next.setMonth(next.getMonth() + 1, 1);
    accessNote = '<aside class="meter-box" aria-labelledby="h-meter"><div class="meter-box__head"><h2 class="t-label" id="h-meter">Bezpłatne materiały</h2>' + ui.meterDots(access.used, access.limit, true) +
      '<span class="meter-box__count">Wykorzystano ' + access.used + ' z ' + access.limit + '</span></div>' +
      '<p class="meter-box__main">' + (left ? 'Czytasz bezpłatny materiał. W tym miesiącu ' + (left === 1 ? 'został Ci jeszcze <strong>1 materiał</strong>.' : 'zostały Ci jeszcze <strong>' + ui.plMat(left) + '</strong>.') : '<strong>To ostatni bezpłatny materiał w tym miesiącu.</strong>') + '</p>' +
      '<p class="meter-box__text">Bez subskrypcji możesz co miesiąc przeczytać ' + ui.plMat(access.limit) + ' oznaczonych jako bezpłatne' + (user ? '' : ' (licznik dotyczy tej przeglądarki)') + '. Każdy otwarty materiał liczy się raz – powrót do niego nie zmniejsza limitu. Licznik odnowi się ' + next.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' }) + '.</p>' +
      '<a class="t-link" href="#/subskrypcja?z=' + encodeURIComponent(m.id) + '">Czytaj bez limitu z subskrypcją' + I('chevRight', 14, 'stroke-width="2.25"') + '</a></aside>';
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

  const latest = C.list({ formats: ['article', 'case'] }).filter(function (x) { return x.id !== m.id; }).slice(0, 3);
  const related = C.related(m, 4);

  const authorBoxes = people.map(function (x) {
    return '<section class="author-box" aria-label="' + (x.role === 'ekspert' ? 'O ekspercie' : 'O autorze') + '"><div class="avatar" aria-hidden="true">' + esc(x.p.initials.slice(0, 2)) + '</div><div>' +
      '<span class="t-label">' + (x.role === 'ekspert' ? 'Ekspert' : 'Autor') + '</span><h2>' + esc(x.p.name) + '</h2><p>' + esc(x.p.bio) + '</p>' +
      '<a class="t-link" href="#/autor/' + x.p.id + '">Wszystkie materiały' + KBR.icon('chevRight', 14, 'stroke-width="2.25"') + '</a></div></section>';
  }).join('');

  const shareMenu = '<div class="menu"><button type="button" class="save-btn" data-action="menu" aria-expanded="false" aria-controls="share-menu" aria-haspopup="true">' + I('share', 18) + 'Udostępnij</button>' +
    '<div class="menu__panel" id="share-menu" hidden>' +
    '<button type="button" data-action="copy-link">' + I('link', 18) + 'Kopiuj link</button>' +
    '<a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(location.href) + '" target="_blank" rel="noopener">' + I('external', 18) + 'LinkedIn<span class="visually-hidden"> (otwiera się w nowej karcie)</span></a>' +
    '<a href="mailto:?subject=' + encodeURIComponent(m.title) + '&body=' + encodeURIComponent(location.href) + '">' + I('mail', 18) + 'E-mail</a>' +
    (navigator.share ? '<button type="button" data-action="native-share">' + I('share', 18) + 'Więcej opcji…</button>' : '') +
    '</div></div>';

  const html = '<div class="container">' +
    '<header class="article-head">' +
      ui.crumbs([{ label: 'Strona główna', href: '#/' }, { label: f.plural, href: f.route }, { label: t.name, href: '#/tematy/' + t.slug }, { label: m.title }]) +
      '<div class="article-head__inner">' +
        (m.access === 'premium' ? '<span class="badge badge--premium article-head__premium">' + I('lock', 13) + 'Premium</span>' : '') +
        '<div class="article-head__top">' + (m.format !== 'article' ? '<span class="badge badge--navy">' + esc(f.name) + '</span>' : '') +
          '<a class="t-label" href="#/tematy/' + t.slug + '"><span class="visually-hidden">Temat główny: </span>' + esc(t.name) + '</a></div>' +
        '<h1>' + esc(m.title) + '</h1>' +
        '<p class="t-lead">' + esc(m.lead) + '</p>' +
        '<div class="article-meta"><span>Autor: ' + authorsMeta + '</span>' + (expertsMeta ? '<span class="roles">Udział ekspercki: ' + expertsMeta + '</span>' : '') +
          '<span class="dot" aria-hidden="true"></span><time datetime="' + m.date + '">' + ui.dateLong(m.date) + '</time>' +
          '<span class="dot" aria-hidden="true"></span><span>' + (m.readTime ? ui.minutes(m.readTime) + ' czytania' : f.name + ': ' + m.duration + ' min') + '</span>' +
          (issue ? '<span class="dot" aria-hidden="true"></span><a href="#/magazyn">Z numeru ' + esc(issue.label) + '</a>' : '') + '</div>' +
        '<div class="article-actions">' + ui.saveButton(m) + shareMenu + '</div>' +
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
      authorBoxes +
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
