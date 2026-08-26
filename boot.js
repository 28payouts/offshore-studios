/* ═══════════ OFFSHORE STUDIOS · BOOT (auth gate + role router) ═══════════ */
(function () {
  const C = window.OS_CONFIG, $ = id => document.getElementById(id);
  const REAL = !!(C.SUPABASE_URL && C.SUPABASE_ANON_KEY);
  let sb = null;
  window.OS_GALAXY = window.OS_GALAXY || "offshore";

  /* ── injected styles: galaxy select + feel fixes ── */
  const bs = document.createElement("style");
  bs.textContent = `
    #galsel{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:30px;padding:24px;background:
      radial-gradient(90% 70% at 50% 0%,rgba(0,232,208,.06),transparent 60%),
      radial-gradient(80% 60% at 80% 100%,rgba(169,139,255,.07),transparent 60%),#01070d;
      opacity:0;animation:gsin .7s cubic-bezier(.2,.9,.25,1) forwards}
    @keyframes gsin{to{opacity:1}}
    #galsel .gs-kick{font:700 10px 'JetBrains Mono',monospace;letter-spacing:.5em;color:var(--dim)}
    #galsel h1{font-family:Unbounded;font-size:clamp(1.4rem,3.4vw,2.3rem);font-weight:800;color:#eafcff;text-align:center;margin:0}
    #galsel .gs-row{display:flex;gap:22px;flex-wrap:wrap;justify-content:center;max-width:980px;width:100%}
    .gs-card{position:relative;flex:1 1 340px;max-width:440px;border-radius:26px;cursor:pointer;
      border:1px solid rgba(120,180,200,.16);background:#030d16;overflow:hidden;
      transition:transform .45s cubic-bezier(.2,.9,.25,1),border-color .45s,box-shadow .45s}
    .gs-card .gs-art{height:190px;background-size:cover;background-position:center 30%;
      transition:transform .8s cubic-bezier(.2,.9,.25,1);filter:saturate(1.05)}
    .gs-card:hover .gs-art,.gs-card.on .gs-art{transform:scale(1.06)}
    .gs-card:hover,.gs-card.on{transform:translateY(-6px)}
    .gs-card.on{border-color:var(--gsa,#00e8d0)}
    .gs-card.on{box-shadow:0 30px 80px -30px var(--gsa,#00e8d0)}
    .gs-fade{position:absolute;top:0;left:0;right:0;height:190px;background:linear-gradient(rgba(1,7,13,.05) 40%,#030d16)}
    .gs-body{padding:20px 24px 24px}
    .gs-name{font-family:Unbounded;font-weight:800;font-size:1.05rem;color:#eafcff;letter-spacing:.04em}
    .gs-sub{font:400 10.5px 'JetBrains Mono',monospace;letter-spacing:.22em;color:var(--dim);margin-top:6px;text-transform:uppercase}
    .gs-brief{max-height:0;overflow:hidden;transition:max-height .6s cubic-bezier(.2,.9,.25,1)}
    .gs-card.on .gs-brief{max-height:340px}
    .gs-brief ul{list-style:none;margin:16px 0 0;padding:14px 0 0;border-top:1px solid rgba(120,180,200,.12);
      display:flex;flex-direction:column;gap:9px}
    .gs-brief li{font-size:12.5px;color:var(--mut);line-height:1.55;display:flex;gap:9px}
    .gs-brief li b{color:#cfeff5;font-weight:600}
    .gs-brief li .gi{flex:0 0 16px;color:var(--gsa,#00e8d0)}
    .gs-enter{margin-top:16px;width:100%;border:0;border-radius:99px;padding:13px;cursor:pointer;
      font:700 10.5px Unbounded;letter-spacing:.28em;color:#01222b;
      background:linear-gradient(100deg,var(--gsa,#00e8d0),#4cdcff)}
    .gs-hint{font:400 10px 'JetBrains Mono',monospace;letter-spacing:.3em;color:var(--dim)}
    #stage{padding-bottom:110px}
    @media(max-width:860px){.gs-card .gs-art{height:130px}.gs-fade{height:130px}}`;
  document.head.appendChild(bs);

  /* ═══════════ CINEMATIC BOOT v5 — stardust converges into the wave ═══════════
     No cheap typed-list boot. A field of stardust is pulled out of the dark and
     forged into the Offshore wave; the signal lines print underneath; on exit the
     wave detonates back into stars. Click anywhere to skip. */
  (function bootSequence() {
    const b = document.createElement("div"); b.id = "bootseq";
    b.innerHTML = `
      <canvas id="bootcv" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
      <div class="btitle" style="position:relative;z-index:2">${"OFFSHORE OS".split("").map((ch, i) => `<span style="animation-delay:${1.6 + i * .05}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("")}</div>
      <div class="blines mono" id="blines" style="position:relative;z-index:2"></div>
      <div class="bskip mono" style="z-index:2">CLICK TO SKIP</div>`;
    document.body.appendChild(b);

    /* ── stardust forge ── */
    const cv = b.querySelector("#bootcv"), x = cv.getContext("2d");
    const W = cv.width = innerWidth * devicePixelRatio, H = cv.height = innerHeight * devicePixelRatio;
    const DP = devicePixelRatio;
    /* the wave, sampled into targets */
    const PTS = [[2,24],[12,20],[18,23],[27,12],[33,16],[42,5],[50,9]];
    const scale = Math.min(W * .34 / 52, H * .2 / 28), ox = W / 2 - 26 * scale, oy = H * .40 - 14 * scale;
    const targets = [];
    for (let s = 0; s < PTS.length - 1; s++) {
      const [ax, ay] = PTS[s], [bx2, by2] = PTS[s + 1];
      const segLen = Math.hypot(bx2 - ax, by2 - ay), n = Math.max(6, Math.round(segLen * 1.6));
      for (let i = 0; i < n; i++) {
        const f = i / n;
        targets.push({ x: ox + (ax + (bx2 - ax) * f) * scale, y: oy + (ay + (by2 - ay) * f) * scale });
      }
    }
    const P = targets.map((tg, i) => {
      const a = Math.random() * Math.PI * 2, d = (0.4 + Math.random() * 0.7) * Math.max(W, H) * .6;
      return { x: W / 2 + Math.cos(a) * d, y: H / 2 + Math.sin(a) * d, tx: tg.x, ty: tg.y,
        delay: (i / targets.length) * 26 + Math.random() * 14, s: (1 + Math.random() * 1.8) * DP,
        hue: Math.random() < .5 ? "0,232,208" : "169,139,255", vx: 0, vy: 0 };
    });
    let t = 0, killed = false, exploded = false;
    (function frame() {
      if (!document.contains(cv)) return;
      requestAnimationFrame(frame);
      t++;
      x.fillStyle = "rgba(1,4,8,.26)"; x.fillRect(0, 0, W, H);   /* trails */
      let locked = 0;
      P.forEach(p => {
        if (exploded) { p.x += p.vx; p.y += p.vy; p.vx *= 1.04; p.vy *= 1.04; }
        else if (t > p.delay) {
          const e = .085;                                        /* magnetic pull */
          p.x += (p.tx - p.x) * e; p.y += (p.ty - p.y) * e;
          if (Math.abs(p.tx - p.x) < 2 * DP && Math.abs(p.ty - p.y) < 2 * DP) locked++;
        }
        const a2 = exploded ? .9 : Math.min(1, Math.max(.12, 1 - Math.hypot(p.tx - p.x, p.ty - p.y) / (300 * DP)));
        x.fillStyle = `rgba(${p.hue},${a2})`;
        x.beginPath(); x.arc(p.x, p.y, p.s, 0, 7); x.fill();
      });
      /* once the wave is forged, stroke the spine + breathe a glow along it */
      if (!exploded && locked > targets.length * .82) {
        const g = x.createLinearGradient(ox, oy + 28 * scale, ox + 52 * scale, oy);
        g.addColorStop(0, "#00e8d0"); g.addColorStop(1, "#a98bff");
        x.strokeStyle = g; x.lineWidth = 2.4 * DP; x.lineCap = x.lineJoin = "round";
        x.shadowColor = "rgba(0,232,208,.8)"; x.shadowBlur = 10 * DP;
        x.beginPath(); PTS.forEach(([px2, py2], i) => { const X = ox + px2 * scale, Y = oy + py2 * scale; i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.stroke();
        x.shadowBlur = 0;
        /* pulse of light travelling the wave */
        const pf = (t * .016) % 1; let acc = 0, total = 0;
        for (let s = 0; s < PTS.length - 1; s++) total += Math.hypot(PTS[s+1][0]-PTS[s][0], PTS[s+1][1]-PTS[s][1]);
        for (let s = 0; s < PTS.length - 1; s++) {
          const L = Math.hypot(PTS[s+1][0]-PTS[s][0], PTS[s+1][1]-PTS[s][1]);
          if (pf * total <= acc + L) {
            const f = (pf * total - acc) / L;
            const X = ox + (PTS[s][0] + (PTS[s+1][0]-PTS[s][0]) * f) * scale, Y = oy + (PTS[s][1] + (PTS[s+1][1]-PTS[s][1]) * f) * scale;
            const rg = x.createRadialGradient(X, Y, 0, X, Y, 26 * DP);
            rg.addColorStop(0, "rgba(234,252,255,.95)"); rg.addColorStop(1, "transparent");
            x.fillStyle = rg; x.beginPath(); x.arc(X, Y, 26 * DP, 0, 7); x.fill();
            break;
          }
          acc += L;
        }
      }
    })();

    /* ── signal lines ── */
    const LINES = ["WAKING THE WORLD…", "ENGINES E1–E4 · CHECK", "CLIENT VAULTS · SEALED", "COUNCIL · SEATED", "CLAUDE · ONLINE"];
    const bl = b.querySelector("#blines");
    let li = 0;
    const typeLine = () => {
      if (killed || li >= LINES.length) return;
      const row = document.createElement("div"); bl.appendChild(row);
      const txt = LINES[li++]; let ci = 0;
      const tv = setInterval(() => {
        row.textContent = txt.slice(0, ++ci) + (ci < txt.length ? "▌" : " ✓");
        if (ci >= txt.length) { clearInterval(tv); setTimeout(typeLine, 130); }
      }, 18);
    };
    setTimeout(typeLine, 1500);

    /* ── exit: the wave detonates back into stardust ── */
    const kill = () => {
      if (killed) return; killed = true; exploded = true;
      P.forEach(p => { const a = Math.random() * Math.PI * 2, v = (1.5 + Math.random() * 5) * DP; p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; });
      b.classList.add("bout"); setTimeout(() => b.remove(), 750);
    };
    b.addEventListener("click", kill);
    setTimeout(kill, 4600);
  })();

  /* ═══════════ HYPERSPACE — the jump to your universe ═══════════ */
  function runWarp(done) {
    /* GUARANTEE: the warp can never strand anyone on a black screen.
       If the animation stalls (throttled tab, hidden window), the user
       still lands in their universe within 3 seconds. */
    let fired = false;
    const fire = () => { if (!fired) { fired = true; done(); } };
    const guard = setTimeout(fire, 3000);
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
        /* arrival: soft radial burst, not a hard white slap */
        const fl = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * .7);
        fl.addColorStop(0, "rgba(234,252,255,.9)"); fl.addColorStop(.5, "rgba(0,232,208,.35)"); fl.addColorStop(1, "rgba(1,7,13,0)");
        x.fillStyle = fl; x.fillRect(0, 0, W, H);
        clearTimeout(guard); fire();
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

  $("gateMode").textContent = REAL ? "SECURE MODE · SUPABASE LINKED" : "LOCAL MODE · demo identities · supabase keys not set";

  async function realInit() {
    if (!REAL) return;
    try {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js";
        s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
      sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);
      window.OS_SB = sb; /* modules (fills feed, client vaults) share the client */
      /* getUser() asks the SERVER for the live profile — a stale token from before
         a role/metadata change can never lock someone into the wrong universe.
         Resume goes through arrive() so admins still get the universe select. */
      const { data } = await sb.auth.getUser();
      if (data && data.user) arrive(await profileOf(data.user), $("gateMsg") || { textContent: "" });
    } catch (e) { /* CDN unreachable — gate still works through the bridge */ }
  }

  async function profileOf(u) {
    /* role lives in user_metadata.role; default trading.
       FAILSAFE: ADMIN_EMAILS are always full admins — a missing/mismatched
       metadata row can never lock the owner out of their own software. */
    const md = u.user_metadata || {};
    const forced = (C.ADMIN_EMAILS || []).includes(String(u.email || "").toLowerCase());
    return {
      email: u.email,
      name: md.name || u.email.split("@")[0],
      role: forced ? "admin" : (md.role || "trading"),
      gals: md.gals || (forced ? ["harmonic", "offshore"] : undefined)
    };
  }

  async function signIn() {
    const email = $("inEmail").value.trim().toLowerCase(), pass = $("inPass").value;
    const msg = $("gateMsg"); msg.className = "gmsg"; msg.textContent = "AUTHENTICATING…";
    if (REAL && sb) {
      /* real accounts first — Supabase Auth is the front door now */
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (!error) return arrive(await profileOf(data.user), msg);
      } catch (e) { /* network/CDN hiccup — fall through to the bridge */ }
      /* BRIDGE: until every account exists in Supabase, the local book still
         opens the door. Remove LOCAL_USERS from config once accounts are made. */
    }
    const hit = C.LOCAL_USERS.find(u => u.email === email && u.pass === pass)
      || OS.store.get("clients", []).find(u => u.email === email && u.pass === pass);
    if (!hit) return deny("ACCESS DENIED · UNKNOWN DIVER");
    arrive({ email: hit.email, name: hit.name, role: hit.role, accent: hit.accent, welcome: hit.welcome, bill: hit.bill, note: hit.note, gals: hit.gals }, msg);
  }

  /* admins pick a work-life first; single-universe accounts and clients jump straight in.
     gals is the allowlist — Mr John carries ["harmonic"] and never sees Offshore Studios. */
  function arrive(prof, msg) {
    const allowed = prof.role === "admin" ? (prof.gals || ["harmonic", "offshore"]) : null;
    if (prof.role === "admin" && allowed.length > 1) {
      msg.textContent = "IDENTITY CONFIRMED · CHOOSE YOUR UNIVERSE";
      const g = $("gate"); if (g) { g.style.transition = "opacity .6s"; g.style.opacity = "0"; setTimeout(() => g.remove(), 650); }
      showGalaxySelect(prof);
    } else {
      window.OS_GALAXY = prof.role === "admin" ? allowed[0] : (prof.role === "trading" ? "harmonic" : "offshore");
      msg.textContent = "COORDINATES LOCKED · JUMPING";
      runWarp(() => enter(prof));
    }
  }

  /* ═══════════ THE TWO WORK-LIVES — pick a universe ═══════════ */
  function showGalaxySelect(user) {
    const old = $("galsel"); if (old) old.remove();
    const clients = OS.store.get("clients", []);
    const agencyN = clients.filter(c => c.role === "agency").length;
    const BRIEF = {
      harmonic: [
        ["〰", "The Live Mind", "frozen 27 Jul · backtested $10.0M / 10y · sim gate 0/60"],
        ["◎", "Sim connection", "awaiting TradingView webhook plan — then real fills light the desk"],
        ["✺", "Harmonic Academy", "LIVE · harmonic-academy.netlify.app"],
        ["✳", "AI & Agents", "constellation online"],
        ["→", "Next move", "webhook relay + fill log → the 0/60 gate starts counting"]
      ],
      offshore: [
        ["⬡", "Round Table", "5 minds seated · goes fully live with the API key"],
        ["❖", "Clients", clients.length + " onboarded · real count, no fakes"],
        ["◍", "Studios Agency", "site LIVE · book of work: " + (agencyN || "empty on purpose")],
        ["✦", "Claude", "resident · wired into every screen"],
        ["→", "Next move", "Supabase keys → sealed client vaults + real accounts"]
      ]
    };
    const gs = document.createElement("div"); gs.id = "galsel";
    gs.innerHTML = `
      <div class="gs-kick">WELCOME BACK, ${user.name.toUpperCase()}</div>
      <h1>Your universes. <span class="grad">One command deck.</span></h1>
      <div class="gs-row">
        ${["harmonic", "offshore"].filter(k => !user.gals || user.gals.includes(k)).map(k => { const G = C.GALAXIES[k]; return `
        <div class="gs-card" data-g="${k}" style="--gsa:${G.accent}">
          <div class="gs-art" style="background-image:url('${G.art}')"></div><div class="gs-fade"></div>
          <div class="gs-body">
            <div class="gs-name">${G.name}</div>
            <div class="gs-sub">${G.sub}</div>
            <div class="gs-brief">
              <ul>${BRIEF[k].map(([ic, t, d]) => `<li><span class="gi">${ic}</span><span><b>${t}</b> — ${d}</span></li>`).join("")}</ul>
              <button class="gs-enter">ENTER ${G.name} →</button>
            </div>
          </div>
        </div>`; }).join("")}
      </div>
      <div class="gs-hint">CLICK A UNIVERSE FOR ITS BRIEFING · ENTER TO JUMP</div>`;
    document.body.appendChild(gs);
    gs.addEventListener("click", e => {
      const enterBtn = e.target.closest(".gs-enter");
      const card = e.target.closest(".gs-card");
      if (enterBtn && card) {
        window.OS_GALAXY = card.dataset.g;
        gs.style.transition = "opacity .45s"; gs.style.opacity = "0";
        setTimeout(() => gs.remove(), 480);
        runWarp(() => enter(user));
        return;
      }
      if (card) gs.querySelectorAll(".gs-card").forEach(c => c.classList.toggle("on", c === card));
    });
  }
  function deny(t) {
    const msg = $("gateMsg"); msg.className = "gmsg err"; msg.textContent = t;
    const card = document.querySelector(".gcard");
    card.classList.remove("gshake"); void card.offsetWidth; card.classList.add("gshake");
  }

  /* ── enter the shell (re-entrant: also used when switching universes) ── */
  function enter(user) {
    OS.setUser(user);
    /* personalization: the portal wears the client's color; admins wear their saved theme */
    const lay = OS.store.get("layout_" + user.email, {});
    const accent = user.accent || lay.accent;
    if (accent) { document.documentElement.style.setProperty("--aqua", accent); document.documentElement.style.setProperty("--bio", accent); }
    const g = $("gate");
    if (g) { g.classList.add("open"); setTimeout(() => g.remove(), 900); }
    const app = $("app"); app.hidden = false;
    buildRail(user); buildStatus(user); startWorld();
    const first = visibleModules(user)[0];
    go(first ? first.id : "livemind");
  }

  function visibleModules(user) {
    const gal = window.OS_GALAXY || "offshore";
    let list = C.MODULES.filter(m => m.roles.includes(user.role) &&
      (!m.galaxy || m.galaxy === "both" || m.galaxy === gal));
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
      (user.role === "admin" && (!user.gals || user.gals.length > 1) ? `<button class="navbtn" id="btnGal"><span class="ic">⇄</span><span class="lb">Universes</span></button>` : "") +
      (user.role === "admin" ? `<button class="navbtn" id="btnCust"><span class="ic">⚙</span><span class="lb">Customize</span></button>` : "") +
      `<button class="navbtn" id="btnOut"><span class="ic">⏻</span><span class="lb">Sign out</span></button>`;
    rail.onclick = e => {
      const b = e.target.closest(".navbtn"); if (!b) return;
      if (b.id === "btnOut") { location.reload(); return; }
      if (b.id === "btnCust") { openCustomize(user); return; }
      if (b.id === "btnGal") { showGalaxySelect(user); return; }
      go(b.dataset.id);
    };
  }

  /* ═══════════ THE LIVING WORLD — full-viewport ecosystem ═══════════
     Bioluminescent current that breathes with the trading session:
     hunting hours run fast and aqua; off-hours drift slow and violet. */
  function startWorld() {
    if (window.__worldOn) return; window.__worldOn = true;   /* one ambient loop, ever */
    const c = $("bgfx"); if (!c) return;
    const x = c.getContext("2d");
    let W, H, mx = .5, my = .5;
    const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; rs();
    addEventListener("resize", rs);
    addEventListener("pointermove", e => { mx = e.clientX / W; my = e.clientY / H; }, { passive: true });
    const P = [...Array(80)].map(() => ({
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
    let fskip = 0;
    (function frame() {
      if (!document.getElementById("bgfx")) { window.__worldOn = false; return; }
      requestAnimationFrame(frame);
      if (document.hidden) return;
      if (fskip++ & 1) return;                       /* ambient layer runs at 30fps — zero jank */
      t += 2;
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
    if (window.__statusTimers) window.__statusTimers.forEach(clearInterval);
    window.__statusTimers = [];
    const gal = C.GALAXIES && C.GALAXIES[window.OS_GALAXY || "offshore"];
    const canClaude = C.MODULES.some(m => m.id === "claude" && m.roles.includes(user.role));
    /* static skeleton once — only the live values re-render (no flicker) */
    el.innerHTML =
      `<span class="brand"><svg width="26" height="14" viewBox="0 0 52 28"><polyline points="2,24 12,20 18,23 27,12 33,16 42,5 50,9" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><defs><linearGradient id="lg" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#00e8d0"/><stop offset="1" stop-color="#a98bff"/></linearGradient></defs></svg>OFFSHORE OS</span><span class="sep"></span>` +
      (gal ? `<span class="it" style="color:${gal.accent};font-weight:700">◈ ${gal.name}</span><span class="sep"></span>` : "") +
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
    tick(); window.__statusTimers.push(setInterval(tick, 1000));
    /* heartbeat waveform */
    const wc = document.getElementById("hudwave");
    if (wc) {
      const wx = wc.getContext("2d"); wc.width = 128; wc.height = 32;
      let wt = 0;
      window.__statusTimers.push(setInterval(() => {
        if (document.hidden || !document.getElementById("hudwave")) return;
        wt++; wx.clearRect(0, 0, 128, 32);
        for (let i = 0; i < 16; i++) {
          const h = 4 + Math.abs(Math.sin(wt * .18 + i * .55)) * 18 * (.4 + Math.random() * .6);
          wx.fillStyle = `rgba(0,232,208,${.35 + h / 40})`;
          wx.fillRect(i * 8, 16 - h / 2, 4, h);
        }
      }, 90));
    }
  }

  $("btnIn").onclick = signIn;
  ["inEmail", "inPass"].forEach(id => $(id).addEventListener("keydown", e => { if (e.key === "Enter") signIn(); }));
  /* GUEST PASS: anyone can explore the showcase universe — no account, no data */
  const bg = $("btnGuest");
  if (bg) bg.onclick = () => arrive({ email: "guest@offshore", name: "Explorer", role: "guest" }, $("gateMsg"));
  realInit();
})();
