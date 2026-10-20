// Romeworks site: reveals, nav, hero parallax, Core Courier arena cycle, videos.
(() => {
  const root = document.documentElement;
  const params = new URLSearchParams(location.search);
  // ?shot renders everything in its final state, for full-page screenshots.
  const shot = params.has("shot");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const still = shot || reduce;
  root.classList.add("js");
  if (shot) {
    root.classList.add("shot");
    root.style.setProperty("--vh", (params.get("vh") || 900) + "px");
  }

  // Scroll reveals.
  const revealed = document.querySelectorAll("[data-reveal]");
  if (shot || !("IntersectionObserver" in window)) {
    revealed.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -6% 0px" });
    revealed.forEach((el) => io.observe(el));
  }

  // Nav: solid once scrolled, menu on small screens.
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const btn = nav.querySelector(".menu-btn");
    btn?.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
    nav.querySelectorAll(".links a").forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn?.setAttribute("aria-expanded", "false");
    }));
  }

  // Hero phones lean toward the pointer.
  const stage = document.querySelector(".stage");
  if (stage && !still && matchMedia("(hover: hover) and (pointer: fine)").matches) {
    addEventListener("pointermove", (e) => {
      stage.style.setProperty("--mx", ((e.clientX / innerWidth) * 2 - 1).toFixed(3));
      stage.style.setProperty("--my", ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
    }, { passive: true });
  }

  // Core Courier: screenshots cycle through the arenas; tabs jump to one.
  document.querySelectorAll("[data-cycle]").forEach((box) => {
    const slides = [...box.querySelectorAll(".screen > img")];
    const tabs = [...document.querySelectorAll(`[data-cycle-tabs="${box.id}"] .arena`)];
    const ms = 2800;
    let i = 0, timer = null;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle("on", k === i));
      tabs.forEach((t, k) => {
        t.classList.remove("on");
        t.setAttribute("aria-selected", k === i);
        if (k === i) { void t.offsetWidth; t.classList.add("on"); }
      });
    };
    const play = () => { clearInterval(timer); if (!still) timer = setInterval(() => show(i + 1), ms); };
    tabs.forEach((t, k) => t.addEventListener("click", () => { show(k); play(); }));
    root.style.setProperty("--cycle", ms + "ms");
    show(0);
    if (still) tabs[0]?.parentElement.classList.add("paused");
    // Only cycle while on screen.
    if ("IntersectionObserver" in window && !still) {
      new IntersectionObserver(([e]) => (e.isIntersecting ? play() : clearInterval(timer))).observe(box);
    }
  });

  // Videos play while visible, muted; the sound button unmutes.
  document.querySelectorAll("video[data-inview]").forEach((v) => {
    if (shot) return;
    if (reduce) { v.controls = true; return; }
    if (!("IntersectionObserver" in window)) { v.play().catch(() => {}); return; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.35 }).observe(v);
  });
  document.querySelectorAll("[data-sound]").forEach((b) => {
    const v = document.getElementById(b.dataset.sound);
    b.addEventListener("click", () => {
      v.muted = !v.muted;
      if (!v.muted) v.play().catch(() => {});
      b.classList.toggle("unmuted", !v.muted);
      b.querySelector(".label").textContent = v.muted ? "Sound on" : "Mute";
      b.setAttribute("aria-pressed", !v.muted);
    });
  });

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
})();
