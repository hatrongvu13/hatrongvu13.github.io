/*
==================================
i18n.js
Internationalization Engine
==================================
*/

const I18N = {

    vi: {

        navAbout: "Giới thiệu",
        navSkills: "Kỹ năng",
        navExperience: "Kinh nghiệm",
        navProjects: "Dự án",
        navArchitecture: "Kiến trúc hệ thống",
        navRoadmap: "Lộ trình",
        navKnowledge: "Chia sẻ kiến thức",
        navCommunity: "Cộng đồng",
        navContact: "Liên hệ",

        heroProjects: "Xem dự án",
        heroDownloadCv: "Tải CV",
        heroContact: "Liên hệ",

        aboutTitle: "Giới thiệu",

        skillsTitle: "Công nghệ",

        experienceTitle: "Kinh nghiệm",

        projectsTitle: "Dự án nổi bật",

        architectureTitle: "Thiết kế hệ thống",

        roadmapTitle: "Lộ trình Java",

        knowledgeTitle: "Chia sẻ kiến thức",

        creatorTitle: "Nhà sáng tạo nội dung",

        communityTitle: "Cộng đồng",

        contactTitle: "Liên hệ",

        contactName: "Họ và tên",

        contactEmail: "Email",

        contactMessage: "Nội dung",

        contactSend: "Gửi",

        downloadCv: "Tải CV",

        sourceCode: "Mã nguồn",

        liveDemo: "Demo",

        active: "Đang hoạt động",

        maintenance: "Bảo trì",

        archived: "Lưu trữ",

        completed: "Đã hoàn thành",

        learning: "Đang học",

        planned: "Kế hoạch",

        githubIssue: "Liên hệ qua GitHub Issue",

        telegramFuture: "Tích hợp Telegram trong tương lai",

        emailFuture: "Tích hợp Email trong tương lai",

        loading: "Đang tải dữ liệu...",

        noData: "Không có dữ liệu",

        formSuccess: "Đã gửi thông tin thành công.",

        formError: "Có lỗi xảy ra.",

        thanksCommunity:
            "Cảm ơn bạn đã ghé thăm portfolio của tôi.",

        footerText:
            "Xây dựng bằng HTML, CSS và JavaScript thuần.",

        roadmapJourney:
            "Lộ trình nghề nghiệp",

        architectureDiagram:
            "Sơ đồ hệ thống",

        knowledgeReadMore:
            "Xem thêm",

        creatorTopics:
            "Chủ đề chia sẻ",

        systemDesigner:
            "Kiến trúc sư hệ thống tương lai"
    },

    en: {

        navAbout: "About",
        navSkills: "Skills",
        navExperience: "Experience",
        navProjects: "Projects",
        navArchitecture: "Architecture",
        navRoadmap: "Roadmap",
        navKnowledge: "Knowledge",
        navCommunity: "Community",
        navContact: "Contact",

        heroProjects: "View Projects",
        heroDownloadCv: "Download CV",
        heroContact: "Contact",

        aboutTitle: "About",

        skillsTitle: "Technology",

        experienceTitle: "Experience",

        projectsTitle: "Featured Projects",

        architectureTitle: "System Design",

        roadmapTitle: "Java Roadmap",

        knowledgeTitle: "Knowledge Sharing",

        creatorTitle: "Content Creator",

        communityTitle: "Community",

        contactTitle: "Contact",

        contactName: "Full Name",

        contactEmail: "Email",

        contactMessage: "Message",

        contactSend: "Send",

        downloadCv: "Download CV",

        sourceCode: "Source",

        liveDemo: "Demo",

        active: "Active",

        maintenance: "Maintenance",

        archived: "Archived",

        completed: "Completed",

        learning: "Learning",

        planned: "Planned",

        githubIssue: "Contact via GitHub Issue",

        telegramFuture:
            "Telegram integration in the future",

        emailFuture:
            "Email integration in the future",

        loading: "Loading data...",

        noData: "No data available",

        formSuccess:
            "Information submitted successfully.",

        formError:
            "An error has occurred.",

        thanksCommunity:
            "Thank you for visiting my portfolio.",

        footerText:
            "Built with pure HTML, CSS and JavaScript.",

        roadmapJourney:
            "Career Journey",

        architectureDiagram:
            "System Diagram",

        knowledgeReadMore:
            "Read More",

        creatorTopics:
            "Sharing Topics",

        systemDesigner:
            "Future System Architect"
    }
};

/*
==================================
Language State
==================================
*/

const LanguageManager = {

    key: "portfolio-language",

    current: "vi",

    init() {

        const saved =
            localStorage.getItem(this.key);

        if (saved && I18N[saved]) {

            this.current = saved;

        } else {

            this.current = "vi";
        }

        document.documentElement.lang =
            this.current;
    },

    getLanguage() {

        return this.current;
    },

    setLanguage(language) {

        if (!I18N[language]) {
            return;
        }

        this.current = language;

        localStorage.setItem(
            this.key,
            language
        );

        document.documentElement.lang =
            language;

        this.updateButton();

        document.dispatchEvent(
            new CustomEvent(
                "languageChanged",
                {
                    detail: {
                        language
                    }
                }
            )
        );
    },

    toggle() {

        const nextLanguage =
            this.current === "vi"
                ? "en"
                : "vi";

        this.setLanguage(
            nextLanguage
        );
    },

    t(key) {

        return (
            I18N[this.current]?.[key]
            || key
        );
    },

    updateButton() {

        const button =
            document.getElementById(
                "lang-btn"
            );

        if (!button) {
            return;
        }

        button.textContent =
            this.current.toUpperCase();
    }
};

/*
==================================
Translator Helpers
==================================
*/

function t(key) {

    return LanguageManager.t(key);
}

function resolveLanguageValue(value) {

    if (!value) {
        return "";
    }

    if (
        typeof value === "object"
        &&
        !Array.isArray(value)
    ) {

        return (
            value[
                LanguageManager.getLanguage()
                ]
            || value.vi
            || value.en
            || ""
        );
    }

    return value;
}

/*
==================================
Apply Text
==================================
*/

function applyStaticTranslations() {

    const elements =
        document.querySelectorAll(
            "[data-i18n]"
        );

    elements.forEach(element => {

        const key =
            element.dataset.i18n;

        element.textContent =
            t(key);
    });
}

/*
==================================
Language Button
==================================
*/

function initializeLanguageButton() {

    const button =
        document.getElementById(
            "lang-btn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            LanguageManager.toggle();
        }
    );

    LanguageManager.updateButton();
}

/*
==================================
Document Init
==================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        LanguageManager.init();

        initializeLanguageButton();

        applyStaticTranslations();
    }
);

/*
==================================
Public API
==================================
*/

window.LanguageManager =
    LanguageManager;

window.t = t;

window.resolveLanguageValue =
    resolveLanguageValue;