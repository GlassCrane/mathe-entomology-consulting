/* =========================================================
   Mathe Entomology Consulting LLC — interactions
   GSAP 3 + ScrollTrigger
   ========================================================= */

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- footer year ---------- */
document.querySelectorAll("[data-year]").forEach(el => {
  el.textContent = new Date().getFullYear();
});

/* ---------- nav scroll state ---------- */
const nav = document.querySelector(".nav");
ScrollTrigger.create({
  start: 40,
  onUpdate: self => nav.classList.toggle("is-scrolled", self.scroll() > 40),
  onEnter: () => nav.classList.add("is-scrolled"),
  onLeaveBack: () => nav.classList.remove("is-scrolled")
});

if (!reduceMotion) {

  /* ---------- scroll progress bar ---------- */
  gsap.to(".progress-bar", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.4 }
  });

  /* ---------- hero intro ---------- */
  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".nav", { y: -30, autoAlpha: 0, duration: 0.8 })
    .from(".hero-title .line-inner", {
      yPercent: 115,
      duration: 1.1,
      stagger: 0.12,
      ease: "power4.out"
    }, 0.15)
    .from("[data-hero-fade]", {
      y: 26,
      autoAlpha: 0,
      duration: 0.9,
      stagger: 0.1
    }, 0.55)
    .from("[data-hero-plate]", {
      y: 60,
      autoAlpha: 0,
      duration: 1.2,
      ease: "power3.out"
    }, 0.5)
    .from(".scroll-cue", { autoAlpha: 0, duration: 0.8 }, 1.1);

  /* ---------- parallax images ---------- */
  document.querySelectorAll("[data-parallax]").forEach(img => {
    const amount = parseFloat(img.dataset.parallax) || 12;
    gsap.fromTo(img,
      { yPercent: -amount / 2 },
      {
        yPercent: amount / 2,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest("figure") || img,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
  });

  /* ---------- marquee drift ---------- */
  gsap.to(".marquee-track", {
    xPercent: -25,
    ease: "none",
    scrollTrigger: {
      trigger: ".marquee",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.6
    }
  });

  /* ---------- generic reveals ---------- */
  document.querySelectorAll("[data-reveal]").forEach(el => {
    gsap.from(el, {
      y: 34,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  /* ---------- positioning statement: word-by-word ---------- */
  const statement = document.querySelector("[data-statement]");
  if (statement) {
    const words = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = words
      .map(w => `<span class="w">${w}</span>`)
      .join(" ");
    gsap.to(statement.querySelectorAll(".w"), {
      opacity: 1,
      stagger: 0.02,
      ease: "none",
      scrollTrigger: {
        trigger: statement,
        start: "top 78%",
        end: "bottom 45%",
        scrub: 0.5
      }
    });
  }

  /* ---------- stat counter ---------- */
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => { el.textContent = Math.round(obj.v); },
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ---------- service rows ---------- */
  document.querySelectorAll("[data-service]").forEach(row => {
    gsap.from(row, {
      autoAlpha: 0,
      y: 28,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 88%" }
    });
  });

  /* ---------- pinned horizontal specimen rail (desktop) ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 981px)", () => {
    const rail = document.querySelector("[data-rail]");
    const pin = document.querySelector(".specimens-pin");
    if (!rail || !pin) return;

    const distance = () => rail.scrollWidth - window.innerWidth;

    gsap.to(rail, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: ".specimens",
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });
  });

} else {
  /* reduced motion: make sure the statement text is fully visible */
  document.querySelectorAll(".statement-text .w").forEach(w => w.style.opacity = 1);
  const st = document.querySelector("[data-statement]");
  if (st) st.style.opacity = 1;
}

/* =========================================================
   Ant cursor trail — six ants pacing behind the pointer.
   Desktop pointers only; skipped for reduced motion.
   ========================================================= */
(function antTrail() {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (!finePointer || reduceMotion) return;

  const ANT_COUNT = 6;
  const SPACING = 34;        // gap each ant keeps from the one ahead
  const MOUSE_GAP = 70;      // lead ant hangs back from the cursor
  const STOP_ZONE = 4;       // close enough = stop walking

  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:150;overflow:hidden;";
  document.body.appendChild(layer);

  /* A small, tidy top-down ant: head / thorax / gaster,
     antennae, and three leg pairs that swing while walking. */
  function antSVG(scale, opacity) {
    const el = document.createElement("div");
    el.style.cssText =
      "position:absolute;top:0;left:0;will-change:transform;" +
      `width:${26 * scale}px;height:${26 * scale}px;opacity:${opacity};`;
    el.innerHTML = `
      <svg viewBox="0 0 26 26" width="100%" height="100%" style="overflow:visible">
        <g class="ant-body" fill="#241f18" stroke="#241f18">
          <!-- legs -->
          <g class="legs" stroke-width="1.1" fill="none" stroke-linecap="round">
            <g class="leg-set a">
              <path d="M11 10 L4.5 5.5"/>
              <path d="M12.5 13 L3.5 13"/>
              <path d="M11 16 L4.5 20.5"/>
            </g>
            <g class="leg-set b">
              <path d="M15 10 L21.5 5.5"/>
              <path d="M13.5 13 L22.5 13"/>
              <path d="M15 16 L21.5 20.5"/>
            </g>
          </g>
          <!-- antennae -->
          <g stroke-width="0.9" fill="none" stroke-linecap="round">
            <path d="M12 6.2 L9.5 2.6"/>
            <path d="M14 6.2 L16.5 2.6"/>
          </g>
          <!-- head, thorax, gaster (pointing up / -y) -->
          <ellipse cx="13" cy="7.2"  rx="2.5" ry="2.9"/>
          <ellipse cx="13" cy="12.6" rx="2.1" ry="2.7"/>
          <ellipse cx="13" cy="19"   rx="3.1" ry="4.1"/>
        </g>
      </svg>`;
    layer.appendChild(el);
    return el;
  }

  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  let seen = false;

  const ants = [];
  for (let i = 0; i < ANT_COUNT; i++) {
    const scale = 1 - i * 0.06;
    const el = antSVG(scale, 0);
    ants.push({
      el,
      x: mouse.x, y: mouse.y,
      angle: 0,
      phase: Math.random() * Math.PI * 2,
      speed: 0.11 - i * 0.008,          // followers ease a touch slower
      wobble: 0
    });
  }

  window.addEventListener("pointermove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!seen) {
      seen = true;
      // ants wander in from wherever they were parked
      ants.forEach((a, i) => {
        a.x = e.clientX - (MOUSE_GAP + i * SPACING);
        a.y = e.clientY + 20;
        gsap.to(a.el, { opacity: 1, duration: 0.6, delay: i * 0.06 });
      });
    }
  });

  document.addEventListener("mouseleave", () => {
    ants.forEach(a => gsap.to(a.el, { opacity: 0, duration: 0.4 }));
    seen = false;
  });

  gsap.ticker.add(() => {
    if (!seen) return;
    let tx = mouse.x, ty = mouse.y, gap = MOUSE_GAP;

    ants.forEach((a, i) => {
      const dx = tx - a.x;
      const dy = ty - a.y;
      const dist = Math.hypot(dx, dy);

      // walk only while outside the resting gap
      const overshoot = dist - gap;
      let walking = false;
      if (overshoot > STOP_ZONE) {
        const step = overshoot * a.speed;
        a.x += (dx / dist) * step;
        a.y += (dy / dist) * step;
        a.angle = Math.atan2(dy, dx);
        walking = true;
      }

      // gentle gait wobble while moving
      if (walking) {
        a.phase += 0.35;
        a.wobble = Math.sin(a.phase) * 3;
      } else {
        a.wobble *= 0.85;
      }

      const half = 13 * (1 - i * 0.06);
      // svg ant points "up", so heading needs +90deg
      const deg = (a.angle * 180) / Math.PI + 90 + a.wobble;
      a.el.style.transform =
        `translate(${a.x - half}px, ${a.y - half}px) rotate(${deg}deg)`;

      // next ant in line follows this one
      tx = a.x; ty = a.y; gap = SPACING;
    });
  });
})();
