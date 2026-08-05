/* ═══════════ MODULE · STUDIOS AGENCY ═══════════
   Admin sees the agency's operating picture; agency clients will see THEIR
   project, bills and results here (client portal wiring is next). */
OS.register({
  id: "agency",
  mount(el, user) {
    const L = window.OS_CONFIG.LINKS;
    const admin = user.role === "admin";
    const DEMO_CLIENTS = [
      { n: "Harbour Dental", s: "Site live · SEO month 2", st: "ok", bill: "$450 · due 1 Aug" },
      { n: "Northside Gym", s: "AI booking agent · building", st: "warn", bill: "$1,200 · 50% paid" },
      { n: "Cafe Marina", s: "Brand + site · proposal sent", st: "off", bill: "—" }
    ];
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
      <div class="card reveal"><div class="stat"><div class="k">Active clients</div><div class="v">3</div>
        <div class="s">demo data · portal wiring next</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Pipeline (demo)</div><div class="v pos">$4,850</div>
        <div class="s">booked + proposed this month</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">AI automations</div><div class="v bio">2</div>
        <div class="s">booking agent · content engine</div></div></div>
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
      <h2 style="font-size:1.3rem">Book of work <span class="chip warn" style="vertical-align:middle">DEMO DATA</span></h2></div>
    <div class="cards">
      ${DEMO_CLIENTS.map(c => `<div class="card reveal"><h3>${c.n}</h3><p class="cs">${c.s}</p>
        <span class="chip ${c.st}">${c.st === "ok" ? "ON TRACK" : c.st === "warn" ? "IN BUILD" : "PROSPECT"}</span>
        <span class="chip">${c.bill}</span></div>`).join("")}
    </div>` : `
    <div class="mhead reveal" style="margin-top:30px"><div class="eyebrow">Your project</div>
      <h2 style="font-size:1.3rem">${user.welcome || "Status & billing"}</h2></div>
    <div class="cards">
      <div class="card reveal"><h3>Current phase</h3><p class="cs">${user.note || "design → build → launch"}</p>
        <span class="chip ok">IN BUILD</span><span class="chip">next review: this week</span></div>
      <div class="card reveal"><h3>Next bill</h3><p class="cs">transparent, no surprises</p>
        <div class="stat"><div class="v">${(user.bill || "$450 · due 1 Aug").split("·")[0].trim()}</div><div class="s">${(user.bill || "$450 · due 1 Aug").split("·").slice(1).join("·").trim() || "on schedule"}</div></div></div>
    </div>`}`;
  }
});
