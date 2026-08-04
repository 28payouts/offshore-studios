/* ═══════════ MODULE · COMMAND CENTER (admin home) ═══════════ */
OS.register({
  id: "home",
  mount(el, user) {
    const L = window.OS_CONFIG.LINKS;
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Command Center · ${user.name}</div>
      <h2>Everything Offshore. <span class="grad">One picture.</span></h2>
      <p class="sub">Every system, live in one place. Click any module to dive in — each runs independently, so building one never breaks another.</p>
    </div>
    <div class="cards">
      <div class="card hot reveal" data-go="livemind">
        <h3>〰 The Live Mind</h3><p class="cs">autonomous trading · 4 engines · sim running</p>
        <div class="stat"><div class="k">Backtested record</div><div class="v pos">$10.02M</div>
        <div class="s">57.3% WR · PF 2.00 · 16.9% max DD</div></div>
        <div style="margin-top:12px"><span class="chip ok" id="hmLmState">●</span><span class="chip warn">SIM GATE 0/60</span><span class="chip">CONFIG FROZEN</span></div>
      </div>
      <div class="card hot reveal" data-go="agency">
        <h3>◍ Studios Agency</h3><p class="cs">web design · AI automation · marketing</p>
        <div class="stat"><div class="k">Site</div><div class="v aq">LIVE</div>
        <div class="s">offshore studios · netlify</div></div>
        <div style="margin-top:12px"><span class="chip ok">SITE UP</span><span class="chip off">CLIENT PORTAL · BUILDING</span></div>
      </div>
      <div class="card hot reveal" data-go="agents">
        <h3>✳ AI & Agents</h3><p class="cs">the intelligence layer around everything</p>
        <div class="stat"><div class="k">Integrations</div><div class="v bio">6</div>
        <div class="s">Claude · TradingView · GitHub · more</div></div>
        <div style="margin-top:12px"><span class="chip ok">CLAUDE ACTIVE</span><span class="chip warn">LEARNING LOOP · NEXT</span></div>
      </div>
      <div class="card reveal">
        <h3>▤ Quick links</h3><p class="cs">the live properties</p>
        <div style="display:flex;flex-direction:column;gap:9px;margin-top:6px">
          <a class="btn" href="${L.livemindSite}" target="_blank">OPEN LIVE MIND SITE ↗</a>
          <a class="btn ghost" href="${L.agencySite}" target="_blank">OPEN AGENCY SITE ↗</a>
        </div>
      </div>
    </div>
    <div class="mhead reveal" style="margin-top:34px">
      <div class="eyebrow">Today</div>
      <h2 style="font-size:1.3rem">What the machine is doing right now</h2>
    </div>
    <div class="cards">
      <div class="card reveal"><h3>Session</h3><p class="cs" id="hmSess">—</p>
        <div id="hmSessNote" style="font-size:12.5px;color:var(--mut)"></div></div>
      <div class="card reveal"><h3>Next milestones</h3><p class="cs">the road we're on</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:1.9">
        ① Sim gate: 30–60 trades at ≥70–80% winner-capture<br>
        ② TradingView webhooks → this dashboard, live<br>
        ③ Client accounts onboarded here<br>
        ④ Legs 5 & 6 (YM/RTY) validation</div></div>
    </div>`;
    el.querySelectorAll("[data-go]").forEach(c => c.onclick = () => OS.emit("nav:request", c.dataset.go));

    const sess = () => {
      const n = OS.nyNow(), d = n.dec, we = n.wd === "Sat" || n.wd === "Sun";
      const s = we ? ["Weekend — markets closed", "The Mind rests. Levels don't move on weekends."]
        : d >= 2 && d < 5 ? ["London hunt", "E1 + E3 watching the Asia range extremes."]
        : d >= 8.5 && d < 9.5 ? ["Pre-open brief", "Scoring the day 0–9 before the New York bell."]
        : d >= 9.5 && d < 11 ? ["NY morning — all four engines live", "The best 90 minutes of the day."]
        : d >= 11 && d < 13.5 ? ["Midday stand-down", "Thin chop — the Mind refuses to trade it."]
        : d >= 13.5 && d < 16 ? ["NY afternoon hunt", "E1 + E3 live · runners close 15:58."]
        : ["Asia watch", "Logging tonight's levels — tomorrow morning's map."];
      const se = document.getElementById("hmSess"); if (!se) return;
      se.textContent = s[0]; document.getElementById("hmSessNote").textContent = s[1];
      const st = document.getElementById("hmLmState");
      const live = !we && ((d >= 2 && d < 5) || (d >= 8.5 && d < 11) || (d >= 13.5 && d < 16));
      if (st) { st.textContent = live ? "● HUNTING" : "○ STANDING BY"; st.className = "chip " + (live ? "ok" : "off"); }
    };
    sess(); this._t = setInterval(sess, 30000);
  },
  unmount() { clearInterval(this._t); }
});
