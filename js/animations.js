/*
==================================
animations.js
GSAP Motion Layer (optional, progressive-enhancement)
==================================

Design goals:
- NEVER block content. If GSAP fails to load or the user prefers reduced
  motion, elements stay fully visible (no hidden-forever bug).
- Config-driven: read data.json -> settings.motion to enable/disable and
  pick a preset, so you tune it without touching code.
- Subtle and senior-looking: short distances, soft easing, staggered reveals,
  a restrained hero intro and a thin scroll-progress bar.
==================================
*/

(() => {
    "use strict";

    const DEFAULTS = Object.freeze({
        enabled: true,
        preset: "subtle",        // "subtle" | "smooth" | "off"
        reveal: true,            // scroll-reveal for [.gsap-reveal] and [.gsap-card]
        heroIntro: true,         // staggered hero entrance
        scrollProgress: true,    // thin top progress bar
        stagger: 0.08,
        duration: 0.6,
        distance: 24             // px translateY for reveals
    });

    const PRESETS = {
        subtle: { duration: 0.6, distance: 24, stagger: 0.08, ease: "power2.out" },
        smooth: { duration: 0.9, distance: 40, stagger: 0.12, ease: "power3.out" },
        off: null
    };

    const prefersReduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function readConfig() {
        const fromData =
            window.PORTFOLIO?.getData?.()?.settings?.motion || {};
        return { ...DEFAULTS, ...fromData };
    }

    // If motion is disabled for any reason, make sure marked elements are visible.
    function ensureVisible() {
        document
            .querySelectorAll(".gsap-reveal, .gsap-card")
            .forEach((el) => {
                el.style.opacity = "";
                el.style.transform = "";
            });
    }

    function hasGsap() {
        return typeof window.gsap !== "undefined";
    }

    let built = false;

    function build() {
        const config = readConfig();

        if (
            built ||
            !config.enabled ||
            config.preset === "off" ||
            prefersReduced ||
            !hasGsap()
        ) {
            ensureVisible();
            return;
        }

        built = true;
        const gsap = window.gsap;
        const preset = PRESETS[config.preset] || PRESETS.subtle;
        const hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";

        if (hasScrollTrigger) {
            gsap.registerPlugin(window.ScrollTrigger);
        }

        /* ---- Hero intro ---- */
        if (config.heroIntro) {
            const heroTargets = document.querySelectorAll(
                "#hero .hero-eyebrow, #hero h1, #hero h2, #hero .hero-description, #hero .hero-actions, #hero .social-links, #hero .profile-card"
            );
            if (heroTargets.length) {
                gsap.from(heroTargets, {
                    y: preset.distance,
                    opacity: 0,
                    duration: preset.duration,
                    ease: preset.ease,
                    stagger: preset.stagger,
                    clearProps: "all"
                });
            }
        }

        /* ---- Scroll reveals ---- */
        if (config.reveal && hasScrollTrigger) {
            // Section headings
            gsap.utils.toArray(".gsap-reveal").forEach((el) => {
                gsap.from(el, {
                    y: preset.distance,
                    opacity: 0,
                    duration: preset.duration,
                    ease: preset.ease,
                    clearProps: "all",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none"
                    }
                });
            });

            // Cards -> reveal in staggered batches per grid
            const cards = gsap.utils.toArray(".gsap-card");
            if (cards.length) {
                ScrollTrigger.batch(cards, {
                    start: "top 90%",
                    onEnter: (batch) =>
                        gsap.from(batch, {
                            y: preset.distance,
                            opacity: 0,
                            duration: preset.duration,
                            ease: preset.ease,
                            stagger: preset.stagger,
                            clearProps: "all",
                            overwrite: true
                        })
                });
            }
        } else if (config.reveal) {
            ensureVisible();
        }

        /* ---- Scroll progress bar ---- */
        if (config.scrollProgress && hasScrollTrigger) {
            let bar = document.getElementById("scroll-progress");
            if (!bar) {
                bar = document.createElement("div");
                bar.id = "scroll-progress";
                document.body.appendChild(bar);
            }
            gsap.to(bar, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.3
                }
            });
        }

        if (hasScrollTrigger) {
            // Content is injected async; recalc trigger positions after paint.
            requestAnimationFrame(() => ScrollTrigger.refresh());
        }
    }

    // Build after the portfolio finishes rendering its dynamic content.
    document.addEventListener("portfolioRendered", () => {
        // Reset flag so a re-render (language switch) re-arms cleanly.
        built = false;
        // Kill old triggers to avoid duplicates on re-render.
        if (typeof window.ScrollTrigger !== "undefined") {
            window.ScrollTrigger.getAll().forEach((t) => t.kill());
        }
        build();
    });

    // Fallback: if the event never fires (data error), don't leave things hidden.
    window.addEventListener("load", () => {
        setTimeout(ensureVisible, 1500);
    });

    window.MotionLayer = Object.freeze({ build, ensureVisible });
})();
