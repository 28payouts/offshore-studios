/* ═══════════ MODULE · STUDIOS AGENCY ═══════════
   Two faces, one module.
   ADMIN — the operating picture of the agency.
   CLIENT — their world: their brand on the wall, their journey moving in
   real time, every deliverable kept forever, the add-on catalogue at live
   prices, and a direct line to the team. Professional front-of-house:
   no internals, no tooling talk — just their project, beautifully. */
OS.register({
  id: "agency",
  _timers: [],
  mount(el, user) {
    const L = window.OS_CONFIG.LINKS;
    const admin = user.role === "admin";

    /* ─────────────── ADMIN: operations ─────────────── */
    if (admin) {
      const BOOK = OS.store.get("clients", []).filter(c => c.role === "agency");
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Studios Agency · operations</div>
        <h2>The agency, at a glance.</h2>
        <p class="sub">Sites, clients, automations and billing — the business side of Offshore in one view. Onboard and manage in ❖ Clients.</p>
      </div>
      <div class="cards">
        <div class="card reveal"><div class="stat"><div class="k">Agency site</div><div class="v aq">LIVE</div>
          <div class="s">three.js · GSAP · Netlify</div></div>
          <div style="margin-top:12px"><a class="btn ghost" href="${L.agencySite}" target="_blank">OPEN SITE ↗</a></div></div>
        <div class="card reveal"><div class="stat"><div class="k">Active clients</div><div class="v">${BOOK.length}</div>
          <div class="s">${BOOK.length ? "onboarded · real" : "real count — onboard in ❖ Clients"}</div></div></div>
        <div class="card reveal"><div class="stat"><div class="k">Open requests</div><div class="v wc">${BOOK.reduce((n, c) => n + (c.reqs || []).filter(r => !r.seen).length, 0) || "—"}</div>
          <div class="s">add-on requests awaiting reply</div></div></div>
        <div class="card reveal"><div class="stat"><div class="k">Deliverables shipped</div><div class="v aq">${BOOK.reduce((n, c) => n + (c.delivs || []).length, 0)}</div>
          <div class="s">across the whole book · real</div></div></div>
      </div>
      <div class="mhead reveal" style="margin-top:30px"><div class="eyebrow">Clients</div>
        <h2 style="font-size:1.3rem">Book of work <span class="chip ok" style="vertical-align:middle">REAL</span></h2></div>
      <div class="cards">
        ${BOOK.length ? BOOK.map(c => `<div class="card reveal" style="border-color:${(c.accent || "#00e8d0")}44">
          <div style="display:flex;align-items:center;gap:12px">
            ${c.brand && c.brand.logo ? `<img src="${c.brand.logo}" style="width:38px;height:38px;border-radius:10px;object-fit:cover">` : ""}
            <h3 style="margin:0">${c.name}</h3></div>
          <p class="cs">${(c.miles || []).find(m => m.s === "now")?.l || c.note || "project underway"}</p>
          <span class="chip ok">${(c.miles || []).filter(m => m.s === "done").length}/${(c.miles || []).length} DONE</span>
          <span class="chip">${c.bill || "billing not set"}</span></div>`).join("")
        : `<div class="card reveal"><h3>Empty on purpose</h3>
          <p class="cs">No fake clients here. Onboard a real one in ❖ Clients and their world ignites.</p>
          <span class="chip off">AWAITING FIRST CLIENT</span></div>`}
      </div>`;
      return;
    }

    /* ─────────────── CLIENT: their world ─────────────── */
    const me = () => (OS.store.get("clients", []).find(c => c.email === user.email)) || {};
    const upd = fn => { OS.store.set("clients", OS.store.get("clients", []).map(c => c.email === user.email ? fn(c) : c)); };
    const AC = () => me().accent || user.accent || "#00e8d0";

    const render = () => {
      const c = me();
      const miles = c.miles || [];
      const done = miles.filter(m => m.s === "done").length;
      const pct = miles.length ? Math.round((done / miles.length) * 100) : 0;
      const nowM = miles.find(m => m.s === "now");
      el.innerHTML = `
      <div class="mhead reveal" style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
        ${c.brand && c.brand.logo ? `<img src="${c.brand.logo}" style="width:72px;height:72px;border-radius:18px;object-fit:cover;border:1px solid ${AC()}55;box-shadow:0 12px 40px -12px ${AC()}">` : ""}
        <div style="flex:1;min-width:240px">
          <div class="eyebrow" style="color:${AC()}">${c.welcome || "Your project with Offshore Studios"}</div>
          <h2 style="margin:0">${c.name || user.name}</h2>
          <p class="sub" style="margin:6px 0 0">${c.brand && c.brand.tag ? c.brand.tag : "Live progress · every deliverable · a direct line to the team."}</p>
        </div>
        ${c.brand && c.brand.site ? `<a class="btn ghost" href="${c.brand.site}" target="_blank">YOUR SITE ↗</a>` : ""}
      </div>

      <div class="card reveal" style="border-color:${AC()}44">
        <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
          <h3 style="margin:0">Your journey</h3>
          <span class="chip ok">${done} OF ${miles.length || "—"} COMPLETE</span>
          ${nowM ? `<span class="chip warn">NOW: ${nowM.l.toUpperCase()}</span>` : pct === 100 && miles.length ? `<span class="chip ok">ALL DELIVERED ✓</span>` : ""}
        </div>
        <div style="height:10px;border-radius:99px;background:rgba(120,180,200,.12);margin:18px 0 8px;overflow:hidden">
          <div style="width:${pct}%;height:100%;border-radius:99px;background:linear-gradient(90deg,${AC()},#4cdcff);
            box-shadow:0 0 18px ${AC()};transition:width 1.2s cubic-bezier(.2,.8,.2,1)"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:11px;margin-top:16px">
          ${miles.length ? miles.map((m, i) => `
          <div class="reveal" style="display:flex;gap:14px;align-items:center;animation-delay:${i * 70}ms">
            <span style="width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;
              font:700 12px 'JetBrains Mono';flex:none;
              ${m.s === "done" ? `background:${AC()};color:#01222b` : m.s === "now" ? `border:2px solid ${AC()};color:${AC()};box-shadow:0 0 14px -2px ${AC()}` : "border:1.5px solid rgba(120,180,200,.3);color:var(--dim)"}">
              ${m.s === "done" ? "✓" : i + 1}</span>
            <span style="font-size:13.5px;color:${m.s === "done" ? "var(--dim)" : m.s === "now" ? "#eafcff" : "var(--mut)"};${m.s === "now" ? "font-weight:600" : ""}">${m.l}</span>
            ${m.s === "now" ? `<span class="chip warn" style="margin-left:auto">IN PROGRESS</span>` : ""}
          </div>`).join("") : `<span class="chip off">JOURNEY BEING PREPARED</span>`}
        </div>
      </div>

      <div class="cards" style="margin-top:13px;grid-template-columns:1.05fr .95fr">
        <div class="card reveal">
          <h3>Your deliverables</h3><p class="cs">everything we ship lives here, permanently yours</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
            ${(c.delivs || []).length ? c.delivs.map(d => `
            <div style="display:flex;gap:12px;align-items:center;padding:11px 14px;border-radius:14px;background:rgba(4,16,26,.6);border:1px solid rgba(120,180,200,.12)">
              <span style="color:${AC()};font-size:16px">◈</span>
              <div style="flex:1"><b style="color:#eafcff;font-size:13px">${d.n}</b>
                <div class="mono" style="font-size:9.5px;color:var(--dim);letter-spacing:.14em">${new Date(d.when).toLocaleDateString()}</div></div>
              ${d.link ? `<a class="btn ghost sm" href="${d.link}" target="_blank">OPEN ↗</a>` : ""}
            </div>`).join("") : `<span class="chip off">FIRST DELIVERABLE COMING SOON</span>`}
          </div>
        </div>
        <div class="card reveal">
          <h3>Available add-ons</h3><p class="cs">live pricing · request and we'll take it from there</p>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">
            ${(c.addons || []).filter(a => a.on).length ? c.addons.filter(a => a.on).map((a, i) => `
            <div style="display:flex;gap:12px;align-items:center;padding:11px 14px;border-radius:14px;background:rgba(4,16,26,.6);border:1px solid rgba(120,180,200,.12)">
              <div style="flex:1"><b style="color:#eafcff;font-size:13px">${a.n}</b></div>
              <span style="color:${AC()};font:700 13px 'JetBrains Mono'">${a.p}</span>
              ${(c.reqs || []).some(q => q.n === a.n) ? `<span class="chip ok">REQUESTED ✓</span>`
                : `<button class="btn ghost sm" data-req="${a.n.replace(/"/g, "")}">REQUEST</button>`}
            </div>`).join("") : `<span class="chip off">NEW OFFERINGS APPEAR HERE</span>`}
          </div>
          <p class="cs" style="margin-top:12px">Something you want that isn't listed? Use the direct line below — future projects start as conversations.</p>
        </div>
      </div>

      <div class="card reveal chatcard" style="margin-top:13px;padding:0">
        <div style="display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:1px solid rgba(120,180,200,.12)">
          <span class="aidot" style="background:${AC()}"></span>
          <div><div style="font:800 13px Unbounded;color:#eafcff">DIRECT LINE</div>
            <div class="mono" style="font-size:10px;letter-spacing:.2em;color:var(--dim)">YOU × OFFSHORE STUDIOS · SUPPORT · IDEAS · FUTURE PROJECTS</div></div>
          <span class="chip ok" style="margin-left:auto">WE REPLY FAST</span>
        </div>
        <div class="chatlog" id="agLog" style="max-height:260px">
          ${(c.msgs || []).map(m => `<div class="msg ${m.from === "client" ? "me" : "ai"}"><div><b style="font-size:10px;letter-spacing:.12em;color:${m.from === "client" ? AC() : "var(--aqua)"}">${m.from === "client" ? "YOU" : "OFFSHORE STUDIOS"}</b><br>${m.t}</div></div>`).join("")
          || `<div class="msg ai"><div>Welcome to your direct line. Questions, change requests, new ideas, future projects — drop them here and the team picks them up.</div></div>`}
        </div>
        <div class="chatbar"><input class="fin" id="agIn" placeholder="message the team…"><button class="btn" id="agSend">SEND</button></div>
      </div>`;

      el.querySelectorAll("[data-req]").forEach(b => b.onclick = () => {
        upd(r => ({ ...r, reqs: [...(r.reqs || []), { n: b.dataset.req, when: Date.now(), seen: false }] }));
        render();
      });
      const send = () => {
        const t = el.querySelector("#agIn").value.trim(); if (!t) return;
        upd(r => ({ ...r, msgs: [...(r.msgs || []), { from: "client", t, when: Date.now(), seen: false }] }));
        render();
      };
      el.querySelector("#agSend").onclick = send;
      el.querySelector("#agIn").addEventListener("keydown", e => { if (e.key === "Enter") send(); });
      const lg = el.querySelector("#agLog"); lg.scrollTop = lg.scrollHeight;
    };
    render();
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
