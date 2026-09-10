/*
 * Vu Ha Trong Portfolio
 * i18n: lightweight Vietnamese / English internationalization
 * No external library required
 */

(() => {
  "use strict";

  const STORAGE_KEY = "vht-portfolio-language";
  const SUPPORTED_LANGUAGES = Object.freeze(["vi", "en"]);
  const FALLBACK_LANGUAGE = "vi";

  const MESSAGES = Object.freeze({
    vi: {
      navAbout: "Giới thiệu",
      navSkills: "Kỹ năng",
      navExperience: "Sự nghiệp",
      navProjects: "Dự án",
      navArchitecture: "Kiến trúc",
      navRoadmap: "Lộ trình",
      navKnowledge: "Chia sẻ",
      navCommunity: "Cộng đồng",
      navContact: "Liên hệ",

      heroEyebrow: "Java · Spring Boot · Kiến trúc hệ thống",
      heroDownloadCv: "Tải CV",
      heroProjects: "Xem dự án",
      heroContact: "Liên hệ",

      aboutTitle: "Giới thiệu",
      skillsTitle: "Kỹ năng và công nghệ",
      experienceTitle: "Hành trình sự nghiệp",
      projectsTitle: "Dự án nổi bật",
      architectureTitle: "Thiết kế hệ thống",
      roadmapTitle: "Lộ trình Java đến kiến trúc sư",
      roadmapJourney: "Năng lực đang phát triển và các cột mốc nghề nghiệp tiếp theo.",
      knowledgeTitle: "Chia sẻ kiến thức",
      creatorTitle: "Nội dung và ý tưởng",
      communityTitle: "Cảm ơn cộng đồng",
      contactTitle: "Liên hệ",
      contactSubtitle: "Trao đổi về Java, kiến trúc hệ thống, dự án cá nhân hoặc hợp tác nội dung.",

      contactName: "Họ và tên",
      contactEmail: "Email",
      contactMessage: "Nội dung",
      contactSend: "Gửi liên hệ",
      contactNamePlaceholder: "Tên của bạn",
      contactEmailPlaceholder: "email@example.com",
      contactMessagePlaceholder: "Bạn muốn trao đổi điều gì?",
      contactFormNote: "Thông tin sẽ được chuyển thành GitHub Issue sau khi endpoint được cấu hình.",
      contactDialogDescription: "Bạn có thể mở biểu mẫu liên hệ hoặc gửi email trực tiếp. GitHub Issue, Telegram và thông báo email sẽ được kích hoạt theo cấu hình trong data.json.",
      contactDialogOpenForm: "Mở biểu mẫu liên hệ",

      collaborationTitle: "Hợp tác",
      collaborationJava: "Java và Spring Boot",
      collaborationArchitecture: "Thiết kế hệ thống và kiến trúc phần mềm",
      collaborationOpenSource: "Mã nguồn mở và dự án cá nhân",
      collaborationContent: "Chia sẻ kiến thức và hợp tác nội dung",

      sourceCode: "Mã nguồn",
      liveDemo: "Demo",
      readMore: "Xem thêm",
      knowledgeReadMore: "Xem thêm",
      active: "Đang phát triển",
      maintenance: "Đang bảo trì",
      archived: "Đã lưu trữ",
      completed: "Đã hoàn thành",
      learning: "Đang phát triển",
      planned: "Dự kiến",
      total: "Tổng số",
      careerMatrix: "Ma trận phát triển năng lực",
      careerPath: "Lộ trình nghề nghiệp",

      formSuccess: "Thông tin liên hệ đã được xử lý.",
      formError: "Không thể xử lý liên hệ. Vui lòng thử lại.",
      formRateLimit: "Vui lòng chờ trước khi gửi lại.",
      validationNameRequired: "Vui lòng nhập họ và tên.",
      validationEmailRequired: "Vui lòng nhập email.",
      validationEmailInvalid: "Địa chỉ email chưa hợp lệ.",
      validationMessageShort: "Nội dung cần có ít nhất 5 ký tự.",
      thanksCommunity: "Cảm ơn bạn đã theo dõi và ghé thăm portfolio.",
      noData: "Chưa có dữ liệu để hiển thị.",
      loading: "Đang tải dữ liệu...",
      dataLoadError: "Không thể tải data.json",

      languageButtonLabel: "Chuyển sang tiếng Anh",
      themeButtonLabel: "Đổi giao diện sáng tối",
      closeDialogLabel: "Đóng hộp thoại",
      primaryNavigationLabel: "Điều hướng chính",
      socialNavigationLabel: "Mạng xã hội",
      mainActionsLabel: "Hành động chính",

      footerText: "Xây dựng bằng HTML, CSS và JavaScript thuần.",
      noScript: "Trang này cần JavaScript để tải nội dung từ data.json."
    },

    en: {
      navAbout: "About",
      navSkills: "Skills",
      navExperience: "Career",
      navProjects: "Projects",
      navArchitecture: "Architecture",
      navRoadmap: "Roadmap",
      navKnowledge: "Insights",
      navCommunity: "Community",
      navContact: "Contact",

      heroEyebrow: "Java · Spring Boot · System Architecture",
      heroDownloadCv: "Download CV",
      heroProjects: "View projects",
      heroContact: "Contact",

      aboutTitle: "About",
      skillsTitle: "Skills and technologies",
      experienceTitle: "Career journey",
      projectsTitle: "Featured projects",
      architectureTitle: "System design",
      roadmapTitle: "Java to architect roadmap",
      roadmapJourney: "Capabilities in progress and the next career milestones.",
      knowledgeTitle: "Knowledge sharing",
      creatorTitle: "Content and ideas",
      communityTitle: "Community appreciation",
      contactTitle: "Contact",
      contactSubtitle: "Connect about Java, system architecture, personal projects or content collaboration.",

      contactName: "Full name",
      contactEmail: "Email",
      contactMessage: "Message",
      contactSend: "Send message",
      contactNamePlaceholder: "Your name",
      contactEmailPlaceholder: "email@example.com",
      contactMessagePlaceholder: "What would you like to discuss?",
      contactFormNote: "The message will be converted into a GitHub Issue after the endpoint is configured.",
      contactDialogDescription: "Open the contact form or send an email directly. GitHub Issues, Telegram and email notifications can be enabled through data.json.",
      contactDialogOpenForm: "Open contact form",

      collaborationTitle: "Collaboration",
      collaborationJava: "Java and Spring Boot",
      collaborationArchitecture: "System design and software architecture",
      collaborationOpenSource: "Open source and personal projects",
      collaborationContent: "Knowledge sharing and content collaboration",

      sourceCode: "Source",
      liveDemo: "Demo",
      readMore: "Read more",
      knowledgeReadMore: "Read more",
      active: "In development",
      maintenance: "Maintenance",
      archived: "Archived",
      completed: "Completed",
      learning: "In progress",
      planned: "Planned",
      total: "Total",
      careerMatrix: "Capability growth matrix",
      careerPath: "Career path",

      formSuccess: "Your contact information has been processed.",
      formError: "The contact request could not be processed. Please try again.",
      formRateLimit: "Please wait before submitting again.",
      validationNameRequired: "Please enter your full name.",
      validationEmailRequired: "Please enter your email address.",
      validationEmailInvalid: "Please enter a valid email address.",
      validationMessageShort: "The message must contain at least 5 characters.",
      thanksCommunity: "Thank you for following and visiting my portfolio.",
      noData: "No data is available yet.",
      loading: "Loading data...",
      dataLoadError: "Unable to load data.json",

      languageButtonLabel: "Switch to Vietnamese",
      themeButtonLabel: "Toggle light and dark theme",
      closeDialogLabel: "Close dialog",
      primaryNavigationLabel: "Primary navigation",
      socialNavigationLabel: "Social media",
      mainActionsLabel: "Primary actions",

      footerText: "Built with pure HTML, CSS and JavaScript.",
      noScript: "This page requires JavaScript to load content from data.json."
    }
  });

  let currentLanguage = FALLBACK_LANGUAGE;
  let hasStoredPreference = false;

  function normalizeLanguage(language) {
    if (typeof language !== "string") {
      return FALLBACK_LANGUAGE;
    }

    const normalized = language.trim().toLowerCase().split("-")[0];
    return SUPPORTED_LANGUAGES.includes(normalized)
      ? normalized
      : FALLBACK_LANGUAGE;
  }

  function readStoredLanguage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      hasStoredPreference = Boolean(stored);
      return stored ? normalizeLanguage(stored) : null;
    } catch (error) {
      console.warn("[i18n] Unable to read language preference.", error);
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      hasStoredPreference = true;
    } catch (error) {
      console.warn("[i18n] Unable to save language preference.", error);
    }
  }

  function t(key, variables = {}) {
    const template =
      MESSAGES[currentLanguage]?.[key] ??
      MESSAGES[FALLBACK_LANGUAGE]?.[key] ??
      key;

    if (typeof template !== "string") {
      return String(template ?? "");
    }

    return template.replace(/\{(\w+)\}/g, (match, variableName) => {
      return Object.prototype.hasOwnProperty.call(variables, variableName)
        ? String(variables[variableName])
        : match;
    });
  }

  function resolveLanguageValue(value, language = currentLanguage) {
    if (value === null || value === undefined) {
      return "";
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value !== "object") {
      return value;
    }

    const normalizedLanguage = normalizeLanguage(language);
    return (
      value[normalizedLanguage] ??
      value[FALLBACK_LANGUAGE] ??
      value.en ??
      ""
    );
  }

  function setTextContent(element, value) {
    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  }

  function applyTextTranslations(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((element) => {
      setTextContent(element, t(element.dataset.i18n));
    });
  }

  function applyAttributeTranslations(root = document) {
    const attributeMap = {
      "data-i18n-placeholder": "placeholder",
      "data-i18n-title": "title",
      "data-i18n-label": "aria-label",
      "data-i18n-alt": "alt"
    };

    Object.entries(attributeMap).forEach(([dataAttribute, htmlAttribute]) => {
      root.querySelectorAll(`[${dataAttribute}]`).forEach((element) => {
        const key = element.getAttribute(dataAttribute);
        element.setAttribute(htmlAttribute, t(key));
      });
    });
  }

  function updateKnownElements() {
    const languageButton = document.getElementById("lang-btn");
    if (languageButton) {
      languageButton.textContent = currentLanguage.toUpperCase();
      languageButton.setAttribute("aria-label", t("languageButtonLabel"));
      languageButton.setAttribute("title", t("languageButtonLabel"));
      languageButton.setAttribute(
        "lang",
        currentLanguage === "vi" ? "vi" : "en"
      );
    }

    const themeButton = document.getElementById("theme-btn");
    if (themeButton) {
      themeButton.setAttribute("aria-label", t("themeButtonLabel"));
      themeButton.setAttribute("title", t("themeButtonLabel"));
    }

    const dialogCloseButton = document.getElementById("dialog-close");
    if (dialogCloseButton) {
      dialogCloseButton.setAttribute("aria-label", t("closeDialogLabel"));
    }

    const navigation = document.querySelector(".navbar");
    if (navigation) {
      navigation.setAttribute("aria-label", t("primaryNavigationLabel"));
    }

    const socialLinks = document.getElementById("social-links");
    if (socialLinks) {
      socialLinks.setAttribute("aria-label", t("socialNavigationLabel"));
    }

    const heroActions = document.querySelector(".hero-actions");
    if (heroActions) {
      heroActions.setAttribute("aria-label", t("mainActionsLabel"));
    }

    setTextContent(document.querySelector(".hero-eyebrow"), t("heroEyebrow"));
    setTextContent(
      document.querySelector("#contact .section-subtitle"),
      t("contactSubtitle")
    );
    setTextContent(
      document.getElementById("contact-form-note"),
      t("contactFormNote")
    );

    const contactDialog = document.getElementById("contact-dialog");
    if (contactDialog) {
      setTextContent(
        contactDialog.querySelector("p"),
        t("contactDialogDescription")
      );
      setTextContent(
        contactDialog.querySelector("a.btn"),
        t("contactDialogOpenForm")
      );
    }

    const collaborationCard = document.querySelector(".collaboration-card");
    if (collaborationCard) {
      setTextContent(
        collaborationCard.querySelector("h3"),
        t("collaborationTitle")
      );

      const listItems = collaborationCard.querySelectorAll("li");
      const keys = [
        "collaborationJava",
        "collaborationArchitecture",
        "collaborationOpenSource",
        "collaborationContent"
      ];
      listItems.forEach((item, index) => {
        if (keys[index]) {
          setTextContent(item, t(keys[index]));
        }
      });
    }

    const contactName = document.getElementById("contact-name");
    const contactEmail = document.getElementById("contact-email");
    const contactMessage = document.getElementById("contact-message");

    if (contactName) {
      contactName.placeholder = t("contactNamePlaceholder");
    }
    if (contactEmail) {
      contactEmail.placeholder = t("contactEmailPlaceholder");
    }
    if (contactMessage) {
      contactMessage.placeholder = t("contactMessagePlaceholder");
    }
  }

  function applyTranslations(root = document) {
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = "ltr";
    applyTextTranslations(root);
    applyAttributeTranslations(root);
    updateKnownElements();
  }

  function dispatchLanguageChanged(previousLanguage, source) {
    document.dispatchEvent(
      new CustomEvent("languageChanged", {
        detail: {
          language: currentLanguage,
          previousLanguage,
          source
        }
      })
    );
  }

  function setLanguage(language, options = {}) {
    const {
      persist = true,
      emit = true,
      source = "user"
    } = options;

    const nextLanguage = normalizeLanguage(language);
    const previousLanguage = currentLanguage;
    currentLanguage = nextLanguage;

    if (persist) {
      storeLanguage(nextLanguage);
    }

    applyTranslations();

    if (emit && previousLanguage !== nextLanguage) {
      dispatchLanguageChanged(previousLanguage, source);
    }

    return currentLanguage;
  }

  function toggleLanguage() {
    return setLanguage(currentLanguage === "vi" ? "en" : "vi", {
      persist: true,
      emit: true,
      source: "toggle"
    });
  }

  function useDefaultLanguage(language) {
    if (hasStoredPreference) {
      applyTranslations();
      return currentLanguage;
    }

    return setLanguage(language, {
      persist: false,
      emit: true,
      source: "data.json"
    });
  }

  function initialize() {
    const storedLanguage = readStoredLanguage();
    const htmlLanguage = document.documentElement.lang;

    currentLanguage = storedLanguage ?? normalizeLanguage(htmlLanguage);
    applyTranslations();

    const languageButton = document.getElementById("lang-btn");
    if (languageButton && languageButton.dataset.i18nBound !== "true") {
      languageButton.addEventListener("click", toggleLanguage);
      languageButton.dataset.i18nBound = "true";
    }

    document.dispatchEvent(
      new CustomEvent("i18nReady", {
        detail: { language: currentLanguage }
      })
    );
  }

  const LanguageManager = Object.freeze({
    init: initialize,
    t,
    toggle: toggleLanguage,
    setLanguage,
    useDefaultLanguage,
    applyTranslations,
    resolveLanguageValue,
    getLanguage: () => currentLanguage,
    getSupportedLanguages: () => [...SUPPORTED_LANGUAGES],
    hasStoredPreference: () => hasStoredPreference
  });

  window.I18N_MESSAGES = MESSAGES;
  window.LanguageManager = LanguageManager;
  window.t = t;
  window.resolveLanguageValue = resolveLanguageValue;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
