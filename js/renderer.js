/*
==================================
renderer.js
Main UI Renderer
==================================
*/

let PORTFOLIO_DATA = null;

/*
==================================
Helpers
==================================
*/

function $(selector) {
    return document.querySelector(selector);
}

function createElement(tag, className = "") {

    const el = document.createElement(tag);

    if (className) {
        el.className = className;
    }

    return el;
}

function bindSocialLink(
    id,
    url
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    if (!url) {

        element.style.display =
            "none";

        return;
    }

    element.href = url;
}


/*
==================================
Data Loader
==================================
*/

async function loadPortfolioData() {

    try {

        const response =
            await fetch(
                "./data/data.json",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }

        PORTFOLIO_DATA =
            await response.json();

        renderAll();

    } catch (error) {

        console.error(error);

        document.body.innerHTML = `
            <main class="container">
                <div class="content-card">
                    <h2>Data Loading Error</h2>
                    <p>${error.message}</p>
                </div>
            </main>
        `;
    }
}

/*
==================================
SEO
==================================
*/

function updateSeo() {

    if (!PORTFOLIO_DATA) {
        return;
    }

    document.title =
        PORTFOLIO_DATA.settings.siteTitle;

    const description = document.querySelector(
        "meta[name='description']"
    );

    if (description) {

        description.setAttribute(
            "content",
            PORTFOLIO_DATA.settings.siteDescription
        );
    }
}

/*
==================================
Hero
==================================
*/

function renderHero() {

    const personal =
        PORTFOLIO_DATA.personal;

    $("#full-name").textContent =
        personal.fullName;

    $("#profile-name").textContent =
        personal.fullName;

    $("#role").textContent =
        resolveLanguageValue(
            personal.role
        );

    $("#tagline").textContent =
        resolveLanguageValue(
            personal.tagline
        );

    $("#profile-location").textContent =
        resolveLanguageValue(
            personal.location
        );

    bindSocialLink(
        "github-link",
        personal.github
    );

    bindSocialLink(
        "linkedin-link",
        personal.linkedin
    );

    bindSocialLink(
        "youtube-link",
        personal.youtube
    );

    bindSocialLink(
        "facebook-link",
        personal.facebook
    );

    bindSocialLink(
        "tiktok-link",
        personal.tiktok
    );

    const cvButton =
        document.querySelector(
            ".hero-actions a[href='#']"
        );

    if (
        cvButton &&
        PORTFOLIO_DATA.settings.cvDownload
    ) {

        cvButton.href =
            PORTFOLIO_DATA.settings.cvDownload;
    }

    $("#footer-name").textContent =
        personal.fullName;

    $("#footer-year").textContent =
        new Date().getFullYear();
}

/*
==================================
Summary
==================================
*/

function renderSummary() {

    $("#summary").textContent =
        resolveLanguageValue(
            PORTFOLIO_DATA.personal.summary
        );
}

/*
==================================
Stats
==================================
*/

function renderStats() {

    const container =
        $("#stats-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.stats.forEach(
        stat => {

            const card =
                createElement(
                    "div",
                    "stat-card"
                );

            card.innerHTML = `
                <strong>
                    ${stat.value}
                </strong>

                <div>
                    ${resolveLanguageValue(
                stat.label
            )}
                </div>
            `;

            container.appendChild(card);
        }
    );
}

/*
==================================
Skills
==================================
*/

function renderSkills() {

    const container =
        $("#skills-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.skills.forEach(
        skillGroup => {

            const card =
                createElement(
                    "div",
                    "skill-card"
                );

            const chips =
                skillGroup.items
                    .map(item =>
                        `<span class="chip tech-chip">
                            ${item}
                        </span>`
                    )
                    .join("");

            card.innerHTML = `
                <h3>
                    ${skillGroup.group}
                </h3>

                <div class="creator-topics">
                    ${chips}
                </div>
            `;

            container.appendChild(card);
        }
    );
}

/*
==================================
Experience
==================================
*/

function renderExperience() {

    const container =
        $("#experience-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.experience.forEach(
        item => {

            const achievements =
                resolveLanguageValue(
                    item.achievements
                )
                    .map(value => `
                        <li>${value}</li>
                    `)
                    .join("");

            const article =
                createElement(
                    "article",
                    "experience-item"
                );

            article.innerHTML = `
                <div
                    class="experience-period">

                    ${item.period}

                </div>

                <div
                 class="experience-content content-card">

                    <h3>
                        ${resolveLanguageValue(
                item.role
            )}
                    </h3>

                    <p>
                        ${item.company}
                    </p>

                    <p>
                        ${resolveLanguageValue(
                item.description
            )}
                    </p>

                    <ul>
                        ${achievements}
                    </ul>

                </div>
            `;

            container.appendChild(
                article
            );
        }
    );
}

/*
==================================
Projects
==================================
*/

function renderProjects() {

    const container =
        $("#project-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.projects.forEach(
        project => {

            const tech =
                project.tech
                    .map(v =>
                        `<span class="chip">
                            ${v}
                        </span>`
                    )
                    .join("");

            const card =
                createElement(
                    "article",
                    "project-card"
                );

            card.innerHTML = `
                <div class="
                    project-status
                    ${project.status}">
                    ${project.status}
                </div>

                <h3>
                    ${project.name}
                </h3>

                <p>
                    ${resolveLanguageValue(
                project.description
            )}
                </p>

                <div>
                    ${tech}
                </div>

                <div class="card-actions">

                    ${project.source || '#'}

                        ${t("sourceCode")}
                    </a>

                    ${project.demo || '#'}

                        ${t("liveDemo")}
                    </a>

                </div>
            `;

            container.appendChild(
                card
            );
        }
    );
}

/*
==================================
Architecture
==================================
*/

function renderArchitectures() {

    const container =
        $("#architecture-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.architectures.forEach(
        architecture => {

            const card =
                createElement(
                    "div",
                    "architecture-card"
                );

            const diagram =
                architecture.diagram
                    .map((node, index) => {

                        const arrow =
                            index <
                            architecture.diagram.length - 1
                                ? `<span class="architecture-arrow">→</span>`
                                : "";

                        return `
                            <span class="architecture-node">
                                ${node}
                            </span>
                            ${arrow}
                        `;
                    })
                    .join("");

            card.innerHTML = `
                <h3>
                    ${architecture.name}
                </h3>

                <small>
                    ${architecture.level}
                </small>

                <p>
                    ${resolveLanguageValue(
                architecture.description
            )}
                </p>

                <div
                 class="architecture-diagram">

                    ${diagram}

                </div>
            `;

            container.appendChild(
                card
            );
        }
    );
}

/*
==================================
Knowledge
==================================
*/

function renderKnowledge() {

    const container =
        $("#knowledge-container");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.knowledge.forEach(
        item => {

            const card =
                createElement(
                    "div",
                    "knowledge-card"
                );

            card.innerHTML = `
                <h3>
                    ${item.title}
                </h3>

                <p>
                    ${resolveLanguageValue(
                item.description
            )}
                </p>

                ${item.link || '#'}

                    ${t(
                "knowledgeReadMore"
            )}

                </a>
            `;

            container.appendChild(
                card
            );
        }
    );
}

/*
==================================
Creator
==================================
*/

function renderCreatorTopics() {

    const container =
        $("#creator-topics");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    PORTFOLIO_DATA.creator.topics
        .forEach(topic => {

            container.innerHTML += `
                <span
                    class="topic-chip">

                    ${topic}

                </span>
            `;
        });
}

/*
==================================
Community
==================================
*/

function renderCommunity() {

    const community =
        PORTFOLIO_DATA.community;

    $("#community-title")
        .textContent =
        resolveLanguageValue(
            community.title
        );

    $("#community-description")
        .textContent =
        resolveLanguageValue(
            community.description
        );

    const container =
        $("#community-container");

    container.innerHTML = "";

    community.followers.forEach(
        follower => {

            const card =
                createElement(
                    "div",
                    "community-card"
                );

            card.innerHTML = `
                <h4>
                    ${follower.name}
                </h4>

                <div
                 class="community-quote">

                    "${resolveLanguageValue(
                follower.message
            )}"

                </div>
            `;

            container.appendChild(
                card
            );
        }
    );
}

/*
==================================
All Render
==================================
*/

function renderAll() {

    if (!PORTFOLIO_DATA) {
        return;
    }

    updateSeo();

    renderHero();

    renderSummary();

    renderStats();

    renderSkills();

    renderExperience();

    renderProjects();

    renderArchitectures();

    renderKnowledge();

    renderCreatorTopics();

    renderCommunity();

    document.dispatchEvent(
        new CustomEvent(
            "portfolioRendered"
        )
    );
}

/*
==================================
Language Refresh
==================================
*/

document.addEventListener(
    "languageChanged",
    () => {

        renderAll();
    }
);

/*
==================================
Public API
==================================
*/

window.PORTFOLIO = {

    getData() {

        return PORTFOLIO_DATA;
    },

    reload() {

        return loadPortfolioData();
    }
};

/*
==================================
Startup
==================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadPortfolioData();
    }
);