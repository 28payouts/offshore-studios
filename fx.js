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
    #grainfx{position:fixed;inset:0;z-index:110;pointer-events:none;opacity:.055;mix-blend-mode:overlay}
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
  }, 120);

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

  /* ── pro libraries from CDN: GSAP + Lenis butter scroll ── */
  const load = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  load("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js");
  load("https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js").then(() => {
    try {
      if (window.Lenis) {
        const lenis = new Lenis({ lerp: .09, wheelMultiplier: 1.05 });
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }
    } catch (e) { /* native scroll is fine */ }
  });

  /* ── Higgsfield skybox hook: set window.OS_SKYBOX (or hardcode) to a hosted
        cinematic nebula and the whole app wears it behind the particle field ── */
  const applySky = url => {
    const app = document.getElementById("app"); if (!app || !url) return;
    const img = new Image();
    img.onload = () => {
      app.style.background = `linear-gradient(rgba(1,7,13,.72),rgba(1,7,13,.86)), url("${url}") center/cover fixed no-repeat`;
    };
    img.src = url;
  };
  window.OS_setSkybox = applySky;
  /* Higgsfield-generated cinematic nebula (real AI art, hosted on their CDN) */
  window.OS_SKYBOX = window.OS_SKYBOX || "https://d8j0ntlcm91z4.cloudfront.net/user_3H4SzmK3yfFv5j6nbvNOM3d88rq/hf_20260809_151529_04d4ca59-bab1-490f-bd5b-c90de4408294.png";
  const trySky = () => { if (document.getElementById("app") && !document.getElementById("app").hidden) applySky(window.OS_SKYBOX); else setTimeout(trySky, 1500); };
  trySky();
})();
