/*
==================================
contact.js
Contact & Community Module
==================================
*/

const ContactModule = (() => {

    const STORAGE_KEY =
        "portfolio-last-submit";

    const RATE_LIMIT_SECONDS = 60;

    /*
    ==================================
    Helpers
    ==================================
    */

    function getForm() {

        return document.getElementById(
            "contact-form"
        );
    }

    function getDialog() {

        return document.getElementById(
            "contact-dialog"
        );
    }

    /*
    ==================================
    Toast
    ==================================
    */

    function showToast(
        message,
        type = "success"
    ) {

        const oldToast =
            document.querySelector(
                ".toast"
            );

        if (oldToast) {
            oldToast.remove();
        }

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.textContent =
            message;

        document.body.appendChild(
            toast
        );

        setTimeout(() => {

            toast.remove();

        }, 4000);
    }

    /*
    ==================================
    Validation
    ==================================
    */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);
    }

    function validateForm(
        name,
        email,
        message
    ) {

        if (!name?.trim()) {

            showToast(
                "Name is required",
                "error"
            );

            return false;
        }

        if (!email?.trim()) {

            showToast(
                "Email is required",
                "error"
            );

            return false;
        }

        if (!isValidEmail(email)) {

            showToast(
                "Invalid email",
                "error"
            );

            return false;
        }

        if (
            !message ||
            message.trim().length < 5
        ) {

            showToast(
                "Message is too short",
                "error"
            );

            return false;
        }

        return true;
    }

    /*
    ==================================
    Anti Spam
    ==================================
    */

    function canSubmit() {

        const lastSubmit =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!lastSubmit) {
            return true;
        }

        const nextTime =
            Number(lastSubmit)
            +
            RATE_LIMIT_SECONDS * 1000;

        return Date.now() > nextTime;
    }

    function markSubmitted() {

        localStorage.setItem(
            STORAGE_KEY,
            Date.now()
        );
    }

    /*
    ==================================
    Community Thank You
    ==================================
    */

    function thankUser(name) {

        const container =
            document.getElementById(
                "community-container"
            );

        if (!container) {
            return;
        }

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "community-card";

        card.innerHTML = `
            <h4>
                ${name}
            </h4>

            <div
             class="community-quote">
                ❤️
                ${t(
            "thanksCommunity"
        )}
            </div>
        `;

        container.prepend(card);
    }

    /*
    ==================================
    Draft Save
    ==================================
    */

    function saveDraft(data) {

        localStorage.setItem(
            "portfolio-contact-draft",
            JSON.stringify(data)
        );
    }

    function loadDraft() {

        const raw =
            localStorage.getItem(
                "portfolio-contact-draft"
            );

        if (!raw) {
            return null;
        }

        try {

            return JSON.parse(raw);

        } catch {

            return null;
        }
    }

    function restoreDraft() {

        const draft =
            loadDraft();

        if (!draft) {
            return;
        }

        const form = getForm();

        if (!form) {
            return;
        }

        if (draft.name) {
            form.name.value =
                draft.name;
        }

        if (draft.email) {
            form.email.value =
                draft.email;
        }

        if (draft.message) {
            form.message.value =
                draft.message;
        }
    }

    /*
    ==================================
    Future Providers
    ==================================
    */

    async function sendToGithubIssue(
        payload
    ) {

        console.log(
            "[Future GitHub Issue]",
            payload
        );

        return {
            success: true
        };
    }

    async function sendToTelegram(
        payload
    ) {

        console.log(
            "[Future Telegram]",
            payload
        );

        return {
            success: true
        };
    }

    async function sendToEmail(
        payload
    ) {

        console.log(
            "[Future Email]",
            payload
        );

        return {
            success: true
        };
    }

    /*
    ==================================
    Submit
    ==================================
    */

    async function submitForm(
        event
    ) {

        event.preventDefault();

        if (!canSubmit()) {

            showToast(
                "Please wait before submitting again.",
                "warning"
            );

            return;
        }

        const form =
            event.target;

        const data = {

            name:
                form.name.value
                    .trim(),

            email:
                form.email.value
                    .trim(),

            message:
                form.message.value
                    .trim(),

            submittedAt:
                new Date()
                    .toISOString()
        };

        if (
            !validateForm(
                data.name,
                data.email,
                data.message
            )
        ) {
            return;
        }

        try {

            saveDraft(data);

            const config =
                window.PORTFOLIO
                    ?.getData()
                    ?.contact;

            /*
            ------------------------------
            GitHub Issue
            ------------------------------
            */

            if (
                config?.githubIssueEnabled
            ) {

                await sendToGithubIssue(
                    data
                );
            }

            /*
            ------------------------------
            Telegram
            ------------------------------
            */

            if (
                config?.telegram
                    ?.enabled
            ) {

                await sendToTelegram(
                    data
                );
            }

            /*
            ------------------------------
            Email
            ------------------------------
            */

            if (
                config?.email
                    ?.enabled
            ) {

                await sendToEmail(
                    data
                );
            }

            markSubmitted();

            thankUser(
                data.name
            );

            form.reset();

            localStorage.removeItem(
                "portfolio-contact-draft"
            );

            showToast(
                t(
                    "formSuccess"
                ),
                "success"
            );

            const dialog =
                getDialog();

            if (
                dialog &&
                dialog.open
            ) {
                dialog.close();
            }

        } catch (error) {

            console.error(
                error
            );

            showToast(
                t(
                    "formError"
                ),
                "error"
            );
        }
    }

    /*
    ==================================
    Modal
    ==================================
    */

    function initModal() {

        const dialog =
            getDialog();

        const openButton =
            document.getElementById(
                "contact-open-btn"
            );

        const closeButton =
            document.getElementById(
                "dialog-close"
            );

        if (
            dialog &&
            openButton
        ) {

            openButton
                .addEventListener(
                    "click",
                    () => {

                        dialog.showModal();
                    }
                );
        }

        if (
            dialog &&
            closeButton
        ) {

            closeButton
                .addEventListener(
                    "click",
                    () => {

                        dialog.close();
                    }
                );
        }
    }

    /*
    ==================================
    Form Init
    ==================================
    */

    function initForm() {

        const form =
            getForm();

        if (!form) {
            return;
        }

        restoreDraft();

        form.addEventListener(
            "submit",
            submitForm
        );

        form.addEventListener(
            "input",
            () => {

                saveDraft({

                    name:
                    form.name.value,

                    email:
                    form.email.value,

                    message:
                    form.message.value
                });
            }
        );
    }

    /*
    ==================================
    Init
    ==================================
    */

    function init() {

        initModal();

        initForm();
    }

    return {

        init,

        showToast
    };

})();

/*
==================================
Bootstrap
==================================
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        ContactModule.init();
    }
);

/*
==================================
Public API
==================================
*/

window.ContactModule =
    ContactModule;
