/* ═══════════ MODULE · THE BOT LAB ═══════════
   One room, one obsession: making the Live Mind better.
   Every number on this screen is from the verified bar-by-bar backtest
   (frozen 27 Jul 2026) or derived arithmetic from it — nothing invented.
   The lab table seats three minds: CLAUDE (engineer), LIVE MIND (the bot),
   DATA (the record). With an API key they think for real. */
OS.register({
  id: "botlab",
  _timers: [],
  mount(el, user) {
    /* ── the verified record ── */
    const V = { final: 10015774, start: 100000, wr: 57.3, pf: 2.00, dd: 16.9, cagr: 58.0, trades: 4267, years: 10 };
    const wins = Math.round(V.trades * V.wr / 100), losses = V.trades - wins;
    const ENG = [
      { n: "E1", sub: "FOUNDATION · ES", pf: 1.53, col: "#a98bff" },
      { n: "E2", sub: "NARRATIVE · NQ",  pf: 1.59, col: "#4cdcff" },
      { n: "E3", sub: "CROSSOVER · NQ",  pf: 1.96, col: "#00e8d0" },
      { n: "E4", sub: "MIRROR · ES",     pf: 1.50, col: "#6ef2c0" }
    ];

    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">The Bot Lab · ${user.name}</div>
      <h2>One room. One obsession:<br><span class="grad">make the Mind sharper.</span></h2>
      <p class="sub">Every stat from the verified record, the engines on the bench, and a council
      that argues about nothing but the bot. <span class="chip warn">BACKTEST DATA</span>
      <span class="chip off">SIM GATE 0/60</span></p>
    </div>

    <div class="cards reveal">
      <div class="card"><div class="stat"><div class="k">Final equity · 10y</div><div class="v pos">$10.02M</div><div class="s">$100k start · 100.2× · verified bar-by-bar</div></div></div>
      <div class="card"><div class="stat"><div class="k">Win rate</div><div class="v">${V.wr}%</div><div class="s">${wins.toLocaleString()} wins · ${losses.toLocaleString()} losses</div></div></div>
      <div class="card"><div class="stat"><div class="k">Profit factor</div><div class="v aq">${V.pf.toFixed(2)}</div><div class="s">$2 won per $1 lost, lifetime</div></div></div>
      <div class="card"><div class="stat"><div class="k">Max drawdown</div><div class="v wc">${V.dd}%</div><div class="s">never worse in ten years</div></div></div>
      <div class="card"><div class="stat"><div class="k">CAGR</div><div class="v pos">${V.cagr}%</div><div class="s">compound annual growth</div></div></div>
      <div class="card"><div class="stat"><div class="k">Trades</div><div class="v">${V.trades.toLocaleString()}</div><div class="s">≈${Math.round(V.trades / V.years)}/yr · ≈${Math.round(V.trades / V.years / 12)}/mo · selective on purpose</div></div></div>
    </div>

    <div class="cards" style="margin-top:13px;grid-template-columns:1.1fr .9fr">
      <div class="card reveal">
        <h3>Engine bench</h3><p class="cs">profit factor per engine · the spread IS the research agenda</p>
        <div style="margin-top:10px">
          ${ENG.map(e => `
          <div style="display:flex;align-items:center;gap:10px;margin:11px 0">
            <span style="font:800 12px Unbounded;color:${e.col};width:30px">${e.n}</span>
            <span class="mono" style="font-size:10px;color:var(--dim);width:120px;letter-spacing:.08em">${e.sub}</span>
            <div style="flex:1;height:10px;border-radius:99px;background:rgba(120,180,200,.1);overflow:hidden">
              <div style="width:${(e.pf / 2.2) * 100}%;height:100%;border-radius:99px;background:linear-gradient(90deg,${e.col}55,${e.col})"></div>
            </div>
            <b style="font:700 12px 'JetBrains Mono';color:${e.col};width:44px;text-align:right">${e.pf.toFixed(2)}</b>
          </div>`).join("")}
        </div>
        <p class="cs" style="margin-top:8px">E3's crossover brain leads at 1.96 — why the ES engines sit ~1.5 is the lab's #1 open question.</p>
      </div>
      <div class="card reveal">
        <h3>Proven in testing</h3><p class="cs">findings already paid for — the lab builds on these</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.15;margin-top:4px">
          <span class="chip ok">KEPT</span> A+ filter — selectivity built the curve<br>
          <span class="chip ok">KEPT</span> bank 33% at +1R · runner rides free<br>
          <span class="chip ok">KEPT</span> midday stand-down — chop refused<br>
          <span class="chip warn">KILLED</span> mechanical break-even — cost real money<br>
          <span class="chip warn">KILLED</span> overtrading — every loosening tested worse
        </div>
      </div>
    </div>

    <div class="cards" style="margin-top:13px;grid-template-columns:.9fr 1.1fr">
      <div class="card reveal">
        <h3>Data the lab is starving for</h3><p class="cs">what the backtest cannot tell us</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.15;margin-top:4px">
          <span class="chip off">MISSING</span> real fill prices &amp; slippage<br>
          <span class="chip off">MISSING</span> live spread at entry moments<br>
          <span class="chip off">MISSING</span> sim win-rate vs record (the 0/60 gate)<br><br>
          All three unlock the moment the <b style="color:var(--aqua)">TradingView webhook</b>
          lands — then this page starts learning from live tape, not history.
        </div>
      </div>
      <div class="card reveal">
        <h3>Improvement protocol</h3><p class="cs">how an idea earns its way into frozen rules</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.15;margin-top:4px">
          ① Council raises a hypothesis below<br>
          ② Full backtest battery — in-sample sweep<br>
          ③ Out-of-sample validation — no peeking<br>
          ④ Must beat v-current on money AND drawdown<br>
          ⑤ Only then do the frozen rules move — versioned, never silently
        </div>
      </div>
    </div>

    <div class="chatcard card reveal" style="margin-top:13px">
      <div style="display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid rgba(120,180,200,.12)">
        <div style="display:flex;gap:7px">
          <span class="aidot" style="background:#a98bff" title="Claude"></span>
          <span class="aidot" style="background:#00e8d0" title="Live Mind"></span>
          <span class="aidot" style="background:#4cdcff" title="Data"></span>
        </div>
        <div>
          <div style="font:800 13px Unbounded;color:#eafcff">THE LAB TABLE</div>
          <div class="mono" id="blNow" style="font-size:10px;letter-spacing:.2em;color:var(--dim)">CLAUDE · LIVE MIND · DATA</div>
        </div>
        <span class="chip ${localStorage.getItem("claude_key") ? "ok" : "off"}" style="margin-left:auto">${localStorage.getItem("claude_key") ? "API · THINKING FOR REAL" : "LOCAL · add API key in ✦ Claude"}</span>
      </div>
      <div class="chatlog" id="blLog"></div>
      <div class="quickrow" style="padding:0 18px">
        <button class="qk" data-t="why do the ES engines lag E3?">⚙ ES vs E3 gap</button>
        <button class="qk" data-t="how should exits evolve next?">🎯 exits</button>
        <button class="qk" data-t="what should we watch during the 0/60 sim gate?">🚦 sim gate</button>
        <button class="qk" data-t="where is the risk model weakest?">🛡 risk</button>
      </div>
      <div class="chatbar">
        <input id="blIn" placeholder="drop a question on the lab table…">
        <button id="blGo">RAISE IT</button>
      </div>
    </div>`;

    /* ── the three minds ── */
    const M = [
      { n: "CLAUDE", col: "#a98bff", who: "the engineer. You propose testable upgrades and refuse untested ones." },
      { n: "LIVE MIND", col: "#00e8d0", who: "the bot itself. You speak for your own frozen rules and your record." },
      { n: "DATA", col: "#4cdcff", who: "the record. You only ever cite verified numbers and say when data is missing." }
    ];
    const FACTS = "Verified backtest, frozen 27 Jul 2026: $100k→$10,015,774 in 10y, 4,267 trades, 57.3% win, PF 2.00, max DD 16.9%, CAGR 58%. Engines: E1 FOUNDATION ES PF 1.53, E2 NARRATIVE NQ PF 1.59, E3 CROSSOVER NQ PF 1.96, E4 MIRROR ES PF 1.50. Proven: A+ selectivity essential; mechanical break-even hurt; bank 33% at +1R kept; midday chop refused. Zero live fills yet — sim gate 0/60 awaits TradingView webhook.";

    const LINES = {
      "CLAUDE": [
        "E3 prints PF 1.96 while both ES engines sit ~1.5. Before touching code I want to know if that's the market, the session, or the logic.",
        "Rules stay frozen. The path is hypothesis → backtest battery → out-of-sample → beat current on money AND drawdown. No shortcuts.",
        "The highest-value upgrade isn't code — it's the webhook. Sim fills give us slippage truth no backtest can fake.",
        "Every idea we loosened the A+ filter for tested worse. Selectivity isn't a setting, it's the edge."
      ],
      "LIVE MIND": [
        "My record: 4,267 trades, 57.3% win, PF 2.00, worst drawdown 16.9% in ten years. I refuse midday chop and I always will.",
        "Mechanical break-even cost us money in testing. I bank a third at +1R and let the runner breathe — that stays.",
        "Frozen since 27 Jul. I earn live capital through the 0/60 gate — sixty verified sim trades, not promises.",
        "Two losses in a day and I'm done until tomorrow. The month breaker stands behind that. Protection is why the curve is smooth."
      ],
      "DATA": [
        "Verified spread: E1 1.53, E2 1.59, E3 1.96, E4 1.50. The E3 gap is the largest unexplained signal in the record.",
        "Roughly 427 trades a year — about 36 a month. Every tested attempt to trade more degraded the equity curve.",
        "I hold zero live fills. Until the webhook lands, every claim here is backtest — and I will say so every single time.",
        "Wins ≈ 2,445 vs losses ≈ 1,822 at 2:1 money won-to-lost. That asymmetry, not the win rate, is what built $10M."
      ]
    };
    const TOPIC = {
      engine: { "CLAUDE": "On the ES gap: my first test battery would be session-by-session PF for E1/E4 — if the bleed is concentrated, the fix is a filter, not a rewrite.", "LIVE MIND": "My ES engines still clear PF 1.5 — profitable, just not E3. Don't amputate what works; understand it.", "DATA": "Recorded fact: NQ engines average PF 1.78, ES engines 1.52. Per-session breakdown needs a new backtest run to verify." },
      exit: { "CLAUDE": "Exits: v4's verified exit upgrades already beat v3 on money and drawdown. Next candidate — protected-swing trails — must pass the same battery.", "LIVE MIND": "I bank 33% at +1R, runner to target or protected level. The one exit 'upgrade' we forced — mechanical BE — made me poorer.", "DATA": "Verified: removing mechanical break-even improved net profit materially in testing. Any new exit must beat that baseline, not the old one." },
      gate: { "CLAUDE": "During 0/60 I'm watching one thing: does sim win-rate track 57.3%? A big divergence means slippage or feed issues, not broken logic.", "LIVE MIND": "Sixty trades is ~6 weeks of my normal pace. I don't rush the gate — rushing is how records die.", "DATA": "Gate math: at 4,267-trade averages, 60 sim trades should land near 34 wins. Under 28 would be a real flag worth a halt." },
      risk: { "CLAUDE": "Risk model's weakest point is untested regime shift — a vol explosion the 10y window undersampled. The throttle helps; live data will tell us more.", "LIVE MIND": "Half size at −5%, quarter at −15%, month breaker at −6%. I have never needed more than that in ten backtested years — but I stay humble.", "DATA": "Max DD 16.9% happened WITH the protection stack on. Without it, tested drawdowns ran materially deeper. The stack is not decorative." }
    };

    const log = el.querySelector("#blLog");
    const hist = OS.store.get("botlab_log", []);
    const paint = (n, col, txt) => {
      const d = document.createElement("div"); d.className = "msg";
      d.innerHTML = `<b style="color:${col};font:700 10.5px 'JetBrains Mono';letter-spacing:.14em">${n}</b><div>${txt}</div>`;
      log.appendChild(d); log.scrollTop = log.scrollHeight;
    };
    hist.forEach(h => paint(h.n, h.col, h.t));
    const say = (n, col, txt) => {
      paint(n, col, txt);
      const now = el.querySelector("#blNow"); if (now) now.textContent = n + " SPEAKING";
      const h2 = OS.store.get("botlab_log", []); h2.push({ n, col, t: txt });
      OS.store.set("botlab_log", h2.slice(-40));
    };
    if (!hist.length) say("DATA", "#4cdcff", "Lab open. " + FACTS.split("Engines")[0] + "Ask the table anything about making the Mind better.");

    /* ── turns: LOCAL persona lines free-running; API turns only on a raised topic ── */
    let seat = 0, topic = null, topicLife = 0, busy = false;
    const key = () => localStorage.getItem("claude_key");
    const model = () => localStorage.getItem("claude_model") || "claude-sonnet-5";

    async function apiTurn(m, tpc) {
      busy = true;
      try {
        const r = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": key(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
          body: JSON.stringify({
            model: model(), max_tokens: 130,
            system: `You are ${m.n} at the Offshore Bot Lab table — ${m.who} Ground truth: ${FACTS} Rules: 1-2 sharp sentences, plain text, never invent numbers, always distinguish backtest from live, it's fine to disagree with the other seats.`,
            messages: [{ role: "user", content: "Topic on the table: " + tpc + ". Give your seat's take." }]
          })
        });
        const j = await r.json();
        const t = j && j.content && j.content[0] && j.content[0].text;
        if (t) say(m.n, m.col, t.trim());
      } catch (e) { /* fall back silently to local next turn */ }
      busy = false;
    }

    const nextTurn = () => {
      if (!document.contains(log) || busy) return;
      const m = M[seat++ % M.length];
      if (topic && topicLife > 0) {
        topicLife--;
        if (key()) { apiTurn(m, topic); return; }
        const kw = /engine|es|e1|e3|e4/i.test(topic) ? "engine" : /exit|target|runner|trail/i.test(topic) ? "exit" : /gate|sim|60/i.test(topic) ? "gate" : /risk|drawdown|size/i.test(topic) ? "risk" : null;
        say(m.n, m.col, kw ? TOPIC[kw][m.n] : LINES[m.n][Math.floor(Math.random() * LINES[m.n].length)]);
        return;
      }
      /* idle chatter stays LOCAL (free) even with a key — the API only burns on your topics */
      say(m.n, m.col, LINES[m.n][Math.floor(Math.random() * LINES[m.n].length)]);
    };
    this._timers.push(setInterval(nextTurn, 9000));

    const raise = () => {
      const inp = el.querySelector("#blIn"), t = inp.value.trim(); if (!t) return;
      inp.value = ""; topic = t; topicLife = 3; seat = 0;
      say("CHAIR", "#ffc46b", "On the table: " + t);
      nextTurn();
    };
    el.querySelector("#blGo").onclick = raise;
    el.querySelector("#blIn").addEventListener("keydown", e => { if (e.key === "Enter") raise(); });
    el.querySelectorAll(".qk[data-t]").forEach(q => q.onclick = () => { el.querySelector("#blIn").value = q.dataset.t; raise(); });
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
