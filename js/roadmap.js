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

    const card =
        document.createElement("div");

    card.className =
        "content-card";

    card.style.marginTop =
        "24px";

    card.innerHTML = `
<pre>

Java Developer
      │
      ▼
Senior Java Developer
      │
      ▼
Technical Lead
      │
      ▼
Solution Architect
      │
      ▼
Enterprise Architect

</pre>
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