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
    const hit = C.LOCAL_USERS.find(u => u.email === email && u.pass === pass);
    if (!hit) return deny("ACCESS DENIED · UNKNOWN DIVER");
    enter({ email: hit.email, name: hit.name, role: hit.role });
  }
  function deny(t) {
    const msg = $("gateMsg"); msg.className = "gmsg err"; msg.textContent = t;
    const card = document.querySelector(".gcard");
    card.classList.remove("gshake"); void card.offsetWidth; card.classList.add("gshake");
  }

  /* ── enter the shell ── */
  function enter(user) {
    OS.setUser(user);
    $("gate").classList.add("open");
    const app = $("app"); app.hidden = false;
    buildRail(user); buildStatus(user);
    const first = C.MODULES.find(m => m.roles.includes(user.role));
    go(first ? first.id : "livemind");
    setTimeout(() => $("gate").remove(), 900);
  }

  function visibleModules(user) { return C.MODULES.filter(m => m.roles.includes(user.role)); }

  function buildRail(user) {
    const rail = $("rail");
    rail.innerHTML = `<div class="grp">Offshore Studios</div>` +
      visibleModules(user).map(m =>
        `<button class="navbtn" data-id="${m.id}"><span class="ic">${m.icon}</span>${m.label}<span class="st" id="st-${m.id}"></span></button>`).join("") +
      `<div class="grp">Session</div>
       <button class="navbtn" id="btnOut"><span class="ic">⏻</span>Sign out</button>`;
    rail.onclick = e => {
      const b = e.target.closest(".navbtn"); if (!b) return;
      if (b.id === "btnOut") { location.reload(); return; }
      go(b.dataset.id);
    };
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
