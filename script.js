/* =========================================================
   MEGA DELICIOSO — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initHeaderScroll();
  initMenuFilters();
  initTestimonialCarousel();
  initContactForm();
  initSurvey();
  setCurrentYear();
});

/* ---------------------------------------------------------
   Menú móvil (hamburguesa de navegación)
--------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cierra el menú al elegir una opción (útil en móvil)
  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   Encabezado: sombra al hacer scroll
--------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const applyShadow = () => {
    if (window.scrollY > 12) {
      header.style.boxShadow = '0 8px 20px rgba(0,0,0,0.25)';
    } else {
      header.style.boxShadow = 'none';
    }
  };

  applyShadow();
  window.addEventListener('scroll', applyShadow, { passive: true });
}

/* ---------------------------------------------------------
   Filtro de categorías del menú
--------------------------------------------------------- */
function initMenuFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.menu-card');
  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');

      const filter = button.dataset.filter;

      cards.forEach((card) => {
        const matches = filter === 'todas' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}

/* ---------------------------------------------------------
   Carrusel de testimonios
--------------------------------------------------------- */
function initTestimonialCarousel() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  let current = 0;
  let autoplayTimer = null;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Ir al testimonio ${index + 1}`);
    if (index === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(index));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(current + 1), 6000);
  }
  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  const carousel = track.closest('.testimonial-carousel');
  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

/* ---------------------------------------------------------
   Validación del formulario de contacto
--------------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById('ctaForm');
  if (!form) return;

  const nombre = document.getElementById('nombre');
  const telefono = document.getElementById('telefono');
  const sucursal = document.getElementById('sucursal');
  const successMsg = document.getElementById('formSuccess');

  const errors = {
    nombre: document.getElementById('errorNombre'),
    telefono: document.getElementById('errorTelefono'),
    sucursal: document.getElementById('errorSucursal'),
  };

  function setError(field, message) {
    errors[field].textContent = message || '';
  }

  function validateNombre() {
    const value = nombre.value.trim();
    if (value.length < 2) {
      setError('nombre', 'Escribe tu nombre completo.');
      return false;
    }
    setError('nombre', '');
    return true;
  }

  function validateTelefono() {
    const digits = telefono.value.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('telefono', 'Ingresa un teléfono a 10 dígitos.');
      return false;
    }
    setError('telefono', '');
    return true;
  }

  function validateSucursal() {
    if (!sucursal.value) {
      setError('sucursal', 'Elige la sucursal más cercana.');
      return false;
    }
    setError('sucursal', '');
    return true;
  }

  nombre.addEventListener('blur', validateNombre);
  telefono.addEventListener('blur', validateTelefono);
  sucursal.addEventListener('change', validateSucursal);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    successMsg.textContent = '';

    const validNombre = validateNombre();
    const validTelefono = validateTelefono();
    const validSucursal = validateSucursal();

    if (validNombre && validTelefono && validSucursal) {
      // Aquí se conectaría con el backend o servicio de reservas real.
      successMsg.textContent = `Gracias, ${nombre.value.trim()}. Te llamamos en breve para confirmar tu pedido.`;
      form.reset();
    }
  });
}

/* ---------------------------------------------------------
   Encuesta: "¿Cuál es tu hamburguesa favorita?"
   Guarda votos en localStorage del navegador de quien vota.
--------------------------------------------------------- */
function initSurvey() {
  const form = document.getElementById('surveyForm');
  const note = document.getElementById('surveyNote');
  const results = document.getElementById('surveyResults');
  const resultsList = document.getElementById('surveyResultsList');
  const resetBtn = document.getElementById('surveyReset');
  if (!form) return;

  const STORAGE_VOTES = 'megaDelicioso_encuestaVotos';
  const STORAGE_VOTED = 'megaDelicioso_yaVoto';

  function getVotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_VOTES)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveVotes(votes) {
    try {
      localStorage.setItem(STORAGE_VOTES, JSON.stringify(votes));
    } catch (e) {
      /* almacenamiento no disponible: la encuesta sigue funcionando en esta sesión */
    }
  }

  function renderResults() {
    const votes = getVotes();
    const total = Object.values(votes).reduce((sum, n) => sum + n, 0);

    resultsList.innerHTML = '';

    Object.entries(votes)
      .sort((a, b) => b[1] - a[1])
      .forEach(([option, count]) => {
        const percent = total ? Math.round((count / total) * 100) : 0;

        const li = document.createElement('li');
        li.className = 'survey-result-row';
        li.innerHTML = `
          <div class="survey-result-top">
            <span>${option}</span>
            <span>${percent}% (${count})</span>
          </div>
          <div class="survey-result-bar">
            <div class="survey-result-fill" style="width:${percent}%"></div>
          </div>
        `;
        resultsList.appendChild(li);
      });
  }

  function showResultsView() {
    form.classList.add('is-hidden');
    results.classList.remove('is-hidden');
    renderResults();
  }

  // Si ya votó antes en este navegador, muestra resultados directamente
  if (localStorage.getItem(STORAGE_VOTED)) {
    showResultsView();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selected = form.querySelector('input[name="favorita"]:checked');

    if (!selected) {
      note.textContent = 'Elige una opción antes de votar.';
      return;
    }

    const votes = getVotes();
    votes[selected.value] = (votes[selected.value] || 0) + 1;
    saveVotes(votes);
    localStorage.setItem(STORAGE_VOTED, 'true');

    note.textContent = '';
    showResultsView();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_VOTED);
      results.classList.add('is-hidden');
      form.classList.remove('is-hidden');
      form.reset();
    });
  }
}

/* ---------------------------------------------------------
   Año actual en el footer
--------------------------------------------------------- */
function setCurrentYear() {
  const el = document.getElementById('anioActual');
  if (el) el.textContent = new Date().getFullYear();
}
