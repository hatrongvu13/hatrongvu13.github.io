/* Dynamic CV Renderer */
(() => {
    "use strict";
    const CV_DOCUMENT_ID = "cv-document";
    const CV_BUTTON_ID = "download-cv-btn";
    const PREVIEW_CLASS = "cv-preview-mode";
    let initialized = false;
    let originalTitle = "";

    const byId = (id) => document.getElementById(id);
    const getData = () => window.PORTFOLIO?.getData?.() || null;
    const toArray = (value) => Array.isArray(value) ? value : [];
    const localized = (value) => window.resolveLanguageValue?.(value) ?? value ?? "";
    const escapeHtml = (value) => String(value ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
    const setText = (id,value) => { const e=byId(id); if(e) e.textContent=value ?? ""; };
    const setHtml = (id,value) => { const e=byId(id); if(e) e.innerHTML=value; };
    const safeUrl = (value) => { try { const u=new URL(value,location.href); return ["http:","https:"].includes(u.protocol)?u.href:""; } catch { return ""; } };
    const setBlockVisibility = (id,visible) => { const b=byId(id)?.closest(".cv-block"); if(b) b.hidden=!visible; };

    function roadmapStageLabel(value) {
        const normalized = String(value || "")
            .trim()
            .toLowerCase();

        const keys = {
            completed: "cvCompleted",
            current: "cvCurrent",
            next: "cvNext",
            planned: "cvPlanned"
        };

        return keys[normalized]
            ? window.t?.(keys[normalized]) || value
            : value;
    }

    function renderRoadmap(data) {
        const config = data.settings?.cv || {};
        const showRoadmap = config.showRoadmap !== false;
        const roadmap = toArray(data.roadmap);

        setBlockVisibility(
            "cv-roadmap",
            showRoadmap && roadmap.length > 0
        );

        if (!showRoadmap) {
            setHtml("cv-roadmap", "");
            return;
        }

        const html = roadmap.map(item => {
            const status = [
                "completed",
                "learning",
                "planned"
            ].includes(item.status)
                ? item.status
                : "planned";

            return `
      <div class="cv-roadmap-item ${status}">
        <strong>
          ${escapeHtml(
                roadmapStageLabel(item.year)
            )}
        </strong>

        <div>
          ${escapeHtml(
                localized(item.title)
            )}
        </div>
      </div>
    `;
        }).join("");

        setHtml("cv-roadmap", html);
    }
    function renderHeader(data) {
        const personal=data.personal||{};
        const social=data.social||{};
        const config=data.settings?.cv||{};
        setText("cv-full-name",personal.fullName);
        setText("cv-role",localized(personal.role));
        setText("cv-tagline",localized(personal.tagline));
        setText("cv-footer-name",personal.fullName);
        const items=[];
        if(personal.email) items.push(`<a href="mailto:${escapeHtml(personal.email)}">${escapeHtml(personal.email)}</a>`);
        if(personal.phone) items.push(`<a href="tel:${escapeHtml(String(personal.phone).replace(/[^+\\d]/g,""))}">${escapeHtml(personal.phone)}</a>`);
        if(personal.location) items.push(`<span>${escapeHtml(localized(personal.location))}</span>`);
        const github=safeUrl(social.github||personal.github);
        const linkedin=safeUrl(social.linkedin||personal.linkedin);
        if(github) items.push(`<a href="${escapeHtml(github)}">GitHub</a>`);
        if(linkedin) items.push(`<a href="${escapeHtml(linkedin)}">LinkedIn</a>`);
        setHtml("cv-contact-list",items.join(""));
        const avatar=byId("cv-avatar");
        const fallback=byId("cv-avatar-fallback");
        const show=config.showAvatar!==false;
        if(avatar){ avatar.hidden=!show; avatar.src=personal.avatar||"./assets/avatar/avatar.png"; }
        if(fallback) fallback.hidden=true;
    }

    function render() {
        const data=getData();
        if(!data) throw new Error("Portfolio data is not ready.");
        window.LanguageManager?.applyTranslations?.();
        const config=data.settings?.cv||{};
        renderHeader(data);
        setText("cv-summary",localized(data.personal?.summary));
        setHtml("cv-skills",toArray(data.skills).map(g=>`<div class="cv-skill-group"><h4>${escapeHtml(localized(g.group||g.title||"Skills"))}</h4><div class="cv-chip-list">${toArray(g.items).map(x=>`<span class="cv-chip">${escapeHtml(localized(x))}</span>`).join("")}</div></div>`).join(""));
        const competencies=toArray(config.competencies).length?toArray(config.competencies):["Java Backend","REST API","System Integration","Clean Architecture","Database Optimization","Code Review"];
        setHtml("cv-competencies",`<div class="cv-chip-list">${competencies.map(x=>`<span class="cv-chip">${escapeHtml(localized(x))}</span>`).join("")}</div>`);
        setHtml("cv-experience",toArray(data.experience).slice(0,Number(config.maxExperience)||4).map(x=>`<article class="cv-experience-item"><div class="cv-item-heading"><h4>${escapeHtml(localized(x.role))}</h4><span class="cv-period">${escapeHtml(x.period)}</span></div><div class="cv-company">${escapeHtml(localized(x.company))}</div><p>${escapeHtml(localized(x.description))}</p>${toArray(localized(x.achievements)).length?`<ul>${toArray(localized(x.achievements)).map(a=>`<li>${escapeHtml(a)}</li>`).join("")}</ul>`:""}</article>`).join(""));
        const projects=toArray(data.projects).slice(0,Number(config.maxProjects)||3);
        setBlockVisibility("cv-projects",config.showProjects!==false&&projects.length>0);
        setHtml("cv-projects",projects.map(x=>`<article class="cv-project-item"><div class="cv-item-heading"><h4>${escapeHtml(localized(x.name))}</h4><span class="cv-period">${escapeHtml(localized(x.type))}</span></div><p>${escapeHtml(localized(x.description))}</p><div class="cv-chip-list">${toArray(x.tech).map(t=>`<span class="cv-chip">${escapeHtml(localized(t))}</span>`).join("")}</div></article>`).join(""));
        const architectures=toArray(data.architectures).slice(0,Number(config.maxArchitectures)||2);
        setBlockVisibility("cv-architectures",config.showArchitecture!==false&&architectures.length>0);
        setHtml("cv-architectures",architectures.map(x=>`<article class="cv-architecture-item"><div class="cv-item-heading"><h4>${escapeHtml(localized(x.name))}</h4><span class="cv-period">${escapeHtml(localized(x.level))}</span></div><p>${escapeHtml(localized(x.description))}</p><div class="cv-chip-list">${toArray(x.diagram).map(t=>`<span class="cv-chip">${escapeHtml(localized(t))}</span>`).join("")}</div></article>`).join(""));
        const roadmap=toArray(data.roadmap);
        setBlockVisibility("cv-roadmap",config.showRoadmap!==false&&roadmap.length>0);
        setHtml("cv-roadmap",roadmap.map(x=>`<div class="cv-roadmap-item ${["completed","learning","planned"].includes(x.status)?x.status:"planned"}"><strong>${escapeHtml(x.year)}</strong><div>${escapeHtml(localized(x.title))}</div></div>`).join(""));
        renderRoadmap(data);
    }

    function printCv(event) {
        event?.preventDefault();
        try {
            const data=getData();
            if(!data) throw new Error("Portfolio data is not ready.");
            const config=data.settings?.cv||{};
            if(config.mode==="file" && config.url){ location.href=config.url; return; }
            render();
            const doc=byId(CV_DOCUMENT_ID);
            if(!doc) throw new Error(`#${CV_DOCUMENT_ID} was not found.`);
            originalTitle=document.title;
            doc.hidden=false;
            document.body.classList.add(PREVIEW_CLASS);
            document.title=(config.fileName||"Vu-Ha-Trong-CV.pdf").replace(/\.pdf$/i,"");
            requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
        } catch(error){
            console.error("[CvModule]",error);
            window.ContactModule?.showToast?.("Không thể tạo CV. Vui lòng thử lại.","error");
        }
    }

    function restorePortfolio(){
        document.body.classList.remove(PREVIEW_CLASS);
        const doc=byId(CV_DOCUMENT_ID); if(doc) doc.hidden=true;
        document.title=originalTitle||getData()?.settings?.siteTitle||"Vu Ha Trong Portfolio";
    }

    function init(){
        if(initialized) return;
        const button=byId(CV_BUTTON_ID);
        if(!button) return;
        initialized=true;
        button.addEventListener("click",printCv);
        window.addEventListener("afterprint",restorePortfolio);
        document.addEventListener("languageChanged",()=>{
            if (getData()) {
                try {
                    render();
                } catch (error) {
                    console.error('{ERROR}', error);
                }
            }
        });
    }

    window.CvModule=Object.freeze({init,render,print:printCv,restorePortfolio});
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
