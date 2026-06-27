// js/form-handler.js - Penanganan form untuk semua halaman form
// Mengirim payload datar yang mengikuti name field di HTML.

class FormHandler {
  constructor(formId, configKey) {
    this.formId = formId;
    this.configKey = normalizeFormKey(configKey);
    this.config = window.FORM_CONFIGS?.[this.configKey] || {
      sheetName: this.configKey,
    };
    this.form = document.getElementById(formId);

    if (!this.form) {
      console.warn(`Form dengan ID "${formId}" tidak ditemukan`);
      return;
    }

    if (this.form.dataset.formHandlerReady === "true") {
      return;
    }

    this.init();
  }

  init() {
    this.form.dataset.formHandlerReady = "true";
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
    this.ensureToastContainer();
    console.log(`FormHandler initialized for: ${this.configKey}`);
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.form.checkValidity()) {
      this.showToast("Mohon isi semua field yang diperlukan", { type: "error" });
      return;
    }

    const formData = this.collectFormData();
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.textContent : "";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Mengirim...";
    }

    try {
      const result = await this.submitToGoogleSheets(formData);
      if (result && result.success === false) {
        throw new Error(result.message || "Apps Script menolak data");
      }

      const stockNotice = result?.stockUpdate?.success === false
        ? ` Stok gagal diperbarui: ${result.stockUpdate.message}`
        : result?.stockUpdate?.stock !== undefined
          ? ` Stok sekarang: ${result.stockUpdate.stock}`
          : "";

      this.showToast(`Data berhasil dikirim!${stockNotice}`, {
        type: result?.stockUpdate?.success === false ? "warning" : "success",
      });
      this.form.reset();

      setTimeout(() => {
        window.location.href = `bankdata_${this.configKey}.html`;
      }, 1200);
    } catch (error) {
      console.error("Error submitting form:", error);
      this.showToast(`Gagal mengirim data: ${error.message}`, { type: "error" });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    }
  }

  collectFormData() {
    const data = {
      sheet: this.config.sheetName || this.configKey,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString("id-ID"),
    };

    const elements = this.form.querySelectorAll("input[name], select[name], textarea[name]");
    elements.forEach((element) => {
      if ((element.type === "checkbox" || element.type === "radio") && !element.checked) {
        return;
      }
      data[element.name] = element.value;
    });

    return data;
  }

  ensureToastContainer() {
    if (document.getElementById("formToastContainer")) return;

    const container = document.createElement("div");
    container.id = "formToastContainer";
    container.style.cssText = [
      "position: fixed",
      "bottom: 18px",
      "right: 18px",
      "display: flex",
      "flex-direction: column",
      "gap: 10px",
      "align-items: flex-end",
      "z-index: 99999",
      "pointer-events: none",
      "max-width: min(360px, calc(100vw - 36px))",
    ].join(";");

    document.body.appendChild(container);
  }

  showToast(message, options = {}) {
    const { type = "success", duration = 3600 } = options;
    this.ensureToastContainer();

    const toast = document.createElement("div");
    toast.className = `form-toast ${type}`;
    toast.style.cssText = [
      "pointer-events: auto",
      "display: flex",
      "align-items: center",
      "gap: 12px",
      "padding: 14px 16px",
      "border-radius: 18px",
      "box-shadow: 0 22px 60px rgba(15, 23, 42, 0.24)",
      "color: white",
      "font-size: 0.95rem",
      "line-height: 1.35",
      "max-width: 100%",
      "opacity: 0",
      "transform: translateY(8px)",
      "transition: opacity 0.25s ease, transform 0.25s ease",
      "background: var(--toast-bg, #16a34a)",
    ].join(";");

    if (type === "error") {
      toast.style.background = "linear-gradient(135deg, #dc2626, #f97316)";
    } else if (type === "warning") {
      toast.style.background = "linear-gradient(135deg, #f59e0b, #ef4444)";
    } else {
      toast.style.background = "linear-gradient(135deg, #22c55e, #0ea5e9)";
    }

    const text = document.createElement("span");
    text.textContent = message;
    text.style.flex = "1 1 auto";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.textContent = "×";
    closeButton.style.cssText = [
      "border: none",
      "background: transparent",
      "color: rgba(255,255,255,0.85)",
      "font-size: 1.1rem",
      "cursor: pointer",
      "padding: 0",
      "line-height: 1",
    ].join(";");
    closeButton.addEventListener("click", () => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      setTimeout(() => toast.remove(), 240);
    });

    toast.appendChild(text);
    toast.appendChild(closeButton);

    const container = document.getElementById("formToastContainer");
    if (container) container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      setTimeout(() => toast.remove(), 240);
    }, duration);
  }

  async submitToGoogleSheets(formData) {
    let url =
      window.APP_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbzyitctci0U0IgsgPbDdu9cClx8fGebXAKGNUop5sGj_IQSm0s5aagmdP8kcAz7symE-w/exec";

  if (window.API_KEY && window.API_KEY !== "sk_live_REPLACE_ME_DO_NOT_COMMIT") {
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}x-api-key=${encodeURIComponent(window.API_KEY)}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
}

function normalizeFormKey(configKey) {
  if (configKey === "komponen_barang") return "komponen";
  return configKey;
}

function detectFormType() {
  const pathname = window.location.pathname;
  if (pathname.includes("form_borongan")) return "borongan";
  if (pathname.includes("form_injectbusa")) return "injectbusa";
  if (pathname.includes("form_kardus")) return "kardus";
  if (pathname.includes("form_ambilbarang")) return "ambilbarang";
  if (pathname.includes("form_produksi")) return "produksi";
  if (pathname.includes("form_komponen")) return "komponen";
  return null;
}

window.FormHandler = FormHandler;
window.initForm = function initForm(configKey) {
  const formType = normalizeFormKey(configKey || detectFormType());
  if (!formType) return null;

  let formId = `${formType}Form`;
  if (!document.getElementById(formId)) {
    const form = document.querySelector("form");
    if (!form) {
      console.warn(`Form untuk "${formType}" tidak ditemukan`);
      return null;
    }
    formId = form.id;
  }

  return new FormHandler(formId, formType);
};

document.addEventListener("DOMContentLoaded", function () {
  window.initForm();
  console.log("Form handler ready");
});
