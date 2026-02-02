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
    image: "./assets/images/ambulancia-uti.jpg",
  },
  {
    id: "ambulancia-resgate",
    label: "Ambulância Tipo Resgate Equipada",
    description: "Suporte para remoções e atendimentos com agilidade, com equipamentos adequados ao perfil assistencial.",
    image: "./assets/images/ambulancia-resgate.jpg",
  },
  {
    id: "van-operacional",
    label: "Van Operacional Especial",
    description: "Veículos para apoio operacional e logística de equipes, com configuração conforme demanda do cliente.",
    image: "./assets/images/van-operacional.jpg",
  },
  {
    id: "monitores",
    label: "Monitores para Apoio",
    description: "Equipamentos de monitoramento para suporte às operações de saúde móvel e atendimentos especializados.",
    image: "./assets/images/monitores.jpg",
  },
  {
    id: "motolancias",
    label: "Motolâncias",
    description: "Resposta rápida para apoio em atendimentos e deslocamentos, com agilidade em áreas de difícil acesso.",
    image: "./assets/images/motolancias.jpg",
  },
  {
    id: "motocicletas",
    label: "Motocicletas",
    description: "Apoio logístico e operacional com mobilidade elevada, reduzindo tempo de resposta em rotinas críticas.",
    image: "./assets/images/motocicletas.jpg",
  },
  {
    id: "minivan",
    label: "Minivan",
    description: "Conforto e praticidade para transporte de equipes e deslocamentos corporativos, com flexibilidade de uso.",
    image: "./assets/images/minivan.jpg",
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

// Se voltar do FormSubmit com ?sent=1, mostra confirmação
if (formStatus) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("sent") === "1") {
    formStatus.textContent = "Mensagem enviada com sucesso. Em breve, nossa equipe entrará em contato.";
    formStatus.classList.remove("hidden");
  }
}

const validators = {
  nome: (v) => v.trim().length >= 2,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  telefone: (v) => v.trim().length >= 8,
  assunto: (v) => v.trim().length > 0,
  mensagem: (v) => v.trim().length >= 10,
};

function ensureHiddenInput(formEl, name, value) {
  if (!formEl) return;
  let input = formEl.querySelector(`input[type="hidden"][name="${CSS.escape(name)}"]`);
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    formEl.appendChild(input);
  }
  input.value = value;
}

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

// Se você estiver usando FormSubmit via HTML (form action="https://formsubmit.co/..."),
// não precisamos interceptar o submit no JS.
const formsubmitEmailFromDataset = (form?.dataset?.formsubmitEmail || "").trim();
const shouldInterceptSubmit = Boolean(formsubmitEmailFromDataset);

shouldInterceptSubmit &&
  form?.addEventListener("submit", async (e) => {
  const fields = ["nome", "email", "telefone", "assunto", "mensagem"];
  const allOk = fields.map(validateField).every(Boolean);

  if (!allOk) {
    e.preventDefault();
    formStatus.textContent = "Revise os campos destacados para enviar.";
    formStatus.classList.remove("hidden");
    return;
  }

  // Integração opcional com FormSubmit:
  // - defina o atributo data-formsubmit-email com o e-mail de destino (ex.: "contato@suaempresa.com.br")
  // - modo "redirect" usa o POST padrão (com reCAPTCHA do FormSubmit)
  // - modo "ajax" envia via fetch para o endpoint AJAX do FormSubmit (sem sair da página)
  const destinationEmail = (form.dataset.formsubmitEmail || "").trim();
  const submitMode = (form.dataset.formsubmitMode || "ajax").trim().toLowerCase();

  if (!destinationEmail || destinationEmail === "SEU_EMAIL_AQUI") {
    e.preventDefault();
    formStatus.textContent = 'Configure o e-mail em data-formsubmit-email (no index.html) para o envio funcionar.';
    formStatus.classList.remove("hidden");
    return;
  }

  if (submitMode === "redirect") {
    e.preventDefault();
    formStatus.textContent = "Abrindo verificação de segurança…";
    formStatus.classList.remove("hidden");

    // Configura envio padrão para FormSubmit (com reCAPTCHA)
    form.action = `https://formsubmit.co/${encodeURIComponent(destinationEmail)}`;
    form.method = "POST";

    // Voltar para a página após enviar
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("sent", "1");
    nextUrl.hash = "contato";
    ensureHiddenInput(form, "_next", nextUrl.toString());

    // Reforça subject/template caso não existam no HTML
    ensureHiddenInput(form, "_subject", "Contato - Landing ALFACAR");
    ensureHiddenInput(form, "_template", "table");

    form.submit();
    return;
  }

  // submitMode === "ajax"
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  if (destinationEmail) {
    try {
      e.preventDefault();
      formStatus.textContent = "Enviando..."; // feedback imediato
      formStatus.classList.remove("hidden");

      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destinationEmail)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...payload,
          _subject: "Contato - Landing ALFACAR",
        }),
      });

      if (!res.ok) throw new Error("Falha ao enviar.");
      formStatus.textContent = "Mensagem enviada com sucesso. Em breve, nossa equipe entrará em contato.";
      form.reset();
      fields.forEach((id) => setError(id, false));
    } catch (err) {
      console.error(err);
      formStatus.textContent =
        "Não foi possível enviar agora. Tente novamente em instantes ou use outro canal de contato.";
      formStatus.classList.remove("hidden");
    }
    return;
  }

  // Sem backend por padrão: exibe confirmação (demo)
  e.preventDefault();
  const payloadDemo = Object.fromEntries(new FormData(form).entries());
  console.debug("Contato (demo):", payloadDemo);
  formStatus.textContent = "Mensagem registrada. Em breve, nossa equipe entrará em contato.";
  formStatus.classList.remove("hidden");
  form.reset();
  fields.forEach((id) => setError(id, false));
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

