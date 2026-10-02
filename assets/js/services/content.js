/* Zapytania o treści – odpowiednik przyszłego API CMS. */
KBR.content = (function () {
  const D = KBR.data;
  const byId = {};
  D.materials.forEach(function (m) { byId[m.id] = m; });

  function get(id) { return byId[id] || null; }
  function topic(id) { return D.topics.find(function (t) { return t.id === id; }) || null; }
  function topicBySlug(slug) { return D.topics.find(function (t) { return t.slug === slug; }) || null; }
  function author(id) { return D.authors.find(function (a) { return a.id === id; }) || null; }
  function format(id) { return D.formats[id]; }
  function isMedia(m) { return m.format === 'podcast' || m.format === 'video'; }

  function sortByDate(list) { return list.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }); }

  function list(filter) {
    filter = filter || {};
    let out = D.materials.filter(function (m) {
      if (filter.formats && filter.formats.indexOf(m.format) === -1) return false;
      if (filter.topic && m.topic !== filter.topic) return false;
      if (filter.access === 'premium' && m.access !== 'premium') return false;
      if (filter.access === 'free' && m.access === 'premium') return false;
      if (filter.author && !m.authors.some(function (a) { return a.id === filter.author; })) return false;
      return true;
    });
    return sortByDate(out);
  }

  function search(q, opts) {
    opts = opts || {};
    const norm = function (s) { return (s || '').toLocaleLowerCase('pl').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l'); };
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    let res = D.materials.map(function (m) {
      const hay = norm([m.title, m.lead, topic(m.topic).name, m.authors.map(function (a) { return author(a.id).name; }).join(' '),
        (m.body || []).map(function (b) { return b.x || (b.items || []).join(' '); }).join(' ')].join(' '));
      const title = norm(m.title);
      let score = 0;
      for (const t of terms) { if (hay.indexOf(t) === -1) return null; score += title.indexOf(t) !== -1 ? 3 : 1; }
      return { m: m, score: score };
    }).filter(Boolean);
    if (opts.topic) res = res.filter(function (r) { return r.m.topic === opts.topic; });
    if (opts.formats) res = res.filter(function (r) { return opts.formats.indexOf(r.m.format) !== -1; });
    res.sort(opts.sort === 'date' ? function (a, b) { return b.m.date.localeCompare(a.m.date); } : function (a, b) { return b.score - a.score || b.m.date.localeCompare(a.m.date); });
    return res.map(function (r) { return r.m; });
  }

  function related(m, n) {
    n = n || 4;
    const same = sortByDate(D.materials.filter(function (x) { return x.id !== m.id && x.topic === m.topic; }));
    const other = sortByDate(D.materials.filter(function (x) { return x.id !== m.id && x.topic !== m.topic && !isMedia(x); }));
    return same.concat(other).slice(0, n);
  }

  function issue(id) { return D.issues.find(function (i) { return i.id === id; }) || null; }
  function currentIssue() { return D.issues.find(function (i) { return i.current; }); }
  function event(id) { return D.events.find(function (e) { return e.id === id; }) || null; }

  return { get: get, topic: topic, topicBySlug: topicBySlug, author: author, format: format, isMedia: isMedia,
    list: list, search: search, related: related, issue: issue, currentIssue: currentIssue, event: event };
})();
