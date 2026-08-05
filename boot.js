/* ═══════════ OFFSHORE STUDIOS · BOOT (auth gate + role router) ═══════════ */
(function () {
  const C = window.OS_CONFIG, $ = id => document.getElementById(id);
  const REAL = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY);
  let sb = null;

  /* ── gate background: drifting plankton ── */
  (function () {
    const c = $("gatebg"), x = c.getContext("2d");
    const rs = () => { c.width = innerWidth; c.height = innerHeight; }; rs(); addEventListener("resize", rs);
    const P = [...Array(60)].map(() => ({ x: Math.random(), y: Math.random(), s: .5 + Math.random() * 1.6, ph: Math.random() * 7 }));
    let t = 0;
    (function draw() {
      if (!document.getElementById("gatebg")) return;
      t++; x.clearRect(0, 0, c.width, c.height);
      P.forEach(p => {
        p.y -= .00012; if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        const a = .18 + Math.sin(t * .03 + p.ph) * .14;
        x.fillStyle = `rgba(0,232,208,${Math.max(.03, a * .5)})`;
        x.beginPath(); x.arc(p.x * c.width, p.y * c.height, p.s, 0, 7); x.fill();
      });
      requestAnimationFrame(draw);
    })();
  })();

  $("gateMode").textContent = REAL ? "SECURE MODE · REAL ACCOUNTS" : "LOCAL MODE · demo identities · supabase keys not set";

  async function realInit() {
    if (!REAL) return;
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
    const { data } = await sb.auth.getSession();
    if (data && data.session) enter(await profileOf(data.session.user));
  }

  async function profileOf(u) {
    /* role lives in user_metadata.role; default trading */
    return { email: u.email, name: (u.user_metadata && u.user_metadata.name) || u.email.split("@")[0], role: (u.user_metadata && u.user_metadata.role) || "trading" };
  }

  async function signIn() {
    const email = $("inEmail").value.trim().toLowerCase(), pass = $("inPass").value;
    const msg = $("gateMsg"); msg.className = "gmsg"; msg.textContent = "AUTHENTICATING…";
    if (REAL) {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) return deny(error.message);
      return enter(await profileOf(data.user));
    }
    const hit = C.LOCAL_USERS.find(u => u.email === email && u.pass === pass)
      || OS.store.get("clients", []).find(u => u.email === email && u.pass === pass);
    if (!hit) return deny("ACCESS DENIED · UNKNOWN DIVER");
    enter({ email: hit.email, name: hit.name, role: hit.role, accent: hit.accent, welcome: hit.welcome, bill: hit.bill, note: hit.note });
  }
  function deny(t) {
    const msg = $("gateMsg"); msg.className = "gmsg err"; msg.textContent = t;
    const card = document.querySelector(".gcard");
    card.classList.remove("gshake"); void card.offsetWidth; card.classList.add("gshake");
  }

  /* ── enter the shell ── */
  function enter(user) {
    OS.setUser(user);
    /* personalization: the portal wears the client's color; admins wear their saved theme */
    const lay = OS.store.get("layout_" + user.email, {});
    const accent = user.accent || lay.accent;
    if (accent) { document.documentElement.style.setProperty("--aqua", accent); document.documentElement.style.setProperty("--bio", accent); }
    $("gate").classList.add("open");
    const app = $("app"); app.hidden = false;
    buildRail(user); buildStatus(user);
    const first = C.MODULES.find(m => m.roles.includes(user.role));
    go(first ? first.id : "livemind");
    setTimeout(() => $("gate").remove(), 900);
  }

  function visibleModules(user) {
    let list = C.MODULES.filter(m => m.roles.includes(user.role));
    /* admin's saved layout: custom order + hidden modules */
    const lay = OS.store.get("layout_" + user.email, {});
    if (lay.order) list = [...list].sort((a, b) => { const ia = lay.order.indexOf(a.id), ib = lay.order.indexOf(b.id); return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib); });
    if (lay.hidden) list = list.filter(m => !lay.hidden.includes(m.id));
    return list;
  }

  function buildRail(user) {
    const rail = $("rail");
    rail.innerHTML = `<div class="grp">Offshore Studios</div>` +
      visibleModules(user).map(m =>
        `<button class="navbtn" data-id="${m.id}"><span class="ic">${m.icon}</span>${m.label}<span class="st" id="st-${m.id}"></span></button>`).join("") +
      `<div class="grp">Session</div>` +
      (user.role === "admin" ? `<button class="navbtn" id="btnCust"><span class="ic">⚙</span>Customize</button>` : "") +
      `<button class="navbtn" id="btnOut"><span class="ic">⏻</span>Sign out</button>`;
    rail.onclick = e => {
      const b = e.target.closest(".navbtn"); if (!b) return;
      if (b.id === "btnOut") { location.reload(); return; }
      if (b.id === "btnCust") { openCustomize(user); return; }
      go(b.dataset.id);
    };
  }

  /* ── CUSTOMIZE: your dashboard, your rules ── */
  function openCustomize(user) {
    const key = "layout_" + user.email;
    const lay = OS.store.get(key, {});
    const all = C.MODULES.filter(m => m.roles.includes(user.role));
    const order = (lay.order || all.map(m => m.id)).filter(id => all.some(m => m.id === id));
    all.forEach(m => { if (!order.includes(m.id)) order.push(m.id); });
    const hidden = new Set(lay.hidden || []);
    let accent = lay.accent || "";
    const ov = document.createElement("div"); ov.className = "custov";
    const paint = () => {
      ov.innerHTML = `<div class="custpanel">
        <h3>⚙ Your dashboard, your rules</h3>
        <p class="cs">reorder, hide, recolor — saved to your account only</p>
        ${order.map((id, i) => { const m = all.find(x => x.id === id); return `
          <div class="custrow ${hidden.has(id) ? "dim" : ""}">
            <span>${m.icon} ${m.label}</span>
            <span class="cbtns">
              <button data-a="up" data-i="${i}" ${i === 0 ? "disabled" : ""}>↑</button>
              <button data-a="dn" data-i="${i}" ${i === order.length - 1 ? "disabled" : ""}>↓</button>
              <button data-a="tog" data-i="${i}">${hidden.has(id) ? "SHOW" : "HIDE"}</button>
            </span>
          </div>`; }).join("")}
        <div style="display:flex;gap:8px;align-items:center;margin:12px 0 4px">
          <span style="font-size:11px;color:var(--dim);letter-spacing:.1em">THEME</span>
          ${["", "#00e8d0", "#4cdcff", "#a98bff", "#6ef2c0", "#ffc46b", "#ff7d9d"].map(c =>
            `<span class="swatch ${accent === c ? "on" : ""}" data-c="${c}" style="background:${c || "linear-gradient(45deg,#00e8d0,#a98bff)"}"></span>`).join("")}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <button class="btn" data-a="save">SAVE</button>
          <button class="btn ghost" data-a="reset">RESET</button>
          <button class="btn ghost" data-a="close">CLOSE</button>
        </div>
      </div>`;
      ov.onclick = e => {
        if (e.target === ov) return ov.remove();
        const sw = e.target.closest(".swatch"); if (sw) { accent = sw.dataset.c; paint(); return; }
        const b = e.target.closest("button[data-a]"); if (!b) return;
        const a = b.dataset.a, i = +b.dataset.i;
        if (a === "up") { [order[i - 1], order[i]] = [order[i], order[i - 1]]; paint(); }
        if (a === "dn") { [order[i + 1], order[i]] = [order[i], order[i + 1]]; paint(); }
        if (a === "tog") { const id = order[i]; hidden.has(id) ? hidden.delete(id) : hidden.add(id); paint(); }
        if (a === "reset") { OS.store.del(key); location.reload(); }
        if (a === "close") ov.remove();
        if (a === "save") {
          OS.store.set(key, { order, hidden: [...hidden], accent });
          if (accent) { document.documentElement.style.setProperty("--aqua", accent); document.documentElement.style.setProperty("--bio", accent); }
          else { document.documentElement.style.removeProperty("--aqua"); document.documentElement.style.removeProperty("--bio"); }
          buildRail(user); ov.remove();
        }
      };
    };
    paint(); document.body.appendChild(ov);
  }

  let current = null;
  function go(id) {
    const user = OS.user(), mod = OS.get(id);
    if (!mod) return;
    if (current && OS.get(current) && OS.get(current).unmount) OS.get(current).unmount();
    current = id;
    document.querySelectorAll("#rail .navbtn").forEach(b => b.classList.toggle("on", b.dataset.id === id));
    const stage = $("stage"); stage.innerHTML = "";
    mod.mount(stage, user);
    OS.emit("nav", id);
  }
  OS.on("nav:request", go);

  function buildStatus(user) {
    const el = $("statusbar");
    const tick = () => {
      const n = OS.nyNow();
      const live = n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      el.innerHTML =
        `<span class="brand">◈ OFFSHORE STUDIOS</span><span class="sep"></span>` +
        `<span class="it">NY <b>${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}:${String(n.s).padStart(2, "0")}</b></span><span class="sep"></span>` +
        `<span class="it"><span class="dot ${live ? "on" : ""}"></span>LIVE MIND ${live ? "HUNTING" : "STANDING BY"}</span><span class="sep"></span>` +
        `<span class="it">MODE <b class="${REAL ? "pos" : "wc"}">${REAL ? "SECURE" : "LOCAL"}</b></span>` +
        `<span class="right"><span class="it">${user.role.toUpperCase()}</span><span class="it"><b>${user.name}</b></span></span>`;
    };
    tick(); setInterval(tick, 1000);
  }

  $("btnIn").onclick = signIn;
  ["inEmail", "inPass"].forEach(id => $(id).addEventListener("keydown", e => { if (e.key === "Enter") signIn(); }));
  realInit();
})();
