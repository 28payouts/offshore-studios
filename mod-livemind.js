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
    <div class="card reveal" style="margin-top:13px;padding:0;overflow:hidden">
      <div style="display:flex;align-items:center;gap:12px;padding:16px 22px;border-bottom:1px solid rgba(120,180,200,.12);flex-wrap:wrap">
        <div>
          <div style="font:800 13px Unbounded;color:#eafcff">THE LIVE TAPE</div>
          <div class="mono" style="font-size:9.5px;letter-spacing:.22em;color:var(--dim)">REAL MARKET · REAL TIME · THE WATER THE MIND HUNTS IN</div>
        </div>
        <div style="display:flex;gap:6px;margin-left:auto" id="lmSyms"></div>
        <span class="chip warn">BOT MARKERS ARRIVE WITH THE WEBHOOK</span>
      </div>
      <div id="lmChart" style="height:520px;background:#01070d"></div>
    </div>

    <div class="cards" style="margin-top:13px;grid-template-columns:1.25fr .75fr">
      <div class="card reveal">
        <h3>Sim desk <span class="chip off" style="float:right" id="lmFeedChip">AWAITING CONNECTION</span></h3>
        <p class="cs">nothing fake on this screen · <span class="mono" id="lmClock">--:--</span> NY</p>
        <div id="lmFills" style="font-size:13px;color:var(--mut);line-height:2;margin-top:8px">
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

    /* ── THE LIVE TAPE: real TradingView chart, live data, zero fakery ──
       This is the actual market feed. When the webhook relay lands, the
       bot's entries/exits print onto this same chart as markers. */
    const SYMS = [["MES", "CME_MINI:MES1!"], ["ES", "CME_MINI:ES1!"], ["NQ", "CME_MINI:NQ1!"], ["MNQ", "CME_MINI:MNQ1!"]];
    let curSym = OS.store.get("lm_symbol", "CME_MINI:MES1!");
    const symRow = el.querySelector("#lmSyms");
    const drawChart = () => {
      const host = el.querySelector("#lmChart"); if (!host) return;
      host.innerHTML = "";
      const div = document.createElement("div");
      div.id = "tvw_" + Date.now(); div.style.height = "100%";
      host.appendChild(div);
      const boot = () => new TradingView.widget({
        container_id: div.id, autosize: true, symbol: curSym, interval: "1",
        timezone: "America/New_York", theme: "dark", style: "1", locale: "en",
        toolbar_bg: "#01070d", backgroundColor: "#01070d",
        enable_publishing: false, hide_side_toolbar: true, allow_symbol_change: false,
        save_image: false, studies: [], withdateranges: true
      });
      if (window.TradingView) boot();
      else {
        const s = document.createElement("script");
        s.src = "https://s3.tradingview.com/tv.js"; s.onload = boot;
        document.head.appendChild(s);
      }
    };
    const paintSyms = () => {
      symRow.innerHTML = SYMS.map(([l, v]) =>
        `<button class="chip ${v === curSym ? "ok" : "off"}" data-s="${v}" style="cursor:pointer">${l}</button>`).join("");
      symRow.querySelectorAll("[data-s]").forEach(b => b.onclick = () => {
        curSym = b.dataset.s; OS.store.set("lm_symbol", curSym); paintSyms(); drawChart();
      });
    };
    paintSyms(); drawChart();

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

    /* ── LIVE FILLS: the real execution feed ──
       Source 1: Supabase `fills` table (when the relay writes there).
       Source 2: the relay's own /fills endpoint (Deno KV / CF KV).
       No source or no rows → the honest wiring card stays. NO fake fills, ever. */
    const fillRow = f => {
      const side = String(f.side || "").toLowerCase();
      const col = side === "long" || side === "buy" ? "var(--aqua)" : "#ff6b8a";
      const when = f.time || f.received || f.created_at || "";
      return `<div style="display:flex;gap:10px;align-items:center;padding:9px 12px;border-radius:12px;background:rgba(4,16,26,.6);border:1px solid rgba(120,180,200,.12);margin-top:8px">
        <b class="mono" style="color:${col};font-size:11px;letter-spacing:.08em">${(f.side || "?").toUpperCase()}</b>
        <span class="mono" style="font-size:11px;color:#eafcff">${f.sym || f.ticker || "?"}</span>
        <span class="chip off" style="font-size:8.5px">${f.engine || "—"}</span>
        <span class="mono" style="font-size:11px;color:var(--mut)">${f.action || ""} @ ${f.price ?? "?"}</span>
        <span class="mono" style="margin-left:auto;font-size:9px;color:var(--dim)">${String(when).slice(0, 19).replace("T", " ")}</span>
      </div>`;
    };
    const paintFills = fills => {
      const box = el.querySelector("#lmFills"), chip = el.querySelector("#lmFeedChip");
      if (!box || !fills || !fills.length) return;
      if (chip) { chip.className = "chip ok"; chip.textContent = "LIVE FEED · " + fills.length + " FILLS"; }
      box.innerHTML = `<div class="mono" style="font-size:9.5px;letter-spacing:.22em;color:var(--dim)">EXECUTION FEED · NEWEST FIRST · EVERY ROW REAL</div>`
        + fills.slice(0, 12).map(fillRow).join("");
    };
    const pollFills = async () => {
      if (document.hidden) return;
      /* Supabase first */
      try {
        if (window.OS_SB) {
          const { data, error } = await window.OS_SB.from("fills").select("*").order("created_at", { ascending: false }).limit(30);
          if (!error && data && data.length) return paintFills(data);
        }
      } catch (e) {}
      /* relay /fills second */
      try {
        const relay = OS.store.get("claude_relay", "");
        if (relay) {
          const base = relay.replace(/\/claude\/?$/, "");
          const r = await fetch(base + "/fills");
          if (r.ok) { const d = await r.json(); if (d.fills && d.fills.length) paintFills(d.fills); }
        }
      } catch (e) {}
    };
    pollFills(); this._timers.push(setInterval(pollFills, 30000));
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
