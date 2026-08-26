/* ═══════════ OFFSHORE STUDIOS · CORE BUS ═══════════
   Tiny kernel every module talks through. Modules never import each other —
   they register here and communicate by events. Updating one module can
   never break another. */
window.OS = (function () {
  const mods = {};            // id → module {id, mount(el,user), unmount?()}
  const subs = {};            // event → [fn]
  let user = null;

  return {
    register(mod) { mods[mod.id] = mod; },
    get(id) { return mods[id]; },
    all() { return mods; },

    on(ev, fn) { (subs[ev] = subs[ev] || []).push(fn); },
    emit(ev, data) { (subs[ev] || []).forEach(f => { try { f(data); } catch (e) { console.warn("[bus]", ev, e); } }); },

    setUser(u) { user = u; this.emit("user", u); },
    user() { return user; },

    /* persistent store (localStorage now → Supabase tables when keys land).
       Every module reads/writes through here so the swap is one change. */
    store: {
      get(k, d) { try { const v = JSON.parse(localStorage.getItem("os_" + k)); return v == null ? d : v; } catch (e) { return d; } },
      /* set() writes locally for instant UI, then syncs anything that belongs to
         the whole business up to the server. The local copy is a cache, not the
         truth — the truth lives in Supabase and follows the client to any device. */
      set(k, v) { this.setLocal(k, v); if (k === "clients") OS.cloud.queue(v); },
      setLocal(k, v) { localStorage.setItem("os_" + k, JSON.stringify(v)); OS.emit("store:" + k, v); },
      del(k) { localStorage.removeItem("os_" + k); }
    },

    /* ═══ CLOUD — every call carries the caller's real session token ═══
       The server identifies who is asking and decides what they may see or
       change. The browser is never trusted with that decision. */
    cloud: {
      base() { return String((window.OS_CONFIG || {}).RELAY_URL || "").replace(/\/claude$/, ""); },
      async token() {
        try { const { data } = await window.OS_SB.auth.getSession(); return (data && data.session && data.session.access_token) || ""; }
        catch (e) { return ""; }
      },
      /* returns the parsed reply, {error} on a refusal, or null if we simply
         aren't connected (no relay configured, or not signed in with a real account) */
      async call(route, body) {
        const b = this.base(); if (!b) return null;
        const t = await this.token(); if (!t) return null;
        try {
          const r = await fetch(b + "/" + route, {
            method: "POST", headers: { "content-type": "application/json" },
            body: JSON.stringify({ token: t, ...body })
          });
          const d = await r.json().catch(() => ({}));
          return r.ok ? d : { error: d.error || ("server " + r.status) };
        } catch (e) { return { error: "network" }; }
      },
      /* pull the book on sign-in: owners get everyone, a client gets only themselves */
      async pull(isOwner) {
        const d = await this.call("clients", { op: isOwner ? "list" : "mine" });
        if (d && d.ok && Array.isArray(d.clients)) { OS.store.setLocal("clients", d.clients); return d.clients; }
        return null;
      },
      _t: null,
      queue(list) { clearTimeout(this._t); this._t = setTimeout(() => this.flush(list), 500); },
      async flush(list) {
        const u = OS.user() || {}; const owner = u.role === "admin";
        for (const c of (list || [])) {
          if (!c || !c.email) continue;
          if (!owner && c.email !== u.email) continue;   /* never write someone else's row */
          await this.call("clients", { op: "save", email: c.email, data: c });
        }
      }
    },

    /* shared helpers */
    fmt(n) { return "$" + Math.round(n).toLocaleString(); },
    fmtM(n) { return Math.abs(n) >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : Math.abs(n) >= 1e4 ? "$" + Math.round(n / 1e3) + "k" : this.fmt(n); },
    nyNow() {
      const s = new Date().toLocaleString("en-US", { timeZone: "America/New_York", hour12: false, weekday: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const m = s.match(/(\d{2}):(\d{2}):(\d{2})/);
      return { wd: s.slice(0, 3), h: +m[1], m: +m[2], s: +m[3], dec: +m[1] + +m[2] / 60 };
    }
  };
})();
