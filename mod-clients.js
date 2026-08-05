/* ═══════════ MODULE · CLIENTS (admin only) ═══════════
   The ultimate agency: every client gets a private, personalized portal.
   Add anyone — trading, agency, whatever comes next. They sign in with the
   email + portal code you set here; their portal wears their color and
   greeting. LOCAL MODE keeps clients on this device; Supabase keys make
   invites real across devices. */
OS.register({
  id: "clients",
  mount(el, user) {
    const REAL = !!(window.OS_CONFIG.SUPABASE_URL && window.OS_CONFIG.SUPABASE_ANON_KEY);
    const load = () => OS.store.get("clients", []);
    const save = list => OS.store.set("clients", list);
    let editing = null; // email being edited

    const shell = () => {
      const L = load();
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Clients · private portals</div>
        <h2>Your people. <span class="grad">Their world.</span></h2>
        <p class="sub">Add a client, pick what they see, give their portal its own color and greeting. They sign in on the same page you do — and land somewhere built only for them.</p>
        <span class="chip ${REAL ? "ok" : "warn"}">${REAL ? "SECURE · real accounts" : "LOCAL MODE · clients live in this browser — paste Supabase keys to make invites real across devices"}</span>
      </div>

      <div class="cards" style="grid-template-columns:.9fr 1.1fr">
        <div class="card reveal">
          <h3 id="cfTitle">${editing ? "Edit client" : "Add a client"}</h3>
          <p class="cs">two minutes to a private portal</p>
          <div class="cform">
            <input class="fin" id="cfName" placeholder="name / company">
            <input class="fin" id="cfEmail" placeholder="email (their sign-in)" ${editing ? "disabled" : ""}>
            <input class="fin" id="cfPass" placeholder="portal code (their password)">
            <select class="fin" id="cfRole">
              <option value="trading">Trading — sees The Live Mind</option>
              <option value="agency">Agency — sees their project + billing</option>
              <option value="admin">Admin — sees everything (careful)</option>
            </select>
            <input class="fin" id="cfWelcome" placeholder="personal greeting (e.g. Welcome back, Doc)">
            <div style="display:flex;gap:8px;align-items:center;margin:4px 0 2px">
              <span style="font-size:11px;color:var(--dim);letter-spacing:.1em">PORTAL COLOR</span>
              ${["#00e8d0", "#4cdcff", "#a98bff", "#6ef2c0", "#ffc46b", "#ff7d9d"].map(c =>
                `<span class="swatch" data-c="${c}" style="background:${c}"></span>`).join("")}
            </div>
            <input class="fin" id="cfBill" placeholder="next bill (e.g. $450 · due 1 Sep) — optional">
            <input class="fin" id="cfNote" placeholder="status line they'll see (e.g. Site in build · launch Sep)">
            <div style="display:flex;gap:8px;margin-top:6px">
              <button class="btn" id="cfSave">${editing ? "SAVE CHANGES" : "CREATE PORTAL"}</button>
              ${editing ? `<button class="btn ghost" id="cfCancel">CANCEL</button>` : ""}
            </div>
            <div class="gmsg" id="cfMsg" style="min-height:16px"></div>
          </div>
        </div>

        <div class="card reveal">
          <h3>Book of clients <span class="chip">${L.length}</span></h3>
          <p class="cs">${L.length ? "click a card to manage" : "no clients yet — your first portal is one form away"}</p>
          <div id="cList" style="display:flex;flex-direction:column;gap:10px;margin-top:8px">
            ${L.map(c => `
            <div class="clientrow" data-e="${c.email}">
              <span class="cdot" style="background:${c.accent || "#00e8d0"}"></span>
              <div class="cinfo"><b>${c.name}</b><span>${c.email} · ${c.role}</span>${c.note ? `<span>${c.note}</span>` : ""}</div>
              <div class="cacts">
                <button class="btn ghost sm" data-act="invite" data-e="${c.email}">COPY INVITE</button>
                <button class="btn ghost sm" data-act="edit" data-e="${c.email}">EDIT</button>
                <button class="btn ghost sm danger" data-act="del" data-e="${c.email}">REMOVE</button>
              </div>
            </div>`).join("")}
          </div>
        </div>
      </div>

      <div class="card reveal" style="margin-top:16px">
        <h3>How a client experiences it</h3>
        <p class="cs">private · interactive · theirs</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:1.9">
          ① They open the same door you do — <span class="mono" style="color:var(--aqua)">28payouts.github.io/offshore-studios</span><br>
          ② Their email + portal code lets them in — anything else is <b style="color:var(--ink)">ACCESS DENIED · UNKNOWN DIVER</b><br>
          ③ The app dresses itself in their color, greets them by name, and shows <b style="color:var(--ink)">only their world</b> — trading clients get the Mind, agency clients get their project and next bill<br>
          ④ ${REAL ? "Accounts are real — Supabase secured." : "When Supabase keys land, these portals become real cross-device accounts automatically."}
        </div>
      </div>`;

      /* swatches */
      let accent = editing ? (load().find(c => c.email === editing) || {}).accent || "#00e8d0" : "#00e8d0";
      const sw = el.querySelectorAll(".swatch");
      const paint = () => sw.forEach(s => s.classList.toggle("on", s.dataset.c === accent));
      sw.forEach(s => s.onclick = () => { accent = s.dataset.c; paint(); }); paint();

      /* prefill on edit */
      if (editing) {
        const c = load().find(x => x.email === editing);
        if (c) { cfName.value = c.name; cfEmail.value = c.email; cfPass.value = c.pass; cfRole.value = c.role; cfWelcome.value = c.welcome || ""; cfBill.value = c.bill || ""; cfNote.value = c.note || ""; }
      }

      /* save */
      el.querySelector("#cfSave").onclick = () => {
        const msg = el.querySelector("#cfMsg");
        const name = cfName.value.trim(), email = cfEmail.value.trim().toLowerCase(), pass = cfPass.value.trim();
        if (!name || !email || !pass) { msg.className = "gmsg err"; msg.textContent = "name, email and portal code are required"; return; }
        let L2 = load();
        if (!editing && (L2.some(c => c.email === email) || window.OS_CONFIG.LOCAL_USERS.some(u => u.email === email))) {
          msg.className = "gmsg err"; msg.textContent = "that email already has a portal"; return;
        }
        const rec = { name, email, pass, role: cfRole.value, welcome: cfWelcome.value.trim(), accent, bill: cfBill.value.trim(), note: cfNote.value.trim(), created: editing ? (L2.find(c => c.email === email) || {}).created || Date.now() : Date.now() };
        L2 = editing ? L2.map(c => c.email === editing ? rec : c) : [...L2, rec];
        save(L2); editing = null; shell();
      };
      const cc = el.querySelector("#cfCancel"); if (cc) cc.onclick = () => { editing = null; shell(); };

      /* row actions */
      el.querySelector("#cList").onclick = e => {
        const b = e.target.closest("[data-act]"); if (!b) return;
        const em = b.dataset.e, c = load().find(x => x.email === em);
        if (b.dataset.act === "edit") { editing = em; shell(); }
        if (b.dataset.act === "del") { if (confirm(`Remove ${c.name}'s portal?`)) { save(load().filter(x => x.email !== em)); editing = null; shell(); } }
        if (b.dataset.act === "invite") {
          navigator.clipboard.writeText(
`${c.welcome || "Welcome to Offshore Studios"} — your private portal is live.

Portal: https://28payouts.github.io/offshore-studios/
Email: ${c.email}
Code: ${c.pass}

See you inside. — Offshore Studios`).then(() => { b.textContent = "COPIED ✓"; setTimeout(() => b.textContent = "COPY INVITE", 1400); });
        }
      };
    };
    shell();
  }
});
