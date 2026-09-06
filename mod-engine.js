/* ═══════════ MODULE · LIVE ENGINE FEED ═══════════
   What the bot is doing right now. Reads the engine's heartbeat through the
   relay (the engine reports every minute: mode, rung, equity, risk, regime,
   open positions, last trades, feed health). The owner gets the one true
   control: HALT. Everyone else watches.

   HONESTY: if the engine has never reported, this page says so. It never
   shows a fake heartbeat, a sample position, or a placeholder equity. */
OS.register({
  id: "engine",
  _timers: [],
  mount(el, user) {
    const isOwner = user.role === "admin" && /riley/i.test(user.email || "");
    let data = null, err = null, halting = false;

    const ago = iso => { if (!iso) return "never"; const s = Math.max(0, (Date.now() - new Date(iso)) / 1000);
      return s < 90 ? Math.round(s) + "s ago" : s < 5400 ? Math.round(s / 60) + "m ago" : Math.round(s / 3600) + "h ago"; };
    const money = n => (n < 0 ? "-" : "") + "$" + Math.abs(+n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

    const nextWindow = () => {
      const n = OS.nyNow(); const wk = !["Sat", "Sun"].includes(n.wd); const t = n.dec;
      const hm = x => `${Math.floor(x)}h ${Math.round((x % 1) * 60)}m`;
      if (wk && t >= 9.5 && t < 11.5) return { on: true, label: "NY AM · entries open until 11:30" };
      if (wk && t >= 13.5 && t < 15.0) return { on: true, label: "NY PM · entries open until 15:00" };
      if (wk && t < 9.5) return { on: false, label: "NY AM opens in " + hm(9.5 - t) };
      if (wk && t < 13.5) return { on: false, label: "NY PM opens in " + hm(13.5 - t) };
      return { on: false, label: "next window · Monday 09:30 NY" };
    };

    async function load() {
      const r = await OS.cloud.call("engine", { op: "read" });
      if (!r) { err = "sign in to view the engine"; data = null; return; }
      if (r.error) { err = r.error === "not found" ? "engine link not deployed on the relay yet" : r.error; data = null; return; }
      err = null; data = r;
    }

    async function setHalt(on) {
      if (!isOwner || halting) return;
      if (on && !confirm("HALT the engine? It stops taking new entries within one minute and flattens at the broker when live.")) return;
      halting = true; paint();
      const r = await OS.cloud.call("engine", { op: "halt", on });
      halting = false;
      if (!r || r.error) alert(r && r.error ? r.error : "could not reach the relay");
      await load(); paint();
    }

    const paint = () => {
      const s = data && data.state; const halt = !!(data && data.halt);
      const alive = s && s.reported && (Date.now() - new Date(s.reported)) < 3 * 60 * 1000;
      const w = nextWindow();
      const stat = (k, v, tone) => `<div style="flex:1;min-width:120px"><div class="mono" style="font-size:9px;letter-spacing:.18em;color:var(--dim)">${k}</div>
        <div style="font:700 20px 'Space Grotesk',sans-serif;color:${tone || "#eafcff"};margin-top:3px">${v}</div></div>`;
      const dd = s ? (1 - s.equity / Math.max(s.peak, 1)) * 100 : null;

      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Live Engine</div>
        <h2>The mind,<br><span class="grad">right now.</span></h2>
        <p class="sub">The engine reports every minute: which rung it is on, how much it is risking, what it holds, and whether its edge is showing up. This page shows exactly that and nothing else.</p>
        <span class="chip ${alive ? "ok" : "off"}">${alive ? "ENGINE LIVE · heartbeat " + ago(s.reported) : s ? "ENGINE SILENT · last heartbeat " + ago(s.reported) : "ENGINE NOT CONNECTED"}</span>
        ${halt ? `<span class="chip warn" style="margin-left:8px">HALTED</span>` : ""}
        ${err ? `<span class="chip off" style="margin-left:8px">${err}</span>` : ""}
      </div>

      <div class="cards reveal" style="grid-template-columns:1.2fr .8fr">
        <div class="card">
          <h3 style="margin:0 0 12px">Account<span class="grad">.</span></h3>
          <div style="display:flex;flex-wrap:wrap;gap:18px">
            ${stat("EQUITY", s ? money(s.equity) : "—")}
            ${stat("PEAK", s ? money(s.peak) : "—")}
            ${stat("DRAWDOWN", s ? dd.toFixed(1) + "%" : "—", s && dd > 15 ? "#ff8fa3" : null)}
            ${stat("RUNG", s ? s.rung : "—", "#a98bff")}
            ${stat("MODE", s ? String(s.mode).toUpperCase() : "—")}
            ${stat("REGIME", s ? (s.regime === "defend" ? "DEFEND" : "NORMAL") : "—", s && s.regime === "defend" ? "#ffc46b" : "#6ef2c0")}
          </div>
          <p class="cs" style="margin:14px 0 0">${s ? `Risk per trade right now — ${Object.entries(s.risk_pct || {}).map(([l, p]) => `${l} ${p}%`).join(" · ")} (${s.profile} profile). Trades booked: ${s.trades_total}.`
            : "Nothing to show until the engine has reported at least once. No sample numbers, on purpose."}</p>
        </div>

        <div class="card">
          <h3 style="margin:0 0 12px">Session clock</h3>
          <div class="mono" style="font-size:11px;letter-spacing:.16em;color:${w.on ? "#00e8d0" : "var(--dim)"}">${w.on ? "● HUNTING" : "○ STANDING BY"}</div>
          <div style="font:700 16px 'Space Grotesk',sans-serif;color:#eafcff;margin-top:6px">${w.label}</div>
          <p class="cs" style="margin:10px 0 0">NY time ${s && s.ny_time ? s.ny_time + " (engine clock)" : "—"} · feeds ${s ? (s.feeds_ok ? "healthy" : "STALE — no new entries") : "—"}</p>
          ${isOwner ? `<div style="margin-top:16px">
            <button class="btn ${halt ? "" : "danger"}" id="egHalt" ${halting ? "disabled" : ""}>${halting ? "…" : halt ? "RESUME ENGINE" : "⛔ HALT ENGINE"}</button>
            <p class="cs" style="margin:8px 0 0;font-size:11px">Owner only. Halt = no new entries within a minute, flatten at the broker when live. The engine reads this flag every cycle.</p>
          </div>` : ""}
        </div>
      </div>

      <div class="cards reveal" style="grid-template-columns:.8fr 1.2fr">
        <div class="card">
          <h3>Open positions</h3>
          ${s && s.open && s.open.length ? s.open.map(p => `<div style="border-left:2px solid #a98bff;padding-left:12px;margin:10px 0">
              <b style="color:#eafcff">${p.leg} · ${p.dir}</b><div class="cs">entry ${p.entry} · stop ${p.stop} · target ${p.target ?? "session close"} · score ${p.score}</div></div>`).join("")
            : `<p class="cs">${s ? "Flat. No open position." : "—"}</p>`}
        </div>
        <div class="card">
          <h3>Last trades</h3>
          ${s && s.last_trades && s.last_trades.length ? `<table style="width:100%;border-collapse:collapse;font-size:12px">
            <tr style="color:var(--dim);font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-align:left"><th style="padding:6px 0">WHEN</th><th>LEG</th><th>SIDE</th><th>EXIT</th><th>R</th><th>P&L</th></tr>
            ${s.last_trades.slice().reverse().map(t => `<tr style="border-top:1px solid rgba(120,180,200,.12)">
              <td style="padding:7px 0;color:var(--mut)">${t.date} ${String(t.time).slice(0, 5)}</td><td>${t.leg}</td>
              <td style="color:${t.dir === "LONG" ? "#6ef2c0" : "#ff8fa3"}">${t.dir}</td><td style="color:var(--mut)">${t.reason}</td>
              <td>${(+t.r).toFixed(2)}</td><td style="color:${t.pnl >= 0 ? "#6ef2c0" : "#ff8fa3"};font-weight:700">${money(t.pnl)}</td></tr>`).join("")}
          </table>` : `<p class="cs">${s ? "No trades booked yet." : "—"}</p>`}
        </div>
      </div>`;
      const hb = el.querySelector("#egHalt"); if (hb) hb.onclick = () => setHalt(!halt);
    };

    paint(); load().then(paint);
    this._timers.push(setInterval(() => { if (!document.hidden && document.contains(el)) load().then(paint); }, 15000));
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
