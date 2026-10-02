/* Pomocnicze funkcje interfejsu: escapowanie, formaty, toast, modal, fokus. */
KBR.ui = KBR.ui || {};
(function (ui) {
  const I = KBR.icon;

  ui.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };
  ui.img = function (file) { return 'assets/img/' + file; };
  ui.dateShort = function (iso) { const d = new Date(iso); return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear() + ' r.'; };
  ui.dateLong = function (iso) { return new Date(iso).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }); };
  ui.dateTime = function (iso) { return new Date(iso).toLocaleString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  ui.money = function (n) { return n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + KBR.config.currency; };
  ui.minutes = function (n) {
    const r = n % 10, r100 = n % 100;
    const word = n === 1 ? 'minuta' : (r >= 2 && r <= 4 && (r100 < 12 || r100 > 14)) ? 'minuty' : 'minut';
    return n + ' ' + word;
  };
  ui.materialUrl = function (m) { return '#/artykul/' + m.id; };
  ui.authorLine = function (m, withRoles) {
    const C = KBR.content;
    const authors = m.authors.filter(function (a) { return a.role === 'autor'; }).map(function (a) { return C.author(a.id).name; });
    let s = 'Autor: ' + authors.join(', ');
    if (withRoles) {
      const experts = m.authors.filter(function (a) { return a.role === 'ekspert'; }).map(function (a) { return C.author(a.id).name; });
      if (experts.length) s += ' · Ekspert: ' + experts.join(', ');
    }
    return s;
  };

  /* Przycisk zapisu – ten sam komponent na stronie artykułu, w listach i w bibliotece.
     Stan synchronizuje ui.syncSaveButtons() po każdej zmianie biblioteki. */
  ui.saveButton = function (m, opts) {
    opts = opts || {};
    const saved = KBR.auth.currentUser() && KBR.library.isSaved(m.id);
    return '<button type="button" class="save-btn' + (opts.compact ? ' save-btn--compact' : '') + '" data-action="toggle-save" data-id="' + m.id + '" aria-pressed="' + (saved ? 'true' : 'false') + '"' +
      ' aria-label="' + ui.esc((saved ? 'Zapisano w bibliotece: ' : 'Zapisz w bibliotece: ') + m.title) + '">' + ui.saveButtonInner(saved, opts.compact) + '</button>';
  };
  ui.saveButtonInner = function (saved, compact) {
    return I(saved ? 'bookmarkFill' : 'bookmark', compact ? 16 : 18) + '<span>' + (saved ? 'Zapisano w bibliotece' : (compact ? 'Zapisz' : 'Zapisz w bibliotece')) + '</span>';
  };
  ui.syncSaveButtons = function () {
    const logged = !!KBR.auth.currentUser();
    document.querySelectorAll('[data-action="toggle-save"]').forEach(function (b) {
      const m = KBR.content.get(b.dataset.id); if (!m) return;
      const saved = logged && KBR.library.isSaved(m.id);
      const compact = b.classList.contains('save-btn--compact');
      b.setAttribute('aria-pressed', saved ? 'true' : 'false');
      b.setAttribute('aria-label', (saved ? 'Zapisano w bibliotece: ' : 'Zapisz w bibliotece: ') + m.title);
      b.innerHTML = ui.saveButtonInner(saved, compact);
    });
    document.querySelectorAll('[data-saved-flag]').forEach(function (el) {
      const saved = logged && KBR.library.isSaved(el.dataset.savedFlag);
      el.hidden = !saved;
    });
  };

  /* Toast (region role=status jest stały w DOM – komunikaty są odczytywane). */
  ui.toast = function (html, opts) {
    opts = opts || {};
    const region = document.getElementById('toast-region');
    const el = document.createElement('div');
    el.className = 'toast' + (opts.kind ? ' toast--' + opts.kind : '');
    el.innerHTML = '<span style="display:flex;gap:10px;align-items:center">' + (opts.kind === 'success' ? '<span class="toast__icon">' + I('checkCircle', 20) + '</span>' : '') + '<span>' + html + '</span></span>' +
      '<button type="button" aria-label="Zamknij komunikat">' + I('close', 18) + '</button>';
    el.querySelector('button').addEventListener('click', function () { el.remove(); });
    region.appendChild(el);
    setTimeout(function () { el.remove(); }, opts.timeout || 7000);
  };

  /* Modal oparty na <dialog> – natywna pułapka fokusu i obsługa Esc. */
  ui.modal = function (html, opts) {
    opts = opts || {};
    const d = document.createElement('dialog');
    d.className = 'modal';
    d.setAttribute('aria-labelledby', 'modal-title');
    d.innerHTML = '<div class="modal__body">' + html + '</div><button type="button" class="modal__close" data-close aria-label="Zamknij okno">' + I('close', 22) + '</button>';
    document.body.appendChild(d);
    const opener = document.activeElement;
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
    });
    d.addEventListener('close', function () { d.remove(); if (opener && opener.focus && document.contains(opener)) opener.focus(); });
    d.showModal();
    const first = d.querySelector(opts.focus || '.btn, a, button');
    if (first) first.focus();
    return d;
  };

  ui.focusMain = function () {
    const h = document.querySelector('#main h1');
    const target = h || document.getElementById('main');
    if (!target) return;
    if (h) h.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  ui.fieldError = function (id, msg) {
    return '<p class="field-error" id="' + id + '-error">' + I('alert', 16) + '<span>' + ui.esc(msg) + '</span></p>';
  };
})(KBR.ui);
