/* ==========================================================================
   Warstwa trwałości prototypu (localStorage / sessionStorage).
   Przechowuje WYŁĄCZNIE stan demonstracyjny: konta bez haseł, sesję, bibliotekę,
   subskrypcję, szkic zamówienia. Nie przechowuje haseł ani danych kart.
   Docelowo zastępowana przez API serwera – interfejs get/set/remove zostaje.
   ========================================================================== */
KBR.storage = (function () {
  const prefix = KBR.config.storagePrefix;
  const memory = { local: {}, session: {} };

  function area(kind) {
    try {
      const s = kind === 'session' ? window.sessionStorage : window.localStorage;
      const probe = prefix + '__probe';
      s.setItem(probe, '1'); s.removeItem(probe);
      return s;
    } catch (e) { return null; }
  }

  function get(key, fallback, kind) {
    kind = kind || 'local';
    const s = area(kind);
    try {
      const raw = s ? s.getItem(prefix + key) : memory[kind][key];
      return raw == null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function set(key, value, kind) {
    kind = kind || 'local';
    const s = area(kind);
    const raw = JSON.stringify(value);
    try { if (s) s.setItem(prefix + key, raw); else memory[kind][key] = raw; } catch (e) { memory[kind][key] = raw; }
  }
  function remove(key, kind) {
    kind = kind || 'local';
    const s = area(kind);
    try { if (s) s.removeItem(prefix + key); } catch (e) { /* ignoruj */ }
    delete memory[kind][key];
  }
  function clearAll() {
    ['local', 'session'].forEach(function (kind) {
      const s = area(kind);
      memory[kind] = {};
      if (!s) return;
      try {
        Object.keys(s).filter(function (k) { return k.indexOf(prefix) === 0; }).forEach(function (k) { s.removeItem(k); });
      } catch (e) { /* ignoruj */ }
    });
  }
  return { get: get, set: set, remove: remove, clearAll: clearAll };
})();

/* Prosta magistrala zdarzeń – komponenty nasłuchują zmian stanu. */
KBR.bus = (function () {
  const handlers = {};
  return {
    on: function (evt, fn) { (handlers[evt] = handlers[evt] || []).push(fn); },
    emit: function (evt, payload) { (handlers[evt] || []).forEach(function (fn) { fn(payload); }); }
  };
})();
