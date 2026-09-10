/*
==================================
cv.js
Dynamic CV Renderer
==================================
*/

const CvModule = (() => {
    "use strict";

    const CV_DOCUMENT_ID = "cv-document";
    const CV_BUTTON_ID = "download-cv-btn";
    const PREVIEW_CLASS = "cv-preview-mode";

    function getData() {
        return window.PORTFOLIO?.getData?.() || null;
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function localized(value) {
        if (typeof window.resolveLanguageValue === "function") {
            return window.resolveLanguageValue(value);
        }

        if (value && typeof value === "object" && !Array.isArray(value)) {
            const language = document.documentElement.lang || "vi";
            return value[language] ?? value.vi ?? value.en ?? "";
        }

        return value ?? "";
    }

    function toArray(value) {
        return Array.isArray(value) ? value : [];
    }

    function setText(id, value) {
        const element = byId(id);
        if (element) {
            element.textContent = value ?? "";
        }
    }

    function setHtml(id, html) {
        const element = byId(id);
        if (element) {
            element.innerHTML = html;
        }
    }

    function setBlockVisibility(containerId, visible) {
        const container = byId(containerId);
        const block = container?.closest(".cv-block");

        if (block) {
            block.hidden = !visible;
        }
    }

    function safeExternalUrl(value) {
        if (!value) {
            return "";
        }

        try {
            const url = new URL(value, window.location.href);
            return ["http:", "https:"].includes(url.protocol) ? url.href : "";
        } catch {
            return "";
        }
    }

    function renderHeader(data) {
        const personal = data.personal || {};
        const settings = data.settings?.cv || {};

        setText("cv-full-name", personal.fullName);
        setText("cv-role", localized(personal.role));
        setText("cv-tagline", localized(personal.tagline));
        setText("cv-footer-name", personal.fullName);

        const contactItems = [];

        if (personal.email) {
            const email = escapeHtml(personal.email);
            contactItems.push(
                `<a href="mailto:${email}">${email}</a>`
            );
        }

        if (personal.phone) {
            const phoneText = escapeHtml(personal.phone);
            const phoneHref = escapeHtml(
                String(personal.phone).replace(/[^+\d]/g, "")
            );
            contactItems.push(
                `<a href="tel:${phoneHref}">${phoneText}</a>`
            );
        }

        if (personal.location) {
            contactItems.push(
                `<span>${escapeHtml(localized(personal.location))}</span>`
            );
        }

        const githubUrl = safeExternalUrl(personal.github);
        if (githubUrl) {
            contactItems.push(
                `<a href="${escapeHtml(githubUrl)}">${escapeHtml(personal.github)}</a>`
            );
        }

        const linkedinUrl = safeExternalUrl(personal.linkedin);
        if (linkedinUrl) {
            contactItems.push(
                `<a href="${escapeHtml(linkedinUrl)}">LinkedIn</a>`
            );
        }

        setHtml("cv-contact-list", contactItems.join(""));

        const avatar = byId("cv-avatar");
        const fallback = byId("cv-avatar-fallback");
        const showAvatar = settings.showAvatar !== false;

        if (avatar) {
            avatar.hidden = !showAvatar;
        }

        if (fallback && !showAvatar) {
            fallback.hidden = true;
        }
    }

    function renderSummary(data) {
        setText("cv-summary", localized(data.personal?.summary));
    }

    function renderSkills(data) {
        const groups = toArray(data.skills);

        const html = groups.map(group => {
            const title = group.group || group.title || "Skills";
            const items = toArray(group.items);

            return `
                <div class="cv-skill-group">
                    <h4>${escapeHtml(title)}</h4>
                    <div class="cv-chip-list">
                        ${items.map(item =>
                            `<span class="cv-chip">${escapeHtml(item)}</span>`
                        ).join("")}
                    </div>
                </div>
            `;
        }).join("");

        setHtml("cv-skills", html);
    }

    function renderCompetencies(data) {
        const configured = toArray(data.settings?.cv?.competencies);
        const competencies = configured.length > 0
            ? configured
            : [
                "Java Backend",
                "REST API",
                "System Integration",
                "Clean Architecture",
                "Database Optimization",
                "Code Review"
            ];

        setHtml(
            "cv-competencies",
            `<div class="cv-chip-list">
                ${competencies.map(item =>
                    `<span class="cv-chip">${escapeHtml(item)}</span>`
                ).join("")}
            </div>`
        );
    }

    function renderExperience(data) {
        const config = data.settings?.cv || {};
        const maxItems = Number(config.maxExperience) || 4;
        const experience = toArray(data.experience).slice(0, maxItems);

        const html = experience.map(item => {
            const achievements = toArray(localized(item.achievements));

            return `
                <article class="cv-experience-item">
                    <div class="cv-item-heading">
                        <h4>${escapeHtml(localized(item.role))}</h4>
                        <span class="cv-period">${escapeHtml(item.period)}</span>
                    </div>
                    <div class="cv-company">${escapeHtml(item.company)}</div>
                    <p>${escapeHtml(localized(item.description))}</p>
                    ${achievements.length > 0 ? `
                        <ul>
                            ${achievements.map(value =>
                                `<li>${escapeHtml(value)}</li>`
                            ).join("")}
                        </ul>
                    ` : ""}
                </article>
            `;
        }).join("");

        setHtml("cv-experience", html);
    }

    function renderProjects(data) {
        const config = data.settings?.cv || {};
        const showProjects = config.showProjects !== false;
        const maxItems = Number(config.maxProjects) || 3;
        const projects = toArray(data.projects).slice(0, maxItems);

        setBlockVisibility("cv-projects", showProjects && projects.length > 0);

        if (!showProjects) {
            setHtml("cv-projects", "");
            return;
        }

        const html = projects.map(project => `
            <article class="cv-project-item">
                <div class="cv-item-heading">
                    <h4>${escapeHtml(project.name)}</h4>
                    <span class="cv-period">${escapeHtml(project.type)}</span>
                </div>
                <p>${escapeHtml(localized(project.description))}</p>
                <div class="cv-chip-list">
                    ${toArray(project.tech).map(item =>
                        `<span class="cv-chip">${escapeHtml(item)}</span>`
                    ).join("")}
                </div>
            </article>
        `).join("");

        setHtml("cv-projects", html);
    }

    function renderArchitectures(data) {
        const config = data.settings?.cv || {};
        const showArchitecture = config.showArchitecture !== false;
        const maxItems = Number(config.maxArchitectures) || 2;
        const architectures = toArray(data.architectures).slice(0, maxItems);

        setBlockVisibility(
            "cv-architectures",
            showArchitecture && architectures.length > 0
        );

        if (!showArchitecture) {
            setHtml("cv-architectures", "");
            return;
        }

        const html = architectures.map(item => `
            <article class="cv-architecture-item">
                <div class="cv-item-heading">
                    <h4>${escapeHtml(item.name)}</h4>
                    <span class="cv-period">${escapeHtml(item.level)}</span>
                </div>
                <p>${escapeHtml(localized(item.description))}</p>
                <div class="cv-chip-list">
                    ${toArray(item.diagram).map(value =>
                        `<span class="cv-chip">${escapeHtml(value)}</span>`
                    ).join("")}
                </div>
            </article>
        `).join("");

        setHtml("cv-architectures", html);
    }

    function renderRoadmap(data) {
        const config = data.settings?.cv || {};
        const showRoadmap = config.showRoadmap !== false;
        const roadmap = toArray(data.roadmap);

        setBlockVisibility("cv-roadmap", showRoadmap && roadmap.length > 0);

        if (!showRoadmap) {
            setHtml("cv-roadmap", "");
            return;
        }

        const html = roadmap.map(item => {
            const status = ["completed", "learning", "planned"]
                .includes(item.status)
                ? item.status
                : "planned";

            return `
                <div class="cv-roadmap-item ${status}">
                    <strong>${escapeHtml(item.year)}</strong>
                    <div>${escapeHtml(localized(item.title))}</div>
                </div>
            `;
        }).join("");

        setHtml("cv-roadmap", html);
    }

    function render() {
        const data = getData();

        if (!data) {
            throw new Error("Portfolio data is not ready.");
        }

        renderHeader(data);
        renderSummary(data);
        renderSkills(data);
        renderCompetencies(data);
        renderExperience(data);
        renderProjects(data);
        renderArchitectures(data);
        renderRoadmap(data);
    }

    function showError(error) {
        console.error("[CvModule]", error);

        const message = document.documentElement.lang === "en"
            ? "The CV could not be generated. Please try again."
            : "Không thể tạo CV. Vui lòng thử lại.";

        if (window.ContactModule?.showToast) {
            window.ContactModule.showToast(message, "error");
        } else {
            window.alert(message);
        }
    }

    function print() {
        try {
            render();

            const cvDocument = byId(CV_DOCUMENT_ID);
            if (!cvDocument) {
                throw new Error(`#${CV_DOCUMENT_ID} was not found in index.html.`);
            }

            cvDocument.hidden = false;
            document.body.classList.add(PREVIEW_CLASS);

            const configuredName = getData()?.settings?.cv?.fileName;
            document.title = configuredName || "Vu-Ha-Trong-CV";

            requestAnimationFrame(() => {
                requestAnimationFrame(() => window.print());
            });
        } catch (error) {
            showError(error);
        }
    }

    function restorePortfolio() {
        document.body.classList.remove(PREVIEW_CLASS);

        const cvDocument = byId(CV_DOCUMENT_ID);
        if (cvDocument) {
            cvDocument.hidden = true;
        }

        const data = getData();
        document.title = data?.settings?.siteTitle || "Vu Ha Trong Portfolio";
    }

    function handleLanguageChanged() {
        const cvDocument = byId(CV_DOCUMENT_ID);

        if (cvDocument && !cvDocument.hidden) {
            try {
                render();
            } catch (error) {
                showError(error);
            }
        }
    }

    function init() {
        const button = byId(CV_BUTTON_ID);

        if (!button) {
            console.warn(`[CvModule] #${CV_BUTTON_ID} was not found.`);
            return;
        }

        button.addEventListener("click", print);
        window.addEventListener("afterprint", restorePortfolio);
        document.addEventListener("languageChanged", handleLanguageChanged);
    }

    return Object.freeze({
        init,
        render,
        print,
        restorePortfolio
    });
})();

document.addEventListener("DOMContentLoaded", CvModule.init);
window.CvModule = CvModule;
