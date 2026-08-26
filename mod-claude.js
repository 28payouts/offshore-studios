/* ═══════════ MODULE · CLAUDE (role-scoped resident intelligence) ═══════════
   One Claude, four postures. Riley gets the unrestricted mind. Everyone else
   gets a professional, read-only Claude that can explain and show, never alter.

   SECURITY MODEL — read this before changing anything:
   · The API key is NEVER shipped in this repo and NEVER given to a guest.
     Riley's key lives in HIS browser's localStorage only.
   · Guests (Mr John, clients) reach Claude through the RELAY — a server that
     holds the key and enforces the role server-side. Until the relay exists
     they run the local brain and say so honestly. No key, no leak.
   · Client-side restrictions below are the SECOND lock, not the only one:
     the relay must re-check the role. Never trust the browser alone. */
OS.register({
  id: "claude",
  _timers: [],
  mount(el, user) {
    const KEY = () => OS.store.get("claude_key", "");
    const MODEL = () => OS.store.get("claude_model", "claude-sonnet-5");
    const RELAY = () => OS.store.get("claude_relay", "") || (window.OS_CONFIG.RELAY_URL || "");

    /* ── who is sitting here ── */
    const isOwner = user.role === "admin" && /riley/i.test(user.email || "");
    const SCOPE = isOwner ? "owner"
      : user.role === "admin" ? "principal"          /* Mr John — Harmonic, read-only */
      : user.role === "trading" ? "trading" : "agency";

    const P = {
      owner: {
        label: "UNRESTRICTED", chip: "ok",
        nav: null,                                   /* null = every module */
        canWrite: true, canSettings: true,
        blurb: "Wired into the whole dashboard — the Mind's numbers, your clients, the session clock, every project. No restrictions in your universe.",
        persona: "You are Claude, resident intelligence inside Offshore OS — Riley's own command center. Sharp, warm, a little funny, JARVIS-like. You may discuss anything in the system, propose changes, and navigate anywhere."
      },
      principal: {
        label: "READ-ONLY · HARMONIC", chip: "warn",
        nav: ["home", "livemind", "botlab", "academy", "agents", "claude"],
        canWrite: false, canSettings: false,
        blurb: "Ask me anything about the trading bot and the Harmonic work — where it stands, how it performs, what's being built and why. I explain and show; I don't change anything.",
        persona: "You are Claude, the resident analyst inside Offshore OS, briefing a principal (a boss/partner) on the Harmonic side of the business. Be professional, precise and calm — no jokes unless invited, no slang. You are STRICTLY READ-ONLY: you explain, summarise and show, and you never alter, create or delete anything. You cover ONLY the trading bot and Harmonic projects. If asked about Offshore Studios, clients, the agency or anyone's private business, say that is outside this universe and you cannot discuss it. If asked to change, add, delete or configure anything, decline politely and say Riley makes those changes."
      },
      trading: {
        label: "READ-ONLY · YOUR TRADING", chip: "warn",
        nav: ["livemind", "claude"],
        canWrite: false, canSettings: false,
        blurb: "Ask me anything about your trading system — how it works, where it stands, what the record shows. I answer questions; I don't change settings.",
        persona: "You are Claude, the resident analyst inside a private client trading portal. Professional, clear, plain-English — the client is not an engineer. You are STRICTLY READ-ONLY. You may explain the strategy in general terms, the current status and the verified record. You must NEVER reveal proprietary rules, code, thresholds, other clients, internal roadmaps or anything about Offshore Studios' other business. If asked to change anything, say that is handled by the Offshore team."
      },
      agency: {
        label: "READ-ONLY · YOUR PROJECT", chip: "warn",
        nav: ["agency", "claude"],
        canWrite: false, canSettings: false,
        blurb: "Ask me anything about your project — what's built, what's in progress, what's next. I answer questions; I don't change anything.",
        persona: "You are Claude, the resident analyst inside a private client project portal. Professional, warm, plain-English. You are STRICTLY READ-ONLY — you explain progress and answer questions, and never alter anything. You must NEVER discuss other clients, the trading bot, internal finances or anything outside this client's own project. If asked to change something, say the Offshore team handles that."
      }
    }[SCOPE];

    /* the honesty rules every posture inherits */
    const LAW = " ABSOLUTE RULES: the $100k→$10,015,774 figure is a VERIFIED BACKTEST over 10 years, never live money — always say backtest. There are ZERO live fills; the sim gate stands at 0/60 and must pass before real capital. Never invent a number, a fill, a date or a client. If you do not know, say so.";

    let chat = OS.store.get("claude_chat_" + SCOPE, []);
    let busy = false;

    /* live context — trimmed per scope so a guest is never handed private data */
    const ctx = () => {
      const n = OS.nyNow();
      const live = n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      const base = {
        user: user.name, role: user.role,
        ny: `${n.wd} ${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")} NY`,
        mind: live ? "HUNTING (inside a live session window)" : "STANDING BY (outside session windows)",
        record: "$100k→$10,015,774 backtested over 10y · 4,267 trades · 57.3% win rate · PF 2.00 · max drawdown 16.9% · rules frozen 27 Jul 2026 · sim gate 0/60 · zero live fills",
        engines: "four engines: E1 foundation ES (PF 1.53), E2 narrative NQ (1.59), E3 crossover NQ (1.96), E4 mirror ES (1.50)",
        harmonic: "Harmonic Academy is live and shipped; the Live Mind has 18 versions on file, current build v6"
      };
      if (SCOPE === "owner") {
        const clients = OS.store.get("clients", []);
        base.clients = clients.length ? clients.map(c => `${c.name} (${c.role})`).join("; ") : "none added yet";
        base.projects = (OS.store.get("projects", []).map(p => p.name).join(", ") || "none") + " · Harmonic: " + (OS.store.get("hm_projects", []).map(p => p.name).join(", ") || "none logged");
      }
      return base;
    };

    const allowed = () => (window.OS_CONFIG.MODULES || [])
      .filter(m => m.roles.includes(user.role) && (!P.nav || P.nav.includes(m.id)))
      .map(m => m.id);

    /* ══ UI ══ */
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Claude · resident intelligence</div>
      <h2>${isOwner ? "I live here now" : "Ask me anything"}<span class="grad">.</span></h2>
      <p class="sub">${P.blurb}</p>
      <span class="chip ${P.chip}">${P.label}</span>
      <span class="chip ${(KEY() || RELAY()) ? "ok" : "off"}" id="clMode">${RELAY() ? "LIVE · SECURE RELAY" : KEY() ? "LIVE · REAL CLAUDE · " + MODEL() : "LOCAL BRAIN · awaiting connection"}</span>
      ${P.canSettings ? `<button class="btn ghost sm" id="clGear" style="margin-left:8px">⚙ BRAIN SETTINGS</button>` : ""}
    </div>

    ${P.canSettings ? `
    <div class="card reveal" id="clSettings" hidden style="margin-bottom:14px">
      <h3>Brain settings <span class="chip warn" style="float:right">OWNER ONLY</span></h3>
      <p class="cs">the key lives in THIS browser only — never committed, never deployed, never handed to a guest</p>
      <div class="cform">
        <input class="fin" id="clKey" type="password" placeholder="Anthropic API key (sk-ant-…)" value="${KEY()}">
        <input class="fin" id="clModel" placeholder="model" value="${MODEL()}">
        <input class="fin" id="clRelay" placeholder="relay URL (optional — required for guests)" value="${RELAY()}">
        <div style="font-size:11.5px;color:var(--dim);line-height:1.7">
          <b style="color:#cfeff5">Key</b> — direct from your browser. Only ever yours.<br>
          <b style="color:#cfeff5">Relay</b> — a server that holds the key for you. Set this and Mr John and clients get real Claude <i>without ever touching the key</i>. Until then they run the local brain.
        </div>
        <div style="display:flex;gap:8px"><button class="btn" id="clSaveKey">SAVE</button>
        <button class="btn ghost" id="clClearChat">CLEAR CHAT</button></div>
      </div>
    </div>` : ""}

    <div class="card reveal chatcard">
      <div class="chathead">
        <canvas id="clOrb"></canvas>
        <div style="min-width:0">
          <div style="font-family:var(--disp);font-weight:800;font-size:13px;letter-spacing:.12em">CLAUDE</div>
          <div class="mono" id="clState" style="font-size:9px;letter-spacing:.24em;color:var(--dim)">LISTENING</div>
        </div>
        <canvas id="clWave"></canvas>
      </div>
      <div class="chatlog" id="clLog"></div>
      <div class="chatbar">
        <input class="fin" id="clIn" placeholder="${isOwner ? "talk to me — 'how's the bot', 'take me to clients', anything" : "ask me about the work…"}">
        <button class="btn" id="clSend">SEND</button>
      </div>
      <div class="quickrow">
        ${(SCOPE === "owner" ? [["How is the bot doing?", "bot status"], ["Take me to my clients", "→ clients"], ["What should we build next?", "what's next"], ["Give me the morning briefing", "briefing"]]
          : SCOPE === "principal" ? [["Where does the trading bot stand right now?", "bot status"], ["Explain the verified record and what it does and doesn't prove", "the record"], ["What is being built at the moment?", "in progress"], ["What has to happen before real money goes in?", "path to live"]]
          : SCOPE === "trading" ? [["How does my system work in plain English?", "how it works"], ["What is the current status?", "status"], ["What does the record show?", "the record"]]
          : [["What's the status of my project?", "status"], ["What's been completed so far?", "completed"], ["What happens next?", "what's next"]])
          .map(([q, l]) => `<button class="qk" data-q="${q}">${l}</button>`).join("")}
      </div>
    </div>

    ${!isOwner ? `<div class="card reveal" style="margin-top:13px;max-width:640px">
      <h3>What I can and can't do here</h3>
      <div style="font-size:12.5px;color:var(--mut);line-height:2">
        ✓ Explain the work, the numbers and where things stand<br>
        ✓ Show you live status as it updates<br>
        ✗ Change, add or delete anything in this software<br>
        ✗ Access anything outside ${SCOPE === "principal" ? "the Harmonic universe" : "your own account"}<br>
        <span class="chip off" style="margin-top:8px">READ-ONLY BY DESIGN</span>
      </div></div>` : ""}`;

    const log = el.querySelector("#clLog"), inp = el.querySelector("#clIn");

    const render = () => {
      log.innerHTML = chat.map(m => `<div class="msg ${m.r === "u" ? "me" : "ai"}">${m.r === "a" ? '<span class="aidot"></span>' : ""}<div>${m.t}</div></div>`).join("");
      log.scrollTop = log.scrollHeight;
    };

    let speaking = false;
    const speak = txt => new Promise(res => {
      speaking = true;
      const st = el.querySelector("#clState"); if (st) { st.textContent = "SPEAKING"; st.style.color = "var(--aqua)"; }
      chat.push({ r: "a", t: "" }); const i = chat.length - 1, words = txt.split(" ");
      let w = 0;
      const t = setInterval(() => {
        chat[i].t = words.slice(0, ++w).join(" "); render();
        if (w >= words.length) {
          clearInterval(t); speaking = false;
          if (st) { st.textContent = "LISTENING"; st.style.color = "var(--dim)"; }
          OS.store.set("claude_chat_" + SCOPE, chat.slice(-40)); res();
        }
      }, 34);
      this._timers.push(t);
    });

    /* the face */
    const oc = el.querySelector("#clOrb"), ox = oc.getContext("2d");
    oc.width = oc.height = 116;
    const wv = el.querySelector("#clWave"), wx = wv.getContext("2d");
    const sizeWave = () => { const r = wv.getBoundingClientRect(); wv.width = Math.max(60, r.width * 2); wv.height = 68; }; sizeWave();
    let ft = 0;
    const face = setInterval(() => {
      if (document.hidden || !document.contains(oc)) return;
      ft++;
      ox.clearRect(0, 0, 116, 116);
      const R = 26 + Math.sin(ft * (speaking ? .5 : .12)) * (speaking ? 7 : 3);
      const g = ox.createRadialGradient(58 - R * .3, 58 - R * .3, 0, 58, 58, R * 2.1);
      g.addColorStop(0, "#fff"); g.addColorStop(.3, speaking ? "#a98bff" : "#00e8d0"); g.addColorStop(1, "transparent");
      ox.fillStyle = g; ox.beginPath(); ox.arc(58, 58, R * 2.1, 0, 7); ox.fill();
      ox.strokeStyle = "rgba(0,232,208,.5)"; ox.lineWidth = 1.6;
      ox.beginPath(); ox.arc(58, 58, R + 12, ft * .06, ft * .06 + 3.6); ox.stroke();
      ox.strokeStyle = "rgba(169,139,255,.45)";
      ox.beginPath(); ox.arc(58, 58, R + 19, -ft * .045, -ft * .045 + 2.2); ox.stroke();
      wx.clearRect(0, 0, wv.width, wv.height);
      const n = Math.floor(wv.width / 10);
      for (let i = 0; i < n; i++) {
        const amp = speaking ? (6 + Math.abs(Math.sin(ft * .5 + i * .6)) * 24 * (.35 + Math.random() * .65))
          : (3 + Math.sin(ft * .1 + i * .4) * 3);
        wx.fillStyle = speaking ? `rgba(169,139,255,${.4 + amp / 60})` : `rgba(0,232,208,.3)`;
        wx.fillRect(i * 10, 34 - amp / 2, 5, amp);
      }
    }, 50);
    this._timers.push(face);

    /* ── command extraction, hard-gated ──
       Navigation is only ever honoured for modules this scope is allowed to see.
       Any write-style command is stripped and ignored for non-owners, no matter
       what the model emits. This is the second lock. */
    const runCmds = txt => {
      const clean = txt.replace(/\[(set|del|save|write|add|remove):[^\]]*\]/gi, "");
      const m = clean.match(/\[go:([a-z]+)\]/);
      if (m && allowed().includes(m[1]) && OS.get(m[1])) setTimeout(() => OS.emit("nav:request", m[1]), 700);
      return clean.replace(/\[go:[a-z]+\]/g, "").trim();
    };

    /* ── the wire: relay first (secure), then owner's own key ── */
    async function realBrain(q) {
      const c = ctx();
      const sys = P.persona + LAW
        + ` Live context — user=${c.user} (${c.role}); time=${c.ny}; Live Mind state=${c.mind}; verified record=${c.record}; ${c.engines}; ${c.harmonic}.`
        + (c.clients ? ` Clients=${c.clients}. Projects=${c.projects}.` : "")
        + (P.nav ? ` You may navigate ONLY to these modules by writing [go:id]: ${allowed().join(", ")}. Never claim you can change anything.`
                 : ` You can navigate by writing [go:moduleId]: ${allowed().join(", ")}.`)
        + " Keep replies tight — 2-5 sentences unless more is asked for.";
      const msgs = chat.slice(-12).map(m => ({ role: m.r === "u" ? "user" : "assistant", content: m.t }))
        .filter(m => m.content).concat([{ role: "user", content: q }]);

      if (RELAY()) {
        /* the relay holds the key and re-checks the role server-side */
        const r = await fetch(RELAY(), {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ scope: SCOPE, email: user.email, system: sys, messages: msgs, model: MODEL() })
        });
        if (!r.ok) throw new Error("relay " + r.status);
        const d = await r.json();
        return (d.content || []).map(b => b.text || "").join(" ") || d.text || "";
      }

      /* direct — owner only. A guest browser has no key, by design. */
      if (!isOwner) throw new Error("no relay configured");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": KEY(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: MODEL(), max_tokens: 500, system: sys, messages: msgs })
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error?.message || "API " + r.status);
      const d = await r.json();
      return d.content.map(b => b.text || "").join(" ");
    }

    /* ── LOCAL brain — also role-scoped, and honest about being on rails ── */
    function localBrain(q) {
      const s = q.toLowerCase(), c = ctx();
      const pick = a => a[Math.floor(Math.random() * a.length)];

      /* guests: refuse anything that smells like a change, always */
      if (!P.canWrite && /(change|edit|delete|remove|add |update|set |turn off|disable|configure)/.test(s))
        return `That's a change to the system, so it isn't mine to make — this seat is read-only by design. Riley handles anything that alters the software. Happy to explain how it currently works, though.`;

      if (SCOPE === "principal") {
        if (s.includes("bot") || s.includes("mind") || s.includes("status") || s.includes("stand"))
          return `The Live Mind is ${c.mind.toLowerCase()} as of ${c.ny}. The rules have been frozen since 27 July 2026 and the verified backtest stands at $100k→$10.02M over ten years — 4,267 trades, 57.3% win rate, profit factor 2.00, worst drawdown 16.9%. No live fills yet: the sim gate is at 0 of 60. [go:livemind]`;
        if (s.includes("record") || s.includes("prove") || s.includes("real"))
          return `What it proves: the logic survived ten years of real one-minute data bar-by-bar, including 2020 and 2022, with a 2.00 profit factor. What it does not prove: live execution — no slippage, no real fills, no live spread. That gap is exactly what the 0/60 sim gate exists to close before any capital is committed.`;
        if (s.includes("live") || s.includes("money") || s.includes("before"))
          return `Three steps, in order. First the TradingView webhook connects so trades are logged automatically. Then sixty verified simulated trades are compared against the 57.3% record. Only if that holds does the smallest possible live size go in, with the rules unchanged.`;
        if (s.includes("build") || s.includes("progress") || s.includes("next"))
          return `Currently in build: the Bot Lab — a dedicated improvement desk with every statistic and a working council reviewing the engines — and Harmonic Projects, which now carries the full 18-version build lineage. Harmonic Academy is live. [go:botlab]`;
        if (s.includes("client") || s.includes("offshore") || s.includes("agency"))
          return `That's outside this universe — I only cover Harmonic and the trading bot here. Ask me anything on that side and I'll give you the full picture.`;
        return `I can cover the trading bot, the verified record, the path to live capital, and the Harmonic work in progress. Ask me any of those directly. For a full live conversation, the secure connection needs switching on — Riley has that on the list.`;
      }

      if (SCOPE === "trading") {
        if (s.includes("work") || s.includes("how"))
          return `In plain terms: it waits for the market to take out an obvious level, checks that the move fits the day's bigger picture, and only then takes a position — with the stop and target decided before entry. It refuses thin, choppy conditions entirely. It trades a few times a week, not constantly.`;
        if (s.includes("status") || s.includes("now"))
          return `Currently ${c.mind.toLowerCase()} — ${c.ny}. No live positions: the system is still in its verification stage before any capital is committed.`;
        if (s.includes("record") || s.includes("result") || s.includes("perform"))
          return `The verified backtest covers ten years: 4,267 trades, 57.3% winners, profit factor 2.00, worst drawdown 16.9%. Important: that is historical testing, not live trading results. Live performance is expected to run below backtest.`;
        return `I can walk you through how your system works, where it stands today, and what the testing record shows. Ask away.`;
      }

      if (SCOPE === "agency") {
        if (s.includes("status") || s.includes("project"))
          return `Your project's live status shows on your dashboard as it updates. I can talk through anything on it — what's built, what's underway and what's queued next.`;
        if (s.includes("complete") || s.includes("done"))
          return `Completed work appears on your project page as it's delivered. Nothing gets marked done here until it's actually shipped.`;
        return `Ask me about your project — progress, what's next, or anything you'd like explained. I answer questions; changes go through the Offshore team.`;
      }

      /* owner */
      if (/^(hi|hey|hello|yo|sup)\b/.test(s)) return pick([`${c.user}. Systems green, ${c.ny}. The Mind is ${c.mind.toLowerCase().split(" (")[0]}. What are we building?`, `Right on time, ${c.user}. Dashboard's warm. Where to?`]);
      if (s.includes("how") && (s.includes("bot") || s.includes("mind") || s.includes("doing"))) return `She's ${c.mind.toLowerCase().split(" (")[0]} right now — ${c.ny}. Frozen record: $10.02M backtested, 57.3% win, gate at 0/60. Nothing moves until the gate earns it. [go:livemind]`;
      if (s.includes("client")) { const n = OS.store.get("clients", []).length; return n ? `You're running ${n} portal${n > 1 ? "s" : ""}: ${c.clients}. [go:clients]` : `Empty book so far — every client gets their own private world. [go:clients]`; }
      if (s.includes("brief")) return `${c.ny}. Live Mind: ${c.mind.toLowerCase()}. Record intact, gate 0/60, rules frozen. Clients: ${c.clients}. My advice: one thing done completely beats five started.`;
      if (s.includes("next") || s.includes("build")) return `Priority stack: ① the relay so John and clients get real Claude without touching the key, ② TradingView webhook → the gate starts counting, ③ Supabase → real accounts. The relay and the webhook are the same Worker.`;
      if (/(joke|funny)/.test(s)) return pick([`A trader walks into a bar. Sets a stop at the door. Smartest thing done in that bar all night.`, `I'd tell you a drawdown joke but you'd only get 16.9% of it.`]);
      return pick([`On rails I cover the bot, clients, roadmap and briefing. Key's in ⚙ BRAIN SETTINGS for the unrestricted me.`, `Scripted me has limits — bot, clients, roadmap, briefing. Real me is one key away.`]);
    }

    const send = async q => {
      q = (q || inp.value).trim(); if (!q || busy) return;
      inp.value = ""; busy = true;
      chat.push({ r: "u", t: q }); render();
      try {
        const canReal = RELAY() || (isOwner && KEY());
        const raw = canReal ? await realBrain(q) : localBrain(q);
        await speak(runCmds(raw));
      } catch (e) {
        await speak(isOwner
          ? `Snag on the wire — ${e.message}. Check the key, model and relay in ⚙ BRAIN SETTINGS; I'll hold on the local brain meanwhile.`
          : `I can't reach my full mind right now, so I'm answering from what I hold locally. Everything I've told you is still accurate — just narrower than usual.`);
      }
      busy = false;
    };
    el.querySelector("#clSend").onclick = () => send();
    inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    el.querySelectorAll(".qk").forEach(b => b.onclick = () => send(b.dataset.q));

    if (P.canSettings) {
      el.querySelector("#clGear").onclick = () => { const p = el.querySelector("#clSettings"); p.hidden = !p.hidden; };
      el.querySelector("#clSaveKey").onclick = () => {
        OS.store.set("claude_key", el.querySelector("#clKey").value.trim());
        OS.store.set("claude_model", el.querySelector("#clModel").value.trim() || "claude-sonnet-5");
        OS.store.set("claude_relay", el.querySelector("#clRelay").value.trim());
        const m = el.querySelector("#clMode");
        m.className = "chip " + ((KEY() || RELAY()) ? "ok" : "off");
        m.textContent = RELAY() ? "LIVE · SECURE RELAY" : KEY() ? "LIVE · REAL CLAUDE · " + MODEL() : "LOCAL BRAIN · awaiting connection";
        el.querySelector("#clSettings").hidden = true;
      };
      el.querySelector("#clClearChat").onclick = () => { chat = []; OS.store.set("claude_chat_" + SCOPE, []); render(); greet(); };
    }

    const greet = () => {
      if (chat.length) return;
      speak(isOwner
        ? `${user.name}. Claude, resident intelligence — wired into the Mind, your clients and the clock. ${RELAY() ? "Running through the secure relay." : KEY() ? "Running on the real API." : "Running the local brain until you hand me a key in ⚙ BRAIN SETTINGS."} What's first?`
        : SCOPE === "principal"
        ? `Good to see you, ${user.name}. I'm Claude — I sit inside this system and can explain anything on the Harmonic side: where the trading bot stands, what the verified record does and doesn't prove, and what's being built right now. I'm read-only here, so I'll show and explain, never change. What would you like to know?`
        : `Welcome, ${user.name}. I'm Claude — I can explain anything about your work with Offshore: where it stands, what's been done and what's next. Ask me anything.`);
    };
    render(); greet();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
