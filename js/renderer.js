/*
 * Vu Ha Trong Portfolio
 * renderer.js: load, validate and render data/data.json
 * Requires i18n.js to be loaded first.
 */

(() => {
    "use strict";

    const DATA_URL = "./data/data.json";
    const state = {
        data: null,
        loading: false,
        error: null
    };

    const SOCIAL_NETWORKS = Object.freeze([
        { key: "github", elementId: "github-link", label: "GitHub" },
        { key: "linkedin", elementId: "linkedin-link", label: "LinkedIn" },
        { key: "youtube", elementId: "youtube-link", label: "YouTube" },
        { key: "facebook", elementId: "facebook-link", label: "Facebook" },
        { key: "tiktok", elementId: "tiktok-link", label: "TikTok" }
    ]);

    function byId(id) {
        return document.getElementById(id);
    }

    function asArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function asObject(value) {
        return value && typeof value === "object" && !Array.isArray(value)
            ? value
            : {};
    }

    function asText(value, fallback = "") {
        if (value === null || value === undefined) {
            return fallback;
        }
        return String(value);
    }

    function localized(value) {
        if (typeof window.resolveLanguageValue === "function") {
            return window.resolveLanguageValue(value);
        }

        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value.vi ?? value.en ?? "";
        }

        return value ?? "";
    }

    function translate(key, fallback = key) {
        return typeof window.t === "function" ? window.t(key) : fallback;
    }

    function clear(element) {
        if (element) {
            element.replaceChildren();
        }
    }

    function create(tagName, options = {}) {
        const element = document.createElement(tagName);

        if (options.className) {
            element.className = options.className;
        }
        if (options.text !== undefined) {
            element.textContent = asText(options.text);
        }
        if (options.attributes) {
            Object.entries(options.attributes).forEach(([name, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    element.setAttribute(name, asText(value));
                }
            });
        }

        return element;
    }

    function appendTextElement(parent, tagName, text, className = "") {
        const element = create(tagName, { className, text });
        parent.appendChild(element);
        return element;
    }

    function isSafeHttpUrl(value) {
        if (typeof value !== "string" || !value.trim()) {
            return false;
        }

        try {
            const url = new URL(value, window.location.href);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch {
            return false;
        }
    }

    function isSafeAssetPath(value) {
        if (typeof value !== "string" || !value.trim()) {
            return false;
        }

        const trimmed = value.trim();
        if (/^(javascript|data):/i.test(trimmed)) {
            return false;
        }

        try {
            const url = new URL(trimmed, window.location.href);
            return ["http:", "https:", "file:"].includes(url.protocol);
        } catch {
            return false;
        }
    }

    function setOptionalLink(element, url, options = {}) {
        if (!element) {
            return;
        }

        const valid = isSafeHttpUrl(url);
        element.hidden = !valid;
        element.toggleAttribute("aria-hidden", !valid);

        if (!valid) {
            element.removeAttribute("href");
            element.setAttribute("tabindex", "-1");
            return;
        }

        element.href = url.trim();
        element.removeAttribute("tabindex");
        element.setAttribute("target", options.target ?? "_blank");
        element.setAttribute("rel", "noopener noreferrer");
    }

    function setMeta(selector, content) {
        const element = document.querySelector(selector);
        if (element && content) {
            element.setAttribute("content", asText(content));
        }
    }

    function getSocialData(data) {
        const explicitSocial = asObject(data.social);
        const personal = asObject(data.personal);

        return SOCIAL_NETWORKS.reduce((result, network) => {
            result[network.key] = explicitSocial[network.key] || personal[network.key] || "";
            return result;
        }, {});
    }

    function normalizeData(rawData) {
        const data = asObject(rawData);

        return {
            ...data,
            settings: asObject(data.settings),
            personal: asObject(data.personal),
            social: getSocialData(data),
            stats: asArray(data.stats),
            skills: asArray(data.skills),
            experience: asArray(data.experience),
            projects: asArray(data.projects),
            architectures: asArray(data.architectures),
            roadmap: asArray(data.roadmap),
            knowledge: asArray(data.knowledge || data.articles),
            creator: asObject(data.creator),
            community: asObject(data.community),
            contact: asObject(data.contact)
        };
    }

    function validateData(data) {
        const issues = [];

        if (!data.personal.fullName) {
            issues.push("personal.fullName is missing");
        }
        if (!data.personal.role) {
            issues.push("personal.role is missing");
        }
        if (!data.settings.siteTitle) {
            issues.push("settings.siteTitle is missing; fallback SEO title will be used");
        }

        if (issues.length) {
            console.warn("[renderer] data.json validation notes:", issues);
        }

        return issues;
    }

    function renderSeo() {
        const { settings, personal, social } = state.data;
        const role = asText(localized(personal.role), "Senior Java Backend Developer");
        const name = asText(personal.fullName, "Vũ Hà Trọng");
        const title = asText(settings.siteTitle, `${name} | ${role}`);
        const description = asText(
            localized(settings.siteDescription) || localized(personal.summary),
            `${name}, ${role}`
        );

        document.title = title;
        setMeta('meta[name="description"]', description);
        setMeta('meta[property="og:title"]', title);
        setMeta('meta[property="og:description"]', description);
        setMeta('meta[name="twitter:title"]', title);
        setMeta('meta[name="twitter:description"]', description);

        if (settings.siteUrl && isSafeHttpUrl(settings.siteUrl)) {
            setMeta('meta[property="og:url"]', settings.siteUrl);
        }

        const avatar = personal.avatar || settings.avatar || "./assets/avatar/avatar.png";
        if (isSafeAssetPath(avatar)) {
            setMeta('meta[property="og:image"]', avatar);
            setMeta('meta[name="twitter:image"]', avatar);
        }

        const schema = byId("person-schema");
        if (schema) {
            schema.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Person",
                name,
                jobTitle: role,
                description,
                url: isSafeHttpUrl(settings.siteUrl) ? settings.siteUrl : window.location.href,
                image: isSafeAssetPath(avatar)
                    ? new URL(avatar, window.location.href).href
                    : undefined,
                email: personal.email ? `mailto:${personal.email}` : undefined,
                sameAs: Object.values(social).filter(isSafeHttpUrl)
            });
        }
    }

    function getCvConfig(settings = {}) {
        const cv = asObject(settings.cv);
        const mode = cv.mode === "file" ? "file" : "print";

        return {
            mode,
            url: cv.url || settings.cvDownload || settings.cvFile || "",
            fileName: cv.fileName || settings.pdfFileName || "Vu-Ha-Trong-Java-Developer-CV.pdf",
            showAvatar: cv.showAvatar !== false,
            showRoadmap: cv.showRoadmap !== false,
            showProjects: cv.showProjects !== false,
            showArchitecture: cv.showArchitecture !== false,
            showKnowledge: cv.showKnowledge === true,
            showCommunity: cv.showCommunity === true,
            showContact: cv.showContact === true,
            maxProjects: Number.isFinite(Number(cv.maxProjects)) ? Math.max(0, Number(cv.maxProjects)) : 3,
            maxExperience: Number.isFinite(Number(cv.maxExperience)) ? Math.max(0, Number(cv.maxExperience)) : 4,
            paperSize: cv.paperSize || "A4",
            accentColor: cv.accentColor || "java"
        };
    }

    function configureCvAction(settings) {
        const button = byId("download-cv-btn");
        if (!button) return;

        const config = getCvConfig(settings);
        button.hidden = false;
        button.dataset.cvMode = config.mode;
        button.dataset.cvFileName = config.fileName;

        if (config.mode === "file") {
            if (!isSafeAssetPath(config.url)) {
                button.hidden = true;
                button.removeAttribute("href");
                return;
            }
            button.href = config.url;
            button.download = config.fileName;
            button.removeAttribute("role");
            return;
        }

        button.href = "#cv-print";
        button.removeAttribute("download");
        button.setAttribute("role", "button");
    }

    function renderHero() {
        const { settings, personal, social } = state.data;
        const name = asText(personal.fullName, "Vũ Hà Trọng");
        const location = asText(localized(personal.location));

        const nameElement = byId("full-name");
        const profileName = byId("profile-name");
        const role = byId("role");
        const tagline = byId("tagline");
        const profileLocation = byId("profile-location");

        if (nameElement) nameElement.textContent = name;
        if (profileName) profileName.textContent = name;
        if (role) role.textContent = asText(localized(personal.role));
        if (tagline) tagline.textContent = asText(localized(personal.tagline));
        if (profileLocation) profileLocation.textContent = location;

        const avatar = byId("avatar-image");
        const avatarPath = personal.avatar || settings.avatar || "./assets/avatar/avatar.png";
        if (avatar && isSafeAssetPath(avatarPath)) {
            avatar.src = avatarPath;
            avatar.alt = localized(personal.avatarAlt) || `Ảnh đại diện ${name}`;
        }

        configureCvAction(settings);

        SOCIAL_NETWORKS.forEach(({ key, elementId, label }) => {
            const link = byId(elementId);
            if (link) {
                link.textContent = label;
                link.setAttribute("aria-label", label);
            }
            setOptionalLink(link, social[key]);
        });

        const emailLink = byId("contact-email-link");
        if (emailLink && personal.email) {
            emailLink.href = `mailto:${personal.email}`;
            emailLink.textContent = personal.email;
            emailLink.hidden = false;
        } else if (emailLink) {
            emailLink.hidden = true;
        }

        const footerName = byId("footer-name");
        const footerYear = byId("footer-year");
        if (footerName) footerName.textContent = name;
        if (footerYear) footerYear.textContent = String(new Date().getFullYear());
    }

    function renderStats() {
        const container = byId("stats-container");
        if (!container) return;
        clear(container);

        state.data.stats.forEach((stat) => {
            const card = create("article", { className: "stat-card gsap-card" });
            appendTextElement(card, "strong", stat.value ?? "");
            appendTextElement(card, "div", localized(stat.label));
            container.appendChild(card);
        });

        container.hidden = state.data.stats.length === 0;
    }

    function renderSummary() {
        const container = byId("summary");
        if (!container) return;
        clear(container);

        const summary = asText(localized(state.data.personal.summary));
        if (!summary) {
            container.appendChild(create("p", {
                className: "empty-state",
                text: translate("noData", "Chưa có dữ liệu để hiển thị.")
            }));
            return;
        }

        appendTextElement(container, "p", summary);
    }

    function renderSkills() {
        const container = byId("skills-container");
        if (!container) return;
        clear(container);

        state.data.skills.forEach((skillGroup) => {
            const card = create("article", { className: "skill-card gsap-card" });
            const title = skillGroup.group || skillGroup.title || "Technology";
            appendTextElement(card, "h3", localized(title));

            const chipContainer = create("div", { className: "creator-topics" });
            asArray(skillGroup.items).forEach((item) => {
                chipContainer.appendChild(create("span", {
                    className: "chip tech-chip",
                    text: localized(item)
                }));
            });

            card.appendChild(chipContainer);
            container.appendChild(card);
        });

        renderEmptyState(container, state.data.skills);
    }

    function renderExperience() {
        const container = byId("experience-container");
        if (!container) return;
        clear(container);

        state.data.experience.forEach((item) => {
            const article = create("article", { className: "experience-item gsap-card" });
            const period = create("div", {
                className: "experience-period",
                text: item.period || ""
            });
            const content = create("div", { className: "experience-content" });

            appendTextElement(content, "h3", localized(item.role));
            appendTextElement(content, "p", localized(item.company || ""));

            const description = asText(localized(item.description));
            if (description) appendTextElement(content, "p", description);

            const achievements = asArray(localized(item.achievements));
            if (achievements.length) {
                const list = create("ul");
                achievements.forEach((achievement) => {
                    appendTextElement(list, "li", localized(achievement));
                });
                content.appendChild(list);
            }

            article.append(period, content);
            container.appendChild(article);
        });

        renderEmptyState(container, state.data.experience);
    }

    function createProjectAction(url, label, options = {}) {
        if (!isSafeHttpUrl(url)) return null;

        const link = create("a", {
            className: ["project-action", options.className || ""]
                .filter(Boolean)
                .join(" "),
            attributes: {
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                "aria-label": options.ariaLabel || label
            }
        });

        const icon = create("span", {
            className: "project-action-icon",
            attributes: { "aria-hidden": "true" }
        });
        icon.innerHTML = options.icon || "";

        const text = create("span", {
            className: "project-action-text",
            text: label
        });

        link.append(icon, text);
        return link;
    }

    const PROJECT_ACTION_ICONS = Object.freeze({
        source: `
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.4-5.5-5.6 0-1.2.4-2.2 1.2-3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C16.8 6 18 6.3 18 6.3c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3 0 4.2-2.8 5.3-5.5 5.6.4.4.8 1.1.8 2.1v3c0 .4.2.7.8.6A11.3 11.3 0 0 0 12 .7Z"/>
      </svg>`,
        docs: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" focusable="false">
        <path d="M6 2.8h8.5L19 7.3v13.9H6z"/>
        <path d="M14 2.8v5h5M9 12h7M9 16h7"/>
      </svg>`,
        demo: `
      <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
        <path d="M8 5.1v13.8c0 .8.9 1.3 1.6.8l10.2-6.9c.6-.4.6-1.2 0-1.6L9.6 4.3C8.9 3.8 8 4.3 8 5.1Z"/>
      </svg>`
    });

    function renderProjects() {
        const container = byId("project-container");
        if (!container) return;
        clear(container);

        state.data.projects.forEach((project) => {
            const projectName = localized(project.name);
            const card = create("article", {
                className: "project-card gsap-card",
                attributes: project.id ? { id: `project-${project.id}` } : {}
            });

            const status = asText(project.status, "planned").toLowerCase();
            appendTextElement(
                card,
                "div",
                translate(status, status),
                `project-status ${status}`
            );
            appendTextElement(card, "h3", projectName);

            const type = asText(localized(project.type));
            if (type) appendTextElement(card, "small", type, "project-type");

            const description = localized(project.description);
            if (description) appendTextElement(card, "p", description);

            const technologies = asArray(project.tech || project.technologies);
            if (technologies.length) {
                const chips = create("div", {
                    className: "creator-topics project-tech",
                    attributes: { "aria-label": "Technology stack" }
                });
                technologies.forEach((technology) => {
                    chips.appendChild(create("span", {
                        className: "chip",
                        text: localized(technology)
                    }));
                });
                card.appendChild(chips);
            }

            const actions = create("div", {
                className: "card-actions",
                attributes: { "aria-label": `${projectName} actions` }
            });

            const sourceLabel = translate("sourceCode", "Mã nguồn");
            const docsLabel = translate("documentation", "Tài liệu");
            const demoLabel = translate("liveDemo", "Xem demo");

            const sourceLink = createProjectAction(project.source, sourceLabel, {
                className: "project-action-source",
                ariaLabel: `${sourceLabel}: ${projectName}`,
                icon: PROJECT_ACTION_ICONS.source
            });
            const docsLink = createProjectAction(
                project.docs || project.documentation,
                docsLabel,
                {
                    className: "project-action-docs",
                    ariaLabel: `${docsLabel}: ${projectName}`,
                    icon: PROJECT_ACTION_ICONS.docs
                }
            );
            const demoLink = createProjectAction(project.demo, demoLabel, {
                className: "project-action-demo",
                ariaLabel: `${demoLabel}: ${projectName}`,
                icon: PROJECT_ACTION_ICONS.demo
            });

            [sourceLink, docsLink, demoLink]
                .filter(Boolean)
                .forEach((link) => actions.appendChild(link));

            if (actions.childElementCount) {
                card.appendChild(actions);
            }

            container.appendChild(card);
        });

        renderEmptyState(container, state.data.projects);
    }

    function renderArchitectures() {
        const container = byId("architecture-container");
        if (!container) return;
        clear(container);

        state.data.architectures.forEach((architecture) => {
            const card = create("article", { className: "architecture-card gsap-card" });
            appendTextElement(card, "h3", localized(architecture.name));

            if (architecture.level) {
                appendTextElement(card, "small", localized(architecture.level));
            }

            appendTextElement(card, "p", localized(architecture.description));

            const nodes = asArray(architecture.diagram || architecture.nodes);
            if (nodes.length) {
                const diagram = create("div", {
                    className: "architecture-diagram",
                    attributes: { "aria-label": translate("architectureTitle", "Thiết kế hệ thống") }
                });

                nodes.forEach((node, index) => {
                    diagram.appendChild(create("span", {
                        className: "architecture-node",
                        text: localized(node)
                    }));

                    if (index < nodes.length - 1) {
                        diagram.appendChild(create("span", {
                            className: "architecture-arrow",
                            text: "→",
                            attributes: { "aria-hidden": "true" }
                        }));
                    }
                });

                card.appendChild(diagram);
            }

            container.appendChild(card);
        });

        renderEmptyState(container, state.data.architectures);
    }

    function renderKnowledge() {
        const container = byId("knowledge-container");
        if (!container) return;
        clear(container);

        state.data.knowledge.forEach((item) => {
            const card = create("article", { className: "knowledge-card gsap-card" });
            appendTextElement(card, "h3", localized(item.title));
            appendTextElement(card, "p", localized(item.description || item.summary));

            const link = createProjectAction(
                item.link || item.url,
                translate("knowledgeReadMore", "Xem thêm")
            );
            if (link) card.appendChild(link);

            container.appendChild(card);
        });

        renderEmptyState(container, state.data.knowledge);
    }

    function renderCreator() {
        const container = byId("creator-topics");
        if (!container) return;
        clear(container);

        const topics = asArray(state.data.creator.topics);
        topics.forEach((topic) => {
            container.appendChild(create("span", {
                className: "topic-chip",
                text: localized(topic)
            }));
        });

        renderEmptyState(container, topics);
    }

    function renderCommunity() {
        const section = byId("community");
        const container = byId("community-container");
        const title = byId("community-title");
        const description = byId("community-description");
        const community = state.data.community;

        if (!section || !container) return;

        if (community.enabled === false) {
            section.hidden = true;
            return;
        }
        section.hidden = false;

        if (title) {
            title.textContent = asText(
                localized(community.title),
                translate("communityTitle", "Cảm ơn cộng đồng")
            );
        }
        if (description) {
            description.textContent = asText(localized(community.description));
        }

        clear(container);
        const followers = asArray(community.followers);
        followers.forEach((follower) => {
            const card = create("article", { className: "community-card gsap-card" });
            appendTextElement(card, "h4", follower.name || "Anonymous");
            appendTextElement(
                card,
                "div",
                localized(follower.message),
                "community-quote"
            );
            container.appendChild(card);
        });

        renderEmptyState(container, followers, false);
    }

    function renderEmptyState(container, items, show = true) {
        if (!show || asArray(items).length || !container) return;

        container.appendChild(create("p", {
            className: "empty-state",
            text: translate("noData", "Chưa có dữ liệu để hiển thị.")
        }));
    }

    function renderAll() {
        if (!state.data) return;

        renderSeo();
        renderHero();
        renderStats();
        renderSummary();
        renderSkills();
        renderExperience();
        renderProjects();
        renderArchitectures();
        renderKnowledge();
        renderCreator();
        renderCommunity();

        if (window.LanguageManager?.applyTranslations) {
            window.LanguageManager.applyTranslations();
        }

        document.dispatchEvent(
            new CustomEvent("portfolioRendered", {
                detail: {
                    data: state.data,
                    language: window.LanguageManager?.getLanguage?.() || "vi"
                }
            })
        );
    }

    function showLoadingState() {
        [
            "stats-container",
            "skills-container",
            "experience-container",
            "project-container",
            "architecture-container",
            "knowledge-container",
            "community-container"
        ].forEach((id) => {
            const container = byId(id);
            if (!container || container.childElementCount) return;
            container.appendChild(create("div", {
                className: "skeleton",
                attributes: { "aria-label": translate("loading", "Đang tải dữ liệu...") }
            }));
        });
    }

    function showLoadError(error) {
        const summary = byId("summary");
        if (!summary) return;

        clear(summary);
        const box = create("div", { className: "empty-state" });
        appendTextElement(
            box,
            "strong",
            translate("dataLoadError", "Không thể tải data.json")
        );
        appendTextElement(box, "p", error.message || String(error));
        appendTextElement(
            box,
            "small",
            "Hãy kiểm tra cú pháp JSON và chạy trang qua HTTP server hoặc GitHub Pages."
        );
        summary.appendChild(box);
    }

    async function loadData(options = {}) {
        const { force = false } = options;

        if (state.loading) return state.data;
        if (state.data && !force) return state.data;

        state.loading = true;
        state.error = null;
        showLoadingState();

        try {
            const response = await fetch(DATA_URL, {
                cache: force ? "reload" : "no-store",
                headers: { Accept: "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
            }

            const rawText = await response.text();
            let parsed;

            try {
                parsed = JSON.parse(rawText);
            } catch (error) {
                const detail = error instanceof SyntaxError ? error.message : String(error);
                throw new Error(`JSON không hợp lệ: ${detail}`);
            }

            state.data = normalizeData(parsed);
            validateData(state.data);

            if (window.LanguageManager?.useDefaultLanguage) {
                window.LanguageManager.useDefaultLanguage(
                    state.data.settings.defaultLanguage || "vi"
                );
            }

            renderAll();
            return state.data;
        } catch (error) {
            state.error = error;
            console.error("[renderer] Unable to load portfolio data:", error);
            showLoadError(error);
            document.dispatchEvent(
                new CustomEvent("portfolioError", { detail: { error } })
            );
            return null;
        } finally {
            state.loading = false;
        }
    }

    function initialize() {
        loadData();
    }

    document.addEventListener("languageChanged", () => {
        if (state.data) renderAll();
    });

    window.PORTFOLIO = Object.freeze({
        getData: () => state.data,
        getState: () => ({ ...state }),
        load: loadData,
        reload: () => loadData({ force: true }),
        render: renderAll,
        getCvConfig: () => state.data ? getCvConfig(state.data.settings) : null
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, { once: true });
    } else {
        initialize();
    }
})();
