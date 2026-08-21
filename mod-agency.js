/* ═══════════ MODULE · STUDIOS AGENCY ═══════════
   Admin sees the agency's operating picture; agency clients will see THEIR
   project, bills and results here (client portal wiring is next). */
OS.register({
  id: "agency",
  mount(el, user) {
    const L = window.OS_CONFIG.LINKS;
    const admin = user.role === "admin";
    /* REAL data only: the book of work is whatever has actually been onboarded */
    const BOOK = OS.store.get("clients", []).filter(c => c.role === "agency");
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Studios Agency · ${admin ? "operations" : user.name}</div>
      <h2>${admin ? "The agency, at a glance." : "Your project with <span class='grad'>Offshore Studios</span>."}</h2>
      <p class="sub">${admin ? "Sites, clients, automations and billing — the business side of Offshore, in one view. Client portal accounts plug in here next." : "Your project status, deliverables and billing — live, in one place."}</p>
    </div>
    ${admin ? `
    <div class="cards">
      <div class="card reveal"><div class="stat"><div class="k">Agency site</div><div class="v aq">LIVE</div>
        <div class="s">three.js · GSAP · Netlify</div></div>
        <div style="margin-top:12px"><a class="btn ghost" href="${L.agencySite}" target="_blank">OPEN SITE ↗</a></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Active clients</div><div class="v">${BOOK.length}</div>
        <div class="s">${BOOK.length ? "onboarded · real" : "real count — onboard in ❖ Clients"}</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Pipeline</div><div class="v" style="color:var(--dim)">—</div>
        <div class="s">connects when billing goes live · no fake numbers</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">AI automations</div><div class="v" style="color:var(--dim)">—</div>
        <div class="s">first deployed automation reports in here</div></div></div>
    </div>` : `
    <div class="cards">
      <div class="card reveal"><div class="stat"><div class="k">Your team</div><div class="v aq">ON IT</div>
        <div class="s">Offshore Studios · design + build + AI</div></div>
        <div style="margin-top:12px"><a class="btn ghost" href="${L.agencySite}" target="_blank">SEE OUR WORK ↗</a></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Direct line</div><div class="v">24h</div>
        <div class="s">response time, always</div></div></div>
    </div>`}
    ${admin ? `
    <div class="mhead reveal" style="margin-top:30px"><div class="eyebrow">Clients</div>
      <h2 style="font-size:1.3rem">Book of work <span class="chip ok" style="vertical-align:middle">REAL</span></h2></div>
    <div class="cards">
      ${BOOK.length ? BOOK.map(c => `<div class="card reveal"><h3>${c.name}</h3><p class="cs">${c.note || c.welcome || "project underway"}</p>
        <span class="chip ok">ACTIVE</span>
        <span class="chip">${c.bill || "billing not set"}</span></div>`).join("")
      : `<div class="card reveal"><h3>Empty on purpose</h3>
        <p class="cs">No fake clients here. The moment you onboard a real one in ❖ Clients,
        their world ignites in the universe and their project lands in this book.</p>
        <span class="chip off">AWAITING FIRST CLIENT</span></div>`}
    </div>` : `
    <div class="mhead reveal" style="margin-top:30px"><div class="eyebrow">Your project</div>
      <h2 style="font-size:1.3rem">${user.welcome || "Status & billing"}</h2></div>
    <div class="cards">
      <div class="card reveal"><h3>Current phase</h3><p class="cs">${user.note || "design → build → launch"}</p>
        <span class="chip ok">IN BUILD</span><span class="chip">next review: this week</span></div>
      <div class="card reveal"><h3>Next bill</h3><p class="cs">transparent, no surprises</p>
        <div class="stat"><div class="v">${(user.bill || "—").split("·")[0].trim()}</div><div class="s">${(user.bill || "").split("·").slice(1).join("·").trim() || "set at onboarding"}</div></div></div>
    </div>`}`;
  }
});
