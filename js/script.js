// year
document.getElementById("year").textContent = new Date().getFullYear();

/* =========================
   THEME TOGGLE (dark / light)
========================= */
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme){
  root.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
}

// au chargement
applyTheme(localStorage.getItem("theme") || "dark");

// au clic
if (themeBtn){
  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
  });
}


/* ===== Smooth scroll ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

/* ===== Burger menu ===== */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

function closeMenu(){
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-expanded", "false");
}

burger.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
  burger.setAttribute("aria-expanded", String(isOpen));
});
document.querySelectorAll(".m-link").forEach(link => link.addEventListener("click", closeMenu));

/* ===== Active nav item ===== */
const navItems = document.querySelectorAll(".navItem");
const ids = ["accueil","apropos","competences","projets","contact"];
const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

const navIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navItems.forEach(l => l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`));
  });
}, { threshold: 0.45 });

sections.forEach(s => navIO.observe(s));

/* ===== Reveal ===== */
const revealEls = document.querySelectorAll(".reveal, .section");
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => {
  el.classList.add("reveal");
  revealIO.observe(el);
});

/* ===== Projects slider ===== */
const trackInner = document.getElementById("trackInner");
const track = document.getElementById("track");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const dotsWrap = document.getElementById("dots");
const slides = trackInner ? Array.from(trackInner.children) : [];
let index = 0;

function renderDots(){
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === index ? " isOn" : "");
    b.setAttribute("aria-label", `Aller au projet ${i+1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });
}

function go(i){
  if (!trackInner || slides.length === 0) return;
  index = (i + slides.length) % slides.length;
  trackInner.style.transform = `translateX(${-index * 100}%)`;
  renderDots();
}

if (prev && next) {
  prev.addEventListener("click", () => go(index - 1));
  next.addEventListener("click", () => go(index + 1));
}
renderDots();

/* swipe projects */
if (track) {
  let startX = 0, dx = 0;
  track.addEventListener("pointerdown", (e) => { startX = e.clientX; dx = 0; });
  track.addEventListener("pointermove", (e) => { dx = e.clientX - startX; });
  track.addEventListener("pointerup", () => {
    if (Math.abs(dx) > 60) go(index + (dx < 0 ? 1 : -1));
    startX = 0; dx = 0;
  });
}

/* ===== Skills carousel controls + drag ===== */
const skillsTrack = document.getElementById("skillsTrack");
const skillPrev = document.getElementById("skillPrev");
const skillNext = document.getElementById("skillNext");

if (skillsTrack && skillPrev && skillNext) {
  const scrollByAmount = () => Math.min(420, skillsTrack.clientWidth * 0.75);

  skillPrev.addEventListener("click", () => {
    skillsTrack.scrollBy({ left: -scrollByAmount(), behavior: "smooth" });
  });

  skillNext.addEventListener("click", () => {
    skillsTrack.scrollBy({ left: scrollByAmount(), behavior: "smooth" });
  });

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  skillsTrack.addEventListener("mousedown", (e) => {
    isDown = true;
    skillsTrack.classList.add("dragging");
    startX = e.pageX - skillsTrack.offsetLeft;
    scrollLeft = skillsTrack.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    isDown = false;
    skillsTrack.classList.remove("dragging");
  });

  skillsTrack.addEventListener("mouseleave", () => {
    isDown = false;
    skillsTrack.classList.remove("dragging");
  });

  skillsTrack.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - skillsTrack.offsetLeft;
    const walk = (x - startX) * 1.2;
    skillsTrack.scrollLeft = scrollLeft - walk;
  });
}

/* ===== Copy email ===== */
const copyBtn = document.getElementById("copyBtn");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const email = document.getElementById("email")?.textContent?.trim();
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      alert("Email copié !");
    } catch {
      alert("Impossible de copier (autorisation navigateur).");
    }
  });
}

/* ===== Form demo ===== */
const form = document.getElementById("contactForm");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Message prêt (formulaire démo). On peut le brancher ensuite.");
  });
}

/* ===== Particles (discret) ===== */
const canvas = document.getElementById("particles");
const ctx = canvas?.getContext("2d");

function resize(){
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

if (canvas && ctx) {
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

/* ===== ABOUT pipeline highlight ===== */
const pipeline = document.getElementById("pipeline");
if (pipeline){
  const steps = Array.from(pipeline.querySelectorAll(".pipeStep"));
  const setOn = (idx) => steps.forEach((s,i)=>s.classList.toggle("isOn", i===idx));

  steps.forEach((btn, idx) => {
    btn.addEventListener("mouseenter", () => setOn(idx));
    btn.addEventListener("focus", () => setOn(idx));
    btn.addEventListener("click", () => setOn(idx));
  });
}

/* ===== ABOUT spotlight ===== */
const aboutSection = document.querySelector(".about");
if (aboutSection){
  aboutSection.addEventListener("mousemove", (e) => {
    const r = aboutSection.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    aboutSection.style.setProperty("--sx", `${x}%`);
    aboutSection.style.setProperty("--sy", `${y}%`);
  });
}

// ====== FILTERS ======
const filterBtns = document.querySelectorAll(".filterBtn");
const cards = document.querySelectorAll(".projectCard");

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("isActive"));
    btn.classList.add("isActive");

    const f = btn.dataset.filter;
    cards.forEach(card => {
      const cat = card.dataset.cat;
      card.style.display = (f === "all" || f === cat) ? "" : "none";
    });
  });
});

// ====== MODAL ======
const modal = document.getElementById("projectModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalClose = document.getElementById("modalClose");

const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalType = document.getElementById("modalType");
const modalDesc = document.getElementById("modalDesc");
const modalLong = document.getElementById("modalLong");
const modalTools = document.getElementById("modalTools");
const modalDemo = document.getElementById("modalDemo");
const modalCode = document.getElementById("modalCode");

function openModal(card){
  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";

  modalImg.src = card.dataset.img;
  modalTitle.textContent = card.dataset.title;
  modalType.textContent = card.dataset.type;
  modalDesc.textContent = card.dataset.desc;
  modalLong.textContent = card.dataset.long;

  // tools
  modalTools.innerHTML = "";
  (card.dataset.tools || "").split(",").map(s => s.trim()).filter(Boolean).forEach(t => {
    const span = document.createElement("span");
    span.className = "toolPill";
    span.textContent = t;
    modalTools.appendChild(span);
  });

  // links
  modalDemo.href = card.dataset.demo || "#";

  // code : seulement si dev + lien présent
  const isDev = card.dataset.cat === "dev";
  const codeLink = (card.dataset.code || "").trim();
  if(isDev && codeLink){
    modalCode.style.display = "inline-flex";
    modalCode.href = codeLink;
  }else{
    modalCode.style.display = "none";
  }
}

function closeModal(){
  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".js-more").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const card = e.target.closest(".projectCard");
    openModal(card);
  });
});

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape") closeModal();
});

document.addEventListener("DOMContentLoaded", () => {

  const slides = document.querySelectorAll(".projectSlide");
  const prev = document.getElementById("prev");
  const next = document.getElementById("next");
  const dotsContainer = document.querySelector(".sliderDots");

  console.log("SLIDES TROUVÉS :", slides.length);

  if (slides.length < 2) {
    console.error("⚠️ Il faut au moins 2 .projectSlide");
    return;
  }

  let index = 0;

  // dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll("button");

  function goTo(i) {
    slides[index].classList.remove("active");
    dots[index].classList.remove("active");

    index = i;

    slides[index].classList.add("active");
    dots[index].classList.add("active");
  }

  next.addEventListener("click", () => {
    goTo((index + 1) % slides.length);
  });

  prev.addEventListener("click", () => {
    goTo((index - 1 + slides.length) % slides.length);
  });

});

// COPY EMAIL
document.querySelectorAll(".copyBtn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const text = btn.getAttribute("data-copy") || "";
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copié ✅";
      setTimeout(() => (btn.textContent = "Copier"), 1200);
    } catch {
      alert("Copie impossible — essaye de sélectionner et copier manuellement.");
    }
  });
});

// CONTACT FORM (mailto)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) return;

    const subject = encodeURIComponent(`Contact portfolio — ${name}`);
    const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    // Mets TON mail ici :
    window.location.href = `mailto:TONMAIL@exemple.com?subject=${subject}&body=${body}`;
  });
}
