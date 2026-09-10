/*
 * Vu Ha Trong Portfolio
 * github.js: safe GitHub contact integration for a static GitHub Pages site
 *
 * Security rule:
 * - Never place a GitHub token in data.json or frontend JavaScript.
 * - Use Issue Composer mode for zero-backend deployment.
 * - Use a trusted Worker/API endpoint for automatic issue creation.
 */

(() => {
  "use strict";

  const DEFAULT_EVENT_TYPE = "portfolio-contact";
  const DEFAULT_LABELS = Object.freeze(["portfolio-contact", "visitor"]);
  const ALLOWED_MODES = Object.freeze([
    "issue-url",
    "worker",
    "dispatch",
    "disabled"
  ]);

  function asObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function asText(value, fallback = "") {
    if (value === null || value === undefined) {
      return fallback;
    }
    return String(value).trim();
  }

  function getLanguage() {
    return window.LanguageManager?.getLanguage?.() ||
      document.documentElement.lang ||
      "vi";
  }

  function getContactConfig() {
    const data = window.PORTFOLIO?.getData?.();
    const contact = asObject(data?.contact);
    const github = asObject(contact.github);

    const repository =
      github.repository ||
      contact.repository ||
      contact.githubRepo ||
      "";

    const configuredMode = asText(
      github.mode || contact.githubMode || "issue-url"
    ).toLowerCase();

    return {
      enabled:
        github.enabled !== false &&
        contact.githubIssueEnabled !== false,
      mode: ALLOWED_MODES.includes(configuredMode)
        ? configuredMode
        : "issue-url",
      repository,
      endpoint:
        github.endpoint ||
        contact.workerEndpoint ||
        contact.dispatchEndpoint ||
        "",
      eventType:
        github.eventType ||
        contact.eventType ||
        DEFAULT_EVENT_TYPE,
      labels: normalizeLabels(
        github.labels || contact.labels || DEFAULT_LABELS
      ),
      issueTemplate: github.issueTemplate || contact.issueTemplate || "",
      issueAssignees: normalizeLabels(
        github.assignees || contact.assignees || []
      ),
      openInNewTab: github.openInNewTab !== false,
      requestTimeoutMs: normalizeTimeout(
        github.requestTimeoutMs || contact.requestTimeoutMs
      )
    };
  }

  function normalizeTimeout(value) {
    const timeout = Number(value);
    if (!Number.isFinite(timeout)) {
      return 12000;
    }
    return Math.min(30000, Math.max(3000, Math.round(timeout)));
  }

  function normalizeLabels(value) {
    const source = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(",")
        : [];

    return [...new Set(
      source
        .map((item) => asText(item))
        .filter(Boolean)
        .slice(0, 10)
    )];
  }

  function normalizeRepository(repository) {
    const value = asText(repository)
      .replace(/^https?:\/\/github\.com\//i, "")
      .replace(/^github\.com\//i, "")
      .replace(/^\/+|\/+$/g, "")
      .replace(/\.git$/i, "");

    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value)) {
      return "";
    }

    return value;
  }

  function isSafeEndpoint(value) {
    if (typeof value !== "string" || !value.trim()) {
      return false;
    }

    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname));
    } catch {
      return false;
    }
  }

  function sanitizeLine(value, maximumLength = 180) {
    return asText(value)
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s{2,}/g, " ")
      .slice(0, maximumLength);
  }

  function sanitizeMessage(value, maximumLength = 3000) {
    return asText(value)
      .replace(/\u0000/g, "")
      .slice(0, maximumLength);
  }

  function normalizePayload(payload) {
    const source = asObject(payload);

    return {
      name: sanitizeLine(source.name, 100),
      email: sanitizeLine(source.email, 160),
      message: sanitizeMessage(source.message, 3000),
      submittedAt: asText(source.submittedAt) || new Date().toISOString(),
      source: sanitizeLine(source.source || "portfolio", 80),
      language: sanitizeLine(source.language || getLanguage(), 12),
      pageUrl: sanitizeLine(source.pageUrl || window.location.href, 500),
      userAgent: sanitizeLine(source.userAgent || navigator.userAgent, 300)
    };
  }

  function escapeMarkdown(value) {
    return asText(value)
      .replace(/\\/g, "\\\\")
      .replace(/([`*_{}\[\]()#+.!|>~-])/g, "\\$1");
  }

  function buildIssueTitle(payload) {
    const normalized = normalizePayload(payload);
    const date = normalized.submittedAt.slice(0, 10) ||
      new Date().toISOString().slice(0, 10);
    const visitorName = normalized.name || "Anonymous";

    return `[PORTFOLIO CONTACT] ${visitorName} · ${date}`;
  }

  function buildIssueBody(payload) {
    const normalized = normalizePayload(payload);

    return [
      "## Portfolio contact",
      "",
      `**Name:** ${escapeMarkdown(normalized.name || "Anonymous")}`,
      `**Email:** ${escapeMarkdown(normalized.email || "Not provided")}`,
      `**Language:** ${escapeMarkdown(normalized.language)}`,
      "",
      "### Message",
      "",
      normalized.message || "No message provided.",
      "",
      "### Submission metadata",
      "",
      `- Submitted at: ${escapeMarkdown(normalized.submittedAt)}`,
      `- Source: ${escapeMarkdown(normalized.source)}`,
      `- Page: ${escapeMarkdown(normalized.pageUrl)}`,
      "",
      "_Created from the portfolio contact form._"
    ].join("\n");
  }

  function buildIssueData(payload, config = getContactConfig()) {
    const normalized = normalizePayload(payload);

    return {
      title: buildIssueTitle(normalized),
      body: buildIssueBody(normalized),
      labels: normalizeLabels(config.labels),
      assignees: normalizeLabels(config.issueAssignees),
      metadata: normalized
    };
  }

  function buildIssueUrl(payload, config = getContactConfig()) {
    const repository = normalizeRepository(config.repository);
    if (!repository) {
      return null;
    }

    const issue = buildIssueData(payload, config);
    const parameters = new URLSearchParams();
    parameters.set("title", issue.title);
    parameters.set("body", issue.body);

    if (issue.labels.length) {
      parameters.set("labels", issue.labels.join(","));
    }
    if (issue.assignees.length) {
      parameters.set("assignees", issue.assignees.join(","));
    }
    if (config.issueTemplate) {
      parameters.set("template", config.issueTemplate);
    }

    return `https://github.com/${repository}/issues/new?${parameters.toString()}`;
  }

  function openIssueComposer(payload, config = getContactConfig()) {
    const issueUrl = buildIssueUrl(payload, config);
    if (!issueUrl) {
      throw new Error("GitHub repository configuration is invalid or missing.");
    }

    const target = config.openInNewTab ? "_blank" : "_self";
    const openedWindow = window.open(issueUrl, target, "noopener,noreferrer");

    if (config.openInNewTab && !openedWindow) {
      window.location.assign(issueUrl);
    }

    return {
      success: true,
      mode: "issue-url",
      requiresUserConfirmation: true,
      issueUrl
    };
  }

  function buildWorkerRequest(payload, config) {
    const issue = buildIssueData(payload, config);

    return {
      action: "create-github-issue",
      repository: normalizeRepository(config.repository),
      eventType: config.eventType,
      issue: {
        title: issue.title,
        body: issue.body,
        labels: issue.labels,
        assignees: issue.assignees
      },
      contact: issue.metadata
    };
  }

  function buildDispatchRequest(payload, config) {
    const issue = buildIssueData(payload, config);

    return {
      event_type: config.eventType || DEFAULT_EVENT_TYPE,
      client_payload: {
        repository: normalizeRepository(config.repository),
        issueTitle: issue.title,
        issueBody: issue.body,
        labels: issue.labels,
        assignees: issue.assignees,
        contact: issue.metadata
      }
    };
  }

  async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : {};
  }

  async function postJson(endpoint, body, timeoutMs) {
    if (!isSafeEndpoint(endpoint)) {
      throw new Error("A secure contact endpoint is not configured.");
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "strict-origin-when-cross-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const result = await parseResponse(response);

      if (!response.ok) {
        const message = result?.message ||
          result?.error ||
          `Request failed with HTTP ${response.status}.`;
        throw new Error(message);
      }

      return result;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new Error("The contact request timed out.");
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function submitViaWorker(payload, config) {
    const request = buildWorkerRequest(payload, config);
    const result = await postJson(
      config.endpoint,
      request,
      config.requestTimeoutMs
    );

    return {
      success: true,
      mode: "worker",
      issueUrl: result.issueUrl || result.html_url || null,
      issueNumber: result.issueNumber || result.number || null,
      response: result
    };
  }

  async function submitViaDispatch(payload, config) {
    const request = buildDispatchRequest(payload, config);
    const result = await postJson(
      config.endpoint,
      request,
      config.requestTimeoutMs
    );

    return {
      success: true,
      mode: "dispatch",
      accepted: true,
      response: result
    };
  }

  async function submitContact(payload) {
    const config = getContactConfig();

    if (!config.enabled || config.mode === "disabled") {
      return {
        success: false,
        mode: "disabled",
        skipped: true,
        reason: "GitHub contact integration is disabled."
      };
    }

    if (!normalizeRepository(config.repository)) {
      throw new Error("Set contact.github.repository in data.json.");
    }

    switch (config.mode) {
      case "worker":
        return submitViaWorker(payload, config);

      case "dispatch":
        return submitViaDispatch(payload, config);

      case "issue-url":
      default:
        return openIssueComposer(payload, config);
    }
  }

  function getPublicConfig() {
    const config = getContactConfig();
    return {
      enabled: config.enabled,
      mode: config.mode,
      repository: normalizeRepository(config.repository),
      hasEndpoint: isSafeEndpoint(config.endpoint),
      labels: [...config.labels],
      openInNewTab: config.openInNewTab
    };
  }

  window.GitHubModule = Object.freeze({
    submitContact,
    generateIssueUrl: buildIssueUrl,
    buildIssueUrl,
    buildIssueTitle,
    buildIssueBody,
    buildIssueData,
    buildWorkerRequest,
    buildDispatchRequest,
    normalizePayload,
    normalizeRepository,
    getConfig: getPublicConfig
  });
})();
