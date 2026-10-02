/* ==========================================================================
   Symulowane usługi kont: uwierzytelnianie, biblioteka, subskrypcja, licznik.
   UWAGA: to wyłącznie symulacja po stronie przeglądarki. Docelowe uwierzytelnianie,
   płatności i kontrola dostępu do treści wymagają implementacji serwerowej.
   Hasła NIE są zapisywane – w prototypie logowanie nie weryfikuje hasła.
   ========================================================================== */
(function () {
  const S = KBR.storage;
  const delay = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  const uid = function (p) { return p + '-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); };
  const normEmail = function (e) { return String(e || '').trim().toLowerCase(); };

  /* ---------------------------------------------------------------- Auth */
  KBR.auth = {
    currentUser: function () {
      const sess = S.get('session', null);
      if (!sess) return null;
      const users = S.get('users', {});
      return Object.values(users).find(function (u) { return u.id === sess.userId; }) || null;
    },
    findByEmail: function (email) { return S.get('users', {})[normEmail(email)] || null; },
    register: async function (data) {
      await delay(350);
      const email = normEmail(data.email);
      const users = S.get('users', {});
      if (users[email]) {
        const err = new Error('exists'); err.field = 'email';
        err.message = 'Konto z tym adresem e-mail już istnieje. Zaloguj się lub użyj innego adresu.'; throw err;
      }
      const user = {
        id: uid('u'), firstName: String(data.firstName || '').trim(), lastName: String(data.lastName || '').trim(), email: email,
        createdAt: new Date().toISOString(),
        consents: { terms: true, newsletter: !!data.newsletter, marketing: !!data.marketing },
        interests: []
      };
      users[email] = user; S.set('users', users);
      S.set('session', { userId: user.id });
      KBR.bus.emit('auth:change', user);
      return user;
    },
    login: async function (data) {
      await delay(300);
      const user = KBR.auth.findByEmail(data.email);
      if (!user) { const err = new Error('invalid'); err.message = 'Nieprawidłowy adres e-mail lub hasło.'; throw err; }
      S.set('session', { userId: user.id });
      KBR.bus.emit('auth:change', user);
      return user;
    },
    logout: function () {
      S.remove('session');
      S.remove('checkout', 'session');
      S.remove('pending', 'session');
      KBR.bus.emit('auth:change', null);
    },
    requestPasswordReset: async function () { await delay(400); return true; /* żadna wiadomość nie jest wysyłana */ },
    completePasswordReset: async function () { await delay(300); return true; },
    updateProfile: async function (patch) {
      await delay(200);
      const u = KBR.auth.currentUser(); if (!u) return null;
      const users = S.get('users', {});
      Object.assign(users[u.email], patch); S.set('users', users);
      KBR.bus.emit('auth:change', users[u.email]);
      return users[u.email];
    },
    /* Narzędzie demo: utworzenie / zalogowanie konta demonstracyjnego bez formularza. */
    demoSignIn: function (profile) {
      const users = S.get('users', {});
      const email = normEmail(profile.email);
      if (!users[email]) users[email] = { id: uid('u'), firstName: profile.firstName, lastName: profile.lastName, email: email, createdAt: new Date().toISOString(), consents: { terms: true, newsletter: false, marketing: false }, interests: [] };
      S.set('users', users); S.set('session', { userId: users[email].id });
      KBR.bus.emit('auth:change', users[email]);
      return users[email];
    }
  };

  /* ------------------------------------------------------------- Library */
  function libKey(u) { return 'library.' + u.id; }
  function readLib(u) { return S.get(libKey(u), { saved: [], recent: [] }); }
  KBR.library = {
    get: function () { const u = KBR.auth.currentUser(); return u ? readLib(u) : { saved: [], recent: [] }; },
    isSaved: function (id) { return KBR.library.get().saved.some(function (s) { return s.id === id; }); },
    save: function (id) {
      const u = KBR.auth.currentUser(); if (!u) return false;
      const lib = readLib(u);
      if (!lib.saved.some(function (s) { return s.id === id; })) {   // brak duplikatów
        lib.saved.unshift({ id: id, savedAt: new Date().toISOString() });
        S.set(libKey(u), lib);
      }
      KBR.bus.emit('library:change', { id: id, saved: true });
      return true;
    },
    remove: function (id) {
      const u = KBR.auth.currentUser(); if (!u) return false;
      const lib = readLib(u);
      lib.saved = lib.saved.filter(function (s) { return s.id !== id; });
      S.set(libKey(u), lib);
      KBR.bus.emit('library:change', { id: id, saved: false });
      return true;
    },
    recordRead: function (id) {
      const u = KBR.auth.currentUser(); if (!u) return;
      const lib = readLib(u);
      lib.recent = [{ id: id, readAt: new Date().toISOString() }].concat(lib.recent.filter(function (r) { return r.id !== id; })).slice(0, 20);
      S.set(libKey(u), lib);
    }
  };

  /* Obserwowane tematy */
  function followKey(u) { return 'follow.' + u.id; }
  KBR.follow = {
    list: function () { const u = KBR.auth.currentUser(); return u ? S.get(followKey(u), []) : []; },
    isFollowing: function (topicId) { return KBR.follow.list().some(function (f) { return f.id === topicId; }); },
    toggle: function (topicId, on) {
      const u = KBR.auth.currentUser(); if (!u) return false;
      let l = S.get(followKey(u), []);
      const has = l.some(function (f) { return f.id === topicId; });
      if (on === undefined) on = !has;
      if (on && !has) l.unshift({ id: topicId, since: new Date().toISOString() });
      if (!on) l = l.filter(function (f) { return f.id !== topicId; });
      S.set(followKey(u), l);
      KBR.bus.emit('follow:change', { id: topicId, on: on });
      return on;
    }
  };

  /* -------------------------------------------------------- Subscription */
  function subKey(u) { return 'subscription.' + u.id; }
  function ordersKey(u) { return 'orders.' + u.id; }
  KBR.subscription = {
    plan: function (id) { return KBR.config.plans.find(function (p) { return p.id === id; }) || null; },
    price: function (planId, period) { const p = KBR.subscription.plan(planId); return p ? p.prices[period] : 0; },
    get: function (user) {
      user = user || KBR.auth.currentUser(); if (!user) return null;
      const sub = S.get(subKey(user), null);
      if (!sub) return null;
      if (new Date(sub.validUntil) < new Date()) return Object.assign({}, sub, { status: 'expired' });
      return sub;
    },
    isActive: function (user) { const s = KBR.subscription.get(user); return !!s && s.status === 'active'; },
    has: function (entitlement) {
      const s = KBR.subscription.get(); if (!s || s.status !== 'active') return false;
      const p = KBR.subscription.plan(s.planId); return !!p && p.entitlements.indexOf(entitlement) !== -1;
    },
    orders: function () { const u = KBR.auth.currentUser(); return u ? S.get(ordersKey(u), []) : []; },
    recordOrder: function (order) {
      const u = KBR.auth.currentUser(); if (!u) return;
      const list = S.get(ordersKey(u), []);
      const i = list.findIndex(function (o) { return o.attemptId === order.attemptId; });
      if (i >= 0) list[i] = order; else list.unshift(order);
      S.set(ordersKey(u), list);
    },
    activate: function (order) {
      const u = KBR.auth.currentUser(); if (!u) return null;
      const months = KBR.config.periods[order.period].months;
      const start = new Date(); const until = new Date(start); until.setMonth(until.getMonth() + months);
      if (order.shipping) S.set('shipping.' + u.id, order.shipping);
      const sub = { planId: order.planId, period: order.period, status: 'active', source: 'individual',
        startedAt: start.toISOString(), validUntil: until.toISOString(), autoRenew: true, orderId: order.orderId, amount: order.amount };
      S.set(subKey(u), sub);
      KBR.bus.emit('subscription:change', sub);
      return sub;
    },
    setAutoRenew: function (on) {
      const u = KBR.auth.currentUser(); if (!u) return;
      const sub = S.get(subKey(u), null); if (!sub) return;
      sub.autoRenew = !!on; S.set(subKey(u), sub);
      KBR.bus.emit('subscription:change', sub);
    },
    shippingAddress: function () { const u = KBR.auth.currentUser(); return u ? S.get('shipping.' + u.id, null) : null; },
    setShippingAddress: function (a) { const u = KBR.auth.currentUser(); if (u) S.set('shipping.' + u.id, a); },
    /* Wysyłki kwartalnika: pierwszy tydzień marca, czerwca, września i grudnia (dane demonstracyjne) */
    shipments: function () {
      const s = KBR.subscription.get(); if (!s || s.status !== 'active') return { past: [], next: null };
      const p = KBR.subscription.plan(s.planId); if (!p || !p.print) return { past: [], next: null };
      const start = new Date(s.startedAt), now = new Date(), past = [];
      let d = new Date(start.getFullYear(), 0, 1), next = null;
      for (let i = 0; i < 40; i++) {
        const m = [2, 5, 8, 11][i % 4], y = start.getFullYear() + Math.floor(i / 4);
        d = new Date(y, m, 3);
        if (d < start) continue;
        const nr = 'Nr 0' + ((i % 4) + 1) + ' / ' + y;
        if (d <= now) past.unshift({ date: d.toISOString(), issue: nr }); else { next = { date: d.toISOString(), issue: nr }; break; }
      }
      return { past: past, next: next };
    },
    /* Narzędzie demo */
    demoActivate: function (planId) {
      KBR.subscription.activate({ planId: planId || 'cyfrowy', period: 'month', orderId: 'DEMO-' + Date.now().toString(36).toUpperCase(), amount: KBR.subscription.price(planId || 'cyfrowy', 'month') });
    },
    demoClear: function () { const u = KBR.auth.currentUser(); if (u) { S.remove(subKey(u)); KBR.bus.emit('subscription:change', null); } }
  };

  /* ----------------------------------------------- Access & meter (limit) */
  function monthKey() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }
  function meterKey() { const u = KBR.auth.currentUser(); return 'meter.' + (u ? u.id : 'guest'); }
  function readMeter() { const m = S.get(meterKey(), null); return m && m.month === monthKey() ? m : { month: monthKey(), ids: [] }; }
  KBR.access = {
    meterLimit: function () { const v = S.get('settings.meterLimit', null); return v == null ? KBR.config.meter.defaultLimit : v; },
    setMeterLimit: function (n) { S.set('settings.meterLimit', Math.max(0, parseInt(n, 10) || 0)); KBR.bus.emit('settings:change'); },
    meterState: function () { const m = readMeter(); return { used: m.ids.length, limit: KBR.access.meterLimit() }; },
    resetMeter: function () { S.remove(meterKey()); },
    /* Ocena dostępu do materiału. consume=true nalicza wyświetlenie w limicie. */
    resolve: function (m, consume) {
      const subscribed = KBR.subscription.has('premium');
      if (m.access === 'open') return { full: true, kind: 'open' };
      if (subscribed) return { full: true, kind: 'subscriber' };
      if (m.access === 'premium') return { full: false, kind: 'premium' };
      /* metered */
      const limit = KBR.access.meterLimit();
      if (limit === 0) return { full: true, kind: 'open' };
      const meter = readMeter();
      if (meter.ids.indexOf(m.id) !== -1) return { full: true, kind: 'metered', used: meter.ids.length, limit: limit };
      if (meter.ids.length < limit) {
        if (consume) { meter.ids.push(m.id); S.set(meterKey(), meter); }
        return { full: true, kind: 'metered', used: meter.ids.length + (consume ? 0 : 1), limit: limit };
      }
      return { full: false, kind: 'meter-exhausted', used: meter.ids.length, limit: limit };
    }
  };

  /* -------------------------------------------- Kontekst (powrót po akcji) */
  KBR.flow = {
    setPending: function (action) { S.set('pending', action, 'session'); },
    takePending: function () { const p = S.get('pending', null, 'session'); S.remove('pending', 'session'); return p; },
    peekPending: function () { return S.get('pending', null, 'session'); },
    setReturn: function (hash) { S.set('returnTo', hash, 'session'); },
    takeReturn: function () { const r = S.get('returnTo', null, 'session'); S.remove('returnTo', 'session'); return r; },
    peekReturn: function () { return S.get('returnTo', null, 'session'); }
  };

  /* --------------------------------------------- Zamówienie (szkic w sesji) */
  KBR.checkout = {
    get: function () { return S.get('checkout', null, 'session'); },
    start: function (planId, period, sourceId) {
      const prev = KBR.checkout.get() || {};
      const draft = Object.assign({}, prev, { planId: planId, period: period || prev.period || 'month' });
      if (sourceId !== undefined) draft.sourceId = sourceId || prev.sourceId || null;
      S.set('checkout', draft, 'session');
      return draft;
    },
    update: function (patch) { const d = Object.assign({}, KBR.checkout.get() || {}, patch); S.set('checkout', d, 'session'); return d; },
    clear: function () { S.remove('checkout', 'session'); },
    amount: function (d) { d = d || KBR.checkout.get(); return d ? KBR.subscription.price(d.planId, d.period) : 0; }
  };

  /* ------------------------------------------ Symulowany operator płatności
     Nie przyjmuje ani nie przetwarza danych kart. Wynik wybiera tester. */
  KBR.payments = {
    simulate: async function (draft, outcome) {
      await delay(1200);
      const attemptId = uid('pay');
      const order = { orderId: draft.orderId, attemptId: attemptId, planId: draft.planId, period: draft.period,
        amount: KBR.checkout.amount(draft), method: draft.method, createdAt: new Date().toISOString(),
        invoice: draft.invoice && draft.invoice.wanted ? draft.invoice : null,
        shipping: draft.shipping || null,
        status: outcome === 'success' ? 'paid' : outcome === 'failure' ? 'failed' : 'canceled' };
      if (outcome !== 'canceled') KBR.subscription.recordOrder(order);
      if (outcome === 'success') KBR.subscription.activate(order);
      return order;
    }
  };

  KBR.newsletter = {
    subscribe: async function (email) { await delay(300); const list = S.get('newsletter', []); if (list.indexOf(normEmail(email)) === -1) list.push(normEmail(email)); S.set('newsletter', list); return true; }
  };

  KBR.resetDemo = function () { S.clearAll(); KBR.bus.emit('auth:change', null); };
})();
