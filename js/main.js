"use strict";

/* =========================================================
   1. REFERENCIAS GENERALES
========================================================== */
const body = document.body;
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const themeToggle = document.getElementById("themeToggle");
const backToTop = document.getElementById("backToTop");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));

/* =========================================================
   2. ENCABEZADO FIJO Y BOTÓN VOLVER ARRIBA
========================================================== */
function updateHeader() {
  const hasScrolled = window.scrollY > 30;
  siteHeader.classList.toggle("scrolled", hasScrolled);
  backToTop.classList.toggle("visible", window.scrollY > 650);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

backToTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* =========================================================
   3. MENÚ RESPONSIVE
========================================================== */
function setMenuState(isOpen) {
  mainNav.classList.toggle("open", isOpen);
  body.classList.toggle("menu-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Cerrar menú" : "Abrir menú"
  );
}

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    setMenuState(false);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 920) {
    setMenuState(false);
  }
});

/* =========================================================
   4. MODO CLARO Y MODO OSCURO
========================================================== */
const savedTheme = localStorage.getItem("nexom-theme");
const prefersDark = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  body.classList.add("dark-theme");
}

function updateThemeLabel() {
  const isDark = body.classList.contains("dark-theme");
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Activar modo claro" : "Activar modo oscuro"
  );
  themeToggle.setAttribute(
    "title",
    isDark ? "Activar modo claro" : "Activar modo oscuro"
  );
}

updateThemeLabel();

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-theme");

  const selectedTheme = body.classList.contains("dark-theme")
    ? "dark"
    : "light";

  localStorage.setItem("nexom-theme", selectedTheme);
  updateThemeLabel();
});

/* =========================================================
   5. ANIMACIONES DE ENTRADA AL HACER SCROLL
========================================================== */
const revealElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.13,
    rootMargin: "0px 0px -45px 0px"
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

/* =========================================================
   6. ESTADÍSTICAS ANIMADAS
========================================================== */
const counters = document.querySelectorAll(".counter");
let countersStarted = false;

function animateCounter(counter) {
  const target = Number(counter.dataset.target);
  const duration = 1800;
  const startTime = performance.now();

  function updateValue(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - Math.pow(1 - progress, 4);
    const value = Math.floor(easedProgress * target);

    counter.textContent = value.toLocaleString("es-MX");

    if (progress < 1) {
      requestAnimationFrame(updateValue);
    } else {
      counter.textContent = target.toLocaleString("es-MX");
    }
  }

  requestAnimationFrame(updateValue);
}

const statisticsSection = document.querySelector(".statistics");

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || countersStarted) return;

      countersStarted = true;
      counters.forEach(animateCounter);
      counterObserver.disconnect();
    });
  },
  {
    threshold: 0.35
  }
);

if (statisticsSection) {
  counterObserver.observe(statisticsSection);
}

/* =========================================================
   7. ENLACE ACTIVO EN EL MENÚ
========================================================== */
const observedSections = Array.from(
  document.querySelectorAll("main section[id]")
);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visibleEntries.length) return;

    const currentId = visibleEntries[0].target.id;

    navLinks.forEach((link) => {
      const linkTarget = link.getAttribute("href").replace("#", "");
      link.classList.toggle("active", linkTarget === currentId);
    });
  },
  {
    threshold: [0.2, 0.4, 0.6],
    rootMargin: "-25% 0px -55% 0px"
  }
);

observedSections.forEach((section) => {
  sectionObserver.observe(section);
});

/* =========================================================
   8. FILTRO DE PROYECTOS
========================================================== */
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    projectCards.forEach((card) => {
      const matchesFilter =
        selectedFilter === "all" ||
        card.dataset.category === selectedFilter;

      card.classList.toggle("hidden", !matchesFilter);
    });
  });
});

/* =========================================================
   9. CARRUSEL DE TESTIMONIOS
========================================================== */
const testimonialTrack = document.getElementById("testimonialTrack");
const testimonialSlides = Array.from(
  document.querySelectorAll(".testimonial-slide")
);
const testimonialPrev = document.getElementById("testimonialPrev");
const testimonialNext = document.getElementById("testimonialNext");
const sliderDots = document.getElementById("sliderDots");

let currentTestimonial = 0;
let testimonialTimer;

function createSliderDots() {
  testimonialSlides.forEach((_, index) => {
    const dot = document.createElement("button");

    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute(
      "aria-label",
      `Mostrar testimonio ${index + 1}`
    );

    dot.addEventListener("click", () => {
      showTestimonial(index);
      restartTestimonialTimer();
    });

    sliderDots.appendChild(dot);
  });
}

function showTestimonial(index) {
  const total = testimonialSlides.length;

  currentTestimonial = (index + total) % total;
  testimonialTrack.style.transform =
    `translateX(-${currentTestimonial * 100}%)`;

  Array.from(sliderDots.children).forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentTestimonial);
    dot.setAttribute(
      "aria-current",
      dotIndex === currentTestimonial ? "true" : "false"
    );
  });
}

function startTestimonialTimer() {
  testimonialTimer = window.setInterval(() => {
    showTestimonial(currentTestimonial + 1);
  }, 6500);
}

function restartTestimonialTimer() {
  window.clearInterval(testimonialTimer);
  startTestimonialTimer();
}

testimonialPrev.addEventListener("click", () => {
  showTestimonial(currentTestimonial - 1);
  restartTestimonialTimer();
});

testimonialNext.addEventListener("click", () => {
  showTestimonial(currentTestimonial + 1);
  restartTestimonialTimer();
});

testimonialTrack.addEventListener("mouseenter", () => {
  window.clearInterval(testimonialTimer);
});

testimonialTrack.addEventListener("mouseleave", () => {
  restartTestimonialTimer();
});

createSliderDots();
showTestimonial(0);
startTestimonialTimer();

/* =========================================================
   10. GESTOS TÁCTILES EN TESTIMONIOS
========================================================== */
let touchStartX = 0;
let touchEndX = 0;

testimonialTrack.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].screenX;
  },
  { passive: true }
);

testimonialTrack.addEventListener(
  "touchend",
  (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const difference = touchStartX - touchEndX;

    if (Math.abs(difference) < 50) return;

    if (difference > 0) {
      showTestimonial(currentTestimonial + 1);
    } else {
      showTestimonial(currentTestimonial - 1);
    }

    restartTestimonialTimer();
  },
  { passive: true }
);

/* =========================================================
   11. VALIDACIÓN DEL FORMULARIO DE CONTACTO
========================================================== */
const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

function showFormMessage(type, message) {
  formMessage.className = `form-message ${type}`;
  formMessage.textContent = message;
}

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = contactForm.nombre.value.trim();
  const email = contactForm.correo.value.trim();
  const message = contactForm.mensaje.value.trim();
  const acceptedPrivacy = contactForm.privacidad.checked;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 3) {
    showFormMessage(
      "error",
      "Ingresa tu nombre completo para continuar."
    );
    contactForm.nombre.focus();
    return;
  }

  if (!emailPattern.test(email)) {
    showFormMessage(
      "error",
      "Ingresa una dirección de correo electrónico válida."
    );
    contactForm.correo.focus();
    return;
  }

  if (message.length < 15) {
    showFormMessage(
      "error",
      "Describe tu necesidad con al menos 15 caracteres."
    );
    contactForm.mensaje.focus();
    return;
  }

  if (!acceptedPrivacy) {
    showFormMessage(
      "error",
      "Debes aceptar el uso de tus datos para enviar la solicitud."
    );
    contactForm.privacidad.focus();
    return;
  }

  /*
    En producción, reemplazar esta simulación por una petición fetch()
    hacia una API segura que procese y almacene la información.
  */
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const originalContent = submitButton.innerHTML;

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  window.setTimeout(() => {
    showFormMessage(
      "success",
      "Gracias. Tu solicitud fue registrada correctamente. El equipo de NEXOM se pondrá en contacto contigo."
    );

    contactForm.reset();
    submitButton.disabled = false;
    submitButton.innerHTML = originalContent;
  }, 900);
});

/* =========================================================
   12. SUSCRIPCIÓN AL BOLETÍN
========================================================== */
const newsletterForm = document.getElementById("newsletterForm");
const newsletterEmail = document.getElementById("newsletterEmail");
const newsletterMessage = document.getElementById("newsletterMessage");

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = newsletterEmail.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    newsletterMessage.textContent =
      "Ingresa un correo electrónico válido.";
    newsletterEmail.focus();
    return;
  }

  /*
    En producción, conectar con el sistema real de suscripción
    y confirmar el registro desde el servidor.
  */
  newsletterMessage.textContent =
    "¡Gracias! Tu correo fue registrado correctamente.";

  newsletterForm.reset();
});

/* =========================================================
   13. AÑO ACTUAL
========================================================== */
document.getElementById("currentYear").textContent =
  new Date().getFullYear();

/* =========================================================
   14. DESPLAZAMIENTO SUAVE CON COMPENSACIÓN DEL ENCABEZADO
========================================================== */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") return;

    const target = document.querySelector(targetId);

    if (!target) return;

    event.preventDefault();

    const headerOffset = siteHeader.offsetHeight + 12;
    const targetPosition =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerOffset;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });

    history.replaceState(null, "", targetId);
  });
});
