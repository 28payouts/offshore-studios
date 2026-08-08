/* ═══════════ MODULE · THE WORLD (admin home) ═══════════
   Not a dashboard — a living orbital system. Every Offshore system is a
   body in orbit around the core; your own projects join the world as new
   orbs. Hover to feel them, click to dive in. */
OS.register({
  id: "home",
  _raf: null, _timers: [],
  mount(el, user) {
    const MODCOL = { livemind: "#00e8d0", claude: "#a98bff", clients: "#4cdcff", agency: "#6ef2c0", agents: "#ffc46b" };
    const projects = () => OS.store.get("projects", []);
    let showForm = false, selected = null;

    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">The World · ${user.name}</div>
      <h2>Everything you run,<br><span class="grad">alive in orbit.</span></h2>
      <p class="sub">Every system is a body around the core. Hover to wake one, click to dive in. Spawn new projects and watch the world grow.</p>
    </div>

    <div id="orbwrap" class="reveal">
      <canvas id="orbmap"></canvas>
      <div id="orbhint">HOVER A BODY · CLICK TO DIVE</div>
    </div>

    <div id="projPanel"></div>

    <div style="display:flex;gap:10px;margin:4px 0 22px" class="reveal">
      <button class="btn ghost" id="btnNewProj">✚ SPAWN A PROJECT INTO THE WORLD</button>
    </div>
    <div id="projForm"></div>

    <div class="cards reveal">
      <div class="card"><div class="stat"><div class="k">Backtested · 10y</div><div class="v pos" data-count="10015774" data-fmt="m">$0</div><div class="s">verified bar-by-bar · frozen 27 Jul</div></div></div>
      <div class="card"><div class="stat"><div class="k">Win rate</div><div class="v" data-count="57.3" data-fmt="pct">0%</div><div class="s">4,267 trades · PF 2.00</div></div></div>
      <div class="card"><div class="stat"><div class="k">Max drawdown</div><div class="v wc" data-count="16.9" data-fmt="pct">0%</div><div class="s">never worse, ten years</div></div></div>
      <div class="card"><div class="stat"><div class="k">Client portals</div><div class="v aq" data-count="${OS.store.get("clients", []).length}" data-fmt="n">0</div><div class="s">private worlds you've opened</div></div></div>
      <div class="card"><div class="stat"><div class="k">Projects in orbit</div><div class="v bio" data-count="${projects().length}" data-fmt="n">0</div><div class="s">and room for infinity</div></div></div>
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
          ① Sim gate — 30–60 trades at ≥70–80% winner-capture<br>
          ② Supabase keys → real client accounts everywhere<br>
          ③ TradingView webhooks → the world feels real trades<br>
          ④ Legs 5 & 6 (YM/RTY) validation</div>
      </div>
    </div>`;

    /* ── count-up choreography ── */
    el.querySelectorAll("[data-count]").forEach(n => {
      const target = +n.dataset.count, fmt = n.dataset.fmt; let st = null;
      const step = ts => {
        if (!st) st = ts; const p = Math.min(1, (ts - st) / 1400), e = 1 - Math.pow(1 - p, 3), v = target * e;
        n.textContent = fmt === "m" ? "$" + (v / 1e6).toFixed(2) + "M" : fmt === "pct" ? v.toFixed(1) + "%" : Math.round(v);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    /* ── THE ORBITAL WORLD ── */
    const cv = el.querySelector("#orbmap"), x = cv.getContext("2d");
    let W = 0, H = 0, DPR = Math.min(2, devicePixelRatio || 1), mx = -1, my = -1, t = 0;
    const size = () => { const r = cv.getBoundingClientRect(); W = cv.width = r.width * DPR; H = cv.height = r.height * DPR; };
    size(); addEventListener("resize", size);

    const bodies = () => {
      const mods = window.OS_CONFIG.MODULES.filter(m => m.id !== "home" && m.roles.includes(user.role));
      const list = mods.map((m, i) => ({
        kind: "mod", id: m.id, label: m.label.toUpperCase(), icon: m.icon,
        col: MODCOL[m.id] || "#4cdcff", a: (i / mods.length) * Math.PI * 2,
        rx: .32 + (i % 2) * .08, ry: .30 + ((i + 1) % 2) * .07, sp: .0016 + i * .0004, r: 15
      }));
      projects().forEach((p, i) => list.push({
        kind: "proj", id: "p" + i, pi: i, label: p.name.toUpperCase(), icon: "◇",
        col: p.color || "#ffc46b", a: 1.1 + i * 1.9, rx: .44, ry: .40, sp: .001 + i * .0003, r: 11
      }));
      return list;
    };
    let B = bodies();
    OS.on("store:projects", () => { B = bodies(); });

    const draw = () => {
      this._raf = requestAnimationFrame(draw);
      if (document.hidden || !document.contains(cv)) return;
      t++; x.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * .47, live = (() => { const n = OS.nyNow(); return n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16)); })();

      /* orbit rings */
      x.strokeStyle = "rgba(0,232,208,.06)"; x.lineWidth = 1;
      [.32, .40, .44].forEach(rr => { x.beginPath(); x.ellipse(cx, cy, W * rr, H * (rr - .02), 0, 0, 7); x.stroke(); });

      let hover = null;
      B.forEach(b => {
        b.a += b.sp * (live ? 1.5 : 1);
        b.sx = cx + Math.cos(b.a) * W * b.rx;
        b.sy = cy + Math.sin(b.a) * H * b.ry;
        const d = Math.hypot(mx - b.sx, my - b.sy);
        b.hov = d < 44 * DPR; if (b.hov) hover = b;
      });
      cv.style.cursor = hover ? "pointer" : "default";

      /* strands + pulses */
      B.forEach(b => {
        const g = x.createLinearGradient(cx, cy, b.sx, b.sy);
        g.addColorStop(0, "rgba(0,232,208,.02)"); g.addColorStop(1, b.col + (b.hov ? "88" : "30"));
        x.strokeStyle = g; x.lineWidth = b.hov ? 2.2 : 1.1;
        const mxx = (cx + b.sx) / 2 + Math.sin(b.a * 2) * 26, myy = (cy + b.sy) / 2 + Math.cos(b.a * 2) * 26;
        x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(mxx, myy, b.sx, b.sy); x.stroke();
        /* pulse train */
        const pt = (t * .012 + b.a) % 1, ix = (1 - pt) * (1 - pt) * cx + 2 * (1 - pt) * pt * mxx + pt * pt * b.sx,
          iy = (1 - pt) * (1 - pt) * cy + 2 * (1 - pt) * pt * myy + pt * pt * b.sy;
        x.fillStyle = b.col; x.beginPath(); x.arc(ix, iy, 2.6 * DPR * (b.hov ? 1.5 : 1), 0, 7); x.fill();
      });

      /* the core */
      const br = (18 + Math.sin(t * .05) * 3) * DPR;
      const cg = x.createRadialGradient(cx, cy, 0, cx, cy, br * 3.4);
      cg.addColorStop(0, "rgba(190,255,244,.95)"); cg.addColorStop(.28, "rgba(0,232,208,.75)"); cg.addColorStop(1, "transparent");
      x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, br * 3.4, 0, 7); x.fill();
      x.strokeStyle = "rgba(0,232,208,.5)"; x.lineWidth = 1.6;
      x.beginPath(); x.arc(cx, cy, br + 9 * DPR, t * .02, t * .02 + 4); x.stroke();
      x.strokeStyle = "rgba(169,139,255,.45)";
      x.beginPath(); x.arc(cx, cy, br + 16 * DPR, -t * .014, -t * .014 + 2.4); x.stroke();
      x.fillStyle = "#012"; x.font = `800 ${8.5 * DPR}px Unbounded`; x.textAlign = "center";
      x.fillStyle = "rgba(1,10,16,.85)"; x.fillText("CORE", cx, cy + 3 * DPR);
      x.fillStyle = "rgba(143,180,196,.8)"; x.font = `${7 * DPR}px "JetBrains Mono"`;
      x.fillText(live ? "● HUNTING" : "○ STANDING BY", cx, cy + br * 2.1 + 12 * DPR);

      /* bodies */
      B.forEach(b => {
        const R = b.r * DPR * (b.hov ? 1.45 : 1);
        const g = x.createRadialGradient(b.sx - R * .3, b.sy - R * .3, 0, b.sx, b.sy, R * 2.6);
        g.addColorStop(0, "#fff"); g.addColorStop(.25, b.col); g.addColorStop(1, "transparent");
        x.fillStyle = g; x.beginPath(); x.arc(b.sx, b.sy, R * 2.6, 0, 7); x.fill();
        x.fillStyle = "rgba(2,10,18,.9)"; x.font = `${13 * DPR}px sans-serif`; x.textAlign = "center";
        x.fillText(b.icon, b.sx, b.sy + 4.5 * DPR);
        x.fillStyle = b.hov ? "#eafcff" : "rgba(143,180,196,.75)";
        x.font = `${b.hov ? 700 : 400} ${7.5 * DPR}px "JetBrains Mono"`;
        x.fillText(b.label, b.sx, b.sy + R + 15 * DPR);
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

    /* ── project panel + spawn form ── */
    const renderProjPanel = () => {
      const pp = el.querySelector("#projPanel"), P = projects();
      if (selected == null || !P[selected]) { pp.innerHTML = ""; return; }
      const p = P[selected];
      pp.innerHTML = `<div class="card reveal" style="margin-bottom:16px;border-color:${p.color}55">
        <h3><span style="color:${p.color}">◇</span> ${p.name}</h3>
        <p class="cs">${p.note || "a body in your world"}</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${p.link ? `<a class="btn ghost sm" href="${p.link}" target="_blank">OPEN ↗</a>` : ""}
          <button class="btn ghost sm danger" id="projDel">REMOVE FROM ORBIT</button>
          <button class="btn ghost sm" id="projClose">CLOSE</button>
        </div></div>`;
      pp.querySelector("#projDel").onclick = () => { OS.store.set("projects", P.filter((_, i) => i !== selected)); selected = null; renderProjPanel(); };
      pp.querySelector("#projClose").onclick = () => { selected = null; renderProjPanel(); };
    };

    el.querySelector("#btnNewProj").onclick = () => { showForm = !showForm; renderForm(); };
    const renderForm = () => {
      const f = el.querySelector("#projForm");
      if (!showForm) { f.innerHTML = ""; return; }
      let col = "#ffc46b";
      f.innerHTML = `<div class="card reveal" style="margin-bottom:22px;max-width:520px">
        <h3>New body for the world</h3><p class="cs">name it, color it, watch it enter orbit</p>
        <div class="cform">
          <input class="fin" id="pjName" placeholder="project name">
          <input class="fin" id="pjLink" placeholder="link (optional — site, repo, doc)">
          <input class="fin" id="pjNote" placeholder="one line on what it is">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:10px;color:var(--dim);letter-spacing:.14em">COLOR</span>
            ${["#ffc46b", "#00e8d0", "#4cdcff", "#a98bff", "#6ef2c0", "#ff7d9d"].map(c => `<span class="swatch" data-c="${c}" style="background:${c}"></span>`).join("")}
          </div>
          <button class="btn" id="pjGo">LAUNCH INTO ORBIT</button>
        </div></div>`;
      const sw = f.querySelectorAll(".swatch");
      const paint = () => sw.forEach(s => s.classList.toggle("on", s.dataset.c === col));
      sw.forEach(s => s.onclick = () => { col = s.dataset.c; paint(); }); paint();
      f.querySelector("#pjGo").onclick = () => {
        const name = f.querySelector("#pjName").value.trim(); if (!name) return;
        OS.store.set("projects", [...projects(), { name, link: f.querySelector("#pjLink").value.trim(), note: f.querySelector("#pjNote").value.trim(), color: col, created: Date.now() }]);
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
