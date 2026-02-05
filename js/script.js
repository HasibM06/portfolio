/* =========================
   HELPERS
========================= */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));

/* =========================
   THEME TOGGLE (dark / light)
========================= */
const root = document.documentElement;
const themeBtn = $("#themeBtn");

function applyTheme(theme){
  root.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}

applyTheme(localStorage.getItem("theme") || "dark");

if (themeBtn){
  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}

/* =========================
   SMOOTH SCROLL
========================= */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = $(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* =========================
   BURGER MENU
========================= */
const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

function closeMenu(){
  if (!mobileMenu || !burger) return;
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-expanded", "false");
}

if (burger && mobileMenu){
  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".m-link").forEach(link => link.addEventListener("click", closeMenu));
}

/* =========================
   ACTIVE NAV ITEM
========================= */
const navItems = $$(".navItem");
const ids = ["accueil","apropos","competences","projets","contact"];
const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

if (navItems.length && sections.length){
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navItems.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
    });
  }, { threshold: 0.45 });

  sections.forEach(s => navIO.observe(s));
}

/* =========================
   PROJECTS SLIDER
========================= */
const trackInner = $("#trackInner");
const prev = $("#prev");
const next = $("#next");
const dotsWrap = $("#dots");

let sliderIndex = 0;
const slides = trackInner ? Array.from(trackInner.children) : [];

function renderDots(){
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === sliderIndex ? " isOn" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Aller au projet ${i+1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });
}

function go(i){
  if (!trackInner || slides.length === 0) return;
  sliderIndex = (i + slides.length) % slides.length;
  trackInner.style.transform = `translateX(${-sliderIndex * 100}%)`;
  renderDots();
}

if (prev) prev.addEventListener("click", () => go(sliderIndex - 1));
if (next) next.addEventListener("click", () => go(sliderIndex + 1));

renderDots();

/* swipe */
const track = $("#track");
if (track){
  let startX = 0, dx = 0, down = false;

  track.addEventListener("pointerdown", (e) => {
    down = true;
    startX = e.clientX;
    dx = 0;
  });

  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    dx = e.clientX - startX;
  });

  track.addEventListener("pointerup", () => {
    down = false;
    if (Math.abs(dx) > 60) go(sliderIndex + (dx < 0 ? 1 : -1));
    startX = 0; dx = 0;
  });
}

/* =========================
   MODAL PROJETS (Voir +)
========================= */
const modal = $("#projectModal");
const modalBackdrop = $("#modalBackdrop");
const modalClose = $("#modalClose");

const modalImg = $("#modalImg");
const modalTitle = $("#modalTitle");
const modalType = $("#modalType");
const modalDesc = $("#modalDesc");
const modalLong = $("#modalLong");
const modalTools = $("#modalTools");
const modalProject = $("#modalProject");

function openModalFromCard(card){
  if (!modal || !card) return;

  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

  const img = card.dataset.img || "";
  const title = card.dataset.title || "Projet";
  const type = card.dataset.type || "";
  const desc = card.dataset.desc || "";
  const long = card.dataset.long || "";
  const tools = (card.dataset.tools || "").split(",").map(s=>s.trim()).filter(Boolean);
  const projectLink = card.dataset.project || "#";

  if (modalImg){
    modalImg.src = img;
    modalImg.alt = title;
  }
  if (modalTitle) modalTitle.textContent = title;
  if (modalType) modalType.textContent = type;
  if (modalDesc) modalDesc.textContent = desc;
  if (modalLong) modalLong.textContent = long;

  if (modalTools){
    modalTools.innerHTML = "";
    tools.forEach(t => {
      const span = document.createElement("span");
      span.className = "toolPill";
      span.textContent = t;
      modalTools.appendChild(span);
    });
  }

  if (modalProject) modalProject.href = projectLink;
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

/* Event delegation: marche même si tu changes tes projets */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".js-more");
  if (!btn) return;

  const card = btn.closest(".projectCard"); // IMPORTANT: doit exister dans l'HTML
  openModalFromCard(card);
});

if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);
if (modalClose) modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* =========================
   COPY EMAIL (boutons Copier)
========================= */
$$(".copyBtn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copié ✅";
      setTimeout(() => (btn.textContent = "Copier"), 1200);
    } catch {
      alert("Copie impossible — copie manuellement.");
    }
  });
});

/* =========================
   CONTACT FORM (mailto)
========================= */
/* =========================
   CONTACT (Formspree AJAX)
   - Envoi direct vers ton Gmail via Formspree
   - Pas de mailto / pas de redirection
========================= */
const contactForm = document.getElementById("contactForm");
const formHint = document.getElementById("formHint");

function setHint(msg, ok = true) {
  if (!formHint) return;
  formHint.textContent = msg;
  formHint.style.opacity = "1";
  formHint.style.color = ok ? "" : "rgba(255,120,120,.95)";
}

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";

    // UX: état "envoi"
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi...";
    }
    setHint("Envoi en cours...");

    try {
      const res = await fetch(contactForm.action, {
        method: contactForm.method || "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        contactForm.reset();
        setHint("Message envoyé ✅ Merci !", true);
      } else {
        // Formspree renvoie parfois un JSON d'erreurs
        let data = null;
        try { data = await res.json(); } catch {}
        const msg =
          data?.errors?.map((er) => er.message).join(", ") ||
          "Oups ! Une erreur est survenue. Réessaie.";
        setHint(msg, false);
      }
    } catch (err) {
      setHint("Erreur réseau. Vérifie ta connexion et réessaie.", false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Envoyer le message →";
      }
    }
  });
}


/* =========================
   PARTICLES (optionnel, safe)
========================= */
const canvas = $("#particles");
const ctx = canvas?.getContext("2d");

function resize(){
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

if (canvas && ctx){
  const particles = [];
  const COUNT = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 22000));

  for(let i=0;i<COUNT;i++){
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: 0.35 + Math.random() * 0.35,
    });
  }

  function draw(){
    ctx.clearRect(0,0,canvas.width, canvas.height);

    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x < -20) p.x = canvas.width + 20;
      if(p.x > canvas.width + 20) p.x = -20;
      if(p.y < -20) p.y = canvas.height + 20;
      if(p.y > canvas.height + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${p.a})`;
      ctx.fill();
    }

    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 120){
          ctx.strokeStyle = `rgba(0,245,255,${(1 - d/120) * 0.10})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x,a.y);
          ctx.lineTo(b.x,b.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
}
