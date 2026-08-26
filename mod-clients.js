/* ═══════════ MODULE · CLIENTS — the onboarding engine (admin only) ═══════════
   A real onboarding system, not a form: a guided wizard that captures the
   client's identity, brand, services and journey — then births a personalized
   portal that fills with their logo, their milestones, their deliverables and
   the add-ons you choose to offer them, at your prices.
   Everything a client sees in ◍ Studios Agency is authored HERE. */
OS.register({
  id: "clients",
  mount(el, user) {
    const REAL = !!(window.OS_CONFIG.SUPABASE_URL && window.OS_CONFIG.SUPABASE_ANON_KEY);
    const load = () => OS.store.get("clients", []);
    const save = list => OS.store.set("clients", list);
    const upd = (email, fn) => { const L = load().map(c => c.email === email ? fn(c) : c); save(L); };

    /* default journeys per service — editable after creation */
    const JOURNEYS = {
      website:  ["Discovery call", "Design concepts", "Build", "Review round", "Launch", "Care & updates"],
      trading:  ["Onboarding", "System walkthrough", "Simulation period", "Verification review", "Go-live"],
      ai:       ["Process mapping", "Automation design", "Build & test", "Deploy", "Optimize"],
      marketing:["Brand audit", "Strategy", "Asset production", "Campaign live", "Report & iterate"]
    };
    const SERVICES = [["website", "Website / Web app"], ["marketing", "Marketing & brand"], ["ai", "AI automation"], ["trading", "Trading systems"]];

    /* Shown exactly once, right after an account is created or reset. The code
       is held in memory only — leave this screen and it is gone for good. */
    let lastInvite = null;
    let view = "book";          /* book | wizard | manage */
    let wiz = null;             /* wizard state */
    let manageEmail = null;

    /* ═══════════ THE BOOK ═══════════ */
    const bookView = () => {
      const L = load();
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Clients · onboarding &amp; portals</div>
        <h2>Your people. <span class="grad">Their world.</span></h2>
        <p class="sub">Run the onboarding and a personalized portal is born — their logo, their journey, their
        deliverables, your add-ons at your prices. Everything they see, you author here.</p>
        <span class="chip ${REAL ? "ok" : "warn"}">${REAL ? "SECURE · real accounts" : "LOCAL MODE · portals live in this browser until Supabase keys land"}</span>
        <button class="btn" id="startWiz" style="margin-left:10px">⟠ ONBOARD A NEW CLIENT</button>
      </div>
      ${lastInvite ? `
      <div class="card reveal" id="inviteCard" style="border-color:#00e8d088;margin-bottom:18px">
        <h3 style="margin:0 0 6px">${lastInvite.name}'s account is live</h3>
        <p class="cs" style="margin:0 0 10px">Send this now. The code is in memory only — once you leave this screen
        nobody, including me, can read it back. If it is lost you reset it, you never look it up.</p>
        <pre class="mono" id="inviteText" style="white-space:pre-wrap;font-size:12px;color:#cfeff5;background:rgba(0,232,208,.06);border:1px solid rgba(0,232,208,.2);border-radius:12px;padding:12px;margin:0 0 12px">${lastInvite.welcome || "Welcome to Offshore Studios"} — your private portal is live.

Portal: https://28payouts.github.io/offshore-studios/
Email: ${lastInvite.email}
Code: ${lastInvite.pass}

Inside you'll find your project's live progress, every deliverable, and a direct line to the team.
— Offshore Studios</pre>
        <button class="btn sm" id="inviteCopy">COPY INVITE</button>
        <button class="btn ghost sm" id="inviteDone" style="margin-left:8px">DONE — HIDE IT</button>
      </div>` : ""}
      <div class="cards">
        ${L.length ? L.map(c => `
        <div class="card reveal" style="border-color:${(c.accent || "#00e8d0")}44">
          <div style="display:flex;align-items:center;gap:14px">
            ${c.brand && c.brand.logo ? `<img src="${c.brand.logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover;border:1px solid ${(c.accent || "#00e8d0")}55">`
              : `<span class="cdot" style="background:${c.accent || "#00e8d0"};width:16px;height:16px"></span>`}
            <div style="flex:1;min-width:0"><h3 style="margin:0">${c.name}</h3>
              <p class="cs" style="margin:2px 0 0">${(c.services || []).map(s => (SERVICES.find(x => x[0] === s) || ["", s])[1]).join(" · ") || c.role}</p></div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">
            <span class="chip ok">${(c.miles || []).filter(m => m.s === "done").length}/${(c.miles || []).length || "—"} MILESTONES</span>
            ${(c.reqs || []).filter(r => !r.seen).length ? `<span class="chip warn">${c.reqs.filter(r => !r.seen).length} NEW REQUEST${c.reqs.filter(r => !r.seen).length > 1 ? "S" : ""}</span>` : ""}
            ${(c.msgs || []).filter(m => m.from === "client" && !m.seen).length ? `<span class="chip warn">💬 NEW MESSAGE</span>` : ""}
          </div>
          <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
            <button class="btn ghost sm" data-manage="${c.email}">MANAGE</button>
            <button class="btn ghost sm" data-reset="${c.email}">RESET CODE</button>
            <button class="btn ghost sm danger" data-del="${c.email}">REMOVE</button>
          </div>
        </div>`).join("")
        : `<div class="card reveal"><h3>No clients yet — by design</h3>
          <p class="cs">No fakes in this book. Hit ⟠ ONBOARD and the wizard walks you through identity, brand,
          services and journey — two minutes later their private world exists.</p>
          <span class="chip off">AWAITING FIRST CLIENT</span></div>`}
      </div>`;
      el.querySelector("#startWiz").onclick = () => {
        wiz = { step: 1, name: "", email: "", pass: "", role: "agency", welcome: "", accent: "#00e8d0",
                brand: { logo: "", site: "", tag: "" }, services: [], miles: [], bill: "",
                addons: [{ n: "Priority support", p: "$99/mo", on: true }], note: "" };
        view = "wizard"; render();
      };
      el.querySelectorAll("[data-manage]").forEach(b => b.onclick = () => { manageEmail = b.dataset.manage; view = "manage"; render(); });
      /* Removing a client kills the real account too — otherwise they'd keep a
         working login to a portal that no longer exists. */
      el.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
        const c = load().find(x => x.email === b.dataset.del);
        if (!confirm(`Remove ${c.name}'s portal AND delete their sign-in? This cannot be undone.`)) return;
        b.disabled = true; b.textContent = "REMOVING…";
        const res = await OS.cloud.call("account", { op: "delete", email: c.email });
        if (!res || res.error) { b.disabled = false; b.textContent = "REMOVE"; alert(res ? res.error : "account server unreachable"); return; }
        save(load().filter(x => x.email !== c.email)); render();
      });

      /* No "copy invite": the code is not stored, so there is nothing to copy.
         A lost code is reset, never recovered. That is the point. */
      el.querySelectorAll("[data-reset]").forEach(b => b.onclick = async () => {
        const c = load().find(x => x.email === b.dataset.reset);
        const np = prompt(`New portal code for ${c.name} (8+ characters).\nThey will need this to sign in — you will not be able to read it again.`);
        if (!np) return;
        if (np.trim().length < 8) { alert("Code must be at least 8 characters."); return; }
        b.disabled = true; b.textContent = "RESETTING…";
        const res = await OS.cloud.call("account", { op: "reset", email: c.email, password: np.trim() });
        b.disabled = false; b.textContent = "RESET CODE";
        if (!res || res.error) { alert(res ? res.error : "account server unreachable"); return; }
        lastInvite = { name: c.name, email: c.email, pass: np.trim(), welcome: c.welcome }; render();
      });

      const ic = el.querySelector("#inviteCopy");
      if (ic) ic.onclick = () => navigator.clipboard.writeText(el.querySelector("#inviteText").textContent)
        .then(() => { ic.textContent = "COPIED ✓"; setTimeout(() => ic.textContent = "COPY INVITE", 1400); });
      const idn = el.querySelector("#inviteDone");
      if (idn) idn.onclick = () => { lastInvite = null; render(); };
    };

    /* ═══════════ THE WIZARD ═══════════ */
    const wizView = () => {
      const W = wiz, step = W.step;
      const bar = [1, 2, 3, 4, 5].map(i =>
        `<span style="flex:1;height:3px;border-radius:3px;background:${i <= step ? "linear-gradient(90deg,var(--aqua),#4cdcff)" : "rgba(120,180,200,.15)"};transition:.4s"></span>`).join("");
      const head = (t, s) => `
        <button class="btn ghost sm" id="wzBack" style="margin-bottom:14px">← ${step === 1 ? "CANCEL" : "BACK"}</button>
        <div style="display:flex;gap:6px;max-width:520px;margin-bottom:22px">${bar}</div>
        <div class="mhead reveal"><div class="eyebrow">Onboarding · step ${step} of 5</div>
        <h2 style="font-size:1.5rem">${t}</h2><p class="sub">${s}</p></div>`;

      if (step === 1) el.innerHTML = head("Who are they?", "The identity that unlocks their private door.") + `
        <div class="card reveal" style="max-width:560px"><div class="cform">
          <input class="fin" id="wName" placeholder="client / company name" value="${W.name}">
          <input class="fin" id="wEmail" placeholder="email — their sign-in" value="${W.email}">
          <input class="fin" id="wPass" placeholder="portal code — their password" value="${W.pass}">
          <select class="fin" id="wRole">
            <option value="agency" ${W.role === "agency" ? "selected" : ""}>Studio client — websites · marketing · automation</option>
            <option value="trading" ${W.role === "trading" ? "selected" : ""}>Trading client — their trading system</option>
          </select>
          <input class="fin" id="wWelcome" placeholder="personal greeting (e.g. Welcome back, Doc)" value="${W.welcome}">
          <button class="btn" id="wzNext">CONTINUE →</button>
          <div class="gmsg" id="wzMsg" style="min-height:16px"></div>
        </div></div>`;

      if (step === 2) el.innerHTML = head("Their brand, on their world", "Their logo and colors dress the portal — it should feel like theirs the second they land.") + `
        <div class="card reveal" style="max-width:560px"><div class="cform">
          <input class="fin" id="wLogo" placeholder="logo image URL (their site, Drive, anywhere public)" value="${W.brand.logo}">
          <div id="wLogoPrev" style="min-height:14px">${W.brand.logo ? `<img src="${W.brand.logo}" style="height:56px;border-radius:12px;border:1px solid rgba(120,180,200,.25)">` : ""}</div>
          <input class="fin" id="wSite" placeholder="their website / company URL (optional)" value="${W.brand.site}">
          <input class="fin" id="wTag" placeholder="one line on who they are (shows under their name)" value="${W.brand.tag}">
          <div style="display:flex;gap:8px;align-items:center;margin:4px 0">
            <span style="font-size:11px;color:var(--dim);letter-spacing:.1em">PORTAL COLOR</span>
            ${["#00e8d0", "#4cdcff", "#a98bff", "#6ef2c0", "#ffc46b", "#ff7d9d"].map(c =>
              `<span class="swatch ${W.accent === c ? "on" : ""}" data-c="${c}" style="background:${c}"></span>`).join("")}
          </div>
          <button class="btn" id="wzNext">CONTINUE →</button>
        </div></div>`;

      if (step === 3) el.innerHTML = head("What are we building for them?", "Pick every service — each one seeds its own journey on their timeline.") + `
        <div class="cards" style="max-width:760px;grid-template-columns:1fr 1fr">
          ${SERVICES.map(([k, label]) => `
          <div class="card reveal wsvc ${W.services.includes(k) ? "on" : ""}" data-s="${k}"
            style="cursor:pointer;${W.services.includes(k) ? `border-color:${W.accent};box-shadow:0 0 24px -10px ${W.accent}` : ""}">
            <h3>${label}</h3><p class="cs">${JOURNEYS[k].slice(0, 3).join(" → ")}…</p>
            <span class="chip ${W.services.includes(k) ? "ok" : "off"}">${W.services.includes(k) ? "SELECTED ✓" : "TAP TO SELECT"}</span>
          </div>`).join("")}
        </div>
        <div class="card reveal" style="max-width:760px;margin-top:13px"><div class="cform">
          <input class="fin" id="wNote" placeholder="scope in one line (e.g. 5-page site + booking + monthly care)" value="${W.note}">
          <button class="btn" id="wzNext">CONTINUE →</button>
          <div class="gmsg" id="wzMsg" style="min-height:16px"></div>
        </div></div>`;

      if (step === 4) {
        if (!W.miles.length) W.miles = [...new Set(W.services.flatMap(s => JOURNEYS[s] || []))].map((l, i) => ({ l, s: i === 0 ? "now" : "next" }));
        el.innerHTML = head("Their journey & the money", "These milestones become their live progress bar. Advance them as you work — they watch it move.") + `
        <div class="card reveal" style="max-width:640px">
          <h3>Milestones</h3><p class="cs">drag-free editing: rename inline, ✕ to drop, add below</p>
          <div id="wMiles" style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
            ${W.miles.map((m, i) => `
            <div style="display:flex;gap:8px;align-items:center">
              <span class="mono" style="color:var(--dim);width:22px">${String(i + 1).padStart(2, "0")}</span>
              <input class="fin" data-mi="${i}" value="${m.l}" style="flex:1">
              <button class="btn ghost sm danger" data-mx="${i}">✕</button>
            </div>`).join("")}
          </div>
          <button class="btn ghost sm" id="wMileAdd" style="margin-top:10px">+ ADD MILESTONE</button>
        </div>
        <div class="card reveal" style="max-width:640px;margin-top:13px"><div class="cform">
          <input class="fin" id="wBill" placeholder="billing line (e.g. $450/mo · next 1 Sep)" value="${W.bill}">
          <button class="btn" id="wzNext">REVIEW →</button>
        </div></div>`;
      }

      if (step === 5) el.innerHTML = head("Ignite their world", "One click and the portal exists — dressed in their brand, loaded with their journey.") + `
        <div class="card reveal" style="max-width:640px;border-color:${W.accent}55">
          <div style="display:flex;align-items:center;gap:16px">
            ${W.brand.logo ? `<img src="${W.brand.logo}" style="width:58px;height:58px;border-radius:14px;object-fit:cover">` : `<span class="cdot" style="background:${W.accent};width:22px;height:22px"></span>`}
            <div><h3 style="margin:0">${W.name}</h3><p class="cs" style="margin:2px 0 0">${W.brand.tag || W.email}</p></div>
          </div>
          <div style="font-size:12.5px;color:var(--mut);line-height:2.2;margin-top:14px">
            <b style="color:#cfeff5">Services:</b> ${W.services.map(s => (SERVICES.find(x => x[0] === s) || ["", s])[1]).join(" · ") || "—"}<br>
            <b style="color:#cfeff5">Journey:</b> ${W.miles.length} milestones, starting at “${(W.miles[0] || {}).l || "—"}”<br>
            <b style="color:#cfeff5">Billing:</b> ${W.bill || "not set"}<br>
            <b style="color:#cfeff5">Sign-in:</b> ${W.email} / ${W.pass}
          </div>
          <div class="gmsg" id="wzMsg2"></div>
          <button class="btn" id="wzCreate" style="margin-top:16px">⟠ CREATE THE PORTAL</button>
        </div>`;

      /* wiring */
      el.querySelector("#wzBack").onclick = () => { if (step === 1) { view = "book"; render(); } else { W.step--; render(); } };
      const nx = el.querySelector("#wzNext");
      if (nx) nx.onclick = () => {
        const msg = el.querySelector("#wzMsg");
        if (step === 1) {
          W.name = wName.value.trim(); W.email = wEmail.value.trim().toLowerCase(); W.pass = wPass.value.trim();
          W.role = wRole.value; W.welcome = wWelcome.value.trim();
          if (!W.name || !W.email || !W.pass) { msg.className = "gmsg err"; msg.textContent = "name, email and portal code are required"; return; }
          if (load().some(c => c.email === W.email) || window.OS_CONFIG.LOCAL_USERS.some(u => u.email === W.email)) {
            msg.className = "gmsg err"; msg.textContent = "that email already has a portal"; return;
          }
        }
        if (step === 2) { W.brand.logo = wLogo.value.trim(); W.brand.site = wSite.value.trim(); W.brand.tag = wTag.value.trim(); }
        if (step === 3) {
          W.note = wNote.value.trim();
          if (!W.services.length) { msg.className = "gmsg err"; msg.textContent = "pick at least one service"; return; }
          W.miles = [];   /* reseed journey from chosen services */
        }
        if (step === 4) {
          W.miles = [...el.querySelectorAll("[data-mi]")].map((inp, i) => ({ l: inp.value.trim() || "Milestone", s: i === 0 ? "now" : "next" }));
          W.bill = wBill.value.trim();
        }
        W.step++; render();
      };
      if (step === 2) {
        el.querySelectorAll(".swatch").forEach(s => s.onclick = () => { W.accent = s.dataset.c; render(); });
        el.querySelector("#wLogo").addEventListener("change", e => { W.brand.logo = e.target.value.trim(); render(); });
      }
      if (step === 3) el.querySelectorAll(".wsvc").forEach(c => c.onclick = () => {
        const k = c.dataset.s;
        W.services = W.services.includes(k) ? W.services.filter(x => x !== k) : [...W.services, k];
        render();
      });
      if (step === 4) {
        el.querySelectorAll("[data-mx]").forEach(b => b.onclick = () => { W.miles.splice(+b.dataset.mx, 1); render(); });
        el.querySelector("#wMileAdd").onclick = () => {
          W.miles = [...el.querySelectorAll("[data-mi]")].map(inp => ({ l: inp.value.trim() || "Milestone", s: "next" }));
          W.miles.push({ l: "New milestone", s: "next" }); render();
        };
      }
      const cr = el.querySelector("#wzCreate");
      if (cr) cr.onclick = async () => {
        /* A real account is born on the SERVER first. If that fails we do not
           create a half-client that can log in nowhere — we stop and say why.
           The portal code is never stored anywhere: it goes to the client and
           to nobody else. If it is lost, Riley resets it; he cannot look it up. */
        cr.disabled = true; cr.textContent = "CREATING ACCOUNT…";
        const res = await OS.cloud.call("account", {
          op: "create", email: W.email, password: W.pass, name: W.name, role: W.role
        });
        if (!res || res.error) {
          cr.disabled = false; cr.textContent = "⟠ CREATE THE PORTAL";
          const m = el.querySelector("#wzMsg2");
          if (m) { m.className = "gmsg err"; m.textContent = res ? res.error : "not connected to the account server — sign in again and retry"; }
          return;
        }
        const rec = { name: W.name, email: W.email, role: W.role, welcome: W.welcome,
          accent: W.accent, brand: W.brand, services: W.services, miles: W.miles, bill: W.bill,
          note: W.note, addons: W.addons, msgs: [], reqs: [], delivs: [], created: Date.now() };
        save([...load(), rec]);
        lastInvite = { name: W.name, email: W.email, pass: W.pass, welcome: W.welcome };
        view = "book"; wiz = null; render();
      };
    };

    /* ═══════════ MANAGE ONE CLIENT ═══════════ */
    const manageView = () => {
      const c = load().find(x => x.email === manageEmail);
      if (!c) { view = "book"; return render(); }
      /* mark inbound as seen */
      upd(c.email, r => ({ ...r,
        reqs: (r.reqs || []).map(q => ({ ...q, seen: true })),
        msgs: (r.msgs || []).map(m => m.from === "client" ? { ...m, seen: true } : m) }));
      const cc = load().find(x => x.email === manageEmail);
      el.innerHTML = `
      <button class="btn ghost sm" id="mgBack" style="margin-bottom:14px">← ALL CLIENTS</button>
      <div class="mhead reveal" style="border-left:2px solid ${cc.accent};padding-left:18px">
        <div class="eyebrow" style="color:${cc.accent}">Managing · ${cc.email}</div>
        <h2 style="display:flex;align-items:center;gap:14px">${cc.brand && cc.brand.logo ? `<img src="${cc.brand.logo}" style="width:44px;height:44px;border-radius:12px;object-fit:cover">` : ""}${cc.name}</h2>
        <p class="sub">${cc.brand && cc.brand.tag ? cc.brand.tag + " · " : ""}Everything you change here appears in their portal instantly.</p>
      </div>

      <div class="cards" style="grid-template-columns:1.1fr .9fr">
        <div class="card reveal">
          <h3>Their journey</h3><p class="cs">advance the stage — they see the bar move</p>
          <div style="display:flex;flex-direction:column;gap:9px;margin-top:8px">
            ${(cc.miles || []).map((m, i) => `
            <div style="display:flex;gap:10px;align-items:center">
              <span class="chip ${m.s === "done" ? "ok" : m.s === "now" ? "warn" : "off"}" style="width:64px;text-align:center">${m.s.toUpperCase()}</span>
              <span style="flex:1;font-size:13px;color:${m.s === "done" ? "var(--dim)" : "#eafcff"}">${m.l}</span>
              ${m.s !== "done" ? `<button class="btn ghost sm" data-adv="${i}">${m.s === "now" ? "COMPLETE ✓" : "START"}</button>` : ""}
            </div>`).join("")}
          </div>
        </div>
        <div class="card reveal">
          <h3>Deliverables vault</h3><p class="cs">everything you ship lands in their portal, forever</p>
          <div style="display:flex;flex-direction:column;gap:7px;margin-top:8px">
            ${(cc.delivs || []).length ? cc.delivs.map(d => `<div style="display:flex;gap:8px;font-size:12.5px;color:var(--mut)"><span style="color:${cc.accent}">◈</span><b style="color:#cfeff5">${d.n}</b>${d.link ? ` · <a href="${d.link}" target="_blank" style="color:var(--aqua)">open ↗</a>` : ""}</div>`).join("") : `<span class="chip off">NOTHING SHIPPED YET</span>`}
          </div>
          <div class="cform" style="margin-top:12px">
            <input class="fin" id="mgDn" placeholder="deliverable name (e.g. Homepage design v2)">
            <input class="fin" id="mgDl" placeholder="link (optional)">
            <button class="btn ghost sm" id="mgDadd">SHIP IT →</button>
          </div>
        </div>
      </div>

      <div class="cards" style="margin-top:13px;grid-template-columns:1fr 1fr">
        <div class="card reveal">
          <h3>Add-ons you're offering them</h3><p class="cs">your catalogue, your prices — shows live in their portal</p>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
            ${(cc.addons || []).map((a, i) => `
            <div style="display:flex;gap:8px;align-items:center;font-size:13px">
              <button class="chip ${a.on ? "ok" : "off"}" data-atog="${i}" style="cursor:pointer">${a.on ? "VISIBLE" : "HIDDEN"}</button>
              <b style="color:#cfeff5;flex:1">${a.n}</b><span style="color:${cc.accent}">${a.p}</span>
              <button class="btn ghost sm danger" data-adel="${i}">✕</button>
            </div>`).join("")}
          </div>
          <div class="cform" style="margin-top:12px">
            <input class="fin" id="mgAn" placeholder="add-on (e.g. SEO care plan)">
            <input class="fin" id="mgAp" placeholder="price (e.g. $149/mo)">
            <button class="btn ghost sm" id="mgAadd">ADD TO THEIR CATALOGUE</button>
          </div>
          ${(cc.reqs || []).length ? `<div style="margin-top:14px"><p class="cs">requests from them</p>
            ${cc.reqs.map(q => `<div style="font-size:12.5px;color:var(--mut);margin-top:4px">⟡ <b style="color:#cfeff5">${q.n}</b> · ${new Date(q.when).toLocaleDateString()}</div>`).join("")}</div>` : ""}
        </div>
        <div class="card reveal chatcard" style="padding:0">
          <div style="padding:18px 22px;border-bottom:1px solid rgba(120,180,200,.12)">
            <h3 style="margin:0">Direct line</h3><p class="cs" style="margin:2px 0 0">their messages · your replies · in their portal instantly</p>
          </div>
          <div class="chatlog" id="mgLog" style="max-height:240px">
            ${(cc.msgs || []).map(m => `<div class="msg ${m.from === "studio" ? "me" : "ai"}"><div><b style="font-size:10px;letter-spacing:.12em;color:${m.from === "studio" ? "var(--aqua)" : cc.accent}">${m.from === "studio" ? "STUDIO" : cc.name.toUpperCase()}</b><br>${m.t}</div></div>`).join("")}
          </div>
          <div class="chatbar"><input class="fin" id="mgMsg" placeholder="message ${cc.name}…"><button class="btn" id="mgSend">SEND</button></div>
        </div>
      </div>`;

      el.querySelector("#mgBack").onclick = () => { view = "book"; render(); };
      el.querySelectorAll("[data-adv]").forEach(b => b.onclick = () => {
        upd(cc.email, r => { const M = [...r.miles]; const i = +b.dataset.adv;
          if (M[i].s === "now") { M[i] = { ...M[i], s: "done" }; const nx = M.findIndex(m => m.s === "next"); if (nx > -1) M[nx] = { ...M[nx], s: "now" }; }
          else M[i] = { ...M[i], s: "now" };
          return { ...r, miles: M }; });
        render();
      });
      el.querySelector("#mgDadd").onclick = () => {
        const n = el.querySelector("#mgDn").value.trim(); if (!n) return;
        upd(cc.email, r => ({ ...r, delivs: [...(r.delivs || []), { n, link: el.querySelector("#mgDl").value.trim(), when: Date.now() }] }));
        render();
      };
      el.querySelectorAll("[data-atog]").forEach(b => b.onclick = () => {
        upd(cc.email, r => ({ ...r, addons: r.addons.map((a, i) => i === +b.dataset.atog ? { ...a, on: !a.on } : a) })); render();
      });
      el.querySelectorAll("[data-adel]").forEach(b => b.onclick = () => {
        upd(cc.email, r => ({ ...r, addons: r.addons.filter((_, i) => i !== +b.dataset.adel) })); render();
      });
      el.querySelector("#mgAadd").onclick = () => {
        const n = el.querySelector("#mgAn").value.trim(), p = el.querySelector("#mgAp").value.trim();
        if (!n || !p) return;
        upd(cc.email, r => ({ ...r, addons: [...(r.addons || []), { n, p, on: true }] })); render();
      };
      const sendMsg = () => {
        const t = el.querySelector("#mgMsg").value.trim(); if (!t) return;
        upd(cc.email, r => ({ ...r, msgs: [...(r.msgs || []), { from: "studio", t, when: Date.now() }] })); render();
      };
      el.querySelector("#mgSend").onclick = sendMsg;
      el.querySelector("#mgMsg").addEventListener("keydown", e => { if (e.key === "Enter") sendMsg(); });
      const lg = el.querySelector("#mgLog"); lg.scrollTop = lg.scrollHeight;
    };

    const render = () => view === "wizard" ? wizView() : view === "manage" ? manageView() : bookView();
    render();
  }
});
