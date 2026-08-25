/* ═══════════ MODULE · HARMONIC PROJECTS ═══════════
   Everything built and shipping for Harmonic: the completed work, the live
   Harmonic Academy, and a strategy desk where Riley + Claude plan what's
   next for the company (Harmonic's own AI, FM3 tooling, new builds).
   Projects added here appear instantly in this app; auto-publishing to the
   public site switches on with the backend keys. */
OS.register({
  id: "academy",
  _timers: [],
  mount(el, user) {
    const P = () => OS.store.get("hm_projects", []);
    const acadUrl = () => OS.store.get("hm_academy_url", "https://harmonic-academy.netlify.app/");

    const render = () => {
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Harmonic Projects · ${user.name}</div>
        <h2>Built for Harmonic.<br><span class="grad">Building what's next.</span></h2>
        <p class="sub">The shipped work, the live Academy, and the strategy desk for what Harmonic becomes next.</p>
      </div>

      <div class="cards" style="grid-template-columns:1.1fr .9fr">
        <div class="card reveal">
          <h3>Harmonic Academy <span class="chip ok" style="float:right">LIVE · REAL</span></h3>
          <p class="cs">the education platform is a real, shipped product</p>
          ${acadUrl()
            ? `<div style="margin-top:12px"><a class="btn" href="${acadUrl()}" target="_blank">OPEN HARMONIC ACADEMY ↗</a></div>`
            : `<div class="cform" style="margin-top:12px;max-width:420px">
                <input class="fin" id="hmUrl" placeholder="paste the Academy URL once — saved forever">
                <button class="btn ghost" id="hmUrlGo">SAVE LINK</button>
              </div>`}
          <p class="cs" style="margin-top:10px">Next evolutions live on the strategy desk below — Harmonic's own AI assistant, FM3 walkthrough tooling, and whatever we raise next.</p>
        </div>
        <div class="card reveal">
          <h3>Shipped for Harmonic</h3>
          <div class="stat"><div class="v aq">${P().length || "—"}</div>
          <div class="s">${P().length ? "projects logged · real" : "log the completed work below — real list, no fakes"}</div></div>
        </div>
      </div>

      <div class="mhead reveal" style="margin-top:26px"><div class="eyebrow">The work</div>
        <h2 style="font-size:1.3rem">Completed &amp; in flight <span class="chip ok" style="vertical-align:middle">REAL</span></h2></div>
      <div class="cards">
        ${P().length ? P().map((p, i) => `
        <div class="card reveal"><h3>${p.name}</h3><p class="cs">${p.desc || "—"}</p>
          <span class="chip ${p.status === "done" ? "ok" : "warn"}">${p.status === "done" ? "COMPLETED" : "IN FLIGHT"}</span>
          ${p.link ? `<a class="btn ghost sm" href="${p.link}" target="_blank" style="margin-left:6px">OPEN ↗</a>` : ""}
          <button class="btn ghost sm danger" data-del="${i}" style="float:right">✕</button></div>`).join("")
        : `<div class="card reveal"><h3>Nothing logged yet</h3>
          <p class="cs">Add the Academy and every Harmonic build below — each one becomes part of the record instantly.</p>
          <span class="chip off">EMPTY ON PURPOSE</span></div>`}
      </div>

      <div class="card reveal" style="margin-top:13px;max-width:560px">
        <h3>Log a Harmonic project</h3>
        <p class="cs">appears in this app instantly · auto-publish to the public site unlocks with the backend keys</p>
        <div class="cform">
          <input class="fin" id="hpName" placeholder="project name">
          <input class="fin" id="hpDesc" placeholder="what it is / what it did for Harmonic">
          <input class="fin" id="hpLink" placeholder="link (optional)">
          <div style="display:flex;gap:8px;align-items:center">
            <span style="font-size:10px;color:var(--dim);letter-spacing:.14em">STATUS</span>
            <button class="chip ok" id="hpDone" data-on="1">COMPLETED</button>
            <button class="chip warn" id="hpFlight">IN FLIGHT</button>
          </div>
          <button class="btn" id="hpGo">LOG IT</button>
        </div>
      </div>

      <div class="chatcard card reveal" style="margin-top:13px">
        <div style="display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid rgba(120,180,200,.12)">
          <span class="aidot" style="background:#a98bff"></span>
          <div>
            <div style="font:800 13px Unbounded;color:#eafcff">STRATEGY DESK</div>
            <div class="mono" style="font-size:10px;letter-spacing:.2em;color:var(--dim)">RILEY × CLAUDE · WHAT HARMONIC BECOMES NEXT</div>
          </div>
          <span class="chip ${localStorage.getItem("claude_key") ? "ok" : "off"}" style="margin-left:auto">${localStorage.getItem("claude_key") ? "API · REAL CLAUDE" : "LOCAL · add API key in ✦ Claude"}</span>
        </div>
        <div class="chatlog" id="hmLog"></div>
        <div class="quickrow" style="padding:0 18px">
          <button class="qk" data-t="what should Harmonic build next?">🚀 what's next</button>
          <button class="qk" data-t="how would Harmonic's own AI assistant work — an AI that walks students through FM3 and the whole platform?">🤖 Harmonic AI</button>
          <button class="qk" data-t="how do we grow the Academy?">📈 grow the Academy</button>
        </div>
        <div class="chatbar">
          <input id="hmIn" placeholder="talk strategy — new builds, Harmonic AI, improvements…">
          <button id="hmGo">SEND</button>
        </div>
      </div>`;
      wire();
    };

    const wire = () => {
      const urlGo = el.querySelector("#hmUrlGo");
      if (urlGo) urlGo.onclick = () => { const v = el.querySelector("#hmUrl").value.trim(); if (v) { OS.store.set("hm_academy_url", v); render(); } };
      el.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { OS.store.set("hm_projects", P().filter((_, i) => i !== +b.dataset.del)); render(); });
      let status = "done";
      const dBtn = el.querySelector("#hpDone"), fBtn = el.querySelector("#hpFlight");
      const paintStatus = () => { dBtn.style.opacity = status === "done" ? 1 : .4; fBtn.style.opacity = status === "done" ? .4 : 1; };
      dBtn.onclick = () => { status = "done"; paintStatus(); };
      fBtn.onclick = () => { status = "flight"; paintStatus(); }; paintStatus();
      el.querySelector("#hpGo").onclick = () => {
        const name = el.querySelector("#hpName").value.trim(); if (!name) return;
        OS.store.set("hm_projects", [...P(), { name, desc: el.querySelector("#hpDesc").value.trim(), link: el.querySelector("#hpLink").value.trim(), status, created: Date.now() }]);
        render();
      };

      /* ── strategy desk chat ── */
      const log = el.querySelector("#hmLog");
      const paint = (n, col, t) => { const d = document.createElement("div"); d.className = "msg";
        d.innerHTML = `<b style="color:${col};font:700 10.5px 'JetBrains Mono';letter-spacing:.14em">${n}</b><div>${t}</div>`;
        log.appendChild(d); log.scrollTop = log.scrollHeight; };
      const hist = OS.store.get("hm_chat", []); hist.forEach(h => paint(h.n, h.col, h.t));
      const say = (n, col, t) => { paint(n, col, t); const h = OS.store.get("hm_chat", []); h.push({ n, col, t }); OS.store.set("hm_chat", h.slice(-40)); };
      if (!hist.length) say("CLAUDE", "#a98bff", "Strategy desk open. The Academy is live — so what does Harmonic become next? Raise anything: new builds, an in-house Harmonic AI, FM3 tooling. With the API key I answer for real; until then I'll hold honest placeholders.");

      const send = async () => {
        const inp = el.querySelector("#hmIn"), t = inp.value.trim(); if (!t) return;
        inp.value = ""; say(user.name.toUpperCase(), "#00e8d0", t);
        const key = localStorage.getItem("claude_key");
        if (!key) { say("CLAUDE", "#a98bff", "Logged. I can't think for real without the API key yet — add it in ✦ Claude and this desk becomes a live strategy session with full context on Harmonic, the bot and the record."); return; }
        try {
          const ctx = "Harmonic context: the Academy is a live education product. Shipped projects: " + (P().map(p => p.name + " (" + (p.status === "done" ? "completed" : "in flight") + ")").join(", ") || "none logged yet") + ". The Live Mind trading bot: verified backtest $100k→$10.0M/10y, 57.3% win, PF 2.00, frozen rules, sim gate 0/60.";
          const r = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
            body: JSON.stringify({ model: localStorage.getItem("claude_model") || "claude-sonnet-5", max_tokens: 350,
              system: "You are Claude, resident strategist inside Offshore OS, at the Harmonic strategy desk with Riley. " + ctx + " Be sharp, concrete and honest — never invent numbers, always distinguish backtest from live, propose buildable next steps.",
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
    render();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
