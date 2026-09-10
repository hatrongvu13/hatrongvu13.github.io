/*
==================================
github.js
GitHub Integration Module
==================================
*/

const GitHubModule = (() => {

    /*
    ==================================
    Config
    ==================================
    */

    const DEFAULT_LABELS = [

        "portfolio-contact",
        "visitor"

    ];

    /*
    ==================================
    Helpers
    ==================================
    */

    function getPortfolioConfig() {

        const data =
            window.PORTFOLIO?.getData();

        if (!data) {
            return null;
        }

        return data.contact || {};
    }

    /*
    ==================================
    Markdown Builder
    ==================================
    */

    function buildIssueBody(payload) {

        return `
# Portfolio Contact Request

## Visitor Information

**Name**

${payload.name}

---

**Email**

${payload.email}

---

## Message

${payload.message}

---

## Metadata

- Submitted At: ${payload.submittedAt}
- Source: GitHub Pages Portfolio
- Language:
${document.documentElement.lang}

---

Generated automatically.
`;
    }

    /*
    ==================================
    Title Builder
    ==================================
    */

    function buildIssueTitle(payload) {

        const timestamp =
            new Date()
                .toISOString()
                .split("T")[0];

        return `[PORTFOLIO CONTACT] ${payload.name} (${timestamp})`;
    }

    /*
    ==================================
    Repository Dispatch Payload
    ==================================
    */

    function buildDispatchPayload(payload) {

        return {

            event_type:
                "portfolio-contact",

            client_payload: {

                name:
                payload.name,

                email:
                payload.email,

                message:
                payload.message,

                submittedAt:
                payload.submittedAt,

                issueTitle:
                    buildIssueTitle(
                        payload
                    ),

                issueBody:
                    buildIssueBody(
                        payload
                    ),

                labels:
                DEFAULT_LABELS
            }
        };
    }

    /*
    ==================================
    Direct GitHub Issue
    ==================================

    WARNING:
    Not recommended because
    PAT token must never
    stay in frontend.

    Only for local testing.
    ==================================
    */

    async function createIssueDirect() {

        throw new Error(
            "Direct GitHub API from frontend is disabled."
        );
    }

    /*
    ==================================
    Repository Dispatch
    ==================================

    Cloudflare Worker
    or GitHub Backend

    Recommended
    ==================================
    */

    async function sendRepositoryDispatch(
        payload
    ) {

        const config =
            getPortfolioConfig();

        if (!config) {

            throw new Error(
                "Contact configuration missing."
            );
        }

        /*
        Example

        https://worker.domain/api/contact

        */

        const endpoint =
            config.dispatchEndpoint;

        if (!endpoint) {

            console.warn(
                "dispatchEndpoint missing"
            );

            return {
                success: true,
                offline: true
            };
        }

        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            buildDispatchPayload(
                                payload
                            )
                        )
                }
            );

        if (!response.ok) {

            throw new Error(
                `Dispatch failed: ${response.status}`
            );
        }

        const result =
            await response.json();

        return result;
    }

    /*
    ==================================
    Cloudflare Worker
    ==================================
    */

    async function sendViaWorker(
        payload
    ) {

        const config =
            getPortfolioConfig();

        if (!config) {

            throw new Error(
                "Config missing"
            );
        }

        const endpoint =
            config.workerEndpoint;

        if (!endpoint) {

            return {
                success: true,
                skipped: true
            };
        }

        const response =
            await fetch(
                endpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );

        if (!response.ok) {

            throw new Error(
                "Worker request failed"
            );
        }

        return response.json();
    }

    /*
    ==================================
    Public Submit
    ==================================
    */

    async function submitContact(
        payload
    ) {

        const config =
            getPortfolioConfig();

        console.log(
            "[GitHub Contact]",
            payload
        );

        /*
        Priority

        Cloudflare Worker

        Dispatch

        Local Demo
        */

        if (
            config?.workerEndpoint
        ) {

            return await sendViaWorker(
                payload
            );
        }

        if (
            config?.dispatchEndpoint
        ) {

            return await sendRepositoryDispatch(
                payload
            );
        }

        /*
        Local fallback

        Useful for testing
        */

        console.warn(
            "No backend endpoint configured."
        );

        return {

            success: true,

            localMode: true,

            title:
                buildIssueTitle(
                    payload
                ),

            body:
                buildIssueBody(
                    payload
                )
        };
    }

    /*
    ==================================
    Open GitHub Issue URL
    ==================================
    */

    function generateIssueUrl(
        payload
    ) {

        const config =
            getPortfolioConfig();

        const repo =
            config?.repository;

        if (!repo) {
            return null;
        }

        const title =
            encodeURIComponent(
                buildIssueTitle(
                    payload
                )
            );

        const body =
            encodeURIComponent(
                buildIssueBody(
                    payload
                )
            );

        return `https://github.com/${repo}/issues/new?title=${title}&body=${body}`;
    }

    /*
    ==================================
    Public API
    ==================================
    */

    return {

        submitContact,

        buildIssueBody,

        buildIssueTitle,

        generateIssueUrl

    };

})();

/*
==================================
Global Access
==================================
*/

window.GitHubModule =
    GitHubModule;