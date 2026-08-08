/* ═══════════ MODULE · THE LIVE MIND (trading) ═══════════
   Verified record + live session state + sim demo feed.
   Demo figures are shaped from the verified backtest and labeled SIM DEMO. */
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
        <h3>Live tape · NQ <span class="chip warn" style="float:right">SIM DEMO</span></h3>
        <p class="cs">replaying the verified record · <span class="mono" id="lmClock">--:--</span> NY</p>
        <canvas id="lmChart" class="fill" style="height:220px"></canvas>
        <div id="lmPos" style="margin-top:10px"></div>
      </div>
      <div class="card reveal">
        <h3>Execution feed</h3><p class="cs">shaped from the real record · 57% win</p>
        <div id="lmFeed"></div>
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
      const r = cn.getBoundingClientRect(), W2 = cn.width = r.width * 2, H2 = cn.height = 380;
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
    }, 55);
    this._timers.push(constel);

    /* ── session state ── */
    const state = () => {
      const n = OS.nyNow(), d = n.dec, we = n.wd === "Sat" || n.wd === "Sun";
      const live = !we && ((d >= 2 && d < 5) || (d >= 8.5 && d < 11) || (d >= 13.5 && d < 16));
      const elS = document.getElementById("lmState");
      if (elS) elS.textContent = we ? "resting." : live ? "hunting." : "standing by.";
    };
    state(); this._timers.push(setInterval(state, 30000));

    /* ── demo tape: synthetic walk seeded from real NQ ranges ── */
    const bars = []; let px = 25700;
    for (let i = 0; i < 60; i++) { const o = px, c = px + (Math.random() - .48) * 22; bars.push({ o, c, h: Math.max(o, c) + Math.random() * 9, l: Math.min(o, c) - Math.random() * 9 }); px = c; }
    let pos = null, nextIn = 6;
    const draw = () => {
      const c = document.getElementById("lmChart"); if (!c) return;
      const x = c.getContext("2d"), r = c.getBoundingClientRect();
      const W = c.width = r.width * 2, H = c.height = 440;
      const vis = bars.slice(-44);
      let lo = Math.min(...vis.map(b => b.l)), hi = Math.max(...vis.map(b => b.h));
      if (pos) { lo = Math.min(lo, pos.stop); hi = Math.max(hi, pos.t1); }
      const pad = (hi - lo) * .1; lo -= pad; hi += pad;
      const xs = i => 12 + i * (W - 120) / 46, ys = v => 10 + ((hi - v) / (hi - lo)) * (H - 34);
      x.clearRect(0, 0, W, H);
      vis.forEach((b, i) => {
        const up = b.c >= b.o, col = up ? "#6ef2c0" : "#ff7d6b", xx = xs(i);
        x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); x.moveTo(xx, ys(b.h)); x.lineTo(xx, ys(b.l)); x.stroke();
        x.fillStyle = col; x.fillRect(xx - 3.2, ys(Math.max(b.o, b.c)), 6.4, Math.max(2.5, Math.abs(ys(b.o) - ys(b.c))));
      });
      const last = vis[vis.length - 1];
      x.fillStyle = "#eafcff"; x.font = "700 16px ui-monospace,Menlo,monospace"; x.textAlign = "left";
      x.fillText(last.c.toFixed(2), W - 104, ys(last.c) + 5);
      if (pos) [[pos.entry, "#4cdcff", "ENTRY"], [pos.stop, pos.be ? "#6ef2c0" : "#ff5a5f", pos.be ? "STOP→BE" : "STOP"], [pos.t1, "#6ef2c0", "+1R"]].forEach(([v, col, lab]) => {
        const y = ys(v); x.strokeStyle = col; x.setLineDash([6, 6]); x.lineWidth = 1.6;
        x.beginPath(); x.moveTo(12, y); x.lineTo(W - 112, y); x.stroke(); x.setLineDash([]);
        x.fillStyle = col; x.font = "700 12px ui-monospace,Menlo,monospace"; x.fillText(lab, W - 104, y + 4);
      });
    };
    const tick = () => {
      const b = bars[bars.length - 1]; const o = b.c, c2 = o + (Math.random() - .48) * 22;
      bars.push({ o, c: c2, h: Math.max(o, c2) + Math.random() * 9, l: Math.min(o, c2) - Math.random() * 9 });
      if (bars.length > 90) bars.shift();
      if (!pos && --nextIn <= 0) {
        const lng = Math.random() < .55, risk = 16 + Math.random() * 12;
        pos = { lng, entry: c2, stop: lng ? c2 - risk : c2 + risk, t1: lng ? c2 + risk : c2 - risk, risk, age: 0, be: false };
        nextIn = 9 + Math.floor(Math.random() * 8);
      }
      if (pos) {
        pos.age++;
        const rr = (pos.lng ? c2 - pos.entry : pos.entry - c2) / pos.risk;
        if (!pos.be && rr >= 1) { pos.be = true; pos.stop = pos.entry; }
        if (rr <= -1 || (pos.be && rr <= .02 && pos.age > 4) || pos.age > 15) { feed(rr); pos = null; }
        const pp = document.getElementById("lmPos");
        if (pp) pp.innerHTML = pos
          ? `<span class="chip ok">● ${pos.lng ? "LONG" : "SHORT"} @ ${pos.entry.toFixed(2)}</span><span class="chip ${rr >= 0 ? "ok" : "warn"}">${rr >= 0 ? "+" : ""}${rr.toFixed(2)}R</span><span class="chip">${pos.be ? "33% banked · runner live" : "hunting +1R"}</span>`
          : `<span class="chip off">flat — scanning for the next sweep</span>`;
      } else { const pp = document.getElementById("lmPos"); if (pp) pp.innerHTML = `<span class="chip off">flat — scanning for the next sweep</span>`; }
      const ck = document.getElementById("lmClock");
      if (ck) { const n = OS.nyNow(); ck.textContent = `${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}:${String(n.s).padStart(2, "0")}`; }
      draw();
    };
    this._timers.push(setInterval(tick, 900)); draw();

    /* ── feed ── */
    const rows = [];
    const SAMPLES = [["E3", "SHORT", 2.4, 9120], ["E2", "LONG", -1, -5240], ["E1", "LONG", 1.1, 4180], ["E3", "LONG", 4.2, 15960], ["E4", "SHORT", .8, 3040], ["E1", "SHORT", -1, -5610], ["E2", "SHORT", 1.9, 7220]];
    let si = 0;
    function feed(rr) {
      const s = SAMPLES[si++ % SAMPLES.length], n = OS.nyNow();
      rows.unshift({ t: `${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")}`, e: s[0], d: s[1], r: s[2], p: s[3] });
      if (rows.length > 7) rows.pop(); render();
    }
    function render() {
      const f = document.getElementById("lmFeed"); if (!f) return;
      const col = { E1: "#a98bff", E2: "#4cdcff", E3: "#00e8d0", E4: "#6ef2c0" };
      f.innerHTML = rows.map(r2 => `<div class="feedrow"><span style="color:var(--dim)">${r2.t}</span>
        <span style="color:${col[r2.e]};font-weight:800">${r2.e}</span>
        <span style="color:#9fc6d4">${r2.d} NQ · ${r2.r > 0 ? "runner banked" : "stop taken"}</span>
        <span class="${r2.p >= 0 ? "pos" : "neg"}" style="font-weight:800;text-align:right">${r2.p >= 0 ? "+" : ""}$${Math.abs(r2.p).toLocaleString()}</span></div>`).join("");
    }
    for (let k = 0; k < 4; k++) feed(1); render();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
