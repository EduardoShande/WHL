/* ═══════════════════════════════════════════════════════════════════
   WHL LLC — Landing Page JavaScript
   - Sticky nav / scroll detection
   - Mobile hamburger menu
   - Smooth scroll for anchor links
   - Intersection Observer animations (fade-up / reveal)
   - FAQ accordion
   - Form validation + n8n webhook submission
═══════════════════════════════════════════════════════════════════ */

/* ── 1. CONFIG ─────────────────────────────────────────────────────
   👉 Replace the URL below with your actual n8n webhook URL
   Example: "https://your-n8n.domain.com/webhook/whl-consultation"
────────────────────────────────────────────────────────────────── */
const WEBHOOK_URL = "//n8n-fbxjjcbhs0zxqmlcspfp3wwr.68.183.150.130.sslip.io/webhook-test/882e0ff1-7099-48a8-b112-035cf55a00e1";


/* ══════════════════════════════════════════
   2. DOM READY
══════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initHamburger();
  initSmoothScroll();
  initScrollAnimations();
  initFAQ();
  initForm();
});


/* ══════════════════════════════════════════
   3. STICKY NAV
══════════════════════════════════════════ */
function initNav() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load
}


/* ══════════════════════════════════════════
   4. HAMBURGER / MOBILE MENU
══════════════════════════════════════════ */
function initHamburger() {
  const hamburger  = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    hamburger.classList.toggle("active", isOpen);
    hamburger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close on link click
  mobileMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
      mobileMenu.classList.remove("open");
      hamburger.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
  });
}


/* ══════════════════════════════════════════
   5. SMOOTH SCROLL
══════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const id = anchor.getAttribute("href");
      if (id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      const navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue("--nav-h")) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}


/* ══════════════════════════════════════════
   6. INTERSECTION OBSERVER ANIMATIONS
══════════════════════════════════════════ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
  );

  document.querySelectorAll(".fade-up, .reveal").forEach(el => {
    observer.observe(el);
  });
}


/* ══════════════════════════════════════════
   7. FAQ ACCORDION
══════════════════════════════════════════ */
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item   = btn.closest(".faq-item");
      const answer = item.querySelector(".faq-answer");
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // Close all others
      document.querySelectorAll(".faq-question").forEach(other => {
        if (other !== btn) {
          other.setAttribute("aria-expanded", "false");
          other.closest(".faq-item").querySelector(".faq-answer").classList.remove("open");
        }
      });

      // Toggle this one
      btn.setAttribute("aria-expanded", !isOpen);
      answer.classList.toggle("open", !isOpen);
    });
  });
}


/* ══════════════════════════════════════════
   8. CONSULTATION FORM
══════════════════════════════════════════ */
function initForm() {
  const form       = document.getElementById("consultationForm");
  const submitBtn  = document.getElementById("submitBtn");
  const successBox = document.getElementById("formSuccess");
  const errorBox   = document.getElementById("formError");

  if (!form) return;

  /* ── Real-time validation on blur ── */
  form.querySelectorAll("input[required], select[required]").forEach(field => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("invalid")) validateField(field);
    });
  });

  /* ── Submit handler ── */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate all required fields
    let valid = true;
    form.querySelectorAll("input[required], select[required]").forEach(field => {
      if (!validateField(field)) valid = false;
    });
    if (!valid) return;

    // Gather data
    const payload = {
      fullName : form.fullName.value.trim(),
      email    : form.email.value.trim(),
      phone    : form.phone.value.trim(),
      service  : form.service.value,
      zipCode  : form.zipCode.value.trim(),
      message  : form.message.value.trim(),
      source   : "WHL Landing Page",
      timestamp: new Date().toISOString(),
    };

    // Loading state
    setLoading(true);
    hideMessages();

    try {
      // Using no-cors because the n8n webhook is on a different domain.
      // In no-cors mode the browser sends the request but returns an opaque
      // response (we can't read status), so we treat any completed fetch as success.
      await fetch(WEBHOOK_URL, {
        method : "POST",
        mode   : "no-cors",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify(payload),
      });

      // If fetch didn't throw, the request was sent — show success
      showSuccess();
      form.reset();
      successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    } catch (err) {
      console.error("Form submission error:", err);
      showError();
    } finally {
      setLoading(false);
    }
  });

  /* ── Helpers ── */

  function validateField(field) {
    const errorEl = field.parentElement.querySelector(".field-error");
    let message = "";

    if (!field.value.trim()) {
      message = "This field is required.";
    } else if (field.type === "email" && !isValidEmail(field.value)) {
      message = "Please enter a valid email address.";
    } else if (field.type === "tel" && !isValidPhone(field.value)) {
      message = "Please enter a valid phone number.";
    } else if (field.id === "zipCode" && !isValidZip(field.value)) {
      message = "Please enter a valid ZIP code.";
    }

    if (message) {
      field.classList.add("invalid");
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      field.classList.remove("invalid");
      if (errorEl) errorEl.textContent = "";
      return true;
    }
  }

  function setLoading(state) {
    const btnText    = submitBtn.querySelector(".btn-text");
    const btnLoading = submitBtn.querySelector(".btn-loading");
    submitBtn.disabled = state;
    btnText.style.display    = state ? "none"         : "";
    btnLoading.style.display = state ? "inline-flex"  : "none";
  }

  function hideMessages() {
    successBox.style.display = "none";
    errorBox.style.display   = "none";
  }
  function showSuccess() { successBox.style.display = "flex"; }
  function showError()   { errorBox.style.display   = "flex"; }
}


/* ══════════════════════════════════════════
   9. VALIDATION HELPERS
══════════════════════════════════════════ */
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

function isValidPhone(val) {
  // Accepts formats: (555) 123-4567 | 555-123-4567 | 5551234567 | +15551234567
  return /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(
    val.replace(/\s/g, "")
  );
}

function isValidZip(val) {
  // US ZIP: 5 digits, or ZIP+4
  return /^\d{5}(-\d{4})?$/.test(val.trim());
}
