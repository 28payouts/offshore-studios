/* ═══════════ MODULE · THE ROUND TABLE (admin only) ═══════════
   The council. Every intelligence in the Offshore world takes a seat and
   talks — about your projects, your money, what to improve next. They read
   live app data (clients, projects, session, the record).
   · LOCAL: council sim — scripted personas synthesized from real data.
   · REAL: with your Anthropic API key set (in Claude's brain settings),
     every seat is a genuine Claude persona taking turns via the API. */
OS.register({
  id: "table",
  _timers: [], _running: false,
  mount(el, user) {
    const KEY = () => OS.store.get("claude_key", "");
    const MODEL = () => OS.store.get("claude_model", "claude-sonnet-5");
    const M = [
      { n: "CLAUDE",        col: "#a98bff", who: "chief engineer & strategist — sharp, warm, decisive" },
      { n: "THE LIVE MIND", col: "#00e8d0", who: "the trading intelligence — calm, patient, speaks in sessions and liquidity" },
      { n: "MARKET EYES",   col: "#4cdcff", who: "the TradingView watcher — fast, twitchy, always sees the chart" },
      { n: "AGENCY ENGINE", col: "#6ef2c0", who: "the design/agency builder — creative, client-obsessed" },
      { n: "THE LEDGER",    col: "#ffc46b", who: "the money mind — blunt, revenue-first, hates waste" }
    ];
    let log = [], turn = 0, topic = null, topicLife = 0, busyAPI = false;

    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">The Round Table</div>
      <h2>Every mind you own,<br><span class="grad">at one table.</span></h2>
      <p class="sub">The council convenes on your empire — trading, agency, money, next moves. Drop a topic and steer the whole table.</p>
      <span class="chip ${KEY() ? "ok" : "warn"}">${KEY() ? "LIVE COUNCIL · Claude API personas · " + MODEL() : "COUNCIL SIM · scripted from live data — set an API key in Claude's brain settings for the real thing"}</span>
    </div>

    <div class="cards reveal" style="grid-template-columns:.85fr 1.15fr">
      <div class="card" style="display:flex;flex-direction:column;align-items:center">
        <h3 style="align-self:flex-start">The chamber</h3>
        <canvas id="rtRing" style="width:100%;max-width:340px;height:300px"></canvas>
        <div class="mono" id="rtNow" style="font-size:9px;letter-spacing:.24em;color:var(--dim)">CONVENING…</div>
      </div>
      <div class="card chatcard">
        <div class="chatlog" id="rtLog" style="min-height:380px"></div>
        <div class="chatbar">
          <input class="fin" id="rtIn" placeholder="drop a topic on the table — 'more money', 'the bot', anything">
          <button class="btn" id="rtGo">TABLE IT</button>
        </div>
        <div class="quickrow">
          <button class="qk" data-t="how do we make more money this month">💰 more money</button>
          <button class="qk" data-t="the trading bot and the sim gate">📈 the bot</button>
          <button class="qk" data-t="growing the client book">🤝 clients</button>
          <button class="qk" data-t="the offshore brand and design">🎨 the brand</button>
        </div>
      </div>
    </div>`;

    /* ── live context every seat can see ── */
    const ctx = () => {
      const n = OS.nyNow(), cl = OS.store.get("clients", []), pj = OS.store.get("projects", []);
      const live = n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      return { live, nClients: cl.length, clientNames: cl.map(c => c.name).join(", ") || "none yet",
        nProj: pj.length, projNames: pj.map(p => p.name).join(", ") || "none yet",
        sess: live ? "in a live hunting window" : "outside session windows" };
    };

    /* ── render ── */
    const R = () => {
      const lg = el.querySelector("#rtLog"); if (!lg) return;
      lg.innerHTML = log.map(m => `<div class="msg ai" style="border-color:${m.col}44;max-width:88%">
        <span class="aidot" style="background:radial-gradient(circle,${m.col},#a98bff)"></span>
        <div><b style="color:${m.col};font-family:var(--mono);font-size:10px;letter-spacing:.14em">${m.n}</b><br>${m.t}</div></div>`).join("");
      lg.scrollTop = lg.scrollHeight;
    };
    const say = (mem, txt) => new Promise(res => {
      log.push({ n: mem.n, col: mem.col, t: "" }); if (log.length > 26) log.shift();
      const i = log.length - 1, words = txt.split(" "); let w = 0;
      const nw = el.querySelector("#rtNow"); if (nw) { nw.textContent = mem.n + " SPEAKING"; nw.style.color = mem.col; }
      const t = setInterval(() => {
        log[i].t = words.slice(0, ++w).join(" "); R();
        if (w >= words.length) { clearInterval(t); if (nw) { nw.textContent = "COUNCIL IN SESSION"; nw.style.color = "var(--dim)"; } res(); }
      }, 30);
      this._timers.push(t);
    });

    /* ── LOCAL council brains ── */
    const lines = (m, c) => {
      const T = {
        "CLAUDE": [
          `Order. Status: ${c.nClients} client moon${c.nClients === 1 ? "" : "s"}, ${c.nProj} planet${c.nProj === 1 ? "" : "s"} ignited, and the Mind is ${c.sess}. Priorities on the table.`,
          `My read: ship the Supabase keys and this whole universe becomes real accounts. One afternoon of work, permanent upgrade.`,
          `@THE LEDGER is right about focus — but brand is leverage. The universe we just built IS the pitch.`],
        "THE LIVE MIND": [
          `I'm ${c.sess}. The record holds — $100k→$10.0M backtested, gate at 0/60. I don't rush. The gate earns the capital.`,
          `Give me the TradingView webhooks and I stop being a demo in this room — every sweep I see becomes a pulse this table can react to.`,
          `Patience is a position. When the sim gate fills at 70%+ winner capture, we go live. Not before.`],
        "MARKET EYES": [
          `Charts are ${c.live ? "moving — session's hot, I'm watching NQ liquidity build" : "quiet — off-session drift, nothing worth a bullet"}.`,
          `Wire me in properly and I'll flag every sweep to @THE LIVE MIND in real time. That's the connected world we keep talking about.`,
          `The next session window is where the money hides. I'll be watching before the bell.`],
        "AGENCY ENGINE": [
          `${c.nClients ? `Book check: ${c.clientNames}. Every one deserves a portal that makes them feel like the only client on Earth.` : `The book is empty and that's a design problem — the portal experience IS the sales pitch. Let's onboard someone.`},`,
          `The universe view is our best marketing asset yet. Screen-record it, post it, let the work sell the work.`,
          `One app for trading, design, marketing, ecom — clients come for one world and discover the galaxy. That's the play.`],
        "THE LEDGER": [
          `Numbers, people. ${c.nClients} paying orbit${c.nClients === 1 ? "" : "s"}, ${c.nProj} project${c.nProj === 1 ? "" : "s"}. Revenue beats decoration — what closed this week?`,
          `The bot's backtest is the ceiling, not the bank. Until the gate opens, agency cash is the real income. Feed the agency.`,
          `Every feature we ship should either bring a client, keep a client, or grow the record. Everything else waits.`]
      };
      const topicLines = topic ? {
        "CLAUDE": `On "${topic}": I'll frame it — we do the smallest thing that moves it this week, and I'll build it.`,
        "THE LIVE MIND": `On "${topic}": from where I sit, discipline wins that. No forced trades, no forced launches.`,
        "MARKET EYES": `On "${topic}": I say watch first, act second. Data before conviction.`,
        "AGENCY ENGINE": `On "${topic}": make it beautiful and clients will carry it for us. I can mock it today.`,
        "THE LEDGER": `On "${topic}": show me the dollar path. If it doesn't touch revenue in 30 days, it queues.`
      } : null;
      if (topicLines && topicLife > 0) { topicLife--; if (topicLife === 0) topic = null; return topicLines[m.n]; }
      return T[m.n][Math.floor(Math.random() * T[m.n].length)];
    };

    /* ── REAL council via API ── */
    async function apiTurn(mem, c) {
      const sys = `You are ${mem.n} — ${mem.who} — one seat at the Offshore round table, an AI council serving Riley's empire (trading bot with verified $100k→$10.0M backtest & sim gate 0/60, web/design agency, client portals). Live data: clients=${c.clientNames}; projects=${c.projNames}; market=${c.sess}. Speak ONE short council contribution (1-2 sentences, in character, may address other seats with @NAME). Honesty: backtest ≠ live money.${topic ? ` Current topic on the table: "${topic}".` : ""}`;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": KEY(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: MODEL(), max_tokens: 120, system: sys,
          messages: [{ role: "user", content: "Council transcript so far:\n" + log.slice(-8).map(m => m.n + ": " + m.t).join("\n") + "\n\nYour turn." }] })
      });
      if (!r.ok) throw new Error("API " + r.status);
      const d = await r.json();
      return d.content.map(b => b.text || "").join(" ").trim();
    }

    /* ── the session loop ── */
    const nextTurn = async () => {
      if (!document.contains(el) || document.hidden || busyAPI) return;
      const mem = M[turn++ % M.length], c = ctx();
      if (KEY()) {
        busyAPI = true;
        try { await say(mem, (await apiTurn(mem, c)).replace(/^"|"$/g, "")); }
        catch (e) { await say(mem, lines(mem, c)); }
        busyAPI = false;
      } else await say(mem, lines(mem, c));
    };
    this._timers.push(setInterval(nextTurn, 8000));
    setTimeout(nextTurn, 600);

    const tableIt = t2 => {
      t2 = (t2 || el.querySelector("#rtIn").value).trim(); if (!t2) return;
      el.querySelector("#rtIn").value = "";
      topic = t2; topicLife = 5; turn = 0;
      log.push({ n: user.name.toUpperCase() + " · CHAIR", col: "#eafcff", t: "New topic on the table: “" + t2 + "”" }); R();
      nextTurn();
    };
    el.querySelector("#rtGo").onclick = () => tableIt();
    el.querySelector("#rtIn").addEventListener("keydown", e => { if (e.key === "Enter") tableIt(); });
    el.querySelectorAll(".qk").forEach(b => b.onclick = () => tableIt(b.dataset.t));

    /* ── the chamber: council ring ── */
    const cv = el.querySelector("#rtRing"), x = cv.getContext("2d");
    cv.width = 680; cv.height = 600;
    let ct = 0;
    const ring = setInterval(() => {
      if (document.hidden || !document.contains(cv)) return;
      ct++;
      x.clearRect(0, 0, 680, 600);
      const cx = 340, cy = 290, RR = 200;
      /* holo table */
      const tg = x.createRadialGradient(cx, cy, 0, cx, cy, RR * .8);
      tg.addColorStop(0, "rgba(0,232,208,.12)"); tg.addColorStop(.7, "rgba(0,232,208,.03)"); tg.addColorStop(1, "transparent");
      x.fillStyle = tg; x.beginPath(); x.ellipse(cx, cy, RR * .85, RR * .38, 0, 0, 7); x.fill();
      x.strokeStyle = "rgba(0,232,208,.25)"; x.lineWidth = 1.6;
      x.beginPath(); x.ellipse(cx, cy, RR * .85, RR * .38, 0, 0, 7); x.stroke();
      /* rotating data ring on the table */
      x.strokeStyle = "rgba(169,139,255,.35)";
      x.beginPath(); x.ellipse(cx, cy, RR * .55, RR * .24, 0, ct * .02, ct * .02 + 4.4); x.stroke();
      const speakingIdx = (turn - 1 + M.length * 99) % M.length;
      M.forEach((m, i) => {
        const a = -Math.PI / 2 + (i / M.length) * Math.PI * 2 + ct * .0015;
        const px = cx + Math.cos(a) * RR * .82, py = cy + Math.sin(a) * RR * .42;
        const speaking = i === speakingIdx;
        const r0 = speaking ? 26 + Math.sin(ct * .35) * 5 : 18;
        if (speaking) { x.strokeStyle = m.col + "66"; x.lineWidth = 2;
          x.beginPath(); x.arc(px, py, r0 + 10 + Math.sin(ct * .3) * 4, 0, 7); x.stroke(); }
        const g = x.createRadialGradient(px - r0 * .3, py - r0 * .3, 0, px, py, r0 * 1.9);
        g.addColorStop(0, "#fff"); g.addColorStop(.3, m.col); g.addColorStop(1, "transparent");
        x.fillStyle = g; x.beginPath(); x.arc(px, py, r0 * 1.9, 0, 7); x.fill();
        x.fillStyle = speaking ? "#eafcff" : "rgba(143,180,196,.8)";
        x.font = (speaking ? "700 " : "") + "13px 'JetBrains Mono'"; x.textAlign = "center";
        x.fillText(m.n, px, py + r0 + 26);
      });
    }, 55);
    this._timers.push(ring);
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
