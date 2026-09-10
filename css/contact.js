/*
 * Vu Ha Trong Portfolio
 * contact.js: contact form, validation, drafts and GitHub integration
 * Requires: i18n.js, renderer.js, github.js
 */

(() => {
  "use strict";

  const DRAFT_KEY = "vht-portfolio-contact-draft";
  const LAST_SUBMIT_KEY = "vht-portfolio-contact-last-submit";
  const DEFAULT_RATE_LIMIT_SECONDS = 60;
  const DRAFT_DEBOUNCE_MS = 250;

  let initialized = false;
  let draftTimer = 0;
  let submitting = false;

  function byId(id) {
    return document.getElementById(id);
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

  function translate(key, fallback) {
    return typeof window.t === "function" ? window.t(key) : fallback;
  }

  function currentLanguage() {
    return window.LanguageManager?.getLanguage?.() ||
      document.documentElement.lang ||
      "vi";
  }

  function isVietnamese() {
    return currentLanguage().toLowerCase().startsWith("vi");
  }

  function getForm() {
    return byId("contact-form");
  }

  function getContactConfig() {
    const data = window.PORTFOLIO?.getData?.();
    const contact = asObject(data?.contact);

    const configuredRateLimit = Number(contact.rateLimitSeconds);
    const rateLimitSeconds = Number.isFinite(configuredRateLimit)
      ? Math.min(3600, Math.max(0, Math.round(configuredRateLimit)))
      : DEFAULT_RATE_LIMIT_SECONDS;

    return {
      rateLimitSeconds,
      saveDraft: contact.saveDraft !== false,
      addLocalThankYou: contact.addLocalThankYou !== false,
      telegram: asObject(contact.telegram),
      email: asObject(contact.email)
    };
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[contact] Unable to read ${key}.`, error);
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[contact] Unable to save ${key}.`, error);
      return false;
    }
  }

  function storageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[contact] Unable to remove ${key}.`, error);
    }
  }

  function showToast(message, type = "success", durationMs = 4500) {
    document.querySelectorAll(".toast").forEach((toast) => toast.remove());

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
    toast.textContent = asText(message);
    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.remove();
    }, durationMs);

    return toast;
  }

  function setFormNote(message, type = "") {
    const note = byId("contact-form-note");
    if (!note) return;

    note.textContent = asText(message);
    note.dataset.state = type;
  }

  function setFieldValidity(field, message = "") {
    if (!field) return;
    field.setCustomValidity(message);
    field.toggleAttribute("aria-invalid", Boolean(message));
  }

  function isValidEmail(email) {
    if (!email || email.length > 160) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u.test(email);
  }

  function readForm(form = getForm()) {
    if (!form) {
      return { name: "", email: "", message: "" };
    }

    const formData = new FormData(form);
    return {
      name: asText(formData.get("name")).trim().slice(0, 100),
      email: asText(formData.get("email")).trim().slice(0, 160),
      message: asText(formData.get("message")).trim().slice(0, 3000)
    };
  }

  function validate(form = getForm(), options = {}) {
    const { report = true } = options;
    if (!form) return { valid: false, firstInvalid: null };

    const nameField = form.elements.namedItem("name");
    const emailField = form.elements.namedItem("email");
    const messageField = form.elements.namedItem("message");
    const values = readForm(form);

    setFieldValidity(nameField);
    setFieldValidity(emailField);
    setFieldValidity(messageField);

    if (!values.name) {
      setFieldValidity(
        nameField,
        translate("validationNameRequired", "Vui lòng nhập họ và tên.")
      );
    }

    if (!values.email) {
      setFieldValidity(
        emailField,
        translate("validationEmailRequired", "Vui lòng nhập email.")
      );
    } else if (!isValidEmail(values.email)) {
      setFieldValidity(
        emailField,
        translate("validationEmailInvalid", "Địa chỉ email chưa hợp lệ.")
      );
    }

    if (values.message.length < 5) {
      setFieldValidity(
        messageField,
        translate(
          "validationMessageShort",
          "Nội dung cần có ít nhất 5 ký tự."
        )
      );
    }

    const firstInvalid = form.querySelector(":invalid");
    const valid = !firstInvalid;

    if (!valid && report) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      form.reportValidity();
    }

    return { valid, firstInvalid, values };
  }

  function saveDraftImmediately() {
    const config = getContactConfig();
    const form = getForm();
    if (!config.saveDraft || !form) return;

    const draft = {
      ...readForm(form),
      savedAt: new Date().toISOString()
    };

    const hasContent = draft.name || draft.email || draft.message;
    if (!hasContent) {
      storageRemove(DRAFT_KEY);
      return;
    }

    storageSet(DRAFT_KEY, JSON.stringify(draft));
  }

  function scheduleDraftSave() {
    window.clearTimeout(draftTimer);
    draftTimer = window.setTimeout(saveDraftImmediately, DRAFT_DEBOUNCE_MS);
  }

  function restoreDraft() {
    const config = getContactConfig();
    const form = getForm();
    if (!config.saveDraft || !form) return;

    const rawDraft = storageGet(DRAFT_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft);
      const current = readForm(form);

      if (!current.name && draft.name) form.elements.name.value = draft.name;
      if (!current.email && draft.email) form.elements.email.value = draft.email;
      if (!current.message && draft.message) {
        form.elements.message.value = draft.message;
      }
    } catch (error) {
      console.warn("[contact] Invalid saved draft.", error);
      storageRemove(DRAFT_KEY);
    }
  }

  function getRemainingRateLimitSeconds() {
    const { rateLimitSeconds } = getContactConfig();
    if (rateLimitSeconds <= 0) return 0;

    const lastSubmit = Number(storageGet(LAST_SUBMIT_KEY));
    if (!Number.isFinite(lastSubmit) || lastSubmit <= 0) return 0;

    const elapsedSeconds = (Date.now() - lastSubmit) / 1000;
    return Math.max(0, Math.ceil(rateLimitSeconds - elapsedSeconds));
  }

  function markSubmitted() {
    storageSet(LAST_SUBMIT_KEY, String(Date.now()));
  }

  function setSubmittingState(isSubmitting) {
    const form = getForm();
    if (!form) return;

    submitting = isSubmitting;
    form.setAttribute("aria-busy", String(isSubmitting));

    const button = form.querySelector('button[type="submit"]');
    if (!button) return;

    if (!button.dataset.defaultLabel) {
      button.dataset.defaultLabel = button.textContent.trim();
    }

    button.disabled = isSubmitting;
    button.textContent = isSubmitting
      ? isVietnamese() ? "Đang xử lý..." : "Processing..."
      : translate("contactSend", button.dataset.defaultLabel);
  }

  function addLocalThankYou(name) {
    const config = getContactConfig();
    const container = byId("community-container");
    const section = byId("community");
    if (!config.addLocalThankYou || !container || !section) return;

    const safeName = asText(name, "Anonymous").trim().slice(0, 100) || "Anonymous";
    const duplicate = [...container.querySelectorAll(".community-card h4")]
      .some((heading) => heading.textContent.trim() === safeName);

    if (duplicate) return;

    const card = document.createElement("article");
    card.className = "community-card gsap-card local-thank-you";
    card.dataset.local = "true";

    const heading = document.createElement("h4");
    heading.textContent = safeName;

    const quote = document.createElement("div");
    quote.className = "community-quote";
    quote.textContent = translate(
      "thanksCommunity",
      "Cảm ơn bạn đã theo dõi và ghé thăm portfolio."
    );

    card.append(heading, quote);
    container.prepend(card);
    section.hidden = false;
  }

  function successMessage(result) {
    if (result?.mode === "issue-url") {
      return isVietnamese()
        ? "GitHub đã được mở với nội dung liên hệ điền sẵn. Hãy kiểm tra và nhấn Submit new issue."
        : "GitHub opened with the contact details pre-filled. Review them and select Submit new issue.";
    }

    if (result?.mode === "worker" && result.issueNumber) {
      return isVietnamese()
        ? `Đã tạo GitHub Issue #${result.issueNumber}.`
        : `GitHub Issue #${result.issueNumber} was created.`;
    }

    if (result?.mode === "dispatch") {
      return isVietnamese()
        ? "Yêu cầu đã được gửi tới GitHub Actions để tạo Issue."
        : "The request was sent to GitHub Actions for issue creation.";
    }

    return translate("formSuccess", "Thông tin liên hệ đã được xử lý.");
  }

  function shouldClearAfterResult(result) {
    // In issue-url mode, GitHub has only opened a pre-filled form. The visitor
    // can still cancel, so preserve the local draft until an automatic backend
    // mode confirms acceptance.
    return result?.mode === "worker" || result?.mode === "dispatch";
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting) return;

    const form = event.currentTarget;
    const validation = validate(form);
    if (!validation.valid) return;

    const remainingSeconds = getRemainingRateLimitSeconds();
    if (remainingSeconds > 0) {
      const message = isVietnamese()
        ? `Vui lòng chờ ${remainingSeconds} giây trước khi gửi lại.`
        : `Please wait ${remainingSeconds} seconds before submitting again.`;
      showToast(message, "warning");
      setFormNote(message, "warning");
      return;
    }

    if (!window.GitHubModule?.submitContact) {
      const message = isVietnamese()
        ? "Mô-đun GitHub chưa sẵn sàng."
        : "The GitHub module is not ready.";
      showToast(message, "error");
      setFormNote(message, "error");
      return;
    }

    const payload = {
      ...validation.values,
      submittedAt: new Date().toISOString(),
      source: "portfolio-contact-form",
      language: currentLanguage(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    setSubmittingState(true);
    saveDraftImmediately();

    try {
      const result = await window.GitHubModule.submitContact(payload);

      if (!result?.success) {
        throw new Error(result?.reason || "Contact integration is disabled.");
      }

      markSubmitted();
      addLocalThankYou(payload.name);

      const message = successMessage(result);
      showToast(message, "success", result.mode === "issue-url" ? 7000 : 4500);
      setFormNote(message, "success");

      if (shouldClearAfterResult(result)) {
        form.reset();
        storageRemove(DRAFT_KEY);
      }

      const dialog = byId("contact-dialog");
      if (dialog?.open) dialog.close();

      document.dispatchEvent(
        new CustomEvent("contactProcessed", {
          detail: {
            mode: result.mode,
            success: true,
            issueUrl: result.issueUrl || null,
            issueNumber: result.issueNumber || null
          }
        })
      );
    } catch (error) {
      console.error("[contact] Submit failed:", error);
      const fallback = translate(
        "formError",
        "Không thể xử lý liên hệ. Vui lòng thử lại."
      );
      const message = error?.message ? `${fallback} ${error.message}` : fallback;
      showToast(message, "error", 6500);
      setFormNote(message, "error");
    } finally {
      setSubmittingState(false);
    }
  }

  function openDialog() {
    const dialog = byId("contact-dialog");
    if (!dialog) {
      byId("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) dialog.showModal();
    } else {
      byId("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function closeDialog() {
    const dialog = byId("contact-dialog");
    if (dialog?.open) dialog.close();
  }

  function initializeDialog() {
    const openButton = byId("contact-open-btn");
    const closeButton = byId("dialog-close");
    const dialog = byId("contact-dialog");

    if (openButton && openButton.dataset.contactBound !== "true") {
      openButton.addEventListener("click", openDialog);
      openButton.dataset.contactBound = "true";
    }

    if (closeButton && closeButton.dataset.contactBound !== "true") {
      closeButton.addEventListener("click", closeDialog);
      closeButton.dataset.contactBound = "true";
    }

    if (dialog && dialog.dataset.contactBound !== "true") {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) closeDialog();
      });
      dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeDialog();
      });
      dialog.dataset.contactBound = "true";
    }
  }

  function initializeForm() {
    const form = getForm();
    if (!form || form.dataset.contactBound === "true") return;

    form.addEventListener("submit", submit);
    form.addEventListener("input", (event) => {
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) {
        setFieldValidity(event.target);
      }
      scheduleDraftSave();
    });
    form.addEventListener("change", scheduleDraftSave);
    form.dataset.contactBound = "true";

    restoreDraft();
  }

  function refreshTranslations() {
    const form = getForm();
    if (!form) return;

    const button = form.querySelector('button[type="submit"]');
    if (button && !submitting) {
      button.textContent = translate("contactSend", "Gửi liên hệ");
      button.dataset.defaultLabel = button.textContent.trim();
    }

    if (!byId("contact-form-note")?.dataset.state) {
      setFormNote(
        translate(
          "contactFormNote",
          "Thông tin sẽ được chuyển thành GitHub Issue sau khi endpoint được cấu hình."
        )
      );
    }
  }

  function initialize() {
    if (initialized) return;
    initialized = true;
    initializeForm();
    initializeDialog();
    refreshTranslations();
  }

  document.addEventListener("languageChanged", refreshTranslations);
  document.addEventListener("portfolioRendered", () => {
    if (!initialized) initialize();
    restoreDraft();
  });

  window.ContactModule = Object.freeze({
    init: initialize,
    validate,
    submit,
    saveDraft: saveDraftImmediately,
    restoreDraft,
    clearDraft: () => storageRemove(DRAFT_KEY),
    showToast,
    openDialog,
    closeDialog,
    getRemainingRateLimitSeconds
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
