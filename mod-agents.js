/* ═══════════ MODULE · AI & AGENTS (admin only) ═══════════
   The intelligence layer: every AI, agent and integration in the Offshore
   world, with its state. New integrations = new entries here. */
OS.register({
  id: "agents",
  mount(el, user) {
    const A = [
      { n: "Claude", d: "Chief engineer & research partner — built the Live Mind pipeline, the sites, this app.", st: "ok", tag: "ACTIVE" },
      { n: "The Live Mind", d: "Autonomous trading intelligence · 4 engines · sim running toward the capital gate.", st: "ok", tag: "SIM" },
      { n: "TradingView Eyes", d: "Pine script on live ES/NQ charts → webhook signals into the Mind.", st: "warn", tag: "WIRING" },
      { n: "Claude × Live Mind loop", d: "Learning layer: watches live markets beside the bot, proposes, never overrides.", st: "warn", tag: "NEXT" },
      { n: "GitHub Pages", d: "Hosting: Live Mind site + this app. Free, unlimited deploys.", st: "ok", tag: "LIVE" },
      { n: "Supabase Auth", d: "Real accounts & per-user privacy. Paste keys in config.js to activate.", st: "off", tag: "KEYS NEEDED" }
    ];
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">AI & Agents</div>
      <h2>The intelligence layer.</h2>
      <p class="sub">Everything thinking on Offshore's behalf — and the honest state of each. Adding an integration is one entry here; nothing else changes.</p>
    </div>
    <div class="cards">
      ${A.map(a => `<div class="card reveal"><h3>${a.n}</h3><p class="cs">${a.d}</p>
        <span class="chip ${a.st}">${a.tag}</span></div>`).join("")}
    </div>
    <div class="card reveal" style="margin-top:16px">
      <h3>Switch on real accounts (2 minutes)</h3>
      <p class="cs">the one step that makes this real software</p>
      <div style="font-size:12.5px;color:var(--mut);line-height:1.9">
        ① Create a free project at <b style="color:var(--ink)">supabase.com</b><br>
        ② Project Settings → API → copy <b style="color:var(--ink)">Project URL</b> + <b style="color:var(--ink)">anon public key</b><br>
        ③ Paste both into <span class="mono" style="color:var(--aqua)">config.js</span> and redeploy<br>
        ④ Tell Claude — accounts, roles and client invites get wired the same day
      </div>
    </div>`;
  }
});
