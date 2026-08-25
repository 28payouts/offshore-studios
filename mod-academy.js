/* ═══════════ MODULE · HARMONIC ACADEMY ═══════════
   Honest state: the academy is being built. No fake students, no fake courses —
   this screen fills with real content as it ships. */
OS.register({
  id: "academy",
  mount(el, user) {
    el.innerHTML = `
    <div class="mhead reveal">
      <div class="eyebrow">Harmonic Academy · ${user.name}</div>
      <h2>Teach the game.<br><span class="grad">Own the curriculum.</span></h2>
      <p class="sub">The education arm of the Harmonic universe. Nothing fake on this screen — it lights up as the academy actually ships.</p>
    </div>
    <div class="cards">
      <div class="card reveal"><div class="stat"><div class="k">Curriculum</div><div class="v wc">IN BUILD</div>
        <div class="s">structure being written now</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Platform</div><div class="v" style="color:var(--dim)">—</div>
        <div class="s">not launched · lands here when live</div></div></div>
      <div class="card reveal"><div class="stat"><div class="k">Students</div><div class="v" style="color:var(--dim)">—</div>
        <div class="s">real count only · no fake numbers</div></div></div>
    </div>
    <div class="cards" style="margin-top:13px;grid-template-columns:1fr 1fr">
      <div class="card reveal">
        <h3>What lands here</h3><p class="cs">the academy roadmap</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2.2;margin-top:4px">
          <span class="chip warn">BUILD</span> curriculum + course structure<br>
          <span class="chip off">THEN</span> content production (video · docs)<br>
          <span class="chip off">THEN</span> platform + student portal in this OS<br>
          <span class="chip off">THEN</span> enrollment, billing &amp; live cohorts
        </div>
      </div>
      <div class="card reveal">
        <h3>Why it matters</h3><p class="cs">the flywheel</p>
        <div style="font-size:12.5px;color:var(--mut);line-height:2;margin-top:4px">
          The Live Mind proves the method → the Academy teaches it →
          students become clients of the whole Offshore world. One story,
          told honestly, across both universes.
        </div>
      </div>
    </div>`;
  }
});
