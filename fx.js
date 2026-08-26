/* ═══════════ OFFSHORE FX — the film layer ═══════════
   What separates a site from a piece: grain, a living cursor, depth on
   everything you touch, and butter scroll. Self-contained — injects its own
   styles, degrades gracefully if a CDN is slow. */
(function () {
  /* ── styles ── */
  const st = document.createElement("style");
  st.textContent = `
    body{cursor:none}
    input,textarea,select{cursor:text}
    #fxdot{position:fixed;top:0;left:0;width:8px;height:8px;border-radius:50%;z-index:120;
      background:#eafcff;box-shadow:0 0 12px rgba(0,232,208,.9);pointer-events:none;
      transform:translate(-50%,-50%);transition:width .2s,height .2s,background .2s}
    #fxring{position:fixed;top:0;left:0;width:34px;height:34px;border-radius:50%;z-index:119;
      border:1.5px solid rgba(0,232,208,.55);pointer-events:none;transform:translate(-50%,-50%);
      transition:width .25s,height .25s,border-color .25s,opacity .25s}
    #fxdot.hot{width:14px;height:14px;background:#00e8d0}
    #fxring.hot{width:56px;height:56px;border-color:rgba(169,139,255,.8)}
    #grainfx{position:fixed;inset:0;z-index:110;pointer-events:none;opacity:.04;mix-blend-mode:overlay}
    .card{transform-style:preserve-3d;will-change:transform}
    @media(pointer:coarse){#fxdot,#fxring{display:none} body{cursor:auto}}`;
  document.head.appendChild(st);

  /* ── film grain ── */
  const g = document.createElement("canvas"); g.id = "grainfx";
  document.body.appendChild(g);
  const gx = g.getContext("2d");
  const gsz = () => { g.width = innerWidth / 2; g.height = innerHeight / 2; }; gsz();
  addEventListener("resize", gsz);
  const tile = document.createElement("canvas"); tile.width = tile.height = 128;
  const tx = tile.getContext("2d");
  setInterval(() => {
    if (document.hidden) return;
    const d = tx.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 46;
    }
    tx.putImageData(d, 0, 0);
    gx.clearRect(0, 0, g.width, g.height);
    gx.fillStyle = gx.createPattern(tile, "repeat"); gx.fillRect(0, 0, g.width, g.height);
  }, 160);

  /* ── living cursor ── */
  const dot = document.createElement("div"); dot.id = "fxdot";
  const ring = document.createElement("div"); ring.id = "fxring";
  document.body.appendChild(ring); document.body.appendChild(dot);
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + "px"; dot.style.top = my + "px";
    const hot = !!e.target.closest("a,button,.card.hot,.navbtn,.qk,.swatch,.clientrow,#orbmap,.btn,input");
    dot.classList.toggle("hot", hot); ring.classList.toggle("hot", hot);
  }, { passive: true });
  (function ringLoop() {
    requestAnimationFrame(ringLoop);
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.left = rx + "px"; ring.style.top = ry + "px";
  })();

  /* ── 3D tilt on every card (event delegation survives re-renders) ── */
  document.addEventListener("pointermove", e => {
    const c = e.target.closest(".card"); if (!c) return;
    const r = c.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
    c.style.transition = "transform .08s";
  }, { passive: true });
  document.addEventListener("pointerout", e => {
    const c = e.target.closest(".card"); if (!c) return;
    c.style.transition = "transform .5s cubic-bezier(.2,.8,.2,1)"; c.style.transform = "";
  }, { passive: true });

  /* ── scroll: NATIVE. Lenis was hijacking the wheel and fighting the page —
        that was the lag and the "can't reach the bottom" feel. Gone. ── */
  const load = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  load("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");

  /* ── Higgsfield skybox hook: set window.OS_SKYBOX (or hardcode) to a hosted
        cinematic nebula and the whole app wears it behind the particle field ── */
  const applySky = url => {
    if (!url) return;
    const img = new Image();
    img.onload = () => {
      const app = document.getElementById("app");
      if (app) app.style.background = `linear-gradient(rgba(1,7,13,.72),rgba(1,7,13,.86)), url("${url}") center/cover fixed no-repeat`;
      const gate = document.getElementById("gate");
      if (gate) gate.style.background = `linear-gradient(rgba(1,7,13,.5),rgba(1,7,13,.82)), url("${url}") center/cover no-repeat`;
    };
    img.src = url;
  };
  window.OS_setSkybox = applySky;
  /* Higgsfield-generated cinematic nebula (real AI art, hosted on their CDN) */
  window.OS_SKYBOX = window.OS_SKYBOX || "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/hf_20260809_151529_04d4ca59-bab1-490f-bd5b-c90de4408294.png";
  applySky(window.OS_SKYBOX);
  const trySky = () => { const a = document.getElementById("app"); if (a && !a.hidden) applySky(window.OS_SKYBOX); else setTimeout(trySky, 1500); };
  trySky();

  /* ── UNIVERSE SELECT: guaranteed to appear ──
     boot.js faded #galsel in with a CSS keyframe. If the browser throttles
     that animation (backgrounded tab, reduced motion, slow paint) the screen
     stays at opacity 0 and clicking "Universes" looks like nothing happened.
     This kills the keyframe and drives the fade from JS instead — inline
     style always wins, so the screen can never get stuck invisible. */
  const gsFix = document.createElement("style");
  gsFix.textContent = "#galsel{animation:none!important;opacity:0;transition:opacity .5s ease}";
  document.head.appendChild(gsFix);
  const showGal = n => {
    n.style.opacity = "0";
    requestAnimationFrame(() => requestAnimationFrame(() => { n.style.opacity = "1"; }));
    setTimeout(() => { n.style.opacity = "1"; }, 400);   /* belt and braces */
  };
  const gsObs = new MutationObserver(ms => {
    ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.id === "galsel") showGal(n); }));
  });
  gsObs.observe(document.body, { childList: true });
  const existing = document.getElementById("galsel"); if (existing) showGal(existing);

  /* ── SIDEBAR: labels float ABOVE everything ──
     Cards create their own stacking contexts (3D tilt transforms), which could
     swallow the rail tooltips. Lift the rail and its labels clear of the page
     so hovering the dock always shows the full label over the content. */
  const railFix = document.createElement("style");
  railFix.textContent = `
    #rail{z-index:46}
    .navbtn .lb{z-index:220;box-shadow:0 14px 40px rgba(0,0,0,.55)}
    #rail:hover{border-color:rgba(0,232,208,.28);box-shadow:0 24px 70px rgba(0,0,0,.55),0 0 30px -12px rgba(0,232,208,.35)}

    /* ── DOCK FOCUS: hovering the sidebar dims the world behind it ── */
    #raildim{position:fixed;inset:0;z-index:44;pointer-events:none;opacity:0;
      background:radial-gradient(1200px 100% at 0% 50%,rgba(1,4,8,.28),rgba(1,4,8,.62));
      backdrop-filter:blur(3px) saturate(.82);-webkit-backdrop-filter:blur(3px) saturate(.82);
      transition:opacity .38s cubic-bezier(.2,.8,.2,1)}
    body.railhov #raildim{opacity:1}
    body.railhov #stage{transition:transform .38s cubic-bezier(.2,.8,.2,1);transform:scale(.994)}
    #stage{transition:transform .38s cubic-bezier(.2,.8,.2,1)}

    /* each item breathes on hover — icon lifts, label glides in staggered */
    .navbtn{transition:transform .28s cubic-bezier(.2,.9,.25,1),background .25s,border-color .25s}
    .navbtn:hover{transform:translateX(4px) scale(1.05)}
    .navbtn:hover .ic{transform:scale(1.18) rotate(-4deg)}
    body.railhov .navbtn .lb{opacity:1;transform:translateY(-50%) translateX(0)}
    ${[...Array(12)].map((_, i) => `body.railhov .navbtn:nth-child(${i + 1}) .lb{transition-delay:${(i * 28)}ms}`).join("\n    ")}

    /* click pulse — a ring detonates off whatever you press */
    .navbtn::after{content:"";position:absolute;inset:0;border-radius:17px;border:1.5px solid var(--aqua);
      opacity:0;transform:scale(.7);pointer-events:none}
    .navbtn:active::after{animation:navpulse .5s ease-out}
    @keyframes navpulse{0%{opacity:.9;transform:scale(.75)}100%{opacity:0;transform:scale(1.5)}}

    /* ── STAGE ARRIVAL: pages surface out of the deep, not just appear ── */
    #stage.warpin{animation:stagein .55s cubic-bezier(.16,.84,.3,1) both!important}
    @keyframes stagein{
      0%{opacity:0;transform:translateY(26px) scale(.985);filter:blur(8px) brightness(1.35)}
      60%{filter:blur(0) brightness(1.04)}
      100%{opacity:1;transform:none;filter:none}}
    .reveal{animation:cardsurface .6s cubic-bezier(.16,.84,.3,1) both}
    .cards .reveal:nth-child(2){animation-delay:.06s}
    .cards .reveal:nth-child(3){animation-delay:.12s}
    .cards .reveal:nth-child(4){animation-delay:.18s}
    .cards .reveal:nth-child(5){animation-delay:.24s}
    @keyframes cardsurface{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:none}}

    /* ── WARP BRAND OVERLAY: the wave draws itself through hyperspace ── */
    #warpbrand{position:fixed;inset:0;z-index:95;pointer-events:none;display:flex;
      flex-direction:column;align-items:center;justify-content:center;gap:18px}
    #warpbrand svg{width:min(300px,46vw);filter:drop-shadow(0 0 18px rgba(0,232,208,.65))}
    #warpbrand .wv{stroke-dasharray:240;stroke-dashoffset:240;animation:wavedraw 1.4s cubic-bezier(.4,0,.2,1) forwards}
    @keyframes wavedraw{to{stroke-dashoffset:0}}
    #warpbrand .wt{font:800 12px Unbounded,sans-serif;letter-spacing:1.2em;color:#eafcff;opacity:0;
      animation:wtin 1s .5s ease forwards;text-indent:1.2em}
    @keyframes wtin{to{opacity:.95;letter-spacing:.55em}}
    #warpvin{position:fixed;inset:0;z-index:94;pointer-events:none;
      background:radial-gradient(circle at 50% 50%,transparent 42%,rgba(1,4,10,.55) 100%)}`;
  document.head.appendChild(railFix);

  /* dim overlay element + rail hover wiring (survives rebuilds via delegation) */
  const dim = document.createElement("div"); dim.id = "raildim"; document.body.appendChild(dim);
  /* click a page → release the focus dim instantly so the app is usable;
     the dim only returns after the pointer leaves the dock and comes back */
  let dimSuppressed = false;
  document.addEventListener("mouseover", e => {
    const inRail = !!e.target.closest("#rail");
    if (!inRail) dimSuppressed = false;
    document.body.classList.toggle("railhov", inRail && !dimSuppressed);
  }, { passive: true });
  document.addEventListener("click", e => {
    if (e.target.closest("#rail")) { dimSuppressed = true; document.body.classList.remove("railhov"); }
  }, true);

  /* warp brand overlay — rides on top of boot.js's hyperspace canvas */
  const warpObs = new MutationObserver(ms => ms.forEach(m => {
    m.addedNodes.forEach(n => {
      if (n.nodeType === 1 && n.id === "warpfx" && !document.getElementById("warpbrand")) {
        const vin = document.createElement("div"); vin.id = "warpvin";
        const wb = document.createElement("div"); wb.id = "warpbrand";
        wb.innerHTML = `<svg viewBox="0 0 52 28" fill="none">
            <polyline class="wv" points="2,24 12,20 18,23 27,12 33,16 42,5 50,9"
              stroke="url(#wg)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
            <defs><linearGradient id="wg" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stop-color="#00e8d0"/><stop offset="1" stop-color="#a98bff"/>
            </linearGradient></defs></svg>
          <div class="wt">OFFSHORE</div>`;
        document.body.appendChild(vin); document.body.appendChild(wb);
      }
    });
    m.removedNodes.forEach(n => {
      if (n.nodeType === 1 && n.id === "warpfx") {
        ["warpbrand", "warpvin"].forEach(id => {
          const x = document.getElementById(id);
          if (x) { x.style.transition = "opacity .5s"; x.style.opacity = "0"; setTimeout(() => x.remove(), 520); }
        });
      }
    });
  }));
  warpObs.observe(document.body, { childList: true });
})();
