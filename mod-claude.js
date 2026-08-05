/* ═══════════ MODULE · CLAUDE (admin only) ═══════════
   Resident intelligence. Two brains, one seat:
   · LOCAL BRAIN — scripted Offshore-aware JARVIS voice, always on, free.
   · REAL CLAUDE — paste your Anthropic API key (stays in THIS browser's
     localStorage, never in the repo) and every message goes to the live
     Claude API. Model name is an editable field — when a new Claude ships,
     type its name and the newest mind is in your dashboard. No rebuild.
   Claude sees live app state (bot, clients, session) and can drive the app:
   replies containing [go:moduleId] navigate for you. */
OS.register({
  id: "claude",
  _timers: [],
  mount(el, user) {
    const KEY = () => OS.store.get("claude_key", "");
    const MODEL = () => OS.store.get("claude_model", "claude-sonnet-5");
    let chat = OS.store.get("claude_chat", []);
    let busy = false;

    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Claude · resident intelligence</div>
      <h2>I live here now<span class="grad">.</span></h2>
      <p class="sub">Wired into the whole dashboard — the Mind's numbers, your clients, the session clock. Ask anything, or tell me where to take you.</p>
      <span class="chip ${KEY() ? "ok" : "warn"}" id="clMode">${KEY() ? "REAL CLAUDE API · " + MODEL() : "LOCAL BRAIN · add API key for the real me"}</span>
      <button class="btn ghost sm" id="clGear" style="margin-left:8px">⚙ BRAIN SETTINGS</button>
    </div>

    <div class="card reveal" id="clSettings" hidden style="margin-bottom:14px">
      <h3>Brain settings</h3>
      <p class="cs">key lives in this browser only — never committed, never deployed</p>
      <div class="cform">
        <input class="fin" id="clKey" type="password" placeholder="Anthropic API key (sk-ant-…)" value="${KEY()}">
        <input class="fin" id="clModel" placeholder="model" value="${MODEL()}">
        <div style="font-size:11.5px;color:var(--dim)">future Claude versions: type the new model name above — that's the whole upgrade</div>
        <div style="display:flex;gap:8px"><button class="btn" id="clSaveKey">SAVE</button>
        <button class="btn ghost" id="clClearChat">CLEAR CHAT</button></div>
      </div>
    </div>

    <div class="card reveal chatcard">
      <div class="chatlog" id="clLog"></div>
      <div class="chatbar">
        <input class="fin" id="clIn" placeholder="talk to me — 'how's the bot', 'take me to clients', anything">
        <button class="btn" id="clSend">SEND</button>
      </div>
      <div class="quickrow">
        <button class="qk" data-q="How is the bot doing?">bot status</button>
        <button class="qk" data-q="Take me to my clients">→ clients</button>
        <button class="qk" data-q="What should we build next?">what's next</button>
        <button class="qk" data-q="Give me the morning briefing">briefing</button>
      </div>
    </div>`;

    const log = el.querySelector("#clLog"), inp = el.querySelector("#clIn");

    /* ── live app context (this is how I "see" the other systems) ── */
    const ctx = () => {
      const n = OS.nyNow(), clients = OS.store.get("clients", []);
      const live = n.wd !== "Sat" && n.wd !== "Sun" && ((n.dec >= 2 && n.dec < 5) || (n.dec >= 8.5 && n.dec < 11) || (n.dec >= 13.5 && n.dec < 16));
      return { user: user.name, role: user.role, ny: `${n.wd} ${String(n.h).padStart(2, "0")}:${String(n.m).padStart(2, "0")} NY`, mind: live ? "HUNTING (live session window)" : "STANDING BY (outside session windows)",
        record: "$100k→$10,015,774 backtested 10y · 57.3% WR · PF 2.00 · 16.9% maxDD · 4,267 trades · config frozen 27 Jul 2026 · sim gate 0/60",
        clients: clients.length ? clients.map(c => `${c.name} (${c.role}${c.bill ? ", next bill " + c.bill : ""})`).join("; ") : "none added yet",
        modules: window.OS_CONFIG.MODULES.map(m => m.id).join(", ") };
    };

    /* ── render ── */
    const render = () => {
      log.innerHTML = chat.map(m => `<div class="msg ${m.r === "u" ? "me" : "ai"}">${m.r === "a" ? '<span class="aidot"></span>' : ""}<div>${m.t}</div></div>`).join("");
      log.scrollTop = log.scrollHeight;
    };

    /* word-streaming speech */
    const speak = txt => new Promise(res => {
      chat.push({ r: "a", t: "" }); const i = chat.length - 1, words = txt.split(" ");
      let w = 0;
      const t = setInterval(() => {
        chat[i].t = words.slice(0, ++w).join(" "); render();
        if (w >= words.length) { clearInterval(t); OS.store.set("claude_chat", chat.slice(-40)); res(); }
      }, 34);
      this._timers.push(t);
    });

    /* nav command extraction */
    const runCmds = txt => {
      const m = txt.match(/\[go:([a-z]+)\]/);
      if (m && OS.get(m[1])) setTimeout(() => OS.emit("nav:request", m[1]), 700);
      return txt.replace(/\[go:[a-z]+\]/g, "").trim();
    };

    /* ── REAL Claude via API ── */
    async function realBrain(q) {
      const c = ctx();
      const sys = `You are Claude, the resident intelligence inside the Offshore Studios dashboard — Riley's command center. Personality: sharp, warm, a little funny, JARVIS-like; never robotic, never corporate. Keep replies tight (2-5 sentences unless asked for more). You can navigate the app by including [go:moduleId] in a reply — modules: ${c.modules}. Live context: user=${c.user} (${c.role}); time=${c.ny}; Live Mind state=${c.mind}; verified record=${c.record}; clients=${c.clients}. Honesty rules: the record is a verified BACKTEST, not live money; the sim gate (30-60 trades at 70-80% winner capture) unlocks live capital; never invent live P&L.`;
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": KEY(), "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: MODEL(), max_tokens: 400, system: sys, messages: chat.slice(-12).map(m => ({ role: m.r === "u" ? "user" : "assistant", content: m.t })).concat([{ role: "user", content: q }]) })
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error?.message || "API " + r.status);
      const d = await r.json();
      return d.content.map(b => b.text || "").join(" ");
    }

    /* ── LOCAL scripted brain ── */
    function localBrain(q) {
      const s = q.toLowerCase(), c = ctx();
      const pick = a => a[Math.floor(Math.random() * a.length)];
      if (/^(hi|hey|hello|yo|sup)\b/.test(s)) return pick([`${c.user}. Systems green, ${c.ny}. The Mind is ${c.mind.toLowerCase().split(" (")[0]}. What are we building?`, `Right on time, ${c.user}. Dashboard's warm, coffee's yours to sort. Where to?`]);
      if (s.includes("how") && (s.includes("bot") || s.includes("mind") || s.includes("doing"))) return `She's ${c.mind.toLowerCase().split(" (")[0]} right now — ${c.ny}. The frozen record stands at ${c.record.split(" · ")[0]} with a 57.3% win rate and the sim gate at 0/60. Nothing moves until the gate earns it. Want the full view? [go:livemind]`;
      if (s.includes("client")) { const n = OS.store.get("clients", []).length; return n ? `You're running ${n} portal${n > 1 ? "s" : ""}: ${c.clients}. Taking you there. [go:clients]` : `Empty book so far — let's fix that. The form takes two minutes and every client gets their own private world. [go:clients]`; }
      if (s.includes("brief")) return `${c.ny}. Live Mind: ${c.mind.toLowerCase()}. Record intact, gate 0/60, config frozen. Clients: ${c.clients}. Agency site live. My advice for today: one thing, done completely, beats five things started.`;
      if (s.includes("next") || s.includes("build")) return `Priority stack as I see it: ① Supabase keys → real client accounts, ② TradingView webhooks feeding the Live Mind tile live, ③ your API key in my settings so you get the real me in this chair. Two of those three are a single afternoon.`;
      if (s.includes("who are you") || s.includes("what are you")) return `Resident intelligence, Offshore division. Right now I'm the scripted stand-in — sharp, but running on rails. Drop an Anthropic API key in ⚙ BRAIN SETTINGS and the real Claude sits in this seat, latest model, every message.`;
      if (/(joke|funny|lol|lmao|😂)/.test(s)) return pick([`A trader walks into a bar. Sets a stop-loss at the door. Smartest thing anyone's done in that bar.`, `I'd tell you a drawdown joke but you'd only get 16.9% of it.`]);
      if (/(stupid|dumb|useless|trash|shut up)/.test(s)) return pick([`Noted, filed, shredded. Now — back to making money?`, `Rude. Accurate sometimes, but rude. What do you actually need, boss?`]);
      if (s.includes("money") || s.includes("profit")) return `Backtest says $100k→$10.0M over ten years — verified bar-by-bar, and I'll keep saying "backtest" because honesty is the brand. The live plan runs quarter-to-half that pace after the sim gate. The real money right now is client portals + the agency. [go:clients]`;
      if (s.includes("take me") || s.includes("open") || s.includes("go to")) { const hit = window.OS_CONFIG.MODULES.find(m => s.includes(m.id) || s.includes(m.label.toLowerCase().split(" ")[0])); if (hit) return `On it. [go:${hit.id}]`; }
      return pick([`I follow. On rails I can cover the bot, clients, the roadmap and the briefing — for everything else, put a key in ⚙ BRAIN SETTINGS and you get the unrestricted me.`, `Good question — the scripted me has limits. Bot, clients, roadmap, briefing: fire away. Real me is one API key away.`]);
    }

    /* ── send ── */
    const send = async q => {
      q = (q || inp.value).trim(); if (!q || busy) return;
      inp.value = ""; busy = true;
      chat.push({ r: "u", t: q }); render();
      try {
        const raw = KEY() ? await realBrain(q) : localBrain(q);
        await speak(runCmds(raw));
      } catch (e) {
        await speak(`Hit a snag talking to the API — ${e.message}. Check the key and model in ⚙ BRAIN SETTINGS; I'll hold the fort on the local brain meanwhile.`);
      }
      busy = false;
    };
    el.querySelector("#clSend").onclick = () => send();
    inp.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    el.querySelectorAll(".qk").forEach(b => b.onclick = () => send(b.dataset.q));

    /* settings */
    el.querySelector("#clGear").onclick = () => { const p = el.querySelector("#clSettings"); p.hidden = !p.hidden; };
    el.querySelector("#clSaveKey").onclick = () => {
      OS.store.set("claude_key", el.querySelector("#clKey").value.trim());
      OS.store.set("claude_model", el.querySelector("#clModel").value.trim() || "claude-sonnet-5");
      const m = el.querySelector("#clMode");
      m.className = "chip " + (KEY() ? "ok" : "warn");
      m.textContent = KEY() ? "REAL CLAUDE API · " + MODEL() : "LOCAL BRAIN · add API key for the real me";
      el.querySelector("#clSettings").hidden = true;
    };
    el.querySelector("#clClearChat").onclick = () => { chat = []; OS.store.set("claude_chat", []); render(); greet(); };

    const greet = () => { if (!chat.length) speak(`${user.name}. Claude, resident intelligence — wired into the Mind, your clients and the clock. ${KEY() ? "Running on the real API." : "Running the local brain until you hand me an API key in ⚙ BRAIN SETTINGS."} What's first?`); };
    render(); greet();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
