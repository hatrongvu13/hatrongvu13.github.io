/*
==================================
roadmap.js
Career Roadmap Renderer
==================================
*/

/*
==================================
Career Growth Matrix
==================================
*/

const CAREER_MATRIX = [

    {
        name: "Backend Engineering",
        current: 90,
        target: 100
    },

    {
        name: "Software Architecture",
        current: 70,
        target: 100
    },

    {
        name: "System Design",
        current: 75,
        target: 100
    },

    {
        name: "Database Design",
        current: 85,
        target: 100
    },

    {
        name: "DevOps",
        current: 60,
        target: 100
    },

    {
        name: "Cloud",
        current: 55,
        target: 100
    },

    {
        name: "Leadership",
        current: 40,
        target: 100
    },

    {
        name: "Business Understanding",
        current: 45,
        target: 100
    }
];

/*
==================================
Helpers
==================================
*/

function roadmapStatusLabel(status) {

    switch (status) {

        case "completed":
            return t("completed");

        case "learning":
            return t("learning");

        default:
            return t("planned");
    }
}

function roadmapStatusClass(status) {

    switch (status) {

        case "completed":
            return "completed";

        case "learning":
            return "learning";

        default:
            return "planned";
    }
}

/*
==================================
Roadmap Timeline
==================================
*/

function renderRoadmapTimeline() {

    const data =
        window.PORTFOLIO?.getData();

    if (!data) {
        return;
    }

    const container =
        document.getElementById(
            "roadmap-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "roadmap-container";

    data.roadmap.forEach(item => {

        const card =
            document.createElement("div");

        card.className =
            "roadmap-card";

        card.innerHTML = `
            <div class="timeline-year">
                ${item.year}
            </div>

            <h3>
                ${item.title}
            </h3>

            <div
             class="
             roadmap-status
             ${roadmapStatusClass(
            item.status
        )}">

                ${roadmapStatusLabel(
            item.status
        )}

            </div>
        `;

        wrapper.appendChild(card);
    });

    container.appendChild(wrapper);
}

/*
==================================
Roadmap Statistics
==================================
*/

function renderRoadmapStatistics() {

    const container =
        document.getElementById(
            "roadmap-container"
        );

    if (!container) {
        return;
    }

    const data =
        window.PORTFOLIO?.getData();

    if (!data) {
        return;
    }

    const total =
        data.roadmap.length;

    const completed =
        data.roadmap.filter(
            item =>
                item.status ===
                "completed"
        ).length;

    const learning =
        data.roadmap.filter(
            item =>
                item.status ===
                "learning"
        ).length;

    const planned =
        data.roadmap.filter(
            item =>
                item.status ===
                "planned"
        ).length;

    const card =
        document.createElement("div");

    card.className =
        "content-card";

    card.style.marginTop =
        "24px";

    card.innerHTML = `
        <h3>
            ${t(
        "roadmapJourney"
    )}
        </h3>

        <div class="stats-grid">

            <div class="stat-card">

                <strong>
                    ${total}
                </strong>

                <div>Total</div>

            </div>

            <div class="stat-card">

                <strong>
                    ${completed}
                </strong>

                <div>
                    ${t(
        "completed"
    )}
                </div>

            </div>

            <div class="stat-card">

                <strong>
                    ${learning}
                </strong>

                <div>
                    ${t(
        "learning"
    )}
                </div>

            </div>

        </div>

        <div
         style="
         margin-top:16px;
         color:var(--text-muted)
         ">

         ${planned}
         ${t("planned")}

        </div>
    `;

    container.appendChild(card);
}

/*
==================================
Career Matrix
==================================
*/

function renderCareerMatrix() {

    const container =
        document.getElementById(
            "roadmap-container"
        );

    if (!container) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "content-card";

    wrapper.style.marginTop =
        "24px";

    let html = `
        <h3>
            Career Growth Matrix
        </h3>
    `;

    CAREER_MATRIX.forEach(
        skill => {

            html += `
                <div
                style="
                margin-top:20px
                ">

                    <div
                    style="
                    display:flex;
                    justify-content:
                    space-between;
                    margin-bottom:8px;
                    ">

                        <span>
                            ${skill.name}
                        </span>

                        <span>
                            ${skill.current}%
                        </span>

                    </div>

                    <div
                     class=
                     "skill-progress">

                        <div
                         class=
                         "skill-progress-fill"

                         style="
                         width:
                         ${skill.current}%">

                        </div>

                    </div>

                </div>
            `;
        }
    );

    wrapper.innerHTML = html;

    container.appendChild(wrapper);
}

/*
==================================
Future Architect Path
==================================
*/
function renderArchitectJourney() {
    const container =
        document.getElementById(
            "roadmap-container"
        );

    if (!container) {
        return;
    }

    const stages = [
        {
            level: "01",
            title: "Java Developer",
            description: {
                vi: "Nền tảng Java, OOP, SQL, REST API và Spring Boot.",
                en: "Java fundamentals, OOP, SQL, REST APIs and Spring Boot."
            },
            status: "completed",
            icon: "☕"
        },
        {
            level: "02",
            title: "Senior Java Developer",
            description: {
                vi: "Thiết kế module, tối ưu hiệu năng, review code và xử lý nghiệp vụ phức tạp.",
                en: "Module design, performance optimization, code review and complex business logic."
            },
            status: "completed",
            icon: "⌨"
        },
        {
            level: "03",
            title: "Technical Lead",
            description: {
                vi: "Dẫn dắt kỹ thuật, kiểm soát chất lượng và hỗ trợ phát triển đội ngũ.",
                en: "Technical leadership, quality control and team development."
            },
            status: "learning",
            icon: "◆"
        },
        {
            level: "04",
            title: "Solution Architect",
            description: {
                vi: "Thiết kế giải pháp tổng thể, tích hợp hệ thống và lựa chọn công nghệ.",
                en: "End-to-end solution design, system integration and technology selection."
            },
            status: "planned",
            icon: "⬡"
        },
        {
            level: "05",
            title: "Enterprise Architect",
            description: {
                vi: "Định hướng kiến trúc doanh nghiệp, tiêu chuẩn kỹ thuật và chiến lược dài hạn.",
                en: "Enterprise architecture direction, technical standards and long-term strategy."
            },
            status: "planned",
            icon: "△"
        }
    ];

    const language =
        window.LanguageManager
            ?.getLanguage?.() || "vi";

    const statusLabels = {
        completed: {
            vi: "Đã đạt được",
            en: "Completed"
        },
        learning: {
            vi: "Đang phát triển",
            en: "In progress"
        },
        planned: {
            vi: "Mục tiêu tiếp theo",
            en: "Next target"
        }
    };

    const card =
        document.createElement("section");

    card.className =
        "content-card architect-journey-card";

    card.innerHTML = `
        <div class="architect-journey-header">

            <div>
                <span class="architect-journey-eyebrow">
                    CAREER PATH
                </span>

                <h3>
                    ${
        language === "vi"
            ? "Lộ trình Java đến Kiến trúc sư hệ thống"
            : "Java to System Architect Journey"
    }
                </h3>

                <p>
                    ${
        language === "vi"
            ? "Lộ trình phát triển năng lực từ kỹ thuật backend chuyên sâu đến thiết kế giải pháp và kiến trúc doanh nghiệp."
            : "A professional path from backend engineering expertise to solution and enterprise architecture."
    }
                </p>
            </div>

            <div class="architect-journey-progress">
                <strong>02 / 05</strong>

                <span>
                    ${
        language === "vi"
            ? "Cột mốc hoàn thành"
            : "Milestones completed"
    }
                </span>
            </div>

        </div>

        <div class="architect-path">

            ${stages.map((stage, index) => `
                <article
                    class="architect-stage ${stage.status}"
                >
                    <div class="architect-stage-marker">

                        <span class="architect-stage-icon">
                            ${stage.icon}
                        </span>

                        ${
        index < stages.length - 1
            ? '<span class="architect-stage-line"></span>'
            : ""
    }

                    </div>

                    <div class="architect-stage-content">

                        <div class="architect-stage-meta">

                            <span class="architect-stage-level">
                                LEVEL ${stage.level}
                            </span>

                            <span
                                class="architect-stage-status ${stage.status}"
                            >
                                ${statusLabels[stage.status][language]}
                            </span>

                        </div>

                        <h4>
                            ${stage.title}
                        </h4>

                        <p>
                            ${
        stage.description[language]
        || stage.description.vi
    }
                        </p>

                    </div>
                </article>
            `).join("")}

        </div>

        <footer class="architect-journey-footer">

            <code class="architect-footer-code">
    <span class="code-keyword">while</span>
    <span class="code-bracket">(</span><span class="code-object">career</span>.<span class="code-method">isGrowing</span><span class="code-bracket">())</span>
    <span class="code-bracket">{</span>

    <span class="code-method">learn</span><span class="code-bracket">();</span>
    <span class="code-method">build</span><span class="code-bracket">();</span>
    <span class="code-method">share</span><span class="code-bracket">();</span>

    <span class="code-bracket">}</span>
</code>
<!--<pre class="architect-footer-code"><code><span class="code-keyword">while</span> (<span class="code-object">career</span>.<span class="code-method">isGrowing</span>()) {-->
<!--    <span class="code-method">learn</span>();-->
<!--    <span class="code-method">build</span>();-->
<!--    <span class="code-method">share</span>();-->
<!--}</code></pre>-->

            <span class="architect-footer-focus">
                Java • Architecture • Leadership
            </span>

        </footer>
    `;

    container.appendChild(card);
}

/*
==================================
Main Renderer
==================================
*/

function renderRoadmap() {
    const container = document.getElementById("roadmap-container")

    renderRoadmapTimeline();

    renderRoadmapStatistics();

    renderCareerMatrix();

    renderArchitectJourney();
}

/*
==================================
Events
==================================
*/

document.addEventListener(
    "portfolioRendered",
    () => {

        renderRoadmap();
    }
);

document.addEventListener(
    "languageChanged",
    () => {

        renderRoadmap();
    }
);

/*
==================================
Public API
==================================
*/

window.RoadmapModule = {

    render: renderRoadmap,

    refresh: renderRoadmap
};