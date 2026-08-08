/* ═══════════ OFFSHORE STUDIOS · BOOT (auth gate + role router) ═══════════ */
(function () {
  const C = window.OS_CONFIG, $ = id => document.getElementById(id);
  const REAL = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY);
  let sb = null;

  /* ═══════════ CINEMATIC BOOT — the machine wakes up ═══════════ */
  (function bootSequence() {
    const b = document.createElement("div"); b.id = "bootseq";
    b.innerHTML = `
      <svg viewBox="0 0 52 28" class="blogo"><polyline points="2,24 12,20 18,23 27,12 33,16 42,5 50,9" fill="none" stroke="url(#blg)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="blg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#00e8d0"/><stop offset="1" stop-color="#a98bff"/></linearGradient></defs></svg>
      <div class="btitle">${"OFFSHORE OS".split("").map((ch, i) => `<span style="animation-delay:${.9 + i * .05}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</div>
      <div class="blines mono" id="blines"></div>
      <div class="bskip mono">CLICK TO SKIP</div>`;
    document.body.appendChild(b);
    const LINES = ["WAKING THE WORLD…", "ENGINES E1–E4 · CHECK", "CLIENT VAULTS · SEALED", "COUNCIL · SEATED", "CLAUDE · ONLINE"];
    const bl = b.querySelector("#blines");
    let li = 0, killed = false;
    const typeLine = () => {
      if (killed || li >= LINES.length) return;
      const row = document.createElement("div"); bl.appendChild(row);
      const txt = LINES[li++]; let ci = 0;
      const t = setInterval(() => {
        row.textContent = txt.slice(0, ++ci) + (ci < txt.length ? "▌" : " ✓");
        if (ci >= txt.length) { clearInterval(t); setTimeout(typeLine, 160); }
      }, 22);
    };
    setTimeout(typeLine, 1100);
    const kill = () => { if (killed) return; killed = true; b.classList.add("bout"); setTimeout(() => b.remove(), 700); };
    b.addEventListener("click", kill);
    setTimeout(kill, 4200);
  })();

  /* ═══════════ HYPERSPACE — the jump to your universe ═══════════ */
  function runWarp(done) {
    const c = document.createElement("canvas"); c.id = "warpfx";
    document.body.appendChild(c);
    const x = c.getContext("2d");
    const W = c.width = innerWidth, H = c.height = innerHeight, cx = W / 2, cy = H / 2;
    const S = [...Array(420)].map(() => ({ a: Math.random() * Math.PI * 2, d: Math.random() * Math.max(W, H) * .5, s: .5 + Math.random() * 1.5 }));
    let t = 0;
    (function frame() {
      t++;
      const acc = Math.min(1, t / 55);                 /* accelerate */
      x.fillStyle = `rgba(1,7,13,${.35 - acc * .15})`; x.fillRect(0, 0, W, H);
      S.forEach(st => {
        st.d += (2 + st.d * .045) * (0.4 + acc * 2.4);
        if (st.d > Math.max(W, H)) { st.d = Math.random() * 30; st.a = Math.random() * Math.PI * 2; }
        const x1 = cx + Math.cos(st.a) * st.d, y1 = cy + Math.sin(st.a) * st.d;
        const len = 2 + st.d * .12 * acc * 2;
        const x2 = cx + Math.cos(st.a) * (st.d + len), y2 = cy + Math.sin(st.a) * (st.d + len);
        const hue = st.a > Math.PI ? "169,139,255" : "0,232,208";
        x.strokeStyle = `rgba(${hue},${.25 + acc * .6})`; x.lineWidth = st.s * (0.6 + acc);
        x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
      });
      if (t < 95) requestAnimationFrame(frame);
      else {
        x.fillStyle = "rgba(234,252,255,.95)"; x.fillRect(0, 0, W, H);  /* arrival flash */
        done();
        c.style.transition = "opacity .8s"; c.style.opacity = "0";
        setTimeout(() => c.remove(), 850);
      }
    })();
  }

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
      const prof = await profileOf(data.user);
      msg.textContent = "COORDINATES LOCKED · JUMPING";
      return runWarp(() => enter(prof));
    }
    const hit = C.LOCAL_USERS.find(u => u.email === email && u.pass === pass)
      || OS.store.get("clients", []).find(u => u.email === email && u.pass === pass);
    if (!hit) return deny("ACCESS DENIED · UNKNOWN DIVER");
    msg.textContent = "COORDINATES LOCKED · JUMPING";
    runWarp(() => enter({ email: hit.email, name: hit.name, role: hit.role, accent: hit.accent, welcome: hit.welcome, bill: hit.bill, note: hit.note }));
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
    buildRail(user); buildStatus(user); startWorld();
    const first = visibleModules(user)[0];
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
    rail.innerHTML =
      visibleModules(user).map(m =>
        `<button class="navbtn" data-id="${m.id}"><span class="ic">${m.icon}</span><span class="lb">${m.label}</span><span class="st" id="st-${m.id}"></span></button>`).join("") +
      (user.role === "admin" ? `<button class="navbtn" id="btnCust"><span class="ic">⚙</span><span class="lb">Customize</span></button>` : "") +
      `<button class="navbtn" id="btnOut"><span class="ic">⏻</span><span class="lb">Sign out</span></button>`;
    rail.onclick = e => {
      const b = e.target.closest(".navbtn"); if (!b) return;
      if (b.id === "btnOut") { location.reload(); return; }
      if (b.id === "btnCust") { openCustomize(user); return; }
      go(b.dataset.id);
    };
  }

  /* ═══════════ THE LIVING WORLD — full-viewport ecosystem ═══════════
     Bioluminescent current that breathes with the trading session:
     hunting hours run fast and aqua; off-hours drift slow and violet. */
  function startWorld() {
    const c = $("bgfx"); if (!c) return;
    const x = c.getContext("2d");
    let W, H, mx = .5, my = .5;
    const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; rs();
    addEventListener("resize", rs);
    addEventListener("pointermove", e => { mx = e.clientX / W; my = e.clientY / H; }, { passive: true });
    const P = [...Array(120)].map(() => ({
      x: Math.random(), y: Math.random(), z: .3 + Math.random() * .7,
      s: .6 + Math.random() * 1.8, ph: Math.random() * 7, hue: Math.random()
    }));
    const AUR = [
      { x: .15, y: .2, r: .5, c: "0,232,208", sp: .00011 },
      { x: .85, y: .75, r: .45, c: "169,139,255", sp: .00008 },
      { x: .55, y: .05, r: .38, c: "76,220,255", sp: .00014 }
    ];
    let t = 0;
    const isLive = () => {
      const n = OS.nyNow();
      return n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
    };
    (function frame() {
      if (!document.getElementById("bgfx")) return;
      requestAnimationFrame(frame);
      if (document.hidden) return;
      t++;
      const live = isLive(), speed = live ? 1.7 : 1, glow = live ? .16 : .1;
      x.clearRect(0, 0, W, H);
      /* aurora bands */
      AUR.forEach((a, i) => {
        const ax = (a.x + Math.sin(t * a.sp * 60 + i * 2) * .06 + (mx - .5) * .03 * (i + 1)) * W;
        const ay = (a.y + Math.cos(t * a.sp * 47 + i) * .05 + (my - .5) * .03 * (i + 1)) * H;
        const g = x.createRadialGradient(ax, ay, 0, ax, ay, a.r * Math.min(W, H));
        g.addColorStop(0, `rgba(${a.c},${glow})`); g.addColorStop(1, "transparent");
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      });
      /* plankton current */
      P.forEach(p => {
        p.y -= .00016 * p.z * speed;
        p.x += Math.sin(t * .004 + p.ph) * .00012 * speed;
        if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        const a = (.25 + Math.sin(t * .03 + p.ph) * .2) * p.z;
        const px = (p.x + (mx - .5) * .022 * p.z) * W, py = (p.y + (my - .5) * .022 * p.z) * H;
        x.fillStyle = p.hue > .82 ? `rgba(169,139,255,${a * .8})` : p.hue > .6 ? `rgba(76,220,255,${a * .7})` : `rgba(0,232,208,${a * .6})`;
        x.beginPath(); x.arc(px, py, p.s * p.z, 0, 7); x.fill();
      });
    })();
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
    stage.classList.remove("warpin"); void stage.offsetWidth; stage.classList.add("warpin");
    mod.mount(stage, user);
    OS.emit("nav", id);
  }
  OS.on("nav:request", go);

  function buildStatus(user) {
    const el = $("statusbar");
    const canClaude = C.MODULES.some(m => m.id === "claude" && m.roles.includes(user.role));
    /* static skeleton once — only the live values re-render (no flicker) */
    el.innerHTML =
      `<span class="brand"><svg width="26" height="14" viewBox="0 0 52 28"><polyline points="2,24 12,20 18,23 27,12 33,16 42,5 50,9" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="lg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#00e8d0"/><stop offset="1" stop-color="#a98bff"/></linearGradient></defs></svg>OFFSHORE OS</span><span class="sep"></span>` +
      `<span class="it">NY <b id="hudNY">--:--:--</b></span><span class="sep"></span>` +
      `<span class="it"><span class="dot" id="hudDot"></span><span id="hudMind">…</span></span><span class="sep"></span>` +
      `<span class="it">MODE <b class="${REAL ? "pos" : "wc"}">${REAL ? "SECURE" : "LOCAL"}</b></span>` +
      `<span class="right">` +
      (canClaude ? `<button class="qk" id="hudClaude">✦ CLAUDE</button>` : "") +
      `<canvas id="hudwave"></canvas><span class="it">${user.role.toUpperCase()}</span><span class="it"><b>${user.name}</b></span></span>`;
    const hc = document.getElementById("hudClaude");
    if (hc) hc.onclick = () => OS.emit("nav:request", "claude");
    const tick = () => {
      const n = OS.nyNow();
      const live = n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      const ny = document.getElementById("hudNY"); if (!ny) return;
      ny.textContent = `${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}:${String(n.s).padStart(2, "0")}`;
      document.getElementById("hudMind").textContent = "LIVE MIND " + (live ? "HUNTING" : "STANDING BY");
      document.getElementById("hudDot").className = "dot" + (live ? " on" : "");
    };
    tick(); setInterval(tick, 1000);
    /* heartbeat waveform */
    const wc = document.getElementById("hudwave");
    if (wc) {
      const wx = wc.getContext("2d"); wc.width = 128; wc.height = 32;
      let wt = 0;
      setInterval(() => {
        if (document.hidden || !document.getElementById("hudwave")) return;
        wt++; wx.clearRect(0, 0, 128, 32);
        for (let i = 0; i < 16; i++) {
          const h = 4 + Math.abs(Math.sin(wt * .18 + i * .55)) * 18 * (.4 + Math.random() * .6);
          wx.fillStyle = `rgba(0,232,208,${.35 + h / 40})`;
          wx.fillRect(i * 8, 16 - h / 2, 4, h);
        }
      }, 90);
    }
  }

  $("btnIn").onclick = signIn;
  ["inEmail", "inPass"].forEach(id => $(id).addEventListener("keydown", e => { if (e.key === "Enter") signIn(); }));
  realInit();
})();
