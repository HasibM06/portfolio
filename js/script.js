const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

const root = document.documentElement;
const themeBtn = $("#themeBtn");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  if (themeBtn) {
    themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
  }
}

applyTheme(localStorage.getItem("theme") || "dark");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", next);
    applyTheme(next);
    drawSkillsRadar();
  });
}

$$('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const id = link.getAttribute("href");
    const target = $(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const burger = $("#burger");
const mobileMenu = $("#mobileMenu");

function closeMenu() {
  if (!mobileMenu || !burger) {
    return;
  }

  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
  burger.setAttribute("aria-expanded", "false");
}

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    mobileMenu.setAttribute("aria-hidden", String(!isOpen));
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  $$(".m-link").forEach((link) => link.addEventListener("click", closeMenu));
}

const navItems = $$(".navItem");
const sectionIds = ["accueil", "apropos", "competences", "projets", "contact"];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

if (navItems.length && sections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        const activeId = entry.target.id;
        navItems.forEach((item) => {
          item.classList.toggle("is-active", item.getAttribute("href") === `#${activeId}`);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => navObserver.observe(section));
}

const radarCanvas = $("#skillsRadar");

function drawSkillsRadar() {
  if (!radarCanvas) {
    return;
  }

  const ctx = radarCanvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const skills = [
    { label: "HTML / CSS", value: 0.95 },
    { label: "JavaScript", value: 0.8 },
    { label: "PHP / MVC", value: 0.65 },
    { label: "Figma / UI", value: 0.6 },
    { label: "Git / Projet", value: 0.75 },
    { label: "Organisation", value: 0.85 },
  ];

  const dpr = window.devicePixelRatio || 1;
  const cssSize = Math.min(radarCanvas.parentElement?.clientWidth || 520, 520);
  radarCanvas.width = cssSize * dpr;
  radarCanvas.height = cssSize * dpr;
  radarCanvas.style.width = `${cssSize}px`;
  radarCanvas.style.height = `${cssSize}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssSize, cssSize);

  const centerX = cssSize / 2;
  const centerY = cssSize / 2;
  const radius = cssSize * 0.29;
  const levels = 5;
  const angleStep = (Math.PI * 2) / skills.length;
  const startAngle = -Math.PI / 2;
  const isLightTheme = document.documentElement.getAttribute("data-theme") === "light";
  const textColor = isLightTheme ? "#0f172a" : "rgba(255, 255, 255, 0.92)";
  const gridColor = isLightTheme ? "rgba(15, 23, 42, 0.14)" : "rgba(255, 255, 255, 0.14)";
  const accentRgb = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim() || "91, 140, 255";

  const shapeFill = `rgba(${accentRgb}, 0.22)`;
  const shapeStroke = `rgba(${accentRgb}, 0.9)`;

  for (let level = 1; level <= levels; level += 1) {
    const currentRadius = (radius / levels) * level;
    ctx.beginPath();

    skills.forEach((_, index) => {
      const angle = startAngle + angleStep * index;
      const x = centerX + Math.cos(angle) * currentRadius;
      const y = centerY + Math.sin(angle) * currentRadius;
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  skills.forEach((_, index) => {
    const angle = startAngle + angleStep * index;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  ctx.beginPath();
  skills.forEach((skill, index) => {
    const angle = startAngle + angleStep * index;
    const pointRadius = radius * skill.value;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.fillStyle = shapeFill;
  ctx.strokeStyle = shapeStroke;
  ctx.lineWidth = 2.5;
  ctx.fill();
  ctx.stroke();

  skills.forEach((skill, index) => {
    const angle = startAngle + angleStep * index;
    const pointRadius = radius * skill.value;
    const x = centerX + Math.cos(angle) * pointRadius;
    const y = centerY + Math.sin(angle) * pointRadius;
    const labelRadius = radius + 30;
    const lx = centerX + Math.cos(angle) * labelRadius;
    const ly = centerY + Math.sin(angle) * labelRadius;

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = shapeStroke;
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = "700 13px Segoe UI, Arial, sans-serif";
    ctx.textAlign =
      Math.cos(angle) > 0.2 ? "left" : Math.cos(angle) < -0.2 ? "right" : "center";
    ctx.textBaseline =
      Math.sin(angle) > 0.3 ? "top" : Math.sin(angle) < -0.3 ? "bottom" : "middle";
    ctx.fillText(skill.label, lx, ly);
  });
}

drawSkillsRadar();
window.addEventListener("resize", drawSkillsRadar);

const trackInner = $("#trackInner");
const prev = $("#prev");
const next = $("#next");
const dotsWrap = $("#dots");
let sliderIndex = 0;
const slides = trackInner ? Array.from(trackInner.children) : [];

function renderDots() {
  if (!dotsWrap) {
    return;
  }

  dotsWrap.innerHTML = "";
  slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.className = `dot${index === sliderIndex ? " isOn" : ""}`;
    button.type = "button";
    button.setAttribute("aria-label", `Aller au projet ${index + 1}`);
    button.addEventListener("click", () => go(index));
    dotsWrap.appendChild(button);
  });
}

function go(index) {
  if (!trackInner || slides.length === 0) {
    return;
  }

  sliderIndex = (index + slides.length) % slides.length;
  trackInner.style.transform = `translateX(${-sliderIndex * 100}%)`;
  renderDots();
}

if (prev) {
  prev.addEventListener("click", () => go(sliderIndex - 1));
}

if (next) {
  next.addEventListener("click", () => go(sliderIndex + 1));
}

renderDots();

const track = $("#track");
if (track) {
  let startX = 0;
  let dx = 0;
  let down = false;

  track.addEventListener("pointerdown", (event) => {
    down = true;
    startX = event.clientX;
    dx = 0;
  });

  track.addEventListener("pointermove", (event) => {
    if (!down) {
      return;
    }

    dx = event.clientX - startX;
  });

  track.addEventListener("pointerup", () => {
    down = false;

    if (Math.abs(dx) > 60) {
      go(sliderIndex + (dx < 0 ? 1 : -1));
    }

    startX = 0;
    dx = 0;
  });
}

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

function openModalFromCard(card) {
  if (!modal || !card) {
    return;
  }

  modal.classList.add("isOpen");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const img = card.dataset.img || "";
  const title = card.dataset.title || "Projet";
  const type = card.dataset.type || "";
  const desc = card.dataset.desc || "";
  const long = card.dataset.long || "";
  const tools = (card.dataset.tools || "").split(",").map((value) => value.trim()).filter(Boolean);
  const projectLink = card.dataset.project || "#";

  if (modalImg) {
    modalImg.src = img;
    modalImg.alt = title;
  }

  if (modalTitle) {
    modalTitle.textContent = title;
  }

  if (modalType) {
    modalType.textContent = type;
  }

  if (modalDesc) {
    modalDesc.textContent = desc;
  }

  if (modalLong) {
    modalLong.textContent = long;
  }

  if (modalTools) {
    modalTools.innerHTML = "";
    tools.forEach((tool) => {
      const tag = document.createElement("span");
      tag.className = "toolPill";
      tag.textContent = tool;
      modalTools.appendChild(tag);
    });
  }

  if (modalProject) {
    modalProject.href = projectLink;
  }
}

function closeModal() {
  if (!modal) {
    return;
  }

  modal.classList.remove("isOpen");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.addEventListener("click", (event) => {
  const button = event.target.closest(".js-more");
  if (!button) {
    return;
  }

  const card = button.closest(".projectCard");
  openModalFromCard(card);
});

if (modalBackdrop) {
  modalBackdrop.addEventListener("click", closeModal);
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

$$(".copyBtn").forEach((button) => {
  button.addEventListener("click", async () => {
    const text = button.getAttribute("data-copy") || "";

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copie OK";
      setTimeout(() => {
        button.textContent = "Copier";
      }, 1200);
    } catch {
      alert("Copie impossible - copie manuellement.");
    }
  });
});

const contactForm = $("#contactForm");
const formHint = $("#formHint");

function setHint(message, ok = true) {
  if (!formHint) {
    return;
  }

  formHint.textContent = message;
  formHint.classList.toggle("isError", !ok);
  formHint.classList.toggle("isVisible", Boolean(message));
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.textContent : "";

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Envoi...";
    }

    setHint("Envoi en cours...");

    try {
      const response = await fetch(contactForm.action, {
        method: contactForm.method || "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactForm.reset();
        setHint("Message envoye. Merci !", true);
      } else {
        let data = null;
        try {
          data = await response.json();
        } catch {}

        const message =
          data?.errors?.map((error) => error.message).join(", ") ||
          "Oups ! Une erreur est survenue. Reessaie.";
        setHint(message, false);
      }
    } catch {
      setHint("Erreur reseau. Verifie ta connexion et reessaie.", false);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText || "Envoyer le message";
      }
    }
  });
}

/* =========================================================
   SCROLL REVEAL
========================================================= */
const revealElements = $$('[data-reveal]');

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-reveal-delay');
          if (delay) {
            entry.target.style.transitionDelay = `${parseInt(delay, 10)}ms`;
          }
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;

    if (alreadyInView) {
      el.classList.add('revealed');
    } else {
      revealObserver.observe(el);
    }
  });
}

/* year footer */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
