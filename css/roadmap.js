/*
 * Vu Ha Trong Portfolio
 * roadmap.js: data-driven career roadmap and capability renderer
 * Requires: i18n.js, renderer.js
 */

(() => {
  "use strict";

  const STATUS_ORDER = Object.freeze({
    completed: 0,
    learning: 1,
    planned: 2
  });

  const STATUS_ALIASES = Object.freeze({
    done: "completed",
    complete: "completed",
    completed: "completed",
    current: "learning",
    progress: "learning",
    "in-progress": "learning",
    learning: "learning",
    planned: "planned",
    plan: "planned",
    future: "planned"
  });

  let renderVersion = 0;

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

  function appendText(parent, tagName, text, className = "") {
    const element = create(tagName, { className, text });
    parent.appendChild(element);
    return element;
  }

  function normalizeStatus(status) {
    const normalized = asText(status, "planned")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    return STATUS_ALIASES[normalized] || "planned";
  }

  function statusLabel(status) {
    const normalized = normalizeStatus(status);
    return translate(normalized, normalized);
  }

  function clampPercentage(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function getRoadmapConfig(data) {
    const config = asObject(data.roadmapSettings || data.roadmapConfig);
    const creator = asObject(data.creator);

    return {
      showStatistics: config.showStatistics !== false,
      showCapabilities: config.showCapabilities !== false,
      showCareerPath: config.showCareerPath !== false,
      sortByYear: config.sortByYear === true,
      capabilities: asArray(
        data.capabilities ||
        data.careerMatrix ||
        data.roadmapCapabilities ||
        config.capabilities
      ),
      careerPath: asArray(
        data.careerPath ||
        config.careerPath ||
        creator.careerPath
      )
    };
  }

  function normalizeRoadmapItems(items, sortByYear) {
    const normalized = asArray(items).map((item, index) => {
      const object = asObject(item);
      return {
        ...object,
        _index: index,
        status: normalizeStatus(object.status),
        title: localized(object.title || object.target || object.role),
        description: localized(object.description || object.summary),
        year: asText(object.year || object.period || "")
      };
    });

    if (!sortByYear) {
      return normalized;
    }

    return normalized.sort((left, right) => {
      const leftYear = Number.parseInt(left.year, 10);
      const rightYear = Number.parseInt(right.year, 10);

      if (Number.isFinite(leftYear) && Number.isFinite(rightYear)) {
        return leftYear - rightYear;
      }
      return left._index - right._index;
    });
  }

  function renderEmptyState(container) {
    container.appendChild(
      create("p", {
        className: "empty-state",
        text: translate("noData", "Chưa có dữ liệu để hiển thị.")
      })
    );
  }

  function renderTimeline(parent, items) {
    if (!items.length) {
      renderEmptyState(parent);
      return;
    }

    const timeline = create("div", {
      className: "roadmap-container",
      attributes: {
        "aria-label": translate("roadmapTitle", "Lộ trình nghề nghiệp")
      }
    });

    items.forEach((item) => {
      const card = create("article", {
        className: `roadmap-card gsap-card status-${item.status}`,
        attributes: {
          "data-roadmap-status": item.status
        }
      });

      if (item.year) {
        appendText(card, "div", item.year, "timeline-year");
      }

      appendText(card, "h3", item.title || translate("planned", "Dự kiến"));

      if (item.description) {
        appendText(card, "p", item.description, "roadmap-description");
      }

      appendText(
        card,
        "div",
        statusLabel(item.status),
        `roadmap-status ${item.status}`
      );

      const topics = asArray(item.topics || item.skills || item.focus);
      if (topics.length) {
        const topicContainer = create("div", {
          className: "creator-topics roadmap-topics"
        });

        topics.forEach((topic) => {
          topicContainer.appendChild(
            create("span", {
              className: "chip",
              text: localized(topic)
            })
          );
        });

        card.appendChild(topicContainer);
      }

      timeline.appendChild(card);
    });

    parent.appendChild(timeline);
  }

  function createStatCard(value, label, className = "") {
    const card = create("article", {
      className: `stat-card roadmap-stat ${className}`.trim()
    });
    appendText(card, "strong", value);
    appendText(card, "div", label);
    return card;
  }

  function renderStatistics(parent, items) {
    const counts = items.reduce(
      (result, item) => {
        result.total += 1;
        result[item.status] += 1;
        return result;
      },
      { total: 0, completed: 0, learning: 0, planned: 0 }
    );

    const completedPercent = counts.total
      ? Math.round((counts.completed / counts.total) * 100)
      : 0;

    const card = create("section", {
      className: "content-card roadmap-summary gsap-card",
      attributes: {
        "aria-labelledby": "roadmap-summary-title"
      }
    });

    appendText(
      card,
      "h3",
      translate("roadmapJourney", "Lộ trình nghề nghiệp"),
      "roadmap-panel-title"
    ).id = "roadmap-summary-title";

    const stats = create("div", { className: "stats-grid roadmap-stats-grid" });
    stats.append(
      createStatCard(counts.total, translate("total", "Tổng số")),
      createStatCard(
        counts.completed,
        translate("completed", "Đã hoàn thành"),
        "status-completed"
      ),
      createStatCard(
        counts.learning,
        translate("learning", "Đang phát triển"),
        "status-learning"
      )
    );
    card.appendChild(stats);

    const progressHeader = create("div", { className: "progress-label" });
    appendText(progressHeader, "span", translate("completed", "Đã hoàn thành"));
    appendText(progressHeader, "strong", `${completedPercent}%`);
    card.appendChild(progressHeader);

    const progress = create("div", {
      className: "skill-progress",
      attributes: {
        role: "progressbar",
        "aria-valuemin": "0",
        "aria-valuemax": "100",
        "aria-valuenow": String(completedPercent),
        "aria-label": translate("completed", "Đã hoàn thành")
      }
    });

    progress.appendChild(
      create("div", {
        className: "skill-progress-fill",
        attributes: {
          style: `width: ${completedPercent}%`
        }
      })
    );

    card.appendChild(progress);

    if (counts.planned > 0) {
      appendText(
        card,
        "p",
        `${translate("planned", "Dự kiến")}: ${counts.planned}`,
        "roadmap-planned-note"
      );
    }

    parent.appendChild(card);
  }

  function normalizeCapability(item) {
    const capability = asObject(item);
    const value = clampPercentage(
      capability.value ??
      capability.current ??
      capability.progress ??
      capability.percent
    );

    return {
      name: localized(capability.name || capability.title || capability.skill),
      description: localized(capability.description),
      value,
      target: clampPercentage(capability.target ?? 100),
      status: normalizeStatus(capability.status || "learning")
    };
  }

  function renderCapabilities(parent, capabilities) {
    const items = asArray(capabilities)
      .map(normalizeCapability)
      .filter((item) => item.name);

    if (!items.length) {
      return;
    }

    const card = create("section", {
      className: "content-card capability-panel gsap-card",
      attributes: {
        "aria-labelledby": "capability-panel-title"
      }
    });

    appendText(
      card,
      "h3",
      translate("careerMatrix", "Ma trận phát triển năng lực"),
      "roadmap-panel-title"
    ).id = "capability-panel-title";

    const list = create("div", { className: "capability-list" });

    items.forEach((item) => {
      const row = create("article", {
        className: "capability-item",
        attributes: {
          "data-capability-status": item.status
        }
      });

      const header = create("div", { className: "capability-header" });
      appendText(header, "span", item.name, "capability-name");
      appendText(header, "strong", `${item.value}%`, "capability-value");
      row.appendChild(header);

      if (item.description) {
        appendText(row, "p", item.description, "capability-description");
      }

      const progress = create("div", {
        className: "skill-progress",
        attributes: {
          role: "progressbar",
          "aria-valuemin": "0",
          "aria-valuemax": String(item.target || 100),
          "aria-valuenow": String(item.value),
          "aria-label": item.name
        }
      });

      progress.appendChild(
        create("div", {
          className: "skill-progress-fill capability-progress-fill",
          attributes: {
            style: `width: ${item.value}%`
          }
        })
      );

      row.appendChild(progress);
      list.appendChild(row);
    });

    card.appendChild(list);
    parent.appendChild(card);
  }

  function inferCareerPath(items) {
    return items
      .map((item) => item.title)
      .filter(Boolean)
      .filter((title, index, list) => list.indexOf(title) === index);
  }

  function renderCareerPath(parent, configuredPath, roadmapItems) {
    const path = asArray(configuredPath).length
      ? asArray(configuredPath).map(localized).filter(Boolean)
      : inferCareerPath(roadmapItems);

    if (!path.length) {
      return;
    }

    const card = create("section", {
      className: "content-card career-path-panel gsap-card",
      attributes: {
        "aria-labelledby": "career-path-title"
      }
    });

    appendText(
      card,
      "h3",
      translate("careerPath", "Lộ trình nghề nghiệp"),
      "roadmap-panel-title"
    ).id = "career-path-title";

    const flow = create("ol", { className: "career-path" });

    path.forEach((step, index) => {
      const item = create("li", { className: "career-path-step" });
      appendText(item, "span", String(index + 1), "career-path-index");
      appendText(item, "strong", step, "career-path-label");
      flow.appendChild(item);
    });

    card.appendChild(flow);
    parent.appendChild(card);
  }

  function refreshGsap() {
    if (window.ScrollTrigger?.refresh) {
      window.requestAnimationFrame(() => window.ScrollTrigger.refresh());
    }
  }

  function render() {
    const container = byId("roadmap-container");
    const data = window.PORTFOLIO?.getData?.();

    if (!container || !data) {
      return;
    }

    renderVersion += 1;
    const currentVersion = renderVersion;

    container.replaceChildren();

    const config = getRoadmapConfig(data);
    const items = normalizeRoadmapItems(data.roadmap, config.sortByYear);

    renderTimeline(container, items);

    if (config.showStatistics && items.length) {
      renderStatistics(container, items);
    }

    if (config.showCapabilities) {
      renderCapabilities(container, config.capabilities);
    }

    if (config.showCareerPath) {
      renderCareerPath(container, config.careerPath, items);
    }

    if (currentVersion === renderVersion) {
      container.dataset.rendered = "true";
      refreshGsap();

      document.dispatchEvent(
        new CustomEvent("roadmapRendered", {
          detail: {
            itemCount: items.length,
            capabilityCount: config.capabilities.length,
            version: currentVersion
          }
        })
      );
    }
  }

  /*
   * renderer.js emits portfolioRendered after every initial render and
   * language change. Listening only to this event prevents duplicate work.
   */
  document.addEventListener("portfolioRendered", render);

  window.RoadmapModule = Object.freeze({
    render,
    refresh: render,
    normalizeStatus,
    getStatusOrder: () => ({ ...STATUS_ORDER })
  });
})();
