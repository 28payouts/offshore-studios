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
      set(k, v) { localStorage.setItem("os_" + k, JSON.stringify(v)); OS.emit("store:" + k, v); },
      del(k) { localStorage.removeItem("os_" + k); }
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
