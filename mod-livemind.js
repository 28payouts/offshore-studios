/* ═══════════ MODULE · THE LIVE MIND (trading) ═══════════
   Verified record + live session state. NO fake tape, NO fake fills:
   the sim desk stays dark until real TradingView fills flow in.
   When you see a number on this screen, it is real. */
OS.register({
  id: "livemind",
  _timers: [],
  mount(el, user) {
    const L = window.OS_CONFIG.LINKS;
    const V = { final: "$10,015,774", wr: "57.3%", pf: "2.00", dd: "16.9%", cagr: "58.0%", trades: "4,267" };
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">The Live Mind · ${user.role === "admin" ? "master view" : user.name}</div>
      <h2>The machine is <span class="grad" id="lmState">…</span></h2>
      <p class="sub">One bot, four engines across ES + NQ. Rules frozen 27 Jul 2026 — the simulator is earning its way to real capital.</p>
    </div>
    <div class="cards">
      <div class="card reveal"><div class="stat"><div class="k">Backtested · 10y</div><div class="v pos">${V.final}</div><div class="s">$100k start · every trade verified</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Win rate</div><div class="v">${V.wr}</div><div class="s">${V.trades} trades · PF ${V.pf}</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Max drawdown</div><div class="v wc">${V.dd}</div><div class="s">never worse, ten years</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Sim gate</div><div class="v aq">0 / 60</div><div class="s">winner-capture unlocks live capital</div></div></div>
    </div>
    <div class="cards" style="margin-top:13px;grid-template-columns:1.25fr .75fr">
      <div class="card reveal">
        <h3>Sim desk <span class="chip off" style="float:right">AWAITING CONNECTION</span></h3>
        <p class="cs">nothing fake on this screen · <span class="mono" id="lmClock">--:--</span> NY</p>
        <div style="font-size:13px;color:var(--mut);line-height:2;margin-top:8px">
          This desk stays dark until real fills flow in. The wiring:<br>
          <span class="chip ok">PINE ENGINES · FROZEN</span> →
          <span class="chip warn">TRADINGVIEW ALERTS</span> →
          <span class="chip warn">WEBHOOK RELAY</span> →
          <span class="chip warn">FILL LOG</span> → this screen.<br><br>
          The moment the first sim trade prints, the live tape, equity curve and
          execution feed light up here — and every number will be real.
          <b style="color:var(--aqua)">60 verified sim trades</b> at record quality
          unlock live capital.
        </div>
      </div>
      <div class="card reveal">
        <h3>Connection checklist</h3><p class="cs">what stands between sim and live</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.3;margin-top:4px">
          <span class="chip ok">DONE</span> engines coded &amp; frozen<br>
          <span class="chip ok">DONE</span> record verified bar-by-bar<br>
          <span class="chip warn">RILEY</span> TradingView plan w/ webhook alerts<br>
          <span class="chip warn">BUILD</span> webhook relay + fill log<br>
          <span class="chip off">THEN</span> sim gate 0/60 starts counting
        </div>
      </div>
    </div>
    <div class="cards" style="margin-top:13px;grid-template-columns:1fr 1fr">
      <div class="card reveal">
        <h3>The four engines</h3><p class="cs">one mind · two brains · two markets</p>
        <canvas id="lmConst" class="fill" style="height:190px"></canvas>
      </div>
      <div class="card reveal">
        <h3>Protection stack</h3><p class="cs">what keeps the record honest</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.1;margin-top:4px">
          <span class="chip ok">2-LOSS DAY STOP</span> two strikes, done for the day<br>
          <span class="chip ok">DRAWDOWN THROTTLE</span> ½ size at −5% · ¼ at −15%<br>
          <span class="chip ok">MONTH BREAKER</span> −6% month = stand down<br>
          <span class="chip ok">BANK 33% AT +1R</span> stop to entry · runner rides free
        </div>
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px" class="reveal">
      <a class="btn" href="${L.livemindSite}" target="_blank">OPEN THE FULL LIVE MIND SITE ↗</a>
      <span class="btn ghost">TALK TO THE MIND — inside the site's core</span>
    </div>`;

    /* ── engine constellation ── */
    const ENG = [
      { n: "E1", sub: "FOUNDATION · ES", pf: "PF 1.53", col: "#a98bff" },
      { n: "E2", sub: "NARRATIVE · NQ", pf: "PF 1.59", col: "#4cdcff" },
      { n: "E3", sub: "CROSSOVER · NQ", pf: "PF 1.96", col: "#00e8d0" },
      { n: "E4", sub: "MIRROR · ES", pf: "PF 1.50", col: "#6ef2c0" }
    ];
    const cn = el.querySelector("#lmConst"), cxx = cn.getContext("2d");
    let ct = 0;
    const constel = setInterval(() => {
      if (document.hidden || !document.contains(cn)) return;
      ct++;
      /* PERF: resizing a canvas every tick reallocs its buffer — only resize on change */
      const r = cn.getBoundingClientRect(), tw = Math.round(r.width * 2);
      if (cn.width !== tw || cn.height !== 380) { cn.width = tw; cn.height = 380; }
      const W2 = cn.width, H2 = cn.height;
      const cx0 = W2 / 2, cy0 = H2 / 2;
      cxx.clearRect(0, 0, W2, H2);
      const cg = cxx.createRadialGradient(cx0, cy0, 0, cx0, cy0, 46);
      cg.addColorStop(0, "rgba(234,252,255,.95)"); cg.addColorStop(.4, "rgba(0,232,208,.6)"); cg.addColorStop(1, "transparent");
      cxx.fillStyle = cg; cxx.beginPath(); cxx.arc(cx0, cy0, 46, 0, 7); cxx.fill();
      ENG.forEach((e, i) => {
        const a = ct * .014 + (i / 4) * Math.PI * 2;
        const ex = cx0 + Math.cos(a) * W2 * .33, ey = cy0 + Math.sin(a) * H2 * .3;
        cxx.strokeStyle = e.col + "44"; cxx.lineWidth = 1.4;
        cxx.beginPath(); cxx.moveTo(cx0, cy0); cxx.lineTo(ex, ey); cxx.stroke();
        const pt = (ct * .02 + i * .25) % 1;
        cxx.fillStyle = e.col; cxx.beginPath();
        cxx.arc(cx0 + (ex - cx0) * pt, cy0 + (ey - cy0) * pt, 3.4, 0, 7); cxx.fill();
        const g2 = cxx.createRadialGradient(ex, ey, 0, ex, ey, 30);
        g2.addColorStop(0, e.col); g2.addColorStop(1, "transparent");
        cxx.fillStyle = g2; cxx.beginPath(); cxx.arc(ex, ey, 30, 0, 7); cxx.fill();
        cxx.fillStyle = "#021018"; cxx.font = "800 13px Unbounded"; cxx.textAlign = "center";
        cxx.fillText(e.n, ex, ey + 5);
        cxx.fillStyle = "#8fb4c4"; cxx.font = "10px 'JetBrains Mono'";
        cxx.fillText(e.sub, ex, ey + 34);
        cxx.fillStyle = e.col; cxx.font = "700 11px 'JetBrains Mono'";
        cxx.fillText(e.pf, ex, ey + 48);
      });
    }, 66);
    this._timers.push(constel);

    /* ── session state ── */
    const state = () => {
      const n = OS.nyNow(), d = n.dec, we = n.wd === "Sat" || n.wd === "Sun";
      const live = !we && ((d >= 2 && d < 5) || (d >= 8.5 && d < 11) || (d >= 13.5 && d < 16));
      const elS = document.getElementById("lmState");
      if (elS) elS.textContent = we ? "resting." : live ? "hunting." : "standing by.";
    };
    state(); this._timers.push(setInterval(state, 30000));

    /* ── NY clock (real) ── */
    const clock = () => {
      const ck = document.getElementById("lmClock");
      if (ck) { const n = OS.nyNow(); ck.textContent = `${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}:${String(n.s).padStart(2, "0")}`; }
    };
    clock(); this._timers.push(setInterval(clock, 1000));
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
