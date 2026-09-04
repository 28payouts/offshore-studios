/* ═══════════ MODULE · SHOWCASE (what we offer) ═══════════
   The guest universe. Anyone can EXPLORE from the gate without an account
   and land here: everything Offshore Studios offers, way more interactive
   than the landing page, with an inquiry desk wired straight to Supabase.
   Admins also carry it (Offshore rail) for showing prospects in person.
   Professional front-of-house: no internals, no tooling talk. */
OS.register({
  id: "showcase",
  _timers: [],
  mount(el, user) {
    const C = window.OS_CONFIG;
    const OFFERS = [
      { ic: "🪐", n: "Personalized Client Universes", tag: "INCLUDED WITH EVERY PROJECT", tc: "ok",
        d: "Every client gets their own universe inside this software — your logo and brand on the wall, your project's live progress as we work, every deliverable kept forever, new offerings with live pricing, and a direct line to the team.",
        pts: ["Your brand wraps the whole experience", "Watch milestones move in real time", "Deliverables vault — yours forever", "Direct line · we reply fast"] },
      { ic: "🌊", n: "High-End Websites", tag: "FROM $2,500", tc: "ok",
        d: "Real 3D, cinematic motion, custom everything — sites that feel like this app. We pull your brand into the build and make something people remember.",
        pts: ["Custom-designed — never templates", "Motion & interaction on every page", "Mobile-perfect, fast, deployed for you", "Final quote scoped to your project"] },
      { ic: "📣", n: "Marketing & Content", tag: "SCOPED PER PROJECT", tc: "ok",
        d: "Launch content, brand assets and campaigns that match the quality of the site they point at — as part of your build or its own engagement.",
        pts: ["Launch kits & brand assets", "Content that matches the build quality", "Scoped alongside your project"] },
      { ic: "✳", n: "AI Automation", tag: "SCOPED PER PROJECT", tc: "ok",
        d: "Assistants and automations wired into your business — answering, organizing, operating. Professional and invisible: your customers just see things working.",
        pts: ["Wired into your real workflows", "Professional, invisible, reliable", "Grows with your business"] },
      { ic: "〰", n: "Trading Intelligence", tag: "EXCLUSIVE · BY INQUIRY", tc: "warn",
        d: "An in-house algorithmic trading system with a ten-year verified record. Not a product on a shelf — access, in any form, starts with a conversation.",
        pts: ["$100k → $3.43M backtested over 10 years", "59.7% win rate · 1,845 trades · PF 1.50", "Max drawdown 19.9% — never worse", "Verified bar-by-bar · stated as a backtest, honestly"] }
    ];
    const TIERS = [
      ["SIGNATURE SITE", "from $2,500", "custom site · motion pass · your universe included"],
      ["FLAGSHIP EXPERIENCE", "from $5,000", "full cinematic build · 3D · brand system"],
      ["CARE & GROWTH · ADD-ON", "from $250/mo", "maintenance add-on · updates · monitoring"],
      ["TRADING INTELLIGENCE", "by inquiry", "exclusive · starts with a conversation"]
    ];
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Offshore Studios · what we build</div>
      <h2>Five things. <span class="grad">Done properly.</span></h2>
      <p class="sub">Everything here is custom and real. Tap anything to open it up — and when you're ready, send it to the studio from right here.</p>
    </div>
    <div class="cards" id="scOffers" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      ${OFFERS.map((o, i) => `
      <div class="card reveal" data-i="${i}" style="cursor:pointer">
        <div style="font-size:26px;margin-bottom:10px">${o.ic}</div>
        <h3 style="margin:0 0 6px">${o.n}</h3>
        <span class="chip ${o.tc}">${o.tag}</span>
        <p class="cs" style="margin-top:10px">${o.d}</p>
        <div class="scmore" data-m="${i}" style="max-height:0;overflow:hidden;transition:max-height .5s cubic-bezier(.2,.8,.2,1)">
          <div style="border-top:1px solid rgba(120,180,200,.12);margin-top:12px;padding-top:12px;display:flex;flex-direction:column;gap:8px">
            ${o.pts.map(p => `<div style="font-size:12.5px;color:var(--mut);display:flex;gap:9px"><span style="color:var(--aqua)">◈</span>${p}</div>`).join("")}
          </div>
        </div>
        <div class="mono" style="font-size:9px;letter-spacing:.2em;color:var(--dim);margin-top:12px">TAP TO ${"EXPAND"} · ◈</div>
      </div>`).join("")}
    </div>

    <div class="mhead reveal" style="margin-top:34px"><div class="eyebrow">The desk · live market</div>
      <h2 style="font-size:1.35rem">Watch the market <span class="grad">our intelligence watches.</span></h2>
      <p class="sub">A live view of the S&amp;P 500 futures our trading system trades — with what the system is doing right now. Flip timeframes freely; the chart is view-only.</p></div>
    <div class="card reveal" style="padding:0;overflow:hidden">
      <div id="scBotStat" class="mono" style="display:flex;flex-wrap:wrap;gap:14px;padding:13px 16px;font-size:9.5px;letter-spacing:.18em;color:var(--mut);border-bottom:1px solid rgba(120,180,200,.12)">CONNECTING…</div>
      <div id="scTV" style="height:460px"></div>
    </div>

    <div class="mhead reveal" style="margin-top:34px"><div class="eyebrow">Starting points</div>
      <h2 style="font-size:1.35rem">Every quote is scoped — <span class="grad">these are the doors in.</span></h2></div>
    <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(230px,1fr))">
      ${TIERS.map(([n, p, s]) => `
      <div class="card reveal sctier" data-t="${n}" style="cursor:pointer;text-align:left">
        <h3 style="margin:0">${n}</h3>
        <div style="font:800 1.4rem Unbounded;color:var(--aqua);margin:10px 0 4px">${p}</div>
        <p class="cs">${s}</p>
        <span class="chip off">FINAL PRICING VARIES WITH SCOPE</span>
      </div>`).join("")}
    </div>

    <div class="card reveal" style="margin-top:20px" id="scForm">
      <h3>Send it to the studio</h3>
      <p class="cs">pick what you want, tell us about it — it lands directly on our desk and we reply personally</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0" id="scChips">
        ${["High-End Website", "Client Universe / Dashboard", "Marketing & Content", "AI Automation", "Trading Intelligence (exclusive)"].map(s =>
          `<span class="chip off" data-v="${s}" style="cursor:pointer">${s.toUpperCase()}</span>`).join("")}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <input class="fin" id="scName" placeholder="your name">
        <input class="fin" id="scEmail" type="email" placeholder="your email">
      </div>
      <div style="margin-top:10px"><textarea class="fin" id="scMsg" style="width:100%;min-height:90px" placeholder="what you're building, and what you want it to feel like…"></textarea></div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:14px">
        <button class="btn" id="scSend">SEND TO THE STUDIO →</button>
        <span class="mono" id="scStat" style="font-size:10px;letter-spacing:.18em"></span>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px" class="reveal">
      <a class="btn ghost" href="landing.html">SEE THE FULL SITE ↗</a>
      ${user.role === "guest" ? `<span class="chip off">EXPLORING AS A GUEST · CLIENTS GET THEIR OWN UNIVERSE</span>` : ""}
    </div>`;

    /* ── the desk: live read-only chart + honest bot status ──
       Guests can flip timeframes on the embedded chart but nothing else:
       no symbol change, no drawing sidebar, no TradingView account needed. */
    const mountTV = () => {
      if (!document.getElementById("scTV")) return;
      new window.TradingView.widget({
        container_id: "scTV", width: "100%", height: 460,
        symbol: "CME_MINI:ES1!", interval: "5", timezone: "America/New_York",
        theme: "dark", style: "1", locale: "en",
        hide_side_toolbar: true, allow_symbol_change: false, save_image: false,
        withdateranges: true, backgroundColor: "rgba(2,9,16,1)"
      });
    };
    if (window.TradingView) mountTV();
    else {
      let tvs = document.getElementById("tvjs");
      if (!tvs) { tvs = document.createElement("script"); tvs.id = "tvjs"; tvs.src = "https://s3.tradingview.com/tv.js"; document.head.appendChild(tvs); }
      tvs.addEventListener("load", mountTV);
      if (window.TradingView) mountTV();
    }
    const botStat = async () => {
      const box = el.querySelector("#scBotStat"); if (!box) return;
      const n = OS.nyNow();
      const wd = n.wd !== "Sat" && n.wd !== "Sun";
      const inSess = wd && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      let fills = null;
      try {
        const r = await fetch(C.SUPABASE_URL + "/rest/v1/fills?select=id", {
          headers: { apikey: C.SUPABASE_ANON_KEY, Authorization: "Bearer " + C.SUPABASE_ANON_KEY, Prefer: "count=exact", Range: "0-0" } });
        if (r.ok) fills = parseInt((r.headers.get("content-range") || "/0").split("/")[1]) || 0;
      } catch (e) {}
      box.innerHTML =
        `<span style="color:${inSess ? "var(--aqua)" : "var(--dim)"}">● ${inSess ? "HUNTING — READING THIS MARKET NOW" : "STANDING BY — OUTSIDE ITS TRADING WINDOWS"}</span>` +
        `<span>NY ${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")} · ${n.wd}</span>` +
        `<span>${fills === null ? "FILL FEED CONNECTING…" : fills > 0 ? "LOGGED FILLS: " + fills : "VERIFICATION STAGE · NO LIVE FILLS YET"}</span>` +
        `<span style="color:var(--dim)">VIEW-ONLY CHART · TIMEFRAMES FREE</span>`;
    };
    botStat();
    this._timers.push(setInterval(botStat, 30000));

    /* expand cards */
    el.querySelector("#scOffers").addEventListener("click", e => {
      const card = e.target.closest(".card[data-i]"); if (!card) return;
      const m = card.querySelector(".scmore");
      const open = m.style.maxHeight && m.style.maxHeight !== "0px";
      m.style.maxHeight = open ? "0" : m.scrollHeight + "px";
    });
    /* tier tap preselects matching chip + scrolls to form */
    el.querySelectorAll(".sctier").forEach(t => t.onclick = () => {
      const map = { "SIGNATURE SITE": "High-End Website", "FLAGSHIP EXPERIENCE": "High-End Website",
        "CARE & GROWTH · ADD-ON": "High-End Website", "TRADING INTELLIGENCE": "Trading Intelligence (exclusive)" };
      const want = map[t.dataset.t];
      el.querySelectorAll("#scChips .chip").forEach(c => { if (c.dataset.v === want) c.className = "chip ok"; });
      el.querySelector("#scForm").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    /* chips toggle */
    el.querySelector("#scChips").addEventListener("click", e => {
      const c = e.target.closest(".chip"); if (!c) return;
      c.className = c.className.includes("ok") ? "chip off" : "chip ok";
    });
    /* submit → Supabase inquiries (publishable key — safe) */
    el.querySelector("#scSend").onclick = async () => {
      const stat = el.querySelector("#scStat");
      const services = [...el.querySelectorAll("#scChips .chip")].filter(c => c.className.includes("ok")).map(c => c.dataset.v);
      const name = el.querySelector("#scName").value.trim(), email = el.querySelector("#scEmail").value.trim();
      const message = el.querySelector("#scMsg").value.trim();
      if (!name || !email) { stat.style.color = "#ff8f8f"; stat.textContent = "NAME + EMAIL SO WE CAN REPLY"; return; }
      if (!services.length) { stat.style.color = "#ff8f8f"; stat.textContent = "PICK AT LEAST ONE"; return; }
      stat.style.color = "var(--dim)"; stat.textContent = "SENDING…";
      try {
        const r = await fetch(C.SUPABASE_URL + "/rest/v1/inquiries", {
          method: "POST",
          headers: { apikey: C.SUPABASE_ANON_KEY, Authorization: "Bearer " + C.SUPABASE_ANON_KEY, "content-type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ name, email, services, message: message || null, tier: "via app showcase" })
        });
        if (!r.ok) throw 0;
        el.querySelector("#scForm").innerHTML = `<h3>It's on our desk. ✓</h3>
          <p class="cs">We read every inquiry personally and we'll reply to <b style="color:var(--aqua)">${email}</b>.
          When your project starts, your own universe comes with it.</p>`;
      } catch (e) { stat.style.color = "#ff8f8f"; stat.textContent = "HICCUP — TRY AGAIN IN A MOMENT"; }
    };
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
