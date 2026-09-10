/*
==================================
app.js
Application Bootstrap
==================================
*/

const App = (() => {

    /*
    ==================================
    Constants
    ==================================
    */

    const STORAGE_THEME =
        "portfolio-theme";

    const STORAGE_MODE =
        "portfolio-mode";

    /*
    ==================================
    Helpers
    ==================================
    */

    function $(selector) {

        return document.querySelector(
            selector
        );
    }

    function $$(selector) {

        return document.querySelectorAll(
            selector
        );
    }

    /*
    ==================================
    Theme Manager
    ==================================
    */

    const ThemeManager = {

        init() {

            this.restoreMode();

            this.bindModeButton();
        },

        restoreMode() {

            const mode =
                localStorage.getItem(
                    STORAGE_MODE
                );

            if (mode === "light") {

                document.body.classList.add(
                    "light"
                );
            }
        },

        toggleMode() {

            document.body.classList.toggle(
                "light"
            );

            const isLight =
                document.body.classList.contains(
                    "light"
                );

            localStorage.setItem(
                STORAGE_MODE,
                isLight
                    ? "light"
                    : "dark"
            );
        },

        bindModeButton() {

            const btn =
                document.getElementById(
                    "theme-btn"
                );

            if (!btn) {
                return;
            }

            btn.addEventListener(
                "click",
                () => {
                    this.toggleMode();
                    btn.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
                }
            );

        }

    };

    /*
    ==================================
    Theme Color Presets
    ==================================
    */

    const ThemePresetManager = {

        set(themeName) {

            document.body.classList.remove(
                "theme-green",
                "theme-violet",
                "theme-amber",
                "theme-java"
            );

            if (
                themeName &&
                themeName !== "cyan"
            ) {

                document.body.classList.add(
                    `theme-${themeName}`
                );
            }

            localStorage.setItem(
                STORAGE_THEME,
                themeName
            );
        },

        restore() {

            const saved =
                localStorage.getItem(
                    STORAGE_THEME
                );

            if (saved) {

                this.set(saved);
            }
        }
    };

    /*
    ==================================
    Smooth Scroll
    ==================================
    */

    function initializeNavigation() {

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(link => {

                link.addEventListener(
                    "click",
                    event => {

                        const href =
                            link.getAttribute(
                                "href"
                            );

                        if (
                            href === "#"
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(
                                href
                            );

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({

                            behavior: "smooth",

                            block: "start"
                        });
                    }
                );
            });
    }

    /*
    ==================================
    Navigation Highlight
    ==================================
    */

    function initializeActiveNavigation() {

        const sections =
            document.querySelectorAll(
                "section[id]"
            );

        const navLinks =
            document.querySelectorAll(
                '.nav-menu a[href^="#"]'
            );

        if (
            !sections.length ||
            !navLinks.length
        ) {

            return;
        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                !entry.isIntersecting
                            ) {

                                return;
                            }

                            const id =
                                entry.target.id;

                            navLinks.forEach(
                                link => {

                                    link.classList.remove(
                                        "active"
                                    );

                                    if (
                                        link.getAttribute(
                                            "href"
                                        ) ===
                                        `#${id}`
                                    ) {

                                        link.classList.add(
                                            "active"
                                        );
                                    }
                                }
                            );
                        }
                    );
                },
                {
                    threshold: 0.25
                }
            );

        sections.forEach(
            section =>
                observer.observe(
                    section
                )
        );
    }

    /*
    ==================================
    Runtime Site Setup
    ==================================
    */

    function initializeRuntimeSettings() {

        const data =
            window.PORTFOLIO?.getData();

        if (!data) {
            return;
        }

        document.title =
            data.settings.siteTitle;

        document.documentElement.lang =
            data.settings.defaultLanguage ||
            "vi";
    }

    /*
    ==================================
    Back To Top
    ==================================
    */

    function createBackToTopButton() {

        const button =
            document.createElement(
                "button"
            );

        button.id =
            "back-to-top";

        button.className =
            "btn btn-primary";

        button.innerHTML =
            "↑";

        button.style.position =
            "fixed";

        button.style.right =
            "20px";

        button.style.bottom =
            "20px";

        button.style.zIndex =
            "9999";

        button.style.display =
            "none";

        document.body.appendChild(
            button
        );

        window.addEventListener(
            "scroll",
            () => {

                button.style.display =
                    window.scrollY > 500
                        ? "flex"
                        : "none";
            }
        );

        button.addEventListener(
            "click",
            () => {

                window.scrollTo({

                    top: 0,

                    behavior:
                        "smooth"
                });
            }
        );
    }

    /*
    ==================================
    Developer Console Banner
    ==================================
    */

    function showDeveloperBanner() {

        console.log(`

======================================
Vu Ha Trong Portfolio
======================================

Java Backend Developer
Spring Boot
System Design
Architecture
Content Creator

======================================

        `);
    }

    /*
    ==================================
    App Ready
    ==================================
    */

    function onPortfolioRendered() {

        initializeRuntimeSettings();
    }

    /*
    ==================================
    Global Events
    ==================================
    */

    function bindEvents() {

        document.addEventListener(
            "portfolioRendered",
            () => {

                onPortfolioRendered();
            }
        );

        document.addEventListener(
            "languageChanged",
            () => {

                initializeRuntimeSettings();
            }
        );
    }

    /*
    ==================================
    Startup
    ==================================
    */

    function start() {

        ThemeManager.init();

        ThemePresetManager.restore();

        initializeNavigation();

        initializeActiveNavigation();

        createBackToTopButton();

        bindEvents();

        // showDeveloperBanner();
    }

    return {

        start,

        theme:
        ThemeManager,

        presets:
        ThemePresetManager
    };

})();

/*
==================================
Document Ready
==================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.start();
    }
);

/*
==================================
Global
==================================
*/

window.App = App;