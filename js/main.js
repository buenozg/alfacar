// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Mobile menu
const mobileMenuButton = $("#mobileMenuButton");
const mobileMenu = $("#mobileMenu");
function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.setAttribute("aria-label", "Abrir menu");
}
function toggleMobileMenu() {
  const isOpen = !mobileMenu.classList.contains("hidden");
  if (isOpen) closeMobileMenu();
  else {
    mobileMenu.classList.remove("hidden");
    mobileMenuButton.setAttribute("aria-expanded", "true");
    mobileMenuButton.setAttribute("aria-label", "Fechar menu");
  }
}
mobileMenuButton?.addEventListener("click", toggleMobileMenu);
$$("#mobileMenu a").forEach((a) => a.addEventListener("click", closeMobileMenu));
document.addEventListener("click", (e) => {
  const isOpen = mobileMenuButton?.getAttribute("aria-expanded") === "true";
  if (!isOpen) return;
  const target = e.target;
  if (!(target instanceof Node)) return;
  const clickedInsideMenu = mobileMenu?.contains(target);
  const clickedButton = mobileMenuButton?.contains(target);
  if (!clickedInsideMenu && !clickedButton) closeMobileMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

// Sticky header shadow on scroll
const header = $("#topo");
const onScroll = () => {
  const scrolled = window.scrollY > 8;
  header.classList.toggle("shadow-sm", scrolled);
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Reveal animations (Intersection Observer)
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("is-visible"));
}

// Categorias (abas + imagem + setas)
const categoryTabsRoot = $("#categoryTabs");
const categoryPanel = $("#categoryPanel");
const categoryImage = $("#categoryImage");
const categoryImagePlaceholder = $("#categoryImagePlaceholder");
const categoryTitle = $("#categoryTitle");
const categoryDescription = $("#categoryDescription");
const categoryPrev = $("#categoryPrev");
const categoryNext = $("#categoryNext");

const categories = [
  {
    id: "leves",
    label: "Leves",
    description: "Veículos ideais para deslocamentos do dia a dia com conforto, eficiência e agilidade.",
    image: "./assets/images/leve.png",
  },
  {
    id: "ambulancia-uti",
    label: "Ambulância Tipo UTI Equipada",
    description: "Atendimento móvel com estrutura e equipamentos para suporte avançado, conforme necessidade da operação.",
    image: "./assets/images/ambulancia.jpg",
  },
  {
    id: "ambulancia-resgate",
    label: "Ambulância Tipo Resgate Equipada",
    description: "Suporte para remoções e atendimentos com agilidade, com equipamentos adequados ao perfil assistencial.",
    image: "./assets/images/ambulancia.jpg",
  },
  {
    id: "van-operacional",
    label: "Van Operacional Especial",
    description: "Veículos para apoio operacional e logística de equipes, com configuração conforme demanda do cliente.",
    image: "./assets/images/operacional_alfacar.png",
  },
  {
    id: "monitores",
    label: "Monitores para Apoio",
    description: "Equipamentos de monitoramento para suporte às operações de saúde móvel e atendimentos especializados.",
    image: "./assets/images/monitor.webp",
  },
  {
    id: "motolancias",
    label: "Motolâncias",
    description: "Resposta rápida para apoio em atendimentos e deslocamentos, com agilidade em áreas de difícil acesso.",
    image: "./assets/images/motolancia.png",
  },
  {
    id: "motocicletas",
    label: "Motocicletas",
    description: "Apoio logístico e operacional com mobilidade elevada, reduzindo tempo de resposta em rotinas críticas.",
    image: "./assets/images/moto.png",
  },
  {
    id: "minivan",
    label: "Minivan",
    description: "Conforto e praticidade para transporte de equipes e deslocamentos corporativos, com flexibilidade de uso.",
    image: "./assets/images/minivan.png",
  },
  {
    id: "vans",
    label: "Vans",
    description: "Transporte de equipes e volumes maiores com segurança, organização e eficiência.",
    image: "./assets/images/vans.jpg",
  },
  {
    id: "eletricos",
    label: "Elétricos",
    description: "Mobilidade moderna com menor impacto ambiental e foco em eficiência energética.",
    image: "./assets/images/eletrico.jpg",
  },
];

const categoryById = new Map(categories.map((c) => [c.id, c]));

function mod(n, m) {
  return ((n % m) + m) % m;
}

function setCategoryActiveStyles(tab, isActive) {
  // borda/realce
  tab.classList.toggle("border-alfagreen-600", isActive);
  tab.classList.toggle("border-black/10", !isActive);
  tab.classList.toggle("hover:border-alfagreen-500", !isActive);
  tab.classList.toggle("ring-2", isActive);
  tab.classList.toggle("ring-alfagreen-500/20", isActive);
}

function setCategory(id, { focusTab = false } = {}) {
  const data = categoryById.get(id);
  if (
    !data ||
    !categoryTabsRoot ||
    !categoryPanel ||
    !categoryImage ||
    !categoryTitle ||
    !categoryDescription ||
    !categoryImagePlaceholder
  )
    return;

  const tabs = $$("[data-category]", categoryTabsRoot);
  const activeTab = tabs.find((t) => t.dataset.category === id) || tabs[0];

  tabs.forEach((tab) => {
    const isActive = tab.dataset.category === id;
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
    setCategoryActiveStyles(tab, isActive);
    // ícone/texto mais vivo quando ativo
    const iconWrap = tab.querySelector("span[aria-hidden='true']");
    if (iconWrap) {
      iconWrap.classList.toggle("text-alfagreen-600", isActive);
      iconWrap.classList.toggle("text-alfagray-800/60", !isActive);
    }
  });

  // Atualiza aria-labelledby do painel para o tab ativo
  if (activeTab?.id) categoryPanel.setAttribute("aria-labelledby", activeTab.id);

  function showPlaceholder() {
    categoryImage.classList.remove("opacity-100");
    categoryImage.classList.add("opacity-0");
    categoryImagePlaceholder.classList.remove("hidden");
  }
  function showImage() {
    categoryImagePlaceholder.classList.add("hidden");
    categoryImage.classList.remove("opacity-0");
    categoryImage.classList.add("opacity-100");
  }

  const updateContent = () => {
    // Por padrão, tentamos carregar um arquivo em assets/categories/<id>.png
    // Se o arquivo ainda não existir, exibimos um placeholder neutro.
    showPlaceholder();

    // remove handlers anteriores (evita múltiplos disparos)
    categoryImage.onload = null;
    categoryImage.onerror = null;

    // Define handlers ANTES do src (evita race com cache)
    categoryImage.onload = () => showImage();
    categoryImage.onerror = () => showPlaceholder();

    categoryImage.alt = `Categoria ${data.label}`;
    categoryImage.src = data.image;
    categoryTitle.textContent = data.label;
    categoryDescription.textContent = data.description;
  };

  updateContent();

  if (focusTab && activeTab) activeTab.focus();
}

function getActiveCategoryIndex() {
  const tabs = categoryTabsRoot ? $$("[data-category]", categoryTabsRoot) : [];
  const active = tabs.find((t) => t.getAttribute("aria-selected") === "true");
  const id = active?.dataset.category;
  const idx = categories.findIndex((c) => c.id === id);
  return idx >= 0 ? idx : 0;
}

function goRelative(delta, { focusTab = false } = {}) {
  const idx = getActiveCategoryIndex();
  const nextIdx = mod(idx + delta, categories.length);
  setCategory(categories[nextIdx].id, { focusTab });
}

if (categoryTabsRoot) {
  // Clique nos tabs
  $$("[data-category]", categoryTabsRoot).forEach((tab) => {
    tab.addEventListener("click", () => setCategory(tab.dataset.category, { focusTab: false }));
  });

  // Teclado: setas/Home/End
  categoryTabsRoot.addEventListener("keydown", (e) => {
    if (!(e instanceof KeyboardEvent)) return;
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    if (e.key === "ArrowLeft") goRelative(-1, { focusTab: true });
    if (e.key === "ArrowRight") goRelative(1, { focusTab: true });
    if (e.key === "Home") setCategory(categories[0].id, { focusTab: true });
    if (e.key === "End") setCategory(categories[categories.length - 1].id, { focusTab: true });
  });
}

categoryPrev?.addEventListener("click", () => goRelative(-1));
categoryNext?.addEventListener("click", () => goRelative(1));

// Estado inicial garantido
setCategory("leves");

// Animated counters
function animateNumber(el, to, { durationMs = 900, prefix = "", suffix = "" } = {}) {
  const start = 0;
  const startTs = performance.now();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const step = (ts) => {
    const p = clamp((ts - startTs) / durationMs, 0, 1);
    const v = Math.round(start + (to - start) * easeOutCubic(p));
    el.textContent = `${prefix}${v}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counters = $$(".counter");
let countersStarted = false;
const numbersSection = $("#numeros");

function startCounters() {
  if (countersStarted) return;
  countersStarted = true;
  counters.forEach((el) => {
    const target = Number(el.getAttribute("data-target") || "0");
    const prefix = el.getAttribute("data-prefix") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    animateNumber(el, target, { prefix, suffix });
  });
}

if (!prefersReducedMotion && "IntersectionObserver" in window && numbersSection) {
  const counterObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounters();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );
  counterObserver.observe(numbersSection);
} else {
  startCounters();
}

// Form validation (basic)
const form = $("#contactForm");
const formStatus = $("#formStatus");

// ========== EmailJS: configure aqui (nada no index.html) ==========
const EMAILJS_CONFIG = {
  serviceId: "service_b97oe9l", // ex: "service_xxxxx"
  templateId: "template_c9zedfd", // ex: "template_xxxxx"
  publicKey: "noD_ONFnS99jb8jFX", // ex: "xxxxxxxxxxxx"
  recaptchaSiteKey: "6Lca014sAAAAACpbefTZYE9FIOf-YsAQdS3L4YsN", // opcional: preencha para ativar reCAPTCHA v2
};
// ===================================================================

function setFieldError(name, show) {
  const msg = document.querySelector(`[data-error-for="${name}"]`);
  if (!msg) return;
  msg.classList.toggle("hidden", !show);
}

const validators = {
  nome: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  telefone: (v) => v.trim().length >= 8,
  assunto: (v) => v.trim().length > 0,
  mensagem: (v) => v.trim().length >= 10,
};

function setError(fieldId, show) {
  const msg = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (!msg) return;
  msg.classList.toggle("hidden", !show);
}

function validateField(id) {
  const el = document.getElementById(id);
  if (!el) return true;
  const val = el.value ?? "";
  const ok = validators[id] ? validators[id](val) : true;
  setError(id, !ok);
  el.classList.toggle("border-red-500", !ok);
  el.classList.toggle("focus:border-red-500", !ok);
  return ok;
}

["nome", "email", "telefone", "assunto", "mensagem"].forEach((id) => {
  document.getElementById(id)?.addEventListener("blur", () => validateField(id));
  document.getElementById(id)?.addEventListener("input", () => validateField(id));
});

function isPlaceholder(v) {
  return typeof v !== "string" || !v.trim();
}

function setupRecaptchaUi() {
  const wrap = document.getElementById("recaptchaWrap");
  const widget = wrap?.querySelector(".g-recaptcha");
  const siteKey = (EMAILJS_CONFIG.recaptchaSiteKey || "").trim();
  if (!wrap || !widget) return;

  if (!siteKey) {
    wrap.classList.add("hidden");
    widget.setAttribute("data-sitekey", "");
    return;
  }
  widget.setAttribute("data-sitekey", siteKey);
  wrap.classList.remove("hidden");
  // Carrega o script do reCAPTCHA se ainda não estiver na página
  if (!document.querySelector('script[src*="google.com/recaptcha"]')) {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js";
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }
}

setupRecaptchaUi();

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fields = ["nome", "email", "telefone", "assunto", "mensagem"];
  const allOk = fields.map(validateField).every(Boolean);

  if (!allOk) {
    formStatus.textContent = "Revise os campos destacados para enviar.";
    formStatus.classList.remove("hidden");
    return;
  }

  // Honeypot: se preenchido, ignora silenciosamente (anti-bot básico)
  const honey = (form.querySelector('input[name="_honey"]')?.value || "").trim();
  if (honey) {
    form.reset();
    formStatus.textContent = "Mensagem enviada com sucesso. Em breve, nossa equipe entrará em contato.";
    formStatus.classList.remove("hidden");
    return;
  }

  // reCAPTCHA v2 (opcional): se configurado em EMAILJS_CONFIG
  const recaptchaSiteKey = (EMAILJS_CONFIG.recaptchaSiteKey || "").trim();
  const captchaEnabled = Boolean(recaptchaSiteKey);
  if (captchaEnabled) {
    const token = window.grecaptcha?.getResponse?.() || "";
    const ok = token.length > 0;
    setFieldError("recaptcha", !ok);
    if (!ok) {
      formStatus.textContent = "Confirme o CAPTCHA para enviar.";
      formStatus.classList.remove("hidden");
      return;
    }
  }

  const { serviceId, templateId, publicKey } = EMAILJS_CONFIG;
  if (isPlaceholder(serviceId) || isPlaceholder(templateId) || isPlaceholder(publicKey)) {
    formStatus.textContent =
      "Configure EmailJS em js/main.js (EMAILJS_CONFIG: serviceId, templateId, publicKey) para o envio funcionar.";
    formStatus.classList.remove("hidden");
    return;
  }

  if (!window.emailjs?.sendForm) {
    formStatus.textContent = "EmailJS não carregou. Recarregue a página e tente novamente.";
    formStatus.classList.remove("hidden");
    return;
  }

  try {
    formStatus.textContent = "Enviando...";
    formStatus.classList.remove("hidden");

    // init pode ser chamado múltiplas vezes; mantemos simples e idempotente
    window.emailjs.init({ publicKey });

    await window.emailjs.sendForm(serviceId, templateId, form);

    formStatus.textContent = "Mensagem enviada com sucesso. Em breve, nossa equipe entrará em contato.";
    form.reset();
    fields.forEach((id) => setError(id, false));
    setFieldError("recaptcha", false);
    if (captchaEnabled && window.grecaptcha?.reset) window.grecaptcha.reset();
  } catch (err) {
    console.error(err);
    formStatus.textContent =
      "Não foi possível enviar agora. Tente novamente em instantes ou use outro canal de contato.";
    formStatus.classList.remove("hidden");
  }
});

// Lucide: renderiza todos os ícones data-lucide
function renderLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderLucideIcons);
} else {
  renderLucideIcons();
}

// fallback: tenta novamente após o load (CDN lento)
window.addEventListener("load", renderLucideIcons);

