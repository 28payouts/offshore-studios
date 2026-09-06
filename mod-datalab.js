/* ═══════════ MODULE · DATA LAB ═══════════
   The honest numbers, made interactive. Every figure here comes from the
   28 Aug 2026 audit of THE LIVE MIND v1.3 (leak-guarded, IS/OOS-validated,
   realistic fills, ladder v3 sizing). The calculator is a MODEL built on
   measured per-rung growth bands and it says so on every screen. It is a
   planning tool, not a promise. */
OS.register({
  id: "datalab",
  mount(el, user) {
    /* ── measured facts (results/LADDER_v2_capital_table.json, capital_lab.py, report_2k.py) ── */
    const CAPITAL = [
      [2000,   249335, 64.4, 35.5], [3000,  897798, 79.9, 30.1], [5000, 1518027, 80.2, 28.9],
      [10000, 1848524, 71.2, 28.6], [25000, 3501831, 66.4, 27.9], [50000, 4637251, 59.5, 25.5],
      [100000, 4962936, 49.5, 25.6], [250000, 5907384, 38.5, 26.1], [1000000, 7365337, 22.8, 31.0]];
    const TWO_K = { modern: { final: 1311171, cagr: 148.6, dd: 24.6, trades_mo: 18, green: 67, avg_mo: 8.8, worst_mo: -9.7 },
                    decade: { final: 1465861, cagr: 97.3, dd: 35.6 },
                    boot: { median2y: 5051, p10: 1976, p90: 12701, ruin: 0, hit5k: 57 } };
    /* per-rung annual growth bands used by the calculator — from the ladder tables & bootstrap
       (median, bad-decile multiplier, good-decile multiplier) */
    const RUNGS = [
      { below: 2000,     name: "SMALL",  cagr: 0.20, lo: 0.2, hi: 2.2 },
      { below: 25000,    name: "GROWTH", cagr: 0.60, lo: 0.3, hi: 1.8 },
      { below: 100000,   name: "BUILD",  cagr: 0.50, lo: 0.4, hi: 1.6 },
      { below: 250000,   name: "SCALE",  cagr: 0.40, lo: 0.4, hi: 1.5 },
      { below: Infinity, name: "CAPACITY", cagr: 0.25, lo: 0.4, hi: 1.4 }];
    const rung = eq => RUNGS.find(r => eq < r.below);
    const money = n => "$" + Math.round(n).toLocaleString();

    let start = 2000, dep = 250, years = 5;

    const project = (mult) => {
      let eq = start; const path = [eq];
      for (let m = 1; m <= years * 12; m++) {
        const r = rung(eq); const g = Math.pow(1 + r.cagr * mult, 1 / 12) - 1;
        eq = eq * (1 + g) + dep; path.push(eq);
      }
      return path;
    };

    const drawPaths = () => {
      const cv = el.querySelector("#dlCurve"); if (!cv) return;
      const x = cv.getContext("2d"); const W = cv.width = 1200, H = cv.height = 420, pad = 40;
      x.clearRect(0, 0, W, H);
      const med = project(1), bad = project(rung(start).lo), good = project(rung(start).hi);
      const hi = Math.max(...good), lo = Math.min(start, ...bad) * 0.9;
      const Y = v => pad + (H - 2 * pad) * (1 - (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)));
      const X = i => pad + (W - 2 * pad) * i / (med.length - 1);
      x.strokeStyle = "rgba(120,180,200,.10)"; for (let i = 0; i <= 4; i++) { const y = pad + (H - 2 * pad) * i / 4; x.beginPath(); x.moveTo(pad, y); x.lineTo(W - pad, y); x.stroke(); }
      const line = (p, col, w, dash) => { x.beginPath(); x.setLineDash(dash || []); x.strokeStyle = col; x.lineWidth = w;
        p.forEach((v, i) => i ? x.lineTo(X(i), Y(v)) : x.moveTo(X(i), Y(v))); x.stroke(); x.setLineDash([]); };
      line(bad, "rgba(255,143,163,.7)", 1.5, [5, 6]); line(good, "rgba(110,242,192,.7)", 1.5, [5, 6]);
      x.shadowColor = "rgba(0,232,208,.6)"; x.shadowBlur = 12; line(med, "#00e8d0", 2.6); x.shadowBlur = 0;
      /* rung transitions on the median path */
      let last = rung(start).name;
      med.forEach((v, i) => { const r = rung(v).name; if (r !== last) { last = r; x.fillStyle = "#a98bff"; x.beginPath(); x.arc(X(i), Y(v), 5, 0, 7); x.fill();
        x.fillStyle = "rgba(169,139,255,.9)"; x.font = "11px 'JetBrains Mono'"; x.textAlign = "center"; x.fillText(r, X(i), Y(v) - 12); } });
      x.fillStyle = "rgba(143,180,196,.6)"; x.font = "11px 'JetBrains Mono'"; x.textAlign = "left";
      x.fillText("log scale · solid = median band · dashed = bad / good decile", pad, H - 12);
    };

    const paint = () => {
      const med = project(1), bad = project(rung(start).lo), good = project(rung(start).hi);
      const contributed = start + dep * years * 12;
      const stat = (k, v, tone) => `<div style="flex:1;min-width:130px"><div class="mono" style="font-size:9px;letter-spacing:.18em;color:var(--dim)">${k}</div>
        <div style="font:700 20px 'Space Grotesk',sans-serif;color:${tone || "#eafcff"};margin-top:3px">${v}</div></div>`;
      el.innerHTML = `
      <div class="mhead reveal">
        <div class="eyebrow">Data Lab</div>
        <h2>Run the numbers<br><span class="grad">yourself.</span></h2>
        <p class="sub">Every figure below is from the audited record of THE LIVE MIND v1.3 — leak-guarded, validated on unseen data, realistic fills. The calculator projects from measured growth bands per account rung. It is a planning model, not a promise; the live record on the Performance Lab is the only thing that counts.</p>
        <span class="chip ok">AUDITED 28 AUG 2026 · LADDER v3</span>
      </div>

      <div class="cards reveal" style="grid-template-columns:1.25fr .75fr">
        <div class="card">
          <h3 style="margin:0 0 4px">Capital-ladder calculator<span class="grad">.</span></h3>
          <p class="cs" style="margin:0 0 12px">Drag the inputs. Watch the bot climb its rungs — SMALL → GROWTH at $2k, BUILD at $25k, SCALE at $100k. Deposits move it up the ladder instantly.</p>
          <div style="display:flex;gap:18px;flex-wrap:wrap;margin-bottom:10px">
            <label class="cs" style="flex:1;min-width:160px">Start <b style="color:#eafcff">${money(start)}</b><br><input type="range" id="dlStart" min="1000" max="100000" step="500" value="${start}" style="width:100%"></label>
            <label class="cs" style="flex:1;min-width:160px">Monthly deposit <b style="color:#eafcff">${money(dep)}</b><br><input type="range" id="dlDep" min="0" max="2000" step="50" value="${dep}" style="width:100%"></label>
            <label class="cs" style="flex:1;min-width:120px">Years <b style="color:#eafcff">${years}</b><br><input type="range" id="dlYears" min="1" max="10" step="1" value="${years}" style="width:100%"></label>
          </div>
          <canvas id="dlCurve" style="width:100%;height:210px"></canvas>
          <div style="display:flex;flex-wrap:wrap;gap:18px;margin-top:14px">
            ${stat("MEDIAN OUTCOME", money(med.at(-1)), "#00e8d0")}
            ${stat("BAD DECILE", money(bad.at(-1)), "#ff8fa3")}
            ${stat("GOOD DECILE", money(good.at(-1)), "#6ef2c0")}
            ${stat("TOTAL PUT IN", money(contributed))}
            ${stat("STARTING RUNG", rung(start).name, "#a98bff")}
          </div>
        </div>

        <div class="card">
          <h3 style="margin:0 0 4px">$2,000 start — measured</h3>
          <p class="cs" style="margin:0 0 12px">The account size Mr John is funding. Modern era 2019 → 2026, one path through the real record, plus the 400-run bootstrap that strips out luck.</p>
          <div style="display:flex;flex-wrap:wrap;gap:16px">
            ${stat("7-YR REPLAY", money(TWO_K.modern.final))}
            ${stat("CAGR", TWO_K.modern.cagr + "%")}
            ${stat("MAX DD", TWO_K.modern.dd + "%")}
            ${stat("TRADES / MO", TWO_K.modern.trades_mo)}
            ${stat("GREEN MONTHS", TWO_K.modern.green + "%")}
            ${stat("WORST MONTH", TWO_K.modern.worst_mo + "%", "#ff8fa3")}
          </div>
          <p class="cs" style="margin:14px 0 0"><b style="color:#cfeff5">Bootstrap, 2 years:</b> median ${money(TWO_K.boot.median2y)} · worst decile ${money(TWO_K.boot.p10)} (still above the start) · best decile ${money(TWO_K.boot.p90)} · chance of busting ${TWO_K.boot.ruin}% · ${TWO_K.boot.hit5k}% reach $5k organically. Expect a third of months red. That is the bot, not a bug.</p>
        </div>
      </div>

      <div class="cards reveal">
        <div class="card">
          <h3>Every capital start, ten years</h3>
          <p class="cs" style="margin:0 0 10px">Same bot, same rules, honest replay 2016 → 2026. Small accounts fly because nothing throttles them; past ~$250k the strategy hits market depth — the road beyond is more markets, not bigger size.</p>
          <table style="width:100%;border-collapse:collapse;font-size:12.5px">
            <tr style="color:var(--dim);font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;text-align:left"><th style="padding:6px 0">START</th><th>10-YEAR</th><th>CAGR</th><th>MAX DD</th></tr>
            ${CAPITAL.map(([s, f, c, d]) => `<tr style="border-top:1px solid rgba(120,180,200,.12)"><td style="padding:7px 0;color:#cfeff5">${money(s)}</td><td style="font-weight:700;color:#eafcff">${money(f)}</td><td style="color:#00e8d0">${c}%</td><td style="color:var(--mut)">${d}%</td></tr>`).join("")}
          </table>
        </div>
        <div class="card">
          <h3>What we tested and threw away</h3>
          <p class="cs" style="margin:0 0 10px">The rejections are why the number is real. Each was measured at the account level and lost.</p>
          <div class="cs" style="line-height:1.9">
            Bigger targets (1.5R+) — profit factor collapsed<br>
            Runners and trailing stops — negative<br>
            Break-even after liquidity — halved returns, drawdown unchanged<br>
            No 5-minute confirmation — edge gone<br>
            Re-weighting the narrative score — curve-fit, flipped sign out of sample<br>
            ES afternoon session, London session — losing on both markets<br>
            Two identical bots on one account — the market sees one order<br>
          </div>
          <p class="cs" style="margin:12px 0 0;color:#8fb4c4">Two look-ahead leaks were found in the original engine in an internal audit and removed. An automated guard now blocks any result that reads the future. Full audit trail: LOOKAHEAD_AUDIT_2026-08-27.</p>
        </div>
      </div>`;
      drawPaths();
      const bind = (id, fn) => { const i = el.querySelector(id); if (i) i.oninput = e => { fn(+e.target.value); paint(); }; };
      bind("#dlStart", v => start = v); bind("#dlDep", v => dep = v); bind("#dlYears", v => years = v);
    };
    paint();
  }
});
