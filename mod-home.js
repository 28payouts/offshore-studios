/* ═══════════ MODULE · THE UNIVERSE (admin home) ═══════════
   Your empire as deep space. Every system is a PLANET around the sun-core:
   shaded spheres, rings, atmospheres — your clients orbit the Clients world
   as moons, your projects are born as new planets. Hover to wake a world,
   click to jump in. */
OS.register({
  id: "home",
  _raf: null, _timers: [],
  mount(el, user) {
    const GAL = window.OS_GALAXY || "offshore";
    const GNAME = GAL === "harmonic" ? "Harmonic" : "Offshore Studios";
    const projects = () => OS.store.get("projects", []).filter(p => (p.gal || "offshore") === GAL);
    const allProjects = () => OS.store.get("projects", []);
    const clients = () => OS.store.get("clients", []);
    let showForm = false, selected = null;

    /* Riley's own online businesses live as planets in HIS Offshore universe */
    if (GAL === "offshore" && /riley/i.test(user.email)) {
      const all = OS.store.get("projects", []);
      [["LedgerLab", "#ffc46b", "Riley's online business · details land as it builds"],
       ["Remeve", "#ff7d9d", "Riley's online business · details land as it builds"]].forEach(([nm, c, note]) => {
        if (!all.some(p => p.name === nm)) all.push({ name: nm, gal: "offshore", color: c, note, link: "", created: Date.now() });
      });
      OS.store.set("projects", all);
    }

    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">The ${GNAME} Universe · ${user.name}</div>
      <h2>Your empire,<br><span class="grad">seen from space.</span></h2>
      <p class="sub">${GAL === "harmonic"
        ? "The trading bot, the projects, the agents — Harmonic's worlds in orbit. Spawn a project and watch a new planet ignite."
        : "Every system is a world orbiting the core. Your clients ride the Clients world as moons. Spawn a project and watch a new planet ignite."}</p>
    </div>

    <div id="orbwrap" class="reveal">
      <canvas id="orbmap"></canvas>
      <div id="orbhint">HOVER A WORLD · CLICK TO JUMP</div>
    </div>

    <div id="projPanel"></div>

    <div style="display:flex;gap:10px;margin:4px 0 22px" class="reveal">
      <button class="btn ghost" id="btnNewProj">✚ IGNITE A NEW PLANET</button>
    </div>
    <div id="projForm"></div>

    <div class="cards reveal">
      <div class="card"><div class="stat"><div class="k">Backtested · 18y</div><div class="v pos" data-count="10015774" data-fmt="m">$0</div><div class="s">verified bar-by-bar · frozen 27 Jul</div></div></div>
      <div class="card"><div class="stat"><div class="k">Win rate</div><div class="v" data-count="56.2" data-fmt="pct">0%</div><div class="s">6,164 trades · PF 1.66</div></div></div>
      <div class="card"><div class="stat"><div class="k">Max drawdown</div><div class="v wc" data-count="16.9" data-fmt="pct">0%</div><div class="s">never worse, eighteen years</div></div></div>
      ${GAL === "offshore" ? `<div class="card"><div class="stat"><div class="k">Client moons</div><div class="v aq" data-count="${clients().length}" data-fmt="n">0</div><div class="s">in orbit around the Clients world</div></div></div>`
      : `<div class="card"><div class="stat"><div class="k">Sim gate</div><div class="v aq">0 / 60</div><div class="s">verified sim trades unlock live capital</div></div></div>`}
      <div class="card"><div class="stat"><div class="k">Planets ignited</div><div class="v bio" data-count="${projects().length}" data-fmt="n">0</div><div class="s">and room for a galaxy</div></div></div>
    </div>

    <div class="cards reveal" style="margin-top:15px;grid-template-columns:1fr 1fr">
      <div class="card">
        <h3>The day, as the Mind sees it</h3><p class="cs">live NY session dial</p>
        <div id="dialwrap"><canvas id="sessdial"></canvas>
          <div><div id="hmSess" style="font-weight:700;font-size:14.5px;margin-bottom:5px">—</div>
          <div id="hmSessNote" style="font-size:12.5px;color:var(--mut);line-height:1.7"></div></div></div>
      </div>
      <div class="card">
        <h3>Next on the horizon</h3><p class="cs">the road we're on</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2">
          ① Supabase keys → real accounts, sealed client vaults<br>
          ② TradingView webhooks → real fills light up the Live Mind<br>
          ③ Spline scenes → true 3D worlds beyond the canvas<br>
          ④ Client-side galaxy — their own beautiful worlds</div>
      </div>
    </div>`;

    /* ── count-up ── */
    el.querySelectorAll("[data-count]").forEach(n => {
      const target = +n.dataset.count, fmt = n.dataset.fmt; let st = null;
      const step = ts => {
        if (!st) st = ts; const p = Math.min(1, (ts - st) / 1400), e = 1 - Math.pow(1 - p, 3), v = target * e;
        n.textContent = fmt === "m" ? "$" + (v / 1e6).toFixed(2) + "M" : fmt === "pct" ? v.toFixed(1) + "%" : Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    /* ═══════════ THE UNIVERSE CANVAS ═══════════ */
    const cv = el.querySelector("#orbmap"), x = cv.getContext("2d");
    let W = 0, H = 0, DPR = Math.min(1.5, devicePixelRatio || 1), mx = -1, my = -1, t = 0;
    const size = () => { const r = cv.getBoundingClientRect(); W = cv.width = r.width * DPR; H = cv.height = r.height * DPR; };
    size(); addEventListener("resize", size);

    /* starfield + nebulas (precomputed) */
    const STARS = [...Array(160)].map(() => ({ x: Math.random(), y: Math.random(), s: Math.random() * 1.4 + .3, ph: Math.random() * 7, z: .4 + Math.random() * .6 }));
    const NEB = [{ x: .18, y: .3, r: .34, c: "76,220,255" }, { x: .82, y: .62, r: .3, c: "169,139,255" }, { x: .5, y: .1, r: .26, c: "0,232,208" }];
    let shoot = null;

    /* worlds: modules + projects. Each world has a planetary character. */
    const FLAVOR = {
      livemind: { col: "#00e8d0", ring: true,  moons: 0 },
      claude:   { col: "#a98bff", ring: false, moons: 1 },
      table:    { col: "#ff7d9d", ring: true,  moons: 0 },
      clients:  { col: "#4cdcff", ring: false, moons: 0 }, /* moons = real clients */
      agency:   { col: "#6ef2c0", ring: true,  moons: 1 },
      agents:   { col: "#ffc46b", ring: false, moons: 2 },
      botlab:   { col: "#ff7d9d", ring: true,  moons: 1 },
      academy:  { col: "#4cdcff", ring: false, moons: 1 }
    };
    /* Higgsfield-rendered worlds — real AI planet art, hotlinked from their CDN */
    const HF = "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/";
    const ART = {
      livemind: HF + "hf_20260821_175515_f25e921c-0e59-4a4b-b82c-95be8cdeaa03.png",
      claude:   HF + "hf_20260821_175515_0e57f17a-e1ff-4552-9a88-79c5bb294254.png",
      table:    HF + "hf_20260821_175515_ac39776a-7b90-47ab-b274-95ad8c3a2811.png",
      clients:  HF + "hf_20260821_175515_2505b7fc-ce7e-4b1b-a754-57c1ad89f6c5.png",
      agency:   HF + "hf_20260821_175515_9be9daca-e377-4d99-b8b3-4fa694716da2.png",
      agents:   HF + "hf_20260821_175515_cc9daaa4-9354-4b32-b933-adefb0b5b9ed.png",
      /* harmonic-only worlds reuse offshore-only art — the two never share a sky */
      botlab:   HF + "hf_20260821_175515_ac39776a-7b90-47ab-b274-95ad8c3a2811.png",
      academy:  HF + "hf_20260821_175515_2505b7fc-ce7e-4b1b-a754-57c1ad89f6c5.png"
    };
    const ARTPOOL = Object.values(ART);
    /* PERF: the renders are 2048px — scaling them every frame is what lags.
       Pre-render each once to a 256px sprite; the draw loop only ever touches sprites. */
    const IMGS = {};
    const pimg = u => {
      if (!IMGS[u]) {
        const rec = { cv: null };
        const i = new Image();
        i.onload = () => {
          const c = document.createElement("canvas"); c.width = c.height = 256;
          c.getContext("2d").drawImage(i, 0, 0, 256, 256);
          rec.cv = c;
        };
        i.src = u; IMGS[u] = rec;
      }
      return IMGS[u];
    };
    ARTPOOL.forEach(pimg); /* pre-warm */
    const bodies = () => {
      const mods = window.OS_CONFIG.MODULES.filter(m => m.id !== "home" && m.roles.includes(user.role) &&
        (!m.galaxy || m.galaxy === "both" || m.galaxy === GAL));
      const list = mods.map((m, i) => {
        const f = FLAVOR[m.id] || { col: "#4cdcff", ring: false, moons: 0 };
        return { kind: "mod", id: m.id, label: m.label.toUpperCase(), col: f.col, ring: f.ring, img: ART[m.id],
          moons: m.id === "clients" ? clients().map(c => c.accent || "#4cdcff").slice(0, 6) : Array(f.moons).fill("#8fb4c4"),
          a: (i / mods.length) * Math.PI * 2 + .35, rx: .30 + (i % 3) * .06, ry: .27 + ((i + 1) % 3) * .05,
          sp: .0013 + i * .00035, r: 17 + (i % 2) * 4 };
      });
      projects().forEach((p, i) => list.push({
        kind: "proj", id: "p" + i, pi: i, label: p.name.toUpperCase(), col: p.color || "#ffc46b",
        img: ARTPOOL[i % ARTPOOL.length],
        ring: i % 2 === 0, moons: [], a: 1.2 + i * 1.7, rx: .43, ry: .38, sp: .0009 + i * .00025, r: 12
      }));
      return list;
    };
    let B = bodies();
    OS.on("store:projects", () => { B = bodies(); });
    OS.on("store:clients", () => { B = bodies(); });

    /* draw one shaded planet with optional ring + moons */
    const planet = (px, py, R, col, b) => {
      /* atmosphere */
      const at = x.createRadialGradient(px, py, R * .6, px, py, R * 2);
      at.addColorStop(0, col + "40"); at.addColorStop(1, "transparent");
      x.fillStyle = at; x.beginPath(); x.arc(px, py, R * 2, 0, 7); x.fill();
      /* back moons + back ring */
      const moonPos = (b.moons || []).map((mc, i) => {
        const ma = t * (.02 + i * .006) + i * 2.1;
        return { mc, mxp: px + Math.cos(ma) * R * 2.1, myp: py + Math.sin(ma) * R * .7, front: Math.sin(ma) >= 0 };
      });
      moonPos.filter(m => !m.front).forEach(m => { x.fillStyle = m.mc; x.beginPath(); x.arc(m.mxp, m.myp, R * .18, 0, 7); x.fill(); });
      if (b.ring) { x.strokeStyle = col + "55"; x.lineWidth = 2.4 * DPR; x.save(); x.translate(px, py); x.rotate(-.35);
        x.beginPath(); x.ellipse(0, 0, R * 1.75, R * .5, 0, Math.PI, Math.PI * 2); x.stroke(); x.restore(); }
      /* the world itself: pre-rendered Higgsfield sprite, shaded sphere as fallback */
      const im = b.img ? pimg(b.img) : null;
      if (im && im.cv) {
        x.save(); x.beginPath(); x.arc(px, py, R, 0, 7); x.clip();
        x.drawImage(im.cv, px - R * 1.02, py - R * 1.02, R * 2.04, R * 2.04);
        x.restore();
        /* soft accent rim so every world still wears its color */
        const rim = x.createRadialGradient(px - R * .5, py - R * .5, R * .55, px, py, R * 1.02);
        rim.addColorStop(0, "transparent"); rim.addColorStop(.85, "transparent"); rim.addColorStop(1, col + "66");
        x.fillStyle = rim; x.beginPath(); x.arc(px, py, R, 0, 7); x.fill();
      } else {
        const g = x.createRadialGradient(px - R * .45, py - R * .45, R * .1, px, py, R * 1.15);
        g.addColorStop(0, "#f2ffff"); g.addColorStop(.28, col); g.addColorStop(.75, col + "88"); g.addColorStop(1, "#030d16");
        x.fillStyle = g; x.beginPath(); x.arc(px, py, R, 0, 7); x.fill();
        const sh = x.createRadialGradient(px + R * .7, py + R * .7, 0, px, py, R * 1.4);
        sh.addColorStop(0, "rgba(1,7,13,.65)"); sh.addColorStop(.55, "transparent");
        x.fillStyle = sh; x.beginPath(); x.arc(px, py, R, 0, 7); x.fill();
      }
      /* front ring + front moons */
      if (b.ring) { x.strokeStyle = col + "AA"; x.lineWidth = 2.8 * DPR; x.save(); x.translate(px, py); x.rotate(-.35);
        x.beginPath(); x.ellipse(0, 0, R * 1.75, R * .5, 0, 0, Math.PI); x.stroke(); x.restore(); }
      moonPos.filter(m => m.front).forEach(m => {
        const mg = x.createRadialGradient(m.mxp - 2, m.myp - 2, 0, m.mxp, m.myp, R * .26);
        mg.addColorStop(0, "#fff"); mg.addColorStop(.5, m.mc); mg.addColorStop(1, "transparent");
        x.fillStyle = mg; x.beginPath(); x.arc(m.mxp, m.myp, R * .26, 0, 7); x.fill();
      });
    };

    let fskip = 0;
    const draw = () => {
      this._raf = requestAnimationFrame(draw);
      if (document.hidden || !document.contains(cv)) return;
      if (fskip++ & 1) return;              /* 30fps universe — silky, half the GPU */
      t += 2; x.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * .47;
      const live = (() => { const n = OS.nyNow(); return n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16)); })();

      /* nebulas */
      NEB.forEach((nb, i) => {
        const g = x.createRadialGradient(nb.x * W, nb.y * H, 0, nb.x * W, nb.y * H, nb.r * W);
        g.addColorStop(0, `rgba(${nb.c},${.05 + Math.sin(t * .004 + i) * .015})`); g.addColorStop(1, "transparent");
        x.fillStyle = g; x.fillRect(0, 0, W, H);
      });
      /* stars */
      STARS.forEach(s => {
        const a = (.3 + Math.sin(t * .02 + s.ph) * .25) * s.z;
        x.fillStyle = `rgba(234,252,255,${a})`;
        x.beginPath(); x.arc(s.x * W, s.y * H, s.s * DPR * s.z, 0, 7); x.fill();
      });
      /* shooting star */
      if (!shoot && Math.random() < .004) shoot = { x: Math.random() * W * .8, y: Math.random() * H * .3, vx: 9 * DPR, vy: 4 * DPR, life: 40 };
      if (shoot) {
        x.strokeStyle = "rgba(234,252,255,.8)"; x.lineWidth = 1.6 * DPR;
        x.beginPath(); x.moveTo(shoot.x, shoot.y); x.lineTo(shoot.x - shoot.vx * 4, shoot.y - shoot.vy * 4); x.stroke();
        shoot.x += shoot.vx; shoot.y += shoot.vy; if (--shoot.life <= 0) shoot = null;
      }

      /* orbit paths */
      x.strokeStyle = "rgba(0,232,208,.05)"; x.lineWidth = 1;
      [.30, .36, .43].forEach(rr => { x.beginPath(); x.ellipse(cx, cy, W * rr, H * (rr - .03), 0, 0, 7); x.stroke(); });

      let hover = null;
      B.forEach(b => {
        b.a += b.sp * (live ? 1.5 : 1);
        b.sx = cx + Math.cos(b.a) * W * b.rx;
        b.sy = cy + Math.sin(b.a) * H * b.ry;
        b.hov = Math.hypot(mx - b.sx, my - b.sy) < 52 * DPR; if (b.hov) hover = b;
      });
      cv.style.cursor = hover ? "pointer" : "default";

      /* ═ THE CORE — a caged star ═ */
      const br = (20 + Math.sin(t * .045) * 3.5) * DPR;
      /* dual-tone halo: aqua heart bleeding into violet */
      const halo = x.createRadialGradient(cx, cy, 0, cx, cy, br * 5);
      halo.addColorStop(0, "rgba(255,255,255,.98)"); halo.addColorStop(.14, "rgba(0,232,208,.85)");
      halo.addColorStop(.34, "rgba(76,220,255,.28)"); halo.addColorStop(.6, "rgba(169,139,255,.12)");
      halo.addColorStop(1, "transparent");
      x.fillStyle = halo; x.beginPath(); x.arc(cx, cy, br * 5, 0, 7); x.fill();
      /* lens-flare cross */
      const flare = (len, wdt, a) => {
        const lg = x.createLinearGradient(cx - len, cy, cx + len, cy);
        lg.addColorStop(0, "transparent"); lg.addColorStop(.5, `rgba(234,252,255,${a})`); lg.addColorStop(1, "transparent");
        x.fillStyle = lg; x.fillRect(cx - len, cy - wdt / 2, len * 2, wdt);
      };
      const fp = .5 + Math.sin(t * .03) * .25;
      flare(br * 5.5, 1.4 * DPR, .5 * fp);
      x.save(); x.translate(cx, cy); x.rotate(Math.PI / 2); x.translate(-cx, -cy); flare(br * 3.4, 1.2 * DPR, .35 * fp); x.restore();
      /* the cage: two counter-rotating elliptical light rings */
      [[1, "0,232,208", .55], [-1, "169,139,255", .45]].forEach(([dir, col, al], ri) => {
        x.save(); x.translate(cx, cy); x.rotate(dir * t * .008 + ri * 1.3);
        x.strokeStyle = `rgba(${col},${al})`; x.lineWidth = 1.6 * DPR;
        x.beginPath(); x.ellipse(0, 0, br * 2.2, br * .8, 0, 0, Math.PI * 1.55); x.stroke();
        /* rider spark on each ring */
        const sa = dir * t * .03;
        x.fillStyle = `rgba(${col},.95)`;
        x.beginPath(); x.arc(Math.cos(sa) * br * 2.2, Math.sin(sa) * br * .8, 2.2 * DPR, 0, 7); x.fill();
        x.restore();
      });
      /* orbiting embers */
      for (let i = 0; i < 10; i++) {
        const ea = t * .014 + (i / 10) * Math.PI * 2, er = br * (2.6 + Math.sin(t * .02 + i * 2.4) * .7);
        const exx = cx + Math.cos(ea) * er, eyy = cy + Math.sin(ea) * er * .55;
        x.fillStyle = `rgba(234,252,255,${.25 + Math.sin(t * .06 + i) * .2})`;
        x.beginPath(); x.arc(exx, eyy, (0.9 + (i % 3) * .5) * DPR, 0, 7); x.fill();
      }
      x.fillStyle = "rgba(1,10,16,.85)"; x.font = `800 ${8 * DPR}px Unbounded`; x.textAlign = "center";
      x.fillText("CORE", cx, cy + 3 * DPR);
      x.fillStyle = "rgba(143,180,196,.85)"; x.font = `${7 * DPR}px "JetBrains Mono"`;
      x.fillText(live ? "● HUNTING" : "○ STANDING BY", cx, cy + br * 2.8 + 12 * DPR);

      /* gravity strands + pulses */
      B.forEach(b => {
        const g = x.createLinearGradient(cx, cy, b.sx, b.sy);
        g.addColorStop(0, "rgba(0,232,208,.02)"); g.addColorStop(1, b.col + (b.hov ? "77" : "22"));
        x.strokeStyle = g; x.lineWidth = b.hov ? 2 : 1;
        const mxx = (cx + b.sx) / 2 + Math.sin(b.a * 2) * 30, myy = (cy + b.sy) / 2 + Math.cos(b.a * 2) * 30;
        x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(mxx, myy, b.sx, b.sy); x.stroke();
        const pt = (t * .01 + b.a) % 1, ix = (1 - pt) * (1 - pt) * cx + 2 * (1 - pt) * pt * mxx + pt * pt * b.sx,
          iy = (1 - pt) * (1 - pt) * cy + 2 * (1 - pt) * pt * myy + pt * pt * b.sy;
        x.fillStyle = b.col; x.beginPath(); x.arc(ix, iy, 2.4 * DPR * (b.hov ? 1.6 : 1), 0, 7); x.fill();
      });

      /* worlds */
      B.forEach(b => {
        const R = b.r * DPR * (b.hov ? 1.35 : 1);
        planet(b.sx, b.sy, R, b.col, b);
        x.fillStyle = b.hov ? "#eafcff" : "rgba(143,180,196,.8)";
        x.font = `${b.hov ? 700 : 400} ${7.5 * DPR}px "JetBrains Mono"`; x.textAlign = "center";
        x.fillText(b.label, b.sx, b.sy + R * 2 + 14 * DPR);
        if (b.hov) { x.fillStyle = b.col; x.font = `${6.5 * DPR}px "JetBrains Mono"`;
          x.fillText(b.kind === "mod" ? "CLICK TO JUMP" : "CLICK TO OPEN", b.sx, b.sy + R * 2 + 26 * DPR); }
      });
    };
    draw();

    cv.addEventListener("pointermove", e => { const r = cv.getBoundingClientRect(); mx = (e.clientX - r.left) * DPR; my = (e.clientY - r.top) * DPR; });
    cv.addEventListener("pointerleave", () => { mx = my = -1; });
    cv.addEventListener("click", () => {
      const hit = B.find(b => b.hov); if (!hit) return;
      if (hit.kind === "mod") return OS.emit("nav:request", hit.id);
      selected = hit.pi; renderProjPanel();
    });

    /* ── planet panel + ignite form ── */
    const renderProjPanel = () => {
      const pp = el.querySelector("#projPanel"), P = projects();
      if (selected == null || !P[selected]) { pp.innerHTML = ""; return; }
      const p = P[selected];
      pp.innerHTML = `<div class="card reveal" style="margin-bottom:16px;border-color:${p.color}55">
        <h3><span style="color:${p.color}">◉</span> ${p.name}</h3>
        <p class="cs">${p.note || "a world in your universe"}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.link ? `<a class="btn ghost sm" href="${p.link}" target="_blank">OPEN ↗</a>` : ""}
          <button class="btn ghost sm danger" id="projDel">COLLAPSE THE PLANET</button>
          <button class="btn ghost sm" id="projClose">CLOSE</button>
        </div></div>`;
      pp.querySelector("#projDel").onclick = () => { const victim = P[selected]; OS.store.set("projects", allProjects().filter(q => q !== victim && !(q.name === victim.name && q.created === victim.created))); selected = null; renderProjPanel(); };
      pp.querySelector("#projClose").onclick = () => { selected = null; renderProjPanel(); };
    };

    el.querySelector("#btnNewProj").onclick = () => { showForm = !showForm; renderForm(); };
    const renderForm = () => {
      const f = el.querySelector("#projForm");
      if (!showForm) { f.innerHTML = ""; return; }
      let col = "#ffc46b";
      f.innerHTML = `<div class="card reveal" style="margin-bottom:22px;max-width:520px">
        <h3>Ignite a new planet</h3><p class="cs">name it, color it, watch it take orbit</p>
        <div class="cform">
          <input class="fin" id="pjName" placeholder="project name">
          <input class="fin" id="pjLink" placeholder="link (optional — site, repo, doc)">
          <input class="fin" id="pjNote" placeholder="one line on what it is">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:10px;color:var(--dim);letter-spacing:.14em">COLOR</span>
            ${["#ffc46b", "#00e8d0", "#4cdcff", "#a98bff", "#6ef2c0", "#ff7d9d"].map(c => `<span class="swatch" data-c="${c}" style="background:${c}"></span>`).join("")}
          </div>
          <button class="btn" id="pjGo">IGNITE</button>
        </div></div>`;
      const sw = f.querySelectorAll(".swatch");
      const paint = () => sw.forEach(s => s.classList.toggle("on", s.dataset.c === col));
      sw.forEach(s => s.onclick = () => { col = s.dataset.c; paint(); }); paint();
      f.querySelector("#pjGo").onclick = () => {
        const name = f.querySelector("#pjName").value.trim(); if (!name) return;
        OS.store.set("projects", [...allProjects(), { name, gal: GAL, link: f.querySelector("#pjLink").value.trim(), note: f.querySelector("#pjNote").value.trim(), color: col, created: Date.now() }]);
        showForm = false; renderForm();
        const cnt = el.querySelector('[data-count][data-fmt="n"].bio'); if (cnt) cnt.textContent = projects().length;
      };
    };

    /* ── session dial ── */
    const dial = el.querySelector("#sessdial"), dx = dial.getContext("2d");
    dial.width = dial.height = 240;
    const drawDial = () => {
      const n = OS.nyNow(); dx.clearRect(0, 0, 240, 240);
      const c0 = 120, R = 92;
      dx.strokeStyle = "rgba(78,115,134,.3)"; dx.lineWidth = 10;
      dx.beginPath(); dx.arc(c0, c0, R, 0, 7); dx.stroke();
      const arc = (h1, h2, col) => { dx.strokeStyle = col; dx.beginPath(); dx.arc(c0, c0, R, (h1 / 24) * Math.PI * 2 - Math.PI / 2, (h2 / 24) * Math.PI * 2 - Math.PI / 2); dx.stroke(); };
      arc(2, 5, "rgba(76,220,255,.6)"); arc(8.5, 11, "rgba(0,232,208,.85)"); arc(13.5, 16, "rgba(110,242,192,.6)");
      const na = (n.dec / 24) * Math.PI * 2 - Math.PI / 2;
      dx.strokeStyle = "#eafcff"; dx.lineWidth = 3; dx.lineCap = "round";
      dx.beginPath(); dx.moveTo(c0 + Math.cos(na) * (R - 18), c0 + Math.sin(na) * (R - 18)); dx.lineTo(c0 + Math.cos(na) * (R + 12), c0 + Math.sin(na) * (R + 12)); dx.stroke();
      dx.fillStyle = "#8fb4c4"; dx.font = "10px 'JetBrains Mono'"; dx.textAlign = "center";
      dx.fillText("24H NY", c0, c0 + 4);
    };
    drawDial(); this._timers.push(setInterval(drawDial, 30000));

    const sess = () => {
      const n = OS.nyNow(), d = n.dec, we = n.wd === "Sat" || n.wd === "Sun";
      const s = we ? ["Weekend — markets closed", "The Mind rests. Levels don't move on weekends."]
        : d >= 2 && d < 5 ? ["London hunt", "E1 + E3 watching the Asia range extremes."]
        : d >= 8.5 && d < 9.5 ? ["Pre-open brief", "Scoring the day before the New York bell."]
        : d >= 9.5 && d < 11 ? ["NY morning — all four engines live", "The best 90 minutes of the day."]
        : d >= 11 && d < 13.5 ? ["Midday stand-down", "Thin chop — the Mind refuses to trade it."]
        : d >= 13.5 && d < 16 ? ["NY afternoon hunt", "E1 + E3 live · runners close 15:58."]
        : ["Asia watch", "Logging tonight's levels — tomorrow's map."];
      const se = el.querySelector("#hmSess"); if (!se) return;
      se.textContent = s[0]; el.querySelector("#hmSessNote").textContent = s[1];
    };
    sess(); this._timers.push(setInterval(sess, 30000));
  },
  unmount() { cancelAnimationFrame(this._raf); this._timers.forEach(clearInterval); this._timers = []; }
});
