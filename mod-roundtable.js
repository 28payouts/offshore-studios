/* ═══════════ MODULE · THE ROUND TABLE (admin only) ═══════════
   A real council, not a screensaver.

   WHAT CHANGED AND WHY
   · It used to loop forever on an 8-second timer, generating personality
     lines from a script. It looked alive and decided nothing.
   · It also called the Anthropic API straight from the browser with a key
     that no longer exists there — so in practice it could only ever run
     the fake version. Now every seat speaks through the secure relay.
   · A session is BOUNDED: opening statements, one round of cross-talk,
     then a verdict. Roughly eleven calls. It convenes when you ask it to
     and then it stops, because an infinite council is just an expensive
     screensaver.
   · It ends with something you can act on. The verdict is saved, and you
     mark each action DONE or DROPPED. A council that never produces a
     decision is theatre.

   HONESTY RULES (enforced in the system prompt, not hoped for)
   · Every seat is given the real numbers and told to say "I don't have
     that" rather than invent. Backtest is never described as live money.
   · With no relay the table does NOT fall back to scripted debate. It
     says it cannot convene. Fake counsel is worse than no counsel. */
OS.register({
  id: "table",
  _timers: [], _running: false,
  mount(el, user) {

    /* ── the seats ─────────────────────────────────────────────────── */
    const M = [
      { n: "CLAUDE",        col: "#a98bff", who: "chief engineer and strategist. You frame the problem, you build, and you close the session with the verdict. Sharp, warm, decisive. You are allowed to disagree with the other seats." },
      { n: "THE LIVE MIND", col: "#00e8d0", who: "the trading intelligence. You speak in sessions, liquidity and discipline. You are protective of the record and hostile to anything that risks capital before the sim gate is satisfied." },
      { n: "MARKET EYES",   col: "#4cdcff", who: "the market watcher. You care about execution reality: spread, slippage, fills, whether a plan survives contact with a live tape. You are the one who asks how we would actually know." },
      { n: "AGENCY ENGINE", col: "#6ef2c0", who: "the agency and product builder. Client experience, design, what makes someone say yes and stay. You think in offers and delivery." },
      { n: "THE LEDGER",    col: "#ffc46b", who: "the money mind. Blunt, revenue-first, allergic to work that does not pay. You demand a dollar path and a date for everything." }
    ];

    let log = [], topic = null, running = false, verdict = null;
    const store = (k, d) => OS.store.get(k, d);

    /* ── THE BRIEFING — only things that are actually true ───────────
       Anything we do not know is stated as unknown. The seats are told
       explicitly not to fill gaps with plausible numbers. */
    const brief = () => {
      const n = OS.nyNow();
      const cl = store("clients", []), pj = store("projects", []);
      const live = n.wd !== "Sat" && n.wd !== "Sun" &&
        ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      const paying = cl.filter(c => c.bill).map(c => `${c.name} (${c.bill})`);
      return [
        `NEW YORK TIME: ${n.wd} ${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")} — ${live ? "inside a hunting window" : "outside session windows"}.`,
        `TRADING — the engine set has been frozen since 27 July 2026. Verified BACKTEST only: $100k to $10.02M over ten years of one-minute data, 4,267 trades, 57.3% win rate, profit factor 2.00, worst drawdown 16.9%. This is NOT live money and has never been live money.`,
        `SIM GATE: 0 of 60 verified simulated trades. The TradingView webhook is not connected yet, so there are ZERO recorded fills. If asked how the bot is performing live, the only honest answer is that it has not traded.`,
        `PROVENANCE of the record (verified 26 Aug 2026 against the raw files): the headline figures come from LIVEMIND_V6_account.csv — the account simulation from 1 June 2016, 4,267 trades, 57.3% win, dollar profit factor 2.00, max drawdown 16.9%, position-sized with the protection stack. The underlying signal file runs longer, from 2008, with 6,164 raw signals at a 1.66 R-multiple profit factor before sizing. Both are real; the headline describes the account, not the raw signal set. Do not mix them.`,
        `CRITICAL GAP: the verified v6 engine set exists as a PYTHON simulation, not as Pine Script. It therefore cannot run on TradingView and cannot fire alerts as things stand. The Pine files in the project (APlus_ICT_v4 and older) are a DIFFERENT, earlier strategy with its own separate results. Nothing can be recorded live until this gap is closed.`,
        `AGENCY — offers are Signature Site $2,500, Full Build $5,000, and Care & Growth $250/month which is a maintenance ADD-ON for existing clients only, never a way in.`,
        `CLIENT BOOK: ${cl.length ? `${cl.length} — ${cl.map(c => c.name).join(", ")}` : "empty. No clients have been onboarded yet."}${paying.length ? `. Billing on record: ${paying.join("; ")}.` : ""}`,
        `PROJECTS: ${pj.length ? pj.map(p => p.name).join(", ") : "none logged"}.`,
        `LIVE PROPERTIES: the Live Mind update site, Harmonic Academy, and the Offshore Studios site. The app itself now runs real accounts through Supabase with a secure server relay holding the API key.`,
        `PEOPLE: Riley owns and builds everything. Mr John is his boss on the Harmonic side and will run his own simulated bot; he sees Harmonic and trading only.`
      ].join("\n");
    };

    /* ── rendering ──────────────────────────────────────────────────── */
    const R = () => {
      const lg = el.querySelector("#rtLog"); if (!lg) return;
      lg.innerHTML = log.map(m => m.chair
        ? `<div class="msg" style="border-color:#eafcff33;max-width:88%"><div><b style="color:#eafcff;font-family:var(--mono);font-size:10px;letter-spacing:.14em">${m.n}</b><br>${m.t}</div></div>`
        : `<div class="msg ai" style="border-color:${m.col}44;max-width:88%">
             <span class="aidot" style="background:radial-gradient(circle,${m.col},#a98bff)"></span>
             <div><b style="color:${m.col};font-family:var(--mono);font-size:10px;letter-spacing:.14em">${m.n}</b><br>${m.t}</div></div>`).join("");
      lg.scrollTop = lg.scrollHeight;
    };

    const say = (mem, txt) => new Promise(res => {
      log.push({ n: mem.n, col: mem.col, t: "" });
      const i = log.length - 1, words = String(txt).split(" "); let w = 0;
      const nw = el.querySelector("#rtNow"); if (nw) { nw.textContent = mem.n + " SPEAKING"; nw.style.color = mem.col; }
      const t = setInterval(() => {
        log[i].t = words.slice(0, ++w).join(" "); R();
        if (w >= words.length) { clearInterval(t); if (nw) { nw.textContent = running ? "COUNCIL IN SESSION" : "TABLE ADJOURNED"; nw.style.color = "var(--dim)"; } res(); }
      }, 22);
      this._timers.push(t);
    });

    /* ── one seat speaks, through the relay ─────────────────────────── */
    async function speak(mem, instruction) {
      const sys =
        `You are ${mem.n} — ${mem.who} You hold one seat at the Offshore round table, an advisory council serving Riley.\n\n` +
        `THE BRIEFING (this is the only factual ground you have):\n${brief()}\n\n` +
        `RULES: Never invent a number, a client, a result or a fill. If the briefing does not contain something, say plainly that you do not have it and say what would be needed to get it. Never describe the backtest as live performance. Speak in character, address other seats with @NAME when you disagree or build on them. Be specific and useful — no motivational filler, no restating the briefing back.` +
        (topic ? `\n\nThe chair has put this on the table: "${topic}". Stay on it.` : "");

      const transcript = log.filter(m => !m.chair).slice(-8).map(m => m.n + ": " + m.t).join("\n");
      const res = await OS.cloud.call("claude", {
        scope: "owner",
        system: sys,
        model: OS.store.get("claude_model", "claude-sonnet-5"),
        messages: [{ role: "user", content: (transcript ? "Council so far:\n" + transcript + "\n\n" : "") + instruction }]
      });
      if (!res) throw new Error("offline");
      if (res.error) throw new Error(res.error);
      return (res.content || []).map(b => b.text || "").join(" ").trim().replace(/^"|"$/g, "");
    }

    /* ── the verdict: the point of the whole exercise ────────────────── */
    async function closeSession() {
      const sys =
        `You are CLAUDE, chairing the close of an Offshore round table session.\n\nTHE BRIEFING:\n${brief()}\n\n` +
        `Read the council transcript and deliver the verdict: the three highest-value actions Riley should take next, ranked. ` +
        `Ground every one in what was actually said and in the briefing. Never invent data.\n\n` +
        `Answer as EXACTLY three lines, no preamble, no numbering, this format:\n` +
        `TITLE :: why it matters in one sentence :: the very first concrete step\n` +
        `Keep each field short and plain.`;
      const res = await OS.cloud.call("claude", {
        scope: "owner", system: sys, model: OS.store.get("claude_model", "claude-sonnet-5"),
        messages: [{ role: "user", content: "Transcript:\n" + log.filter(m => !m.chair).map(m => m.n + ": " + m.t).join("\n") + "\n\nThe verdict." }]
      });
      if (!res || res.error) return null;
      const txt = (res.content || []).map(b => b.text || "").join(" ");
      const items = txt.split("\n").map(l => l.trim()).filter(l => l.includes("::")).slice(0, 3)
        .map(l => { const p = l.split("::").map(s => s.trim().replace(/^[-*\d.\s]+/, "")); return { t: p[0], why: p[1] || "", step: p[2] || "", s: "open" }; });
      return items.length ? { when: Date.now(), topic: topic || "general session", items } : null;
    }

    /* ── the session: bounded, deliberate, then it stops ─────────────── */
    async function convene(t) {
      if (running) return;
      topic = (t || "").trim() || null;
      log = []; verdict = null; running = true; paint();
      el.querySelector("#rtGo").disabled = true;
      el.querySelector("#rtGo").textContent = "IN SESSION…";
      log.push({ chair: true, n: user.name.toUpperCase() + " · CHAIR", t: topic ? "On the table: “" + topic + "”" : "The council convenes on the state of the business." });
      R();

      try {
        for (const mem of M) await say(mem, await speak(mem, "Give your opening read. One or two sentences."));
        log.push({ chair: true, n: "CHAIR", t: "Cross-talk — respond to each other." }); R();
        for (const mem of M) await say(mem, await speak(mem, "Respond to what the others have said. Disagree where you disagree, and be concrete."));

        const v = await closeSession();
        if (v) {
          verdict = v;
          const all = store("decisions", []); all.unshift(v);
          OS.store.setLocal("decisions", all.slice(0, 12));
          log.push({ chair: true, n: "THE VERDICT", t: "Three actions on the board below." }); R();
        }
      } catch (e) {
        log.push({ chair: true, n: "TABLE ADJOURNED", t: e.message === "offline"
          ? "The council could not convene — the secure relay is unreachable. Rather than script a fake debate, it says nothing."
          : "The council stopped: " + e.message });
        R();
      }

      running = false;
      const g = el.querySelector("#rtGo");
      if (g) { g.disabled = false; g.textContent = "CONVENE THE TABLE"; }
      paint();
    }

    /* ── the decisions board — what the table actually produced ──────── */
    const board = () => {
      const all = verdict ? [verdict] : store("decisions", []).slice(0, 1);
      if (!all.length || !all[0]) return `<div class="card reveal"><h3>No verdict yet</h3>
        <p class="cs">Convene the table and it will close with three ranked actions — each with why it matters and the first concrete step. They land here and stay until you mark them.</p></div>`;
      const v = all[0];
      return `<div class="card reveal">
        <h3 style="margin:0 0 2px">The verdict<span class="grad">.</span></h3>
        <p class="cs" style="margin:0 0 14px">${new Date(v.when).toLocaleString()} · ${v.topic}</p>
        ${v.items.map((it, i) => `
          <div style="border-left:2px solid ${it.s === "done" ? "#6ef2c0" : it.s === "dropped" ? "#ffffff22" : "#a98bff"};padding:0 0 0 14px;margin:0 0 16px;${it.s === "dropped" ? "opacity:.42" : ""}">
            <div style="font:700 13.5px 'Space Grotesk',sans-serif;color:#eafcff">${i + 1}. ${it.t}</div>
            <div class="cs" style="margin:3px 0 2px">${it.why}</div>
            <div class="cs" style="color:#8fb4c4"><b style="color:#cfeff5">First step:</b> ${it.step}</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <button class="btn ghost sm" data-mark="${i}" data-s="done">✓ DONE</button>
              <button class="btn ghost sm" data-mark="${i}" data-s="dropped">✕ DROP</button>
            </div>
          </div>`).join("")}
      </div>`;
    };

    /* ── paint ───────────────────────────────────────────────────────── */
    const paint = () => {
      const relayOn = !!(window.OS_CONFIG.RELAY_URL);
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">The Round Table</div>
        <h2>Every mind you own,<br><span class="grad">at one table.</span></h2>
        <p class="sub">The council reads what is actually true about the business — the frozen engines, the empty sim gate, the client book, the offers — argues it out, and closes with three actions you can act on today.</p>
        <span class="chip ${relayOn ? "ok" : "off"}">${relayOn ? "LIVE COUNCIL · secure relay · bounded session" : "COUNCIL OFFLINE · needs the secure relay"}</span>
      </div>

      <div class="cards reveal" style="grid-template-columns:.85fr 1.15fr">
        <div class="card" style="display:flex;flex-direction:column;align-items:center">
          <h3 style="align-self:flex-start">The chamber</h3>
          <canvas id="rtRing" style="width:100%;max-width:340px;height:300px"></canvas>
          <div class="mono" id="rtNow" style="font-size:9px;letter-spacing:.24em;color:var(--dim)">${running ? "COUNCIL IN SESSION" : "TABLE ADJOURNED"}</div>
        </div>
        <div class="card chatcard">
          <div class="chatlog" id="rtLog" style="min-height:380px"></div>
          <div class="chatbar">
            <input class="fin" id="rtIn" placeholder="what should the table decide? leave blank for a general session" ${running ? "disabled" : ""}>
            <button class="btn" id="rtGo" ${relayOn ? "" : "disabled"}>${running ? "IN SESSION…" : "CONVENE THE TABLE"}</button>
          </div>
          <div class="quickrow">
            <button class="qk" data-t="how do we make real revenue in the next 30 days">💰 revenue in 30 days</button>
            <button class="qk" data-t="what has to happen before the trading bot touches real money">📈 path to live</button>
            <button class="qk" data-t="how do we win and keep the first paying clients">🤝 first clients</button>
            <button class="qk" data-t="what should we build next in this app and why">⚗ what to build next</button>
          </div>
        </div>
      </div>
      ${board()}`;

      el.querySelector("#rtGo").onclick = () => convene(el.querySelector("#rtIn").value);
      el.querySelector("#rtIn").addEventListener("keydown", e => { if (e.key === "Enter" && !running) convene(e.target.value); });
      el.querySelectorAll(".qk").forEach(b => b.onclick = () => { if (!running) convene(b.dataset.t); });
      el.querySelectorAll("[data-mark]").forEach(b => b.onclick = () => {
        const all = store("decisions", []); if (!all[0]) return;
        all[0].items[+b.dataset.mark].s = b.dataset.s;
        OS.store.setLocal("decisions", all); verdict = all[0]; paint(); R();
      });
      R();
      chamber();
    };

    /* ── the chamber ring ────────────────────────────────────────────── */
    const chamber = () => {
      const cv = el.querySelector("#rtRing"); if (!cv) return;
      const x = cv.getContext("2d"); cv.width = 680; cv.height = 600;
      let ct = 0;
      const ring = setInterval(() => {
        if (document.hidden || !document.contains(cv)) return;
        ct++;
        x.clearRect(0, 0, 680, 600);
        const cx = 340, cy = 290, RR = 200;
        const tg = x.createRadialGradient(cx, cy, 0, cx, cy, RR * .8);
        tg.addColorStop(0, "rgba(0,232,208,.12)"); tg.addColorStop(.7, "rgba(0,232,208,.03)"); tg.addColorStop(1, "transparent");
        x.fillStyle = tg; x.beginPath(); x.ellipse(cx, cy, RR * .85, RR * .38, 0, 0, 7); x.fill();
        x.strokeStyle = "rgba(0,232,208,.25)"; x.lineWidth = 1.6;
        x.beginPath(); x.ellipse(cx, cy, RR * .85, RR * .38, 0, 0, 7); x.stroke();
        x.strokeStyle = "rgba(169,139,255,.35)";
        x.beginPath(); x.ellipse(cx, cy, RR * .55, RR * .24, 0, ct * .02, ct * .02 + 4.4); x.stroke();
        const last = log.filter(m => !m.chair).slice(-1)[0];
        const speakingIdx = running && last ? M.findIndex(m => m.n === last.n) : -1;
        M.forEach((m, i) => {
          const a = -Math.PI / 2 + (i / M.length) * Math.PI * 2 + ct * .0015;
          const px = cx + Math.cos(a) * RR * .82, py = cy + Math.sin(a) * RR * .42;
          const sp = i === speakingIdx;
          const r0 = sp ? 26 + Math.sin(ct * .35) * 5 : 18;
          if (sp) { x.strokeStyle = m.col + "66"; x.lineWidth = 2; x.beginPath(); x.arc(px, py, r0 + 10 + Math.sin(ct * .3) * 4, 0, 7); x.stroke(); }
          const g = x.createRadialGradient(px - r0 * .3, py - r0 * .3, 0, px, py, r0 * 1.9);
          g.addColorStop(0, "#fff"); g.addColorStop(.3, m.col); g.addColorStop(1, "transparent");
          x.fillStyle = g; x.beginPath(); x.arc(px, py, r0 * 1.9, 0, 7); x.fill();
          x.fillStyle = sp ? "#eafcff" : "rgba(143,180,196,.8)";
          x.font = (sp ? "700 " : "") + "13px 'JetBrains Mono'"; x.textAlign = "center";
          x.fillText(m.n, px, py + r0 + 26);
        });
      }, 55);
      this._timers.push(ring);
    };

    paint();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
