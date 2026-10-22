/* Strona główna – odwzorowanie projektu KBR_Home.pdf */
KBR.pages = KBR.pages || {};
KBR.pages.home = function () {
  const ui = KBR.ui, C = KBR.content, H = KBR.data.home, I = KBR.icon, esc = ui.esc;
  const get = function (id) { return C.get(id); };
  const lead = get(H.lead);
  const subscribed = KBR.subscription.has('premium');

  const picks = H.picks.map(get);
  /* zdjęcie przy środkowym artykule kolumny */
  const mid = Math.floor(picks.length / 2);
  const pickCards = picks.map(function (m, i) {
    if (i !== mid) return ui.card(m, { noImage: true, date: false });
    return '<article class="card card--img">' + ui.media(m) + ui.topicLabel(m) +
      ui.titleLink(m) + '<p class="t-body card__lead">' + esc(m.lead) + '</p><p class="t-meta card__author">' + ui.metaLine(m) + '</p></article>';
  }).join('');
  const latest = H.latest.map(get).map(function (m) { return ui.card(m, { noImage: true, date: false }); }).join('');


  const issue = C.currentIssue();
  const toc = issue.toc.map(get);
  const tocHtml = toc.map(function (m, i) {
    return '<a class="toc-item" href="' + ui.materialUrl(m) + '" data-issue-item="' + m.id + '" data-active="' + (i === 0) + '">' +
      '<span class="toc-item__arrow">' + I('chevLeft', 22, 'stroke-width="2"') + '</span>' +
      '<span class="t-label">' + esc(C.topic(m.topic).name) + '</span><span class="t-title-card">' + esc(m.title) + (m.access === 'premium' ? '<span class="visually-hidden"> (Premium)</span>' : '') + '</span>' +
      '<span class="t-meta">' + esc(m.authors.filter(function (a) { return a.role === 'autor'; }).map(function (a) { return C.author(a.id).name; }).join(', ')) + '</span></a>';
  }).join('');

  const latest2 = H.latest.slice(0, 2).map(get).map(function (m) { return ui.card(m, { noImage: true, date: false }); }).join('');
  /* Zajawka najnowszego numeru w kolumnie „Najnowsze” */
  const magTeaser = '<a class="mag-teaser" href="#/magazyn" aria-label="Nowy numer magazynu KBR: ' + esc(issue.label) + ', ' + esc(issue.title) + '">' +
    '<span class="mag-teaser__cover"><img src="' + ui.img(issue.cover) + '" alt="" loading="lazy"></span>' +
    '<span class="mag-teaser__body"><span class="t-label">Nowy numer</span>' +
      '<span class="mag-teaser__issue">' + esc(issue.label) + '</span>' +
      '<span class="mag-teaser__title">' + esc(issue.title) + '</span>' +
      '<span class="mag-teaser__more">Zobacz spis treści' + I('chevRight', 14, 'stroke-width="2.25"') + '</span></span></a>';

  const topicTiles = KBR.data.topics.map(function (t, i) {
    const items = C.list({ topic: t.id });
    const top = items[0];
    return '<a class="topic-tile' + (i === 0 ? ' topic-tile--lg' : '') + '" href="#/tematy/' + t.slug + '">' +
      (top ? '<img src="' + ui.img(top.image) + '" alt="" loading="lazy"' + (top.imagePos ? ' style="object-position:' + top.imagePos + '"' : '') + '>' : '') +
      '<span class="topic-tile__shade" aria-hidden="true"></span>' +
      '<span class="topic-tile__nr" aria-hidden="true">' + String(i + 1).padStart(2, '0') + '</span>' +
      '<span class="topic-tile__body"><span class="topic-tile__name">' + esc(t.name) + '</span>' +
        '<span class="topic-tile__count">' + ui.plMat(items.length) + '</span>' +
        (top ? '<span class="topic-tile__latest"><span>Najnowszy</span>' + esc(top.title) + '</span>' : '') +
      '</span><span class="topic-tile__arrow" aria-hidden="true">' + I('chevRight', 20, 'stroke-width="2"') + '</span></a>';
  }).join('');
  const html = '' +
    '<h1 class="visually-hidden">Kozminski Business Review – strona główna</h1>' +
    '<div class="container"><div class="home-hero">' +
      '<article class="lead-story">' + ui.media(lead) +
        '<div class="lead-story__meta">' + ui.topicLabel(lead).replace('card__cat', '') + '</div>' +
        '<h2><a class="t-title-xl hover-title" href="' + ui.materialUrl(lead) + '">' + esc(lead.title) + '</a></h2>' +
        '<p class="t-lead">' + esc(lead.lead) + '</p><p class="t-meta">' + ui.metaLine(lead) + '</p>' +
      '</article>' +
      '<section class="picks" aria-labelledby="h-picks"><h2 class="t-section col-head" id="h-picks">Wybrane dla Ciebie</h2>' + pickCards + '</section>' +
      '<section class="latest" aria-labelledby="h-latest"><h2 class="t-section col-head" id="h-latest">Najnowsze</h2>' + magTeaser + latest2 + ui.newsletterForm('home') + '</section>' +
    '</div></div>' +


    '<aside class="container" aria-label="Reklama">' + ui.promo() + '</aside>' +

    '<section class="mag" aria-labelledby="h-magazine"><div class="container">' +
      '<div class="mag__head mag-reveal" style="--i:0"><h2 id="h-magazine">' + I('newspaper', 22) + 'Magazyn</h2></div>' +
      '<div class="mag__grid">' +
        '<div class="mag__coverwrap mag-reveal" style="--i:1">' +
          '<a class="mag-cover" href="#/magazyn" aria-label="Aktualny numer: ' + esc(issue.label) + ' – ' + esc(issue.title) + '">' +
            ui.magCoverBook(issue) + '<span class="mag-cover__shadow" aria-hidden="true"></span></a>' +
        '</div>' +
        '<div class="mag__info">' +
          '<span class="mag__kicker mag-reveal" style="--i:2">Aktualny numer</span>' +
          '<h3 class="mag__title mag-reveal" style="--i:3">' + esc(issue.title) + '</h3>' +
          '<p class="mag__desc mag-reveal" style="--i:4">' + esc(issue.description) + '</p>' +
          '<ol class="mag__toc" aria-label="Spis treści numeru ' + esc(issue.label) + '">' + toc.map(function (m, i) {
            return '<li class="mag-reveal" style="--i:' + (5 + i) + '"><a class="mag-toc" href="' + ui.materialUrl(m) + '">' +
              '<span class="mag-toc__nr">' + String(i + 1).padStart(2, '0') + '</span>' +
              '<span class="mag-toc__thumb" aria-hidden="true"><img src="' + ui.img(issue.featureImage[m.id] || m.image) + '" alt=""></span>' +
              '<span class="mag-toc__body"><span class="mag-toc__topic">' + esc(C.topic(m.topic).name) + '</span><span class="mag-toc__title">' + esc(m.title) + (m.access === 'premium' ? '<span class="visually-hidden"> (Premium)</span>' : '') + '</span>' +
              '<span class="mag-toc__author">Autor: ' + esc(m.authors.filter(function (x) { return x.role === 'autor'; }).map(function (x) { return C.author(x.id).name; }).join(', ')) + '</span></span>' +
              '<span class="mag-toc__arrow" aria-hidden="true">' + I('chevRight', 18, 'stroke-width="2"') + '</span></a></li>';
          }).join('') + '</ol>' +
          '<div class="mag__cta mag-reveal" style="--i:9"><a class="btn btn--primary" href="#/magazyn">Czytaj numer' + I('chevRight', 16, 'stroke-width="2"') + '</a><a class="btn mag__btn-ghost" href="#/magazyn">Pobierz PDF</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="mag__shelf mag-reveal" style="--i:10"><span class="mag__kicker">Z archiwum</span>' +
        '<div class="mag__shelf-row"><ul class="shelf">' +
        KBR.data.issues.filter(function (x) { return x.archived; }).slice(0, 5).map(function (x, i) {
          return '<li><a class="spine spine--' + (i % 5) + '" href="#/magazyn" data-title="' + esc(x.title) + '" data-desc="' + esc(x.description) + '" data-nr="' + esc(x.label) + '" style="--h:' + [222, 204, 232, 212, 198][i] + 'px">' +
            '<span class="spine__nr">' + esc(x.label) + '</span><span class="spine__title">' + esc(x.title) + '</span></a></li>';
        }).join('') + '</ul>' +
        '<div class="mag__shelf-caption" aria-hidden="true"><span class="mag__shelf-nr"></span><span class="mag__shelf-title"></span><span class="mag__shelf-desc"></span><a class="mag__all" href="#/magazyn" tabindex="-1">Archiwum wydań' + I('chevRight', 14, 'stroke-width="2.25"') + '</a></div></div>' +
      '</div>' +
    '</div></section>' +
    '<section class="container home-topics" aria-labelledby="h-topics">' + ui.sectionHead('Tematy', { href: '#/tematy', label: 'Wszystkie tematy' }, { id: 'h-topics' }) +
      '<div class="topic-mosaic">' + topicTiles + '</div></section>' +


    '<div class="container cta-wide"><a class="btn btn--primary btn--lg" href="#/subskrypcja">Wybierz subskrypcję i czytaj bez ograniczeń' + I('chevRight', 24, 'stroke-width="2.25"') + '</a></div>';

  return {
    title: 'Kozminski Business Review',
    html: html,
    mount: function (root) {
      const sec = root.querySelector('.mag');
      if (!sec) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) sec.classList.add('is-in');
      else {
        const io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { sec.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.15 });
        io.observe(sec);
      }
      ui.magCoverMotion(sec.querySelector('.mag-cover'));
      const spines = sec.querySelectorAll('.spine'), cap = sec.querySelector('.mag__shelf-caption');
      function pick(sp) {
        spines.forEach(function (x) { x.classList.toggle('is-out', x === sp); });
        cap.querySelector('.mag__shelf-nr').textContent = sp.dataset.nr;
        cap.querySelector('.mag__shelf-title').textContent = sp.dataset.title;
        cap.querySelector('.mag__shelf-desc').textContent = sp.dataset.desc;
      }
      if (spines.length && cap) {
        pick(spines[0]);
        spines.forEach(function (sp) { sp.addEventListener('pointerenter', function () { pick(sp); }); sp.addEventListener('focus', function () { pick(sp); }); });
      }
    }
  };
};
