const header = document.getElementById("header");
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");
const contactForm = document.getElementById("contactForm");
const formFeedback = document.getElementById("formFeedback");
const revealElements = document.querySelectorAll(".reveal");
const newsCarousel = document.getElementById("newsCarousel");
const newsTrack = document.getElementById("newsTrack");
const newsPrev = document.getElementById("newsPrev");
const newsNext = document.getElementById("newsNext");
const newsDots = document.getElementById("newsDots");

function updateHeaderState() {
  if (header) {
    header.classList.toggle("scrolled", window.scrollY > 12);
  }
}

function closeMobileNav() {
  if (!header || !navToggle) {
    return;
  }

  header.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function toggleMobileNav() {
  if (!header || !navToggle) {
    return;
  }

  const isOpen = header.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

if (navToggle) {
  navToggle.addEventListener("click", toggleMobileNav);
}

if (mainNav) {
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });
}

window.addEventListener("scroll", updateHeaderState);
window.addEventListener("load", updateHeaderState);
window.addEventListener("resize", () => {
  if (window.innerWidth >= 900) {
    closeMobileNav();
  }
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

if (contactForm && formFeedback) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const formData = new FormData(contactForm);
    const userName = formData.get("name");

    formFeedback.textContent = "Enviando mensaje...";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || (result && result.success === "false")) {
        throw new Error("No se pudo enviar el formulario.");
      }

      formFeedback.textContent = `Gracias, ${userName}. Tu mensaje fue enviado correctamente. Nos pondremos en contacto pronto.`;
      contactForm.reset();
    } catch (error) {
      formFeedback.textContent = "No se pudo enviar el mensaje. Verifica tu conexión, confirma tu correo en FormSubmit e inténtalo nuevamente.";
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar consulta";
      }
    }
  });
}

if (newsCarousel && newsTrack && newsPrev && newsNext && newsDots) {
  const slides = Array.from(newsTrack.children);
  let currentIndex = 0;

  function getVisibleCards() {
    if (window.innerWidth >= 1100) {
      return 3;
    }

    if (window.innerWidth >= 900) {
      return 2;
    }

    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, slides.length - getVisibleCards());
  }

  function renderDots() {
    const total = getMaxIndex() + 1;
    newsDots.innerHTML = "";

    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Ir al grupo de noticias ${index + 1}`);
      dot.classList.toggle("active", index === currentIndex);
      dot.addEventListener("click", () => {
        currentIndex = index;
        updateCarousel();
      });
      newsDots.appendChild(dot);
    }
  }

  function updateCarousel() {
    const firstCard = slides[0];
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 0;
    const gap = 20;
    const maxIndex = getMaxIndex();

    currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
    newsTrack.style.transform = `translateX(-${currentIndex * (cardWidth + gap)}px)`;

    Array.from(newsDots.children).forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });

    newsPrev.disabled = currentIndex === 0;
    newsNext.disabled = currentIndex === maxIndex;
  }

  newsPrev.addEventListener("click", () => {
    currentIndex -= 1;
    updateCarousel();
  });

  newsNext.addEventListener("click", () => {
    currentIndex += 1;
    updateCarousel();
  });

  window.addEventListener("resize", () => {
    renderDots();
    updateCarousel();
  });

  renderDots();
  updateCarousel();
}
