"use strict";


/* =========================
   Configuration
   ========================= */

const KAPA_CONFIG = Object.freeze({

    links: {
        instagram: "https://instagram.com/TU_USUARIO",
        tiktok: "https://tiktok.com/@TU_USUARIO",
        facebook: "https://facebook.com/TU_PAGINA",

        payment: "https://TU_LINK_DE_PAGO",

        catalog: "https://TU_LINK_DEL_CATALOGO"
    },

    whatsapp: {
        countryCode: "57",
        phone: "3000000000"
    }

});


/* =========================
   Link Service
   ========================= */

class LinkService {

    static assignLinks() {

        document
            .querySelectorAll("[data-link]")
            .forEach((element) => {

                const linkName =
                    element.dataset.link;

                const url =
                    KAPA_CONFIG.links[linkName];

                if (!url) {
                    return;
                }

                element.href = url;

            });

    }

}


/* =========================
   WhatsApp Service
   ========================= */

class WhatsAppService {

    constructor(config) {

        this.countryCode =
            config.countryCode;

        this.phone =
            config.phone;

    }


    getPhoneNumber() {

        return (
            this.countryCode +
            this.phone
        ).replace(/\D/g, "");

    }


    buildMessage(data) {

        const lines = [

            "Hola Kapa 3D 👋",

            "",

            `Mi nombre es ${data.name}.`,

            "",

            "Quiero solicitar una cotización para una impresión 3D.",

            "",

            "*Descripción:*",

            data.description,

            "",

            "*Medidas aproximadas:*",

            data.measurements,

            "",

            "Quedo atento(a) a la cotización. ¡Gracias!"

        ];

        return lines.join("\n");

    }


    buildUrl(message) {

        const phone =
            this.getPhoneNumber();

        return (
            `https://wa.me/${phone}` +
            `?text=${encodeURIComponent(message)}`
        );

    }


    open(message) {

        const url =
            this.buildUrl(message);

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    }

}


/* =========================
   Modal Controller
   ========================= */

class ModalController {

    constructor(modal) {

        this.modal = modal;

        this.closeButtons =
            modal.querySelectorAll(
                "[data-close-modal]"
            );

        this.handleEscape =
            this.handleEscape.bind(this);

        this.bindEvents();

    }


    bindEvents() {

        this.closeButtons.forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => this.close()
                );

            }
        );

    }


    open() {

        this.modal.classList.add(
            "modal--visible"
        );

        this.modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

        document.addEventListener(
            "keydown",
            this.handleEscape
        );

    }


    close() {

        this.modal.classList.remove(
            "modal--visible"
        );

        this.modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        document.removeEventListener(
            "keydown",
            this.handleEscape
        );

    }


    handleEscape(event) {

        if (event.key === "Escape") {
            this.close();
        }

    }

}


/* =========================
   Quote Form Controller
   ========================= */

class QuoteFormController {

    constructor(form, whatsappService) {

        this.form =
            form;

        this.whatsappService =
            whatsappService;

        this.anySizeCheckbox =
            form.querySelector("#anySize");

        this.measureInputs = [
            form.querySelector("#width"),
            form.querySelector("#height"),
            form.querySelector("#depth")
        ];

        this.bindEvents();

    }


    bindEvents() {

        this.form.addEventListener(
            "submit",
            (event) => this.handleSubmit(event)
        );

        this.anySizeCheckbox.addEventListener(
            "change",
            () => this.handleSizePreference()
        );

    }


    handleSizePreference() {

        const anySize =
            this.anySizeCheckbox.checked;

        this.measureInputs.forEach(
            (input) => {

                input.disabled = anySize;

                if (anySize) {
                    input.value = "";
                }

            }
        );

    }


    getMeasurements() {

        if (this.anySizeCheckbox.checked) {

            return (
                "No tengo una medida específica. " +
                "Puede ser la medida que ustedes recomienden."
            );

        }


        const width =
            this.form.width.value.trim();

        const height =
            this.form.height.value.trim();

        const depth =
            this.form.depth.value.trim();


        const measurements = [];


        if (width) {

            measurements.push(
                `Ancho: ${width} cm`
            );

        }


        if (height) {

            measurements.push(
                `Alto: ${height} cm`
            );

        }


        if (depth) {

            measurements.push(
                `Profundidad: ${depth} cm`
            );

        }


        if (!measurements.length) {

            return (
                "Todavía no tengo definidas las medidas."
            );

        }


        return measurements.join(" | ");

    }


    getFormData() {

        return {

            name:
                this.form.customerName.value.trim(),

            description:
                this.form.description.value.trim(),

            measurements:
                this.getMeasurements()

        };

    }


    handleSubmit(event) {

        event.preventDefault();


        if (!this.form.checkValidity()) {

            this.form.reportValidity();

            return;

        }


        const data =
            this.getFormData();


        const message =
            this.whatsappService
                .buildMessage(data);


        this.whatsappService
            .open(message);

    }

}


/* =========================
   Application
   ========================= */

class KapaApp {

    init() {

        LinkService.assignLinks();


        const modalElement =
            document.querySelector(
                "#whatsappModal"
            );


        const formElement =
            document.querySelector(
                "#quoteForm"
            );


        const openWhatsappButton =
            document.querySelector(
                "#openWhatsappForm"
            );


        const modalController =
            new ModalController(
                modalElement
            );


        const whatsappService =
            new WhatsAppService(
                KAPA_CONFIG.whatsapp
            );


        new QuoteFormController(
            formElement,
            whatsappService
        );


        openWhatsappButton.addEventListener(
            "click",
            () => modalController.open()
        );

    }

}


/* =========================
   Bootstrap
   ========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const app =
            new KapaApp();

        app.init();

    }
);