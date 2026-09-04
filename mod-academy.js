/* ═══════════ MODULE · HARMONIC PROJECTS ═══════════
   A universe of projects, not a list. Every project is a card you enter;
   inside, each one is its own world with its own shape of information.
   THE LIVE MIND carries the full build lineage — every version we shipped.
   Nothing here is invented: versions map to real files in the bot repo and
   figures come from the verified backtests. Empty things stay honestly empty. */
OS.register({
  id: "academy",
  _timers: [],
  mount(el, user) {
    const CUSTOM = () => OS.store.get("hm_projects", []);
    const acadUrl = () => OS.store.get("hm_academy_url", "https://harmonic-academy.netlify.app/");
    let open = null;   /* null = grid, otherwise project key */

    /* ── THE LIVE MIND LINEAGE — every version actually built ── */
    const LINEAGE = [
      { v: "Trade Bot", f: "trade_bot.py", tag: "FOUNDATION", note: "The first real edge. 4,865 trades, Jan 2008 → Mar 2026.",
        stats: [["Win rate", "46.4%"], ["Profit factor", "1.48"], ["Mean R", "+0.259R"], ["$10k @ 2%, 3-ES cap", "$584,625"], ["Max DD", "11.6%"]],
        learned: "A real edge is not a high win rate. 46% with +0.26R repeated 267×/yr is what compounds." },
      { v: "Golden Bot", f: "golden_bot.py", tag: "EXPERIMENT", note: "First attempt at ranking setups instead of taking them all.",
        stats: [], learned: "Ranking helped. The ranking rule itself was too crude to keep." },
      { v: "Golden Bot v2", f: "golden_bot_v2.py", tag: "EXPERIMENT", note: "Second pass at setup ranking with tighter conditions.",
        stats: [], learned: "Tighter beat looser — the first hint that selectivity, not frequency, was the lever." },
      { v: "Safe Bot", f: "safe_bot.py", tag: "RISK STUDY", note: "Maximum-protection build: smaller size, harder stops.",
        stats: [], learned: "Protection smoothed the curve but capped the money. Kept the protections, dropped the caps." },
      { v: "Swing Bot", f: "swing_bot.py", tag: "TIMEFRAME", note: "Higher-timeframe swing variant off the same structure logic.",
        stats: [], learned: "The edge lives intraday. Swing held fewer, worse trades." },
      { v: "Bot A v6", f: "bot_a_v6.py", tag: "LINE A", note: "Sixth iteration of the A line — session-filtered entries.",
        stats: [], learned: "Session filtering was the single biggest clean win of the A line." },
      { v: "Bot B v9", f: "bot_b_v9.py", tag: "LINE B", note: "Ninth iteration of the B line — a separate entry philosophy run in parallel.",
        stats: [], learned: "Two philosophies beat one. This is where the multi-engine idea was born." },
      { v: "AMD / CISD engine", f: "amd_cisd_backtester.py", tag: "ICT MODEL", note: "Accumulation–Manipulation–Distribution with CISD confirmation.",
        stats: [], learned: "Narrative-based entries survived out-of-sample where indicator entries did not." },
      { v: "4H Candle engine", f: "candle4h_engine.py", tag: "HTF DRAW", note: "Higher-timeframe candle logic feeding the draw on liquidity.",
        stats: [], learned: "HTF context massively improved target selection. Folded into every later engine." },
      { v: "A+ ICT MES v2", f: "APlus_ICT_MES_v2.pine", tag: "PINE", note: "First A+ filtered Pine build on MES.",
        stats: [], learned: "A+ filtering beat every unfiltered version tested." },
      { v: "A+ ICT MES v2 — experimental", f: "APlus_ICT_MES_v2_EXPERIMENTAL.pine", tag: "PINE", note: "Loosened variant, run head-to-head against v2.",
        stats: [], learned: "Every loosening tested worse. Overtrading is the tax." },
      { v: "A+ ICT NQ v1", f: "APlus_ICT_NQ_v1.pine", tag: "PINE · NQ", note: "The A+ model ported to Nasdaq.",
        stats: [], learned: "NQ carried the same logic better than ES. That gap is still the open question." },
      { v: "A+ ICT v4", f: "APlus_ICT_v4.pine + aplus_v4_backtester.py", tag: "PINE", note: "Full A+ rebuild with the swept-liquidity bias engine.",
        stats: [["Win rate", "65.6%"], ["Sample", "93 trades, 2019+"]], learned: "Highest win rate we ever recorded — but on a small, recent sample. Not proof, a signal." },
      { v: "Monday Bot · ES / NQ", f: "MONDAY_BOT_ES.pine · MONDAY_BOT_NQ.pine", tag: "DEPLOY", note: "The pair prepared for a live Monday start.",
        stats: [], learned: "Deployment discipline: two instruments, one rule set, no last-minute tweaks." },
      { v: "NQ backtester v3", f: "nq_backtester_v3.py", tag: "VALIDATION", note: "Dedicated NQ bar-by-bar validation harness.",
        stats: [], learned: "Bar-by-bar or it didn't happen. This harness became the standard." },
      { v: "Cross-test: ES engine on NQ", f: "cross_es_on_nq.py", tag: "VALIDATION", note: "Ran the ES brain on NQ data to test whether the edge was market-specific.",
        stats: [], learned: "The edge travelled. That justified building the crossover engine (E3)." },
      { v: "V5 master build", f: "V5_MASTER_BUILD.md · v5_edge_miner.py · v5_exit_opt.py", tag: "OPTIMISED", note: "Three OOS-validated finalists from identical entries: RETURN, QUALITY, SMOOTH.",
        stats: [], learned: "Same entries, different exits, very different outcomes. Exits are their own edge." },
      { v: "LIVE MIND v6", f: "audited+frozen 28 Aug 2026", tag: "CURRENT · FROZEN", note: "One machine, four engines. The build everything else fed into.",
        stats: [["10y result", "$100k → $3,427,531"], ["Trades", "1,845"], ["Win rate", "59.7%"], ["Profit factor", "1.50"], ["Max DD", "19.9%"], ["CAGR", "43.9%"]],
        learned: "Frozen rules, versioned changes, and a 0/60 sim gate before a dollar goes live." }
    ];

    const HF = "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/";
    const ART = {
      livemind: HF + "hf_20260821_175515_f25e921c-0e59-4a4b-b82c-95be8cdeaa03.png",
      academy: HF + "hf_20260821_175515_2505b7fc-ce7e-4b1b-a754-57c1ad89f6c5.png",
      other: HF + "hf_20260821_175515_ac39776a-7b90-47ab-b274-95ad8c3a2811.png"
    };

    /* ── the project set: two real ones + whatever Riley logs ── */
    const CORE = [
      { key: "livemind", name: "THE LIVE MIND", sub: "trading bot · " + LINEAGE.length + " versions built", accent: "#00e8d0", art: ART.livemind,
        chip: ["FROZEN 27 JUL", "ok"], brief: [
          ["◈", "Current build", "v6 — one machine, four engines"],
          ["◈", "Verified record", "$100k → $3.43M / 10y backtest"],
          ["◈", "Versions shipped", LINEAGE.length + " distinct builds, all on file"],
          ["◈", "Live status", "sim gate 0/60 — awaiting TradingView webhook"]
        ] },
      { key: "academy", name: "HARMONIC ACADEMY", sub: "education platform · shipped", accent: "#4cdcff", art: ART.academy,
        chip: ["LIVE · REAL", "ok"], brief: [
          ["◈", "Status", "live and shipped"],
          ["◈", "Address", "harmonic-academy.netlify.app"],
          ["◈", "Next", "Harmonic's own AI — FM3 walkthroughs"],
          ["◈", "Owner", "Riley · Offshore Studios build"]
        ] }
    ];

    const projects = () => CORE.concat(CUSTOM().map((p, i) => ({
      key: "c" + i, ci: i, name: p.name.toUpperCase(), sub: p.desc || "harmonic project", accent: p.color || "#a98bff", art: ART.other,
      chip: p.status === "done" ? ["COMPLETED", "ok"] : ["IN FLIGHT", "warn"],
      brief: [["◈", "What it is", p.desc || "described when you log it"],
              ["◈", "Status", p.status === "done" ? "completed" : "in flight"],
              ["◈", "Link", p.link || "none yet"],
              ["◈", "Logged", new Date(p.created || Date.now()).toLocaleDateString()]],
      custom: p
    })));

    /* ══════════ THE GRID ══════════ */
    const grid = () => {
      const P = projects();
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Harmonic Projects · ${user.name}</div>
        <h2>Every project,<br><span class="grad">a world of its own.</span></h2>
        <p class="sub">Enter a project to see everything inside it — its build lineage, its record, its next move.
        Log a new one and it takes its place here instantly.</p>
      </div>

      <div class="pgrid">
        ${P.map(p => `
        <div class="pcard" data-k="${p.key}" style="--pa:${p.accent}">
          <div class="pc-art" style="background-image:url('${p.art}')"></div><div class="pc-fade"></div>
          <div class="pc-body">
            <div class="pc-top"><div class="pc-name">${p.name}</div><span class="chip ${p.chip[1]}">${p.chip[0]}</span></div>
            <div class="pc-sub">${p.sub}</div>
            <ul class="pc-brief">${p.brief.map(([i, t, d]) => `<li><span class="pi">${i}</span><span><b>${t}</b> — ${d}</span></li>`).join("")}</ul>
            <button class="pc-enter">ENTER ${p.name} →</button>
          </div>
        </div>`).join("")}
      </div>

      <div class="card reveal" style="margin-top:16px;max-width:600px">
        <h3>Log a new Harmonic project</h3>
        <p class="cs">it becomes a world in this universe the moment you save it · auto-publish to the public site unlocks with the backend keys</p>
        <div class="cform">
          <input class="fin" id="hpName" placeholder="project name">
          <input class="fin" id="hpDesc" placeholder="what it is / what it does for Harmonic">
          <input class="fin" id="hpLink" placeholder="link (optional)">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:10px;color:var(--dim);letter-spacing:.14em">STATUS</span>
            <button class="chip ok" id="hpDone">COMPLETED</button>
            <button class="chip warn" id="hpFlight">IN FLIGHT</button>
          </div>
          <button class="btn" id="hpGo">CREATE THE WORLD</button>
        </div>
      </div>`;

      el.querySelectorAll(".pcard").forEach(c => {
        c.querySelector(".pc-enter").onclick = e => { e.stopPropagation(); open = c.dataset.k; render(); };
        c.onclick = () => el.querySelectorAll(".pcard").forEach(o => o.classList.toggle("on", o === c));
      });
      let status = "done";
      const d = el.querySelector("#hpDone"), f = el.querySelector("#hpFlight");
      const paint = () => { d.style.opacity = status === "done" ? 1 : .4; f.style.opacity = status === "done" ? .4 : 1; };
      d.onclick = () => { status = "done"; paint(); }; f.onclick = () => { status = "flight"; paint(); }; paint();
      el.querySelector("#hpGo").onclick = () => {
        const name = el.querySelector("#hpName").value.trim(); if (!name) return;
        OS.store.set("hm_projects", [...CUSTOM(), { name, desc: el.querySelector("#hpDesc").value.trim(),
          link: el.querySelector("#hpLink").value.trim(), color: "#a98bff", status, created: Date.now() }]);
        render();
      };
    };

    /* ══════════ PROJECT: THE LIVE MIND ══════════ */
    const liveMindView = () => `
      ${head("THE LIVE MIND", "trading bot · the full build lineage", "#00e8d0",
        "Eighteen months of builds, in order. Every version below is a real file in the bot repo — what it tried, and what it taught the next one.")}

      <div class="cards reveal">
        <div class="card"><div class="stat"><div class="k">Versions built</div><div class="v aq">${LINEAGE.length}</div><div class="s">every one on file, none discarded from the record</div></div></div>
        <div class="card"><div class="stat"><div class="k">Current build</div><div class="v">v6</div><div class="s">four engines · audited+frozen 28 Aug 2026</div></div></div>
        <div class="card"><div class="stat"><div class="k">Verified 10y</div><div class="v pos">$3.43M</div><div class="s">$100k start · bar-by-bar backtest</div></div></div>
        <div class="card"><div class="stat"><div class="k">Live capital</div><div class="v wc">0 / 60</div><div class="s">sim gate — nothing live until it passes</div></div></div>
      </div>

      <div class="mhead reveal" style="margin-top:26px"><div class="eyebrow">The lineage</div>
        <h2 style="font-size:1.3rem">Every version, in order <span class="chip ok" style="vertical-align:middle">REAL FILES</span></h2></div>

      <div class="lineage">
        ${LINEAGE.map((L, i) => `
        <div class="lrow ${i === LINEAGE.length - 1 ? "cur" : ""}">
          <div class="lnum">${String(i + 1).padStart(2, "0")}</div>
          <div class="lbody">
            <div class="ltop"><b>${L.v}</b><span class="chip ${i === LINEAGE.length - 1 ? "ok" : "off"}">${L.tag}</span></div>
            <div class="lfile mono">${L.f}</div>
            <div class="lnote">${L.note}</div>
            ${L.stats.length ? `<div class="lstats">${L.stats.map(([k, v]) => `<span><i>${k}</i>${v}</span>`).join("")}</div>` : ""}
            <div class="llearn">↳ ${L.learned}</div>
          </div>
        </div>`).join("")}
      </div>

      <div class="cards reveal" style="margin-top:18px;grid-template-columns:1fr 1fr">
        <div class="card"><h3>Where this project goes next</h3><p class="cs">in order, and honestly</p>
          <div style="font-size:12.5px;color:var(--mut);line-height:2.1">
            ① TradingView webhook → the sim gate starts counting<br>
            ② 60 verified sim trades → compare to the 59.7% record<br>
            ③ First live capital, smallest size, unchanged rules<br>
            ④ Live fills feed the Bot Lab → the first real learning loop
          </div></div>
        <div class="card"><h3>Deep desk</h3><p class="cs">the full stats and the three-mind council live on their own page</p>
          <button class="btn" id="toLab">OPEN THE BOT LAB ⚗</button></div>
      </div>`;

    /* ══════════ PROJECT: HARMONIC ACADEMY ══════════ */
    const academyView = () => `
      ${head("HARMONIC ACADEMY", "education platform · shipped and live", "#4cdcff",
        "A real, running product — not a plan. Below: the live site, and the desk where we decide what Harmonic builds next.")}

      <div class="cards reveal" style="grid-template-columns:1.1fr .9fr">
        <div class="card">
          <h3>The live platform <span class="chip ok" style="float:right">LIVE</span></h3>
          <p class="cs">shipped and serving students today</p>
          <div style="margin-top:14px"><a class="btn" href="${acadUrl()}" target="_blank">OPEN HARMONIC ACADEMY ↗</a></div>
          <div class="cform" style="margin-top:14px;max-width:440px">
            <input class="fin" id="hmUrl" placeholder="change the address" value="${acadUrl()}">
            <button class="btn ghost sm" id="hmUrlGo">UPDATE LINK</button>
          </div>
        </div>
        <div class="card"><h3>What's next for it</h3><p class="cs">raised on the desk below, built when we agree</p>
          <div style="font-size:12.5px;color:var(--mut);line-height:2.1">
            ◈ Harmonic's own AI — walks students through FM3<br>
            ◈ Course tooling that scales past one instructor<br>
            ◈ Progress tracking students actually return for<br>
            <span class="chip off" style="margin-top:8px">NOTHING SHIPPED YET — HONEST</span>
          </div></div>
      </div>`;

    /* ══════════ PROJECT: a logged one ══════════ */
    const customView = p => `
      ${head(p.name, p.sub, p.accent, p.custom.desc || "You logged this project — everything you add to it lands here.")}
      <div class="cards reveal">
        <div class="card"><div class="stat"><div class="k">Status</div><div class="v ${p.custom.status === "done" ? "pos" : "wc"}">${p.custom.status === "done" ? "COMPLETED" : "IN FLIGHT"}</div><div class="s">logged ${new Date(p.custom.created).toLocaleDateString()}</div></div></div>
        <div class="card"><h3>Link</h3>${p.custom.link ? `<a class="btn ghost sm" href="${p.custom.link}" target="_blank">OPEN ↗</a>` : `<span class="chip off">NONE YET</span>`}</div>
        <div class="card"><h3>Manage</h3><button class="btn ghost sm danger" id="pDel">DELETE PROJECT</button></div>
      </div>
      <div class="card reveal" style="margin-top:14px"><h3>This world fills as you work</h3>
        <p class="cs">Raise it on the desk below and Claude keeps the record. With the API key it writes the updates itself.</p></div>`;

    const head = (name, sub, accent, blurb) => `
      <button class="btn ghost sm" id="backBtn" style="margin-bottom:14px">← ALL PROJECTS</button>
      <div class="mhead reveal" style="border-left:2px solid ${accent};padding-left:18px">
        <div class="eyebrow" style="color:${accent}">${sub}</div>
        <h2>${name}</h2><p class="sub">${blurb}</p>
      </div>`;

    /* ══════════ the desk (per project context) ══════════ */
    const desk = p => `
      <div class="chatcard card reveal" style="margin-top:16px">
        <div style="display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid rgba(120,180,200,.12)">
          <span class="aidot" style="background:#a98bff"></span>
          <div><div style="font:800 13px Unbounded;color:#eafcff">PROJECT DESK</div>
            <div class="mono" style="font-size:10px;letter-spacing:.2em;color:var(--dim)">${user.name.toUpperCase()} × CLAUDE · ${p.name}</div></div>
          <span class="chip ${localStorage.getItem("claude_key") ? "ok" : "off"}" style="margin-left:auto">${localStorage.getItem("claude_key") ? "API · REAL CLAUDE" : "LOCAL · add API key in ✦ Claude"}</span>
        </div>
        <div class="chatlog" id="hmLog"></div>
        <div class="quickrow" style="padding:0 18px">
          <button class="qk" data-t="what should we build next on this project?">🚀 what's next</button>
          <button class="qk" data-t="how would Harmonic's own AI work — one that walks students through FM3 and the whole platform?">🤖 Harmonic AI</button>
          <button class="qk" data-t="what is the weakest part of this project right now?">🔍 weakest link</button>
        </div>
        <div class="chatbar"><input id="hmIn" placeholder="talk about ${p.name.toLowerCase()}…"><button id="hmGo">SEND</button></div>
      </div>`;

    /* ══════════ router ══════════ */
    const render = () => {
      if (!open) return grid();
      const P = projects(), p = P.find(q => q.key === open);
      if (!p) { open = null; return grid(); }
      el.innerHTML = (p.key === "livemind" ? liveMindView() : p.key === "academy" ? academyView() : customView(p)) + desk(p);
      el.querySelector("#backBtn").onclick = () => { open = null; render(); };
      const lab = el.querySelector("#toLab"); if (lab) lab.onclick = () => OS.emit("nav:request", "botlab");
      const ug = el.querySelector("#hmUrlGo");
      if (ug) ug.onclick = () => { const v = el.querySelector("#hmUrl").value.trim(); if (v) { OS.store.set("hm_academy_url", v); render(); } };
      const del = el.querySelector("#pDel");
      if (del) del.onclick = () => { OS.store.set("hm_projects", CUSTOM().filter((_, i) => i !== p.ci)); open = null; render(); };
      wireDesk(p);
    };

    const wireDesk = p => {
      const key = "hm_chat_" + p.key, log = el.querySelector("#hmLog");
      const paint = (n, col, t) => { const d = document.createElement("div"); d.className = "msg";
        d.innerHTML = `<b style="color:${col};font:700 10.5px 'JetBrains Mono';letter-spacing:.14em">${n}</b><div>${t}</div>`;
        log.appendChild(d); log.scrollTop = log.scrollHeight; };
      const hist = OS.store.get(key, []); hist.forEach(h => paint(h.n, h.col, h.t));
      const say = (n, col, t) => { paint(n, col, t); const h = OS.store.get(key, []); h.push({ n, col, t }); OS.store.set(key, h.slice(-40)); };
      if (!hist.length) say("CLAUDE", "#a98bff", `Desk open on ${p.name}. Raise anything — next builds, weak points, new ideas. With the API key I answer for real and can write updates straight into this project.`);

      const ctxFor = () => p.key === "livemind"
        ? "Project: THE LIVE MIND trading bot. " + LINEAGE.length + " versions built, current LIVE MIND v1.3 (three legs, leak-audited), audited+frozen 28 Aug 2026. Verified backtest: $100k→$3,427,531 over 10y, 1,845 trades, 59.7% win, PF 1.50, max DD 19.9%. Zero live fills — sim gate 0/60 awaiting the TradingView webhook."
        : p.key === "academy"
        ? "Project: HARMONIC ACADEMY — a real, live education platform at " + acadUrl() + ". Next ideas under discussion: Harmonic's own AI assistant for FM3 walkthroughs, course tooling, student progress tracking. Nothing new shipped yet."
        : "Project: " + p.name + ". " + (p.custom ? (p.custom.desc || "no description logged yet") + ". Status: " + (p.custom.status === "done" ? "completed" : "in flight") + "." : "");

      const send = async () => {
        const inp = el.querySelector("#hmIn"), t = inp.value.trim(); if (!t) return;
        inp.value = ""; say(user.name.toUpperCase(), "#00e8d0", t);
        const k = localStorage.getItem("claude_key");
        if (!k) { say("CLAUDE", "#a98bff", "Logged against this project. Add the API key in ✦ Claude and this desk becomes a live working session with full project context."); return; }
        try {
          const r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "content-type": "application/json", "x-api-key": k, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
            body: JSON.stringify({ model: localStorage.getItem("claude_model") || "claude-sonnet-5", max_tokens: 400,
              system: "You are Claude, resident strategist inside Offshore OS, at Riley's project desk. " + ctxFor() + " Be sharp, concrete and honest — never invent numbers, always distinguish backtest from live, propose buildable next steps.",
              messages: [{ role: "user", content: t }] })
          });
          const j = await r.json();
          const txt = j && j.content && j.content[0] && j.content[0].text;
          say("CLAUDE", "#a98bff", txt ? txt.trim() : "API error — check the key in ✦ Claude.");
        } catch (e) { say("CLAUDE", "#a98bff", "Couldn't reach the API — check the key or connection."); }
      };
      el.querySelector("#hmGo").onclick = send;
      el.querySelector("#hmIn").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
      el.querySelectorAll(".qk[data-t]").forEach(q => q.onclick = () => { el.querySelector("#hmIn").value = q.dataset.t; send(); });
    };

    /* styles for this module only */
    if (!document.getElementById("acadcss")) {
      const s = document.createElement("style"); s.id = "acadcss";
      s.textContent = `
      .pgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}
      .pcard{position:relative;border-radius:24px;overflow:hidden;cursor:pointer;background:#030d16;
        border:1px solid rgba(120,180,200,.16);transition:transform .45s cubic-bezier(.2,.9,.25,1),border-color .45s,box-shadow .45s}
      .pcard:hover,.pcard.on{transform:translateY(-6px);border-color:var(--pa);box-shadow:0 30px 80px -34px var(--pa)}
      .pc-art{height:160px;background-size:cover;background-position:center 30%;transition:transform .8s cubic-bezier(.2,.9,.25,1)}
      .pcard:hover .pc-art{transform:scale(1.06)}
      .pc-fade{position:absolute;top:0;left:0;right:0;height:160px;background:linear-gradient(rgba(1,7,13,.05) 40%,#030d16)}
      .pc-body{padding:16px 22px 22px}
      .pc-top{display:flex;align-items:center;gap:10px}
      .pc-name{font-family:Unbounded;font-weight:800;font-size:.98rem;color:#eafcff;letter-spacing:.03em;flex:1}
      .pc-sub{font:400 10px 'JetBrains Mono',monospace;letter-spacing:.2em;color:var(--dim);margin-top:6px;text-transform:uppercase}
      .pc-brief{list-style:none;margin:14px 0 0;padding:13px 0 0;border-top:1px solid rgba(120,180,200,.12);display:flex;flex-direction:column;gap:8px}
      .pc-brief li{font-size:12.2px;color:var(--mut);line-height:1.5;display:flex;gap:9px}
      .pc-brief li b{color:#cfeff5;font-weight:600}
      .pc-brief .pi{flex:0 0 14px;color:var(--pa)}
      .pc-enter{margin-top:15px;width:100%;border:0;border-radius:99px;padding:12px;cursor:pointer;
        font:700 10px Unbounded;letter-spacing:.24em;color:#01222b;background:linear-gradient(100deg,var(--pa),#4cdcff)}
      .lineage{display:flex;flex-direction:column;gap:10px}
      .lrow{display:flex;gap:16px;padding:16px 20px;border-radius:16px;background:rgba(4,16,26,.6);border:1px solid rgba(120,180,200,.1)}
      .lrow.cur{border-color:rgba(0,232,208,.45);background:rgba(0,232,208,.05)}
      .lnum{font:800 15px Unbounded;color:rgba(143,180,196,.4);flex:0 0 30px}
      .lbody{flex:1;min-width:0}
      .ltop{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .ltop b{font-size:14px;color:#eafcff}
      .lfile{font-size:10px;color:var(--dim);letter-spacing:.06em;margin-top:4px;word-break:break-all}
      .lnote{font-size:12.5px;color:var(--mut);margin-top:7px;line-height:1.6}
      .lstats{display:flex;gap:16px;flex-wrap:wrap;margin-top:9px}
      .lstats span{font:700 12.5px 'JetBrains Mono';color:#eafcff}
      .lstats i{display:block;font:400 9.5px 'JetBrains Mono';color:var(--dim);letter-spacing:.14em;text-transform:uppercase;font-style:normal;margin-bottom:2px}
      .llearn{font-size:12px;color:#8fb4c4;margin-top:9px;font-style:italic;line-height:1.6}`;
      document.head.appendChild(s);
    }

    render();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
