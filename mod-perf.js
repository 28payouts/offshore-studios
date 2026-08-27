/* ═══════════ MODULE · THE PERFORMANCE LAB ═══════════
   Built to be empty, and to light up the second the first fill lands.

   THE POINT
   Every panel here is wired to real data now. There is no "we'll hook it up
   later" step: the moment TradingView posts its first alert to the relay,
   the equity curve draws itself, the sim gate starts counting, the engine
   and session tables fill in. Launch day requires zero rebuilding.

   THE HONESTY LINE — this is the whole reason the module exists
   · Nothing here is simulated, sampled or filled in for effect. If there
     are no fills, every number reads "—" and the status says so plainly.
   · The verified backtest is shown as a BENCHMARK to beat, drawn dashed
     and labelled, never mixed into the live series. A backtest is a
     hypothesis. This page is the experiment.
   · P&L is computed from paired entries and exits at the real contract
     multiplier, not estimated.

   WHO SEES IT
   Riley (admin) and anyone on the trading side — Mr John included. It is
   the same record for all of them, because there is only one bot. */
OS.register({
  id: "perf",
  _timers: [],
  mount(el, user) {

    /* Contract multipliers — what one point is actually worth. Getting this
       wrong would silently misstate every dollar on the page. */
    const POINT = { MES: 5, ES: 50, MNQ: 2, NQ: 20, MYM: 0.5, YM: 5 };
    const mult = sym => {
      const s = String(sym || "").toUpperCase();
      for (const k of Object.keys(POINT).sort((a, b) => b.length - a.length)) if (s.includes(k)) return POINT[k];
      return 1;
    };

    /* The verified backtest — the benchmark, never the live series.
       VERIFIED 26 Aug 2026 against results/LIVEMIND_V6_account.csv: 4,267 trades,
       57.3% win, dollar profit factor 2.00, max drawdown 16.9%, $100k to
       $10,015,774 from 1 June 2016 — 10.01 years, CAGR 58.4%. These are correct.
       NOTE for anyone tempted to "fix" them from the raw signal file: that file
       (LIVEMIND_V6_TRUE_trades.csv) runs from 2008 and holds 6,164 signals at a
       1.66 R-multiple profit factor. That is the UNSIZED signal set, not the
       account. Different thing. The headline describes the account. */
    const BT = { start: 100000, end: 10020000, trades: 4267, win: 57.3, pf: 2.00, dd: 16.9, frozen: "27 July 2026" };
    const GATE = 60;

    let fills = null;   /* null = not loaded yet, [] = loaded and genuinely empty */
    let err = null;

    /* ── pair raw fills into closed trades ──────────────────────────────
       TradingView posts one row per order. A trade is an entry and the exit
       that flattens it. We walk the log in time order holding a position,
       and only book a result when the position actually closes. Anything
       still open at the end is shown as open, never counted as a win. */
    const pair = rows => {
      const trades = []; let pos = null;
      for (const f of rows) {
        const side = String(f.side || "").toLowerCase();
        const dir = side.includes("buy") || side.includes("long") ? 1 : side.includes("sell") || side.includes("short") ? -1 : 0;
        const px = Number(f.price), qty = Math.abs(Number(f.qty) || 1);
        if (!dir || !isFinite(px)) continue;
        if (!pos) { pos = { dir, px, qty, t: f.received, engine: f.engine || "—", symbol: f.symbol || "" }; continue; }
        if (dir === pos.dir) {   /* adding to the position — average in */
          pos.px = (pos.px * pos.qty + px * qty) / (pos.qty + qty); pos.qty += qty; continue;
        }
        const closed = Math.min(pos.qty, qty);
        trades.push({
          dir: pos.dir, entry: pos.px, exit: px, qty: closed,
          pl: (px - pos.px) * pos.dir * closed * mult(pos.symbol),
          open: pos.t, close: f.received, engine: pos.engine, symbol: pos.symbol
        });
        pos.qty -= closed;
        if (pos.qty <= 0) pos = qty > closed ? { dir, px, qty: qty - closed, t: f.received, engine: f.engine || "—", symbol: f.symbol || "" } : null;
      }
      return { trades, open: pos };
    };

    /* ── statistics, computed only from closed trades ───────────────── */
    const stats = trades => {
      if (!trades.length) return null;
      const wins = trades.filter(t => t.pl > 0), losses = trades.filter(t => t.pl <= 0);
      const gp = wins.reduce((a, t) => a + t.pl, 0), gl = Math.abs(losses.reduce((a, t) => a + t.pl, 0));
      let eq = 0, peak = 0, dd = 0, streak = 0, best = 0, worst = 0, cur = 0;
      const curve = [0];
      for (const t of trades) {
        eq += t.pl; curve.push(eq);
        peak = Math.max(peak, eq); dd = Math.max(dd, peak - eq);
        cur = t.pl > 0 ? (cur >= 0 ? cur + 1 : 1) : (cur <= 0 ? cur - 1 : -1);
        best = Math.max(best, cur); worst = Math.min(worst, cur); streak = cur;
      }
      return {
        n: trades.length, net: eq, curve,
        win: (wins.length / trades.length) * 100,
        pf: gl > 0 ? gp / gl : (gp > 0 ? Infinity : 0),
        avgWin: wins.length ? gp / wins.length : 0,
        avgLoss: losses.length ? gl / losses.length : 0,
        dd, streak, best, worst,
        bestTrade: Math.max(...trades.map(t => t.pl)),
        worstTrade: Math.min(...trades.map(t => t.pl))
      };
    };

    const money = n => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
    const nyHour = iso => { try { return +new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", hour: "2-digit", hour12: false }); } catch (e) { return -1; } };
    const SESSIONS = [["Asia", 20, 24], ["Asia", 0, 2], ["London", 2, 8], ["NY AM", 9, 12], ["NY PM", 12, 16]];
    const sessionOf = iso => { const h = nyHour(iso); if (h < 0) return "—"; for (const [n, a, b] of SESSIONS) if (h >= a && h < b) return n; return "Off-session"; };

    /* ── load ───────────────────────────────────────────────────────── */
    async function load() {
      const res = await OS.cloud.call("fills", { limit: 5000 });
      if (!res) { err = "not connected — sign in again or the relay is unreachable"; fills = []; return; }
      if (res.error) { err = res.error === "not found" ? "the relay has no fills endpoint yet" : res.error; fills = []; return; }
      err = null; fills = res.fills || [];
    }

    /* ── the equity curve ───────────────────────────────────────────── */
    const drawCurve = (curve) => {
      const cv = el.querySelector("#pfCurve"); if (!cv) return;
      const x = cv.getContext("2d"); const W = cv.width = 1200, H = cv.height = 460;
      x.clearRect(0, 0, W, H);
      const pad = 40;
      /* grid */
      x.strokeStyle = "rgba(120,180,200,.10)"; x.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const y = pad + (H - pad * 2) * i / 4; x.beginPath(); x.moveTo(pad, y); x.lineTo(W - pad, y); x.stroke(); }
      /* zero line */
      const has = curve && curve.length > 1;
      const lo = has ? Math.min(...curve, 0) : -1, hi = has ? Math.max(...curve, 0) : 1;
      const Y = v => pad + (H - pad * 2) * (1 - (v - lo) / ((hi - lo) || 1));
      x.strokeStyle = "rgba(143,180,196,.35)"; x.setLineDash([4, 6]);
      x.beginPath(); x.moveTo(pad, Y(0)); x.lineTo(W - pad, Y(0)); x.stroke(); x.setLineDash([]);
      if (!has) {
        x.fillStyle = "rgba(143,180,196,.55)"; x.font = "600 17px 'Space Grotesk'"; x.textAlign = "center";
        x.fillText("The curve draws itself the moment the first fill lands.", W / 2, H / 2 - 8);
        x.font = "12px 'JetBrains Mono'"; x.fillStyle = "rgba(143,180,196,.35)";
        x.fillText("NOTHING IS PLOTTED HERE UNTIL IT IS REAL", W / 2, H / 2 + 20);
        return;
      }
      /* the live series */
      const gx = x.createLinearGradient(0, pad, 0, H - pad);
      gx.addColorStop(0, "rgba(0,232,208,.30)"); gx.addColorStop(1, "rgba(0,232,208,0)");
      x.beginPath(); x.moveTo(pad, Y(curve[0]));
      curve.forEach((v, i) => x.lineTo(pad + (W - pad * 2) * i / (curve.length - 1), Y(v)));
      x.lineTo(W - pad, Y(0)); x.lineTo(pad, Y(0)); x.closePath(); x.fillStyle = gx; x.fill();
      x.beginPath(); x.moveTo(pad, Y(curve[0]));
      curve.forEach((v, i) => x.lineTo(pad + (W - pad * 2) * i / (curve.length - 1), Y(v)));
      x.strokeStyle = "#00e8d0"; x.lineWidth = 2.4; x.shadowColor = "rgba(0,232,208,.6)"; x.shadowBlur = 14; x.stroke(); x.shadowBlur = 0;
    };

    /* ── the sim gate ring ──────────────────────────────────────────── */
    const drawGate = n => {
      const cv = el.querySelector("#pfGate"); if (!cv) return;
      const x = cv.getContext("2d"); const S = cv.width = cv.height = 320, c = S / 2, r = 118;
      x.clearRect(0, 0, S, S);
      x.strokeStyle = "rgba(120,180,200,.14)"; x.lineWidth = 14; x.beginPath(); x.arc(c, c, r, 0, 7); x.stroke();
      const p = Math.min(n / GATE, 1);
      if (p > 0) {
        const g = x.createLinearGradient(0, 0, S, S); g.addColorStop(0, "#00e8d0"); g.addColorStop(1, "#a98bff");
        x.strokeStyle = g; x.lineCap = "round"; x.beginPath(); x.arc(c, c, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); x.stroke();
      }
      x.fillStyle = "#eafcff"; x.textAlign = "center"; x.font = "700 52px 'Unbounded'";
      x.fillText(String(n), c, c + 10);
      x.font = "11px 'JetBrains Mono'"; x.fillStyle = "rgba(143,180,196,.85)";
      x.fillText("OF " + GATE + " VERIFIED", c, c + 38);
    };

    /* ── breakdown tables ───────────────────────────────────────────── */
    const groupTable = (trades, keyOf, label) => {
      const g = {};
      trades.forEach(t => { const k = keyOf(t) || "—"; (g[k] = g[k] || []).push(t); });
      const keys = Object.keys(g);
      if (!keys.length) return `<p class="cs" style="margin:0">No ${label.toLowerCase()} data yet — this table builds itself from the fills as they arrive.</p>`;
      return `<table style="width:100%;border-collapse:collapse;font-size:12.5px">
        <tr style="color:var(--dim);font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-align:left">
          <th style="padding:6px 0">${label.toUpperCase()}</th><th>TRADES</th><th>WIN%</th><th>NET</th></tr>
        ${keys.map(k => { const s = stats(g[k]); return `<tr style="border-top:1px solid rgba(120,180,200,.12)">
          <td style="padding:9px 0;color:#cfeff5;font-weight:600">${k}</td>
          <td>${s.n}</td><td>${s.win.toFixed(1)}%</td>
          <td style="color:${s.net >= 0 ? "#6ef2c0" : "#ff8fa3"};font-weight:700">${money(s.net)}</td></tr>`; }).join("")}
      </table>`;
    };

    /* ── paint ──────────────────────────────────────────────────────── */
    const paint = () => {
      const loading = fills === null;
      const rows = fills || [];
      const { trades, open } = pair(rows);
      const s = stats(trades);
      const liveOn = rows.length > 0;

      const stat = (label, val, tone) => `<div style="flex:1;min-width:120px">
        <div class="mono" style="font-size:9px;letter-spacing:.18em;color:var(--dim)">${label}</div>
        <div style="font:700 20px 'Space Grotesk',sans-serif;color:${tone || "#eafcff"};margin-top:3px">${val}</div></div>`;

      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Performance Lab</div>
        <h2>The experiment,<br><span class="grad">not the hypothesis.</span></h2>
        <p class="sub">Every panel below reads the live trade log. Nothing is simulated and nothing is estimated —
        if a number has not been earned yet, it reads as a dash. The verified backtest sits alongside as the benchmark to beat, never mixed in.</p>
        <span class="chip ${liveOn ? "ok" : "warn"}">${loading ? "READING THE LOG…" : liveOn ? `LIVE FEED · ${rows.length} FILLS RECORDED` : "AWAITING FIRST FILL · every panel is wired and waiting"}</span>
        ${err ? `<span class="chip off" style="margin-left:8px">${err}</span>` : ""}
      </div>

      <div class="cards reveal" style="grid-template-columns:1.35fr .65fr">
        <div class="card">
          <h3 style="margin:0 0 4px">Equity curve<span class="grad">.</span></h3>
          <p class="cs" style="margin:0 0 12px">Realised profit and loss from closed trades, at the real contract multiplier.</p>
          <canvas id="pfCurve" style="width:100%;height:230px"></canvas>
          <div style="display:flex;flex-wrap:wrap;gap:18px;margin-top:16px">
            ${stat("NET P&L", s ? money(s.net) : "—", s ? (s.net >= 0 ? "#6ef2c0" : "#ff8fa3") : null)}
            ${stat("CLOSED TRADES", s ? s.n : "—")}
            ${stat("WIN RATE", s ? s.win.toFixed(1) + "%" : "—")}
            ${stat("PROFIT FACTOR", s ? (isFinite(s.pf) ? s.pf.toFixed(2) : "∞") : "—")}
            ${stat("MAX DRAWDOWN", s ? money(s.dd) : "—")}
          </div>
        </div>

        <div class="card" style="display:flex;flex-direction:column;align-items:center">
          <h3 style="align-self:flex-start;margin:0 0 4px">The sim gate<span class="grad">.</span></h3>
          <p class="cs" style="align-self:flex-start;margin:0 0 10px">Sixty verified simulated trades before a single dollar of real capital is committed. This counter only moves on real recorded fills.</p>
          <canvas id="pfGate" style="width:100%;max-width:210px;height:210px"></canvas>
          <p class="cs" style="margin:12px 0 0;text-align:center">${s ? (s.n >= GATE ? "Gate satisfied. The decision to go live is Riley's, not the software's." : `${GATE - s.n} to go.`) : "The gate has not started. No trades have been recorded."}</p>
        </div>
      </div>

      <div class="cards reveal">
        <div class="card">
          <h3>By engine</h3>
          <p class="cs" style="margin:0 0 12px">Which of the frozen engines is actually carrying the result.</p>
          ${groupTable(trades, t => t.engine, "Engine")}
        </div>
        <div class="card">
          <h3>By session</h3>
          <p class="cs" style="margin:0 0 12px">New York clock. The model is built for the AM window — this is where that claim gets tested.</p>
          ${groupTable(trades, t => sessionOf(t.close), "Session")}
        </div>
        <div class="card">
          <h3>Trade quality</h3>
          <div style="display:flex;flex-wrap:wrap;gap:18px">
            ${stat("AVG WIN", s ? money(s.avgWin) : "—", "#6ef2c0")}
            ${stat("AVG LOSS", s ? money(s.avgLoss) : "—", "#ff8fa3")}
            ${stat("BEST TRADE", s ? money(s.bestTrade) : "—")}
            ${stat("WORST TRADE", s ? money(s.worstTrade) : "—")}
            ${stat("CURRENT STREAK", s ? (s.streak > 0 ? s.streak + " W" : s.streak < 0 ? Math.abs(s.streak) + " L" : "—") : "—")}
            ${stat("BEST RUN", s ? s.best + " W" : "—")}
          </div>
        </div>
      </div>

      <div class="cards reveal" style="grid-template-columns:1.1fr .9fr">
        <div class="card">
          <h3>The log</h3>
          <p class="cs" style="margin:0 0 12px">${open ? `One position is currently OPEN — ${open.dir > 0 ? "long" : "short"} ${open.qty} from ${open.px}. It is excluded from every statistic above until it closes.` : "Every closed trade, newest first."}</p>
          ${trades.length ? `<div style="max-height:320px;overflow:auto">
            <table style="width:100%;border-collapse:collapse;font-size:12px">
              <tr style="color:var(--dim);font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-align:left">
                <th style="padding:6px 0">CLOSED</th><th>SIDE</th><th>ENTRY</th><th>EXIT</th><th>ENGINE</th><th>P&L</th></tr>
              ${trades.slice().reverse().map(t => `<tr style="border-top:1px solid rgba(120,180,200,.12)">
                <td style="padding:8px 0;color:var(--mut)">${new Date(t.close).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td style="color:${t.dir > 0 ? "#6ef2c0" : "#ff8fa3"}">${t.dir > 0 ? "LONG" : "SHORT"}</td>
                <td>${t.entry}</td><td>${t.exit}</td><td style="color:var(--mut)">${t.engine}</td>
                <td style="color:${t.pl >= 0 ? "#6ef2c0" : "#ff8fa3"};font-weight:700">${money(t.pl)}</td></tr>`).join("")}
            </table></div>`
          : `<p class="cs">Empty by design. No invented rows, no sample data — the first line here will be a real trade.</p>`}
        </div>

        <div class="card">
          <h3>The benchmark</h3>
          <p class="cs" style="margin:0 0 12px">Verified backtest, engines frozen ${BT.frozen}. This is a <b style="color:#cfeff5">hypothesis about the future</b>, produced on historical data with no slippage and no real fills. It is the bar, not the result.</p>
          <div style="display:flex;flex-wrap:wrap;gap:18px">
            ${stat("BACKTEST", "$100k → $10.02M")}
            ${stat("TRADES", BT.trades.toLocaleString())}
            ${stat("WIN RATE", BT.win + "%")}
            ${stat("PROFIT FACTOR", BT.pf.toFixed(2))}
            ${stat("WORST DD", BT.dd + "%")}
          </div>
          <p class="cs" style="margin:14px 0 0">${s
            ? `Live so far: ${s.win.toFixed(1)}% win rate against ${BT.win}% expected, profit factor ${isFinite(s.pf) ? s.pf.toFixed(2) : "∞"} against ${BT.pf.toFixed(2)}. ${s.n < 30 ? "Far too few trades to mean anything yet — treat this as noise until the sample grows." : "The sample is starting to carry weight."}`
            : "Nothing to compare yet. Comparison starts at the first closed trade and only becomes meaningful after roughly thirty."}</p>
        </div>
      </div>

      <div class="cards reveal">
        <div class="card">
          <h3>How the bot behaves</h3>
          <div class="cs" style="line-height:1.9">
            <b style="color:#cfeff5">When it trades.</b> New York morning, roughly 9:30 to 12:00. Outside that window it does nothing on purpose.<br>
            <b style="color:#cfeff5">What it needs.</b> Liquidity has to be taken first, the higher-timeframe picture has to agree, and only then does the entry trigger count. Any one of those missing means no trade.<br>
            <b style="color:#cfeff5">Risk per trade.</b> Fixed and decided before entry — the stop sits beyond the level that protected the move, never at an arbitrary distance.<br>
            <b style="color:#cfeff5">Frozen rules.</b> The engines have not changed since ${BT.frozen}. Changing them mid-test would destroy the meaning of the sample, so they stay shut until the gate closes.<br>
            <b style="color:#cfeff5">It refuses more than it takes.</b> Few, high-quality setups. Long quiet stretches are the system working, not failing.
          </div>
        </div>
        <div class="card">
          <h3>Taking money out</h3>
          <p class="cs" style="margin:0 0 10px">Written now so it is ready the day this is live. Today there is nothing to withdraw — the account is simulated.</p>
          <div class="cs" style="line-height:1.9">
            <b style="color:#cfeff5">1 · Profit is realised, not floating.</b> Only closed trades count. An open position is not money.<br>
            <b style="color:#cfeff5">2 · Leave the working capital.</b> Withdrawals come from profit above the starting balance, so the position sizing stays intact.<br>
            <b style="color:#cfeff5">3 · Request, then settle.</b> Withdrawals are actioned by hand at the broker and typically settle in one to three business days.<br>
            <b style="color:#cfeff5">4 · Tax is yours.</b> Futures profits are taxable. Keep the statements.<br>
          </div>
          <p class="cs" style="margin:12px 0 0;color:#8fb4c4">This app will never move your money for you. No button here can transfer, withdraw or trade — that always goes through you at the broker. That is deliberate.</p>
        </div>
      </div>`;

      drawCurve(s ? s.curve : null);
      drawGate(s ? Math.min(s.n, GATE) : 0);
    };

    paint();
    load().then(paint);
    /* refresh while you watch — cheap, and it makes launch day feel alive */
    this._timers.push(setInterval(() => { if (!document.hidden && document.contains(el)) load().then(paint); }, 60000));
  },
  unmount() { this._timers.forEach(clearInterval); this._timers = []; }
});
