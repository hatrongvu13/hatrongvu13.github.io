/*
 * Vu Ha Trong Portfolio
 * app.js: application bootstrap, theme, navigation and GSAP animations
 * Requires: i18n.js, renderer.js, roadmap.js, github.js, contact.js
 * Optional: GSAP and ScrollTrigger from CDN
 */

(() => {
  "use strict";

  const STORAGE_THEME_KEY = "vht-portfolio-theme";
  const LIGHT_CLASS = "light";
  const ACTIVE_CLASS = "active";
  const GSAP_READY_CLASS = "gsap-ready";
  const MOBILE_BREAKPOINT = 880;

  let initialized = false;
  let navigationObserver = null;
  let gsapContext = null;
  let backToTopButton = null;
  let animationVersion = 0;

  function byId(id) {
    return document.getElementById(id);
  }

  function queryAll(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[app] Unable to read ${key}.`, error);
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[app] Unable to save ${key}.`, error);
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
  }

  function getStoredTheme() {
    const stored = storageGet(STORAGE_THEME_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  }

  function getSystemTheme() {
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  function getCurrentTheme() {
    return document.body.classList.contains(LIGHT_CLASS) ? "light" : "dark";
  }

  function updateThemeMeta(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === "light" ? "#f4f6f9" : "#0b1220";
    }
  }

  function updateThemeButton(theme = getCurrentTheme()) {
    const button = byId("theme-btn");
    if (!button) return;

    const isLight = theme === "light";
    const label = typeof window.t === "function"
      ? window.t("themeButtonLabel")
      : "Đổi giao diện sáng tối";

    button.innerHTML = `<span aria-hidden="true">${isLight ? "☀" : "☾"}</span>`;
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(isLight));
    button.dataset.theme = theme;
  }

  function applyTheme(theme, options = {}) {
    const { persist = true, emit = true } = options;
    const normalized = theme === "light" ? "light" : "dark";
    const previousTheme = getCurrentTheme();

    document.body.classList.toggle(LIGHT_CLASS, normalized === "light");
    document.documentElement.style.colorScheme = normalized;
    updateThemeMeta(normalized);
    updateThemeButton(normalized);

    if (persist) {
      storageSet(STORAGE_THEME_KEY, normalized);
    }

    if (emit && previousTheme !== normalized) {
      document.dispatchEvent(
        new CustomEvent("themeChanged", {
          detail: { theme: normalized, previousTheme }
        })
      );
    }

    return normalized;
  }

  function toggleTheme() {
    return applyTheme(getCurrentTheme() === "light" ? "dark" : "light");
  }

  function initializeTheme() {
    applyTheme(getStoredTheme() || getSystemTheme(), {
      persist: Boolean(getStoredTheme()),
      emit: false
    });

    const button = byId("theme-btn");
    if (button && button.dataset.appBound !== "true") {
      button.addEventListener("click", toggleTheme);
      button.dataset.appBound = "true";
    }

    const media = window.matchMedia?.("(prefers-color-scheme: light)");
    if (media && typeof media.addEventListener === "function") {
      media.addEventListener("change", (event) => {
        if (!getStoredTheme()) {
          applyTheme(event.matches ? "light" : "dark", {
            persist: false,
            emit: true
          });
        }
      });
    }
  }

  function samePageHashLink(anchor) {
    const href = anchor.getAttribute("href");
    return typeof href === "string" && href.startsWith("#") && href.length > 1;
  }

  function initializeSmoothScroll() {
    if (document.documentElement.dataset.smoothScrollBound === "true") return;

    document.addEventListener("click", (event) => {
      const anchor = event.target.closest('a[href^="#"]');
      if (!anchor || !samePageHashLink(anchor)) return;

      const targetId = decodeURIComponent(anchor.hash.slice(1));
      const target = byId(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });

      if (history.pushState) {
        history.pushState(null, "", `#${encodeURIComponent(targetId)}`);
      }
    });

    document.documentElement.dataset.smoothScrollBound = "true";
  }

  function setActiveNavigation(sectionId) {
    queryAll('.nav-menu a[href^="#"]').forEach((link) => {
      const active = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle(ACTIVE_CLASS, active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function initializeActiveNavigation() {
    navigationObserver?.disconnect();

    const links = queryAll('.nav-menu a[href^="#"]');
    const sections = links
      .map((link) => byId(link.hash.slice(1)))
      .filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    navigationObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          setActiveNavigation(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0, 0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => navigationObserver.observe(section));
  }

  function createBackToTopButton() {
    if (backToTopButton || byId("back-to-top")) {
      backToTopButton = byId("back-to-top");
      return;
    }

    const button = document.createElement("button");
    button.id = "back-to-top";
    button.className = "btn btn-primary";
    button.type = "button";
    button.textContent = "↑";
    button.setAttribute("aria-label", "Về đầu trang");
    button.setAttribute("title", "Về đầu trang");
    button.hidden = true;

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    });

    document.body.appendChild(button);
    backToTopButton = button;
  }

  function updateBackToTopVisibility() {
    if (!backToTopButton) return;

    const shouldShow = window.scrollY > Math.max(520, window.innerHeight * 0.72);
    backToTopButton.hidden = !shouldShow;
    backToTopButton.setAttribute("aria-hidden", String(!shouldShow));
  }

  function initializeBackToTop() {
    createBackToTopButton();
    updateBackToTopVisibility();

    if (document.body.dataset.backToTopBound === "true") return;

    let scheduled = false;
    window.addEventListener(
      "scroll",
      () => {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
          updateBackToTopVisibility();
          scheduled = false;
        });
      },
      { passive: true }
    );

    document.body.dataset.backToTopBound = "true";
  }

  function gsapAvailable() {
    return Boolean(window.gsap && window.ScrollTrigger);
  }

  function revealWithoutGsap() {
    document.documentElement.classList.remove(GSAP_READY_CLASS);
    queryAll(".gsap-reveal, .gsap-card").forEach((element) => {
      element.style.removeProperty("opacity");
      element.style.removeProperty("transform");
      element.style.removeProperty("visibility");
    });
  }

  function killGsapAnimations() {
    gsapContext?.revert?.();
    gsapContext = null;

    if (window.ScrollTrigger?.getAll) {
      window.ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    }
  }

  function initializeGsapAnimations() {
    animationVersion += 1;
    const currentVersion = animationVersion;

    if (!gsapAvailable() || prefersReducedMotion()) {
      killGsapAnimations();
      revealWithoutGsap();
      return;
    }

    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    killGsapAnimations();

    document.documentElement.classList.add(GSAP_READY_CLASS);

    gsapContext = gsap.context(() => {
      const heroElements = queryAll("#hero .gsap-reveal");
      if (heroElements.length) {
        gsap.set(heroElements, { autoAlpha: 1 });
        gsap.from(heroElements, {
          autoAlpha: 0,
          y: 24,
          duration: 0.75,
          stagger: 0.12,
          ease: "power2.out",
          clearProps: "transform,opacity,visibility"
        });
      }

      queryAll("main section:not(#hero)").forEach((section) => {
        const staticReveal = queryAll(":scope > .container .gsap-reveal", section);
        if (staticReveal.length) {
          gsap.set(staticReveal, { autoAlpha: 1 });
          gsap.from(staticReveal, {
            autoAlpha: 0,
            y: 18,
            duration: 0.62,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true
            },
            clearProps: "transform,opacity,visibility"
          });
        }
      });

      queryAll(".gsap-card").forEach((card) => {
        gsap.from(card, {
          autoAlpha: 0,
          y: 16,
          duration: 0.52,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          },
          clearProps: "transform,opacity,visibility"
        });
      });

      queryAll(".skill-progress-fill").forEach((bar) => {
        const targetWidth = bar.style.width || getComputedStyle(bar).width;
        gsap.fromTo(
          bar,
          { width: 0 },
          {
            width: targetWidth,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bar,
              start: "top 92%",
              once: true
            }
          }
        );
      });
    }, document.body);

    if (currentVersion === animationVersion) {
      window.requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }

  function scheduleGsapRefresh() {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(initializeGsapAnimations);
    });
  }

  function initializeExternalLinkProtection() {
    queryAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      link.setAttribute("rel", [...rel].join(" "));
    });
  }

  function updateLanguageDependentControls() {
    updateThemeButton();

    if (backToTopButton) {
      const vietnamese = (window.LanguageManager?.getLanguage?.() || "vi") === "vi";
      const label = vietnamese ? "Về đầu trang" : "Back to top";
      backToTopButton.setAttribute("aria-label", label);
      backToTopButton.setAttribute("title", label);
    }
  }

  function bindApplicationEvents() {
    if (document.documentElement.dataset.appEventsBound === "true") return;

    document.addEventListener("portfolioRendered", () => {
      initializeExternalLinkProtection();
      initializeActiveNavigation();
      scheduleGsapRefresh();
    });

    document.addEventListener("roadmapRendered", scheduleGsapRefresh);

    document.addEventListener("languageChanged", () => {
      updateLanguageDependentControls();
      initializeActiveNavigation();
    });

    document.addEventListener("themeChanged", () => {
      window.ScrollTrigger?.refresh?.();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        updateBackToTopVisibility();
      }
      window.ScrollTrigger?.refresh?.();
    }, { passive: true });

    window.addEventListener("pageshow", () => {
      updateBackToTopVisibility();
      window.ScrollTrigger?.refresh?.();
    });

    document.documentElement.dataset.appEventsBound = "true";
  }

  function showDeveloperBanner() {
    console.info(
      "%cVHT.dev%c Java Backend · System Architecture",
      "color:#c97830;font-weight:700;font-family:monospace",
      "color:#9aa8ba;font-family:monospace"
    );
  }

  function initialize() {
    if (initialized) return;
    initialized = true;

    initializeTheme();
    initializeSmoothScroll();
    initializeActiveNavigation();
    initializeBackToTop();
    initializeExternalLinkProtection();
    bindApplicationEvents();
    updateLanguageDependentControls();
    showDeveloperBanner();

    // The renderer may already have completed before app.js initializes.
    if (window.PORTFOLIO?.getData?.()) {
      scheduleGsapRefresh();
    } else if (!gsapAvailable()) {
      revealWithoutGsap();
    }

    document.dispatchEvent(
      new CustomEvent("appReady", {
        detail: {
          theme: getCurrentTheme(),
          gsapAvailable: gsapAvailable(),
          reducedMotion: prefersReducedMotion()
        }
      })
    );
  }

  window.App = Object.freeze({
    start: initialize,
    theme: Object.freeze({
      get: getCurrentTheme,
      set: applyTheme,
      toggle: toggleTheme
    }),
    navigation: Object.freeze({
      refresh: initializeActiveNavigation,
      setActive: setActiveNavigation
    }),
    animations: Object.freeze({
      refresh: scheduleGsapRefresh,
      disable: revealWithoutGsap,
      available: gsapAvailable
    })
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
