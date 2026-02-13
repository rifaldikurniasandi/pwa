// js/form-handler.js - VERSI DIPERBAIKI
class FormHandler {
  constructor(formId, sheetName) {
    this.form = document.getElementById(formId);
    this.sheetName = sheetName;
    this.isSubmitting = false; // Flag untuk mencegah double submit

    if (this.form) {
      console.log(
        `✅ FormHandler: Form ${formId} ditemukan untuk ${sheetName}`,
      );
      this.init();
    } else {
      console.error(`❌ FormHandler: Form ${formId} tidak ditemukan`);
    }
  }

  init() {
    // Remove existing listeners
    this.form.removeEventListener("submit", this.handleSubmit.bind(this));

    // Add new listener
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));

    // Setup form validation
    this.setupValidation();
  }

  setupValidation() {
    // Hapus HTML5 validation default
    this.form.setAttribute("novalidate", "");

    // Tambah custom validation
    const requiredFields = this.form.querySelectorAll("[required]");
    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field));
      field.addEventListener("input", () => this.clearError(field));
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const label = field.labels?.[0]?.textContent || field.name;

    if (field.hasAttribute("required") && !value) {
      this.showFieldError(field, `${label} harus diisi`);
      return false;
    }

    if (field.type === "number") {
      const min = field.getAttribute("min");
      if (min && parseFloat(value) < parseFloat(min)) {
        this.showFieldError(field, `${label} minimal ${min}`);
        return false;
      }
    }

    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showFieldError(field, "Format email tidak valid");
        return false;
      }
    }

    this.clearError(field);
    return true;
  }

  showFieldError(field, message) {
    this.clearError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "field-error text-red-500 text-sm mt-1";
    errorDiv.textContent = message;

    field.classList.add("border-red-500");
    field.parentNode.appendChild(errorDiv);
  }

  clearError(field) {
    field.classList.remove("border-red-500");

    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }
  }

  validateForm() {
    let isValid = true;
    const requiredFields = this.form.querySelectorAll("[required]");

    requiredFields.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    // Cegah double submit
    if (this.isSubmitting) {
      console.log("⚠️ Form sedang diproses...");
      return;
    }

    // Validasi form
    if (!this.validateForm()) {
      alert("⚠️ Harap isi field yang diperlukan!");
      return;
    }

    console.log(`📝 Submitting form ${this.sheetName}`);

    // Tampilkan loading
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    submitBtn.disabled = true;
    this.isSubmitting = true;

    try {
      // Kumpulkan data dari form
      const formData = new FormData(this.form);
      const data = {};

      console.log("📊 Form data collected:");
      for (let [key, value] of formData.entries()) {
        data[key] = value.trim();
        console.log(`  ${key}: ${value}`);
      }

      // Ambil config untuk sheetOrder
      const cfg = window.FORM_CONFIGS && window.FORM_CONFIGS[this.sheetName];
      let rowData = [];

      if (cfg && Array.isArray(cfg.sheetOrder) && cfg.sheetOrder.length > 0) {
        // Gunakan sheetOrder dari config
        rowData = cfg.sheetOrder.map((key) => {
          return data.hasOwnProperty(key) ? data[key] : "";
        });
      } else {
        // Fallback: semua field kecuali submit button
        rowData = Object.keys(data)
          .filter((k) => k !== "submit" && !k.includes("button"))
          .map((k) => data[k]);
      }

      const payload = {
        sheet: this.sheetName,
        data: rowData,
      };

      console.log("📤 Sending payload:", payload);

      // Kirim ke Apps Script dengan timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 detik timeout

      try {
        // Coba fetch biasa dulu (untuk POST)
        const response = await fetch(window.APP_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Cek jika response kosong
        const responseText = await response.text();
        console.log("📥 Raw response:", responseText);

        let result;
        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          console.error("❌ Response bukan JSON:", responseText);
          throw new Error("Format response tidak valid");
        }

        console.log("📥 Parsed response:", result);

        if (result.success) {
          alert("✅ " + (cfg?.successMessage || "Data berhasil disimpan!"));
          this.form.reset();

          // Jika ada redirect page
          if (cfg?.redirectPage) {
            setTimeout(() => {
              window.location.href = cfg.redirectPage;
            }, 1500);
          }
        } else {
          throw new Error(result.message || "Gagal menyimpan data");
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);

        console.error("❌ Fetch error:", fetchError);

        // Handle specific errors
        if (fetchError.name === "AbortError") {
          throw new Error("Waktu permintaan habis. Cek koneksi internet.");
        } else if (fetchError.message.includes("Failed to fetch")) {
          throw new Error(
            "Tidak dapat terhubung ke server. Cek koneksi internet.",
          );
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error("❌ Submit error:", error);

      // User-friendly error messages
      let errorMessage = error.message || "Gagal menyimpan data";

      if (
        errorMessage.includes("CORS") ||
        errorMessage.includes("Access-Control")
      ) {
        errorMessage = "Masalah koneksi ke server. Cek URL Apps Script.";
      } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("habis")
      ) {
        errorMessage = "Waktu permintaan habis. Coba lagi.";
      }

      alert(`❌ ${errorMessage}`);

      // Fallback: Simpan ke localStorage
      this.saveToLocalStorage(data, error);
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      this.isSubmitting = false;

      // Re-enable form setelah 1 detik
      setTimeout(() => {
        this.form.removeEventListener("submit", this.handleSubmit.bind(this));
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));
      }, 1000);
    }
  }

  saveToLocalStorage(data, error) {
    try {
      const fallbackData = {
        sheet: this.sheetName,
        data: data,
        timestamp: new Date().toISOString(),
        error: error.message,
      };

      const fallbackKey = `form_fallback_${this.sheetName}_${Date.now()}`;
      localStorage.setItem(fallbackKey, JSON.stringify(fallbackData));

      console.log("💾 Data disimpan ke localStorage:", fallbackKey);

      // Tampilkan info ke user
      const infoDiv = document.createElement("div");
      infoDiv.className = "bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4";
      infoDiv.innerHTML = `
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="fas fa-exclamation-triangle text-yellow-400"></i>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700">
              Data disimpan sementara. Silakan coba submit lagi nanti.
            </p>
          </div>
        </div>
      `;

      this.form.parentNode.appendChild(infoDiv);

      // Hapus info setelah 10 detik
      setTimeout(() => infoDiv.remove(), 10000);
    } catch (storageError) {
      console.error("❌ Gagal simpan ke localStorage:", storageError);
    }
  }
}

// Inisialisasi otomatis dengan error handling
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 FormHandler initialization...");

  // Cegah inisialisasi ganda
  if (window.formHandlerInitialized) {
    console.log("⚠️ FormHandler sudah diinisialisasi");
    return;
  }

  window.formHandlerInitialized = true;

  // Test koneksi Apps Script
  testAppScriptConnection();

  // Mapping halaman ke form
  const formMap = {
    "form_borongan.html": { id: "boronganForm", sheet: "borongan" },
    "form_injectbusa.html": { id: "injectbusaForm", sheet: "injectbusa" },
    "form_ambilbarang.html": { id: "ambilbarangForm", sheet: "ambilbarang" },
    "form_kardus.html": { id: "kardusForm", sheet: "kardus" },
    "form_produksi.html": { id: "produksiForm", sheet: "produksi" },
    "form_komponen.html": {
      id: "komponen_barangForm",
      sheet: "komponen_barang",
    },
  };

  const currentPage = window.location.pathname.split("/").pop();
  console.log("📄 Current page:", currentPage);

  const formConfig = formMap[currentPage];

  if (formConfig) {
    console.log(
      `🎯 Initializing form: ${formConfig.id} for ${formConfig.sheet}`,
    );

    // Tunggu 500ms untuk memastikan config.js dimuat
    setTimeout(() => {
      if (!window.APP_SCRIPT_URL) {
        console.error("❌ APP_SCRIPT_URL tidak ditemukan!");
        showConnectionError();
        return;
      }

      try {
        new FormHandler(formConfig.id, formConfig.sheet);
        console.log("✅ FormHandler berhasil diinisialisasi");
      } catch (initError) {
        console.error("❌ Gagal inisialisasi FormHandler:", initError);
        showInitError();
      }
    }, 500);
  } else {
    console.log("ℹ️ Tidak ada form untuk halaman ini:", currentPage);
  }
});

// Test koneksi Apps Script
async function testAppScriptConnection() {
  try {
    if (!window.APP_SCRIPT_URL) {
      console.warn("⚠️ APP_SCRIPT_URL belum didefinisikan");
      return;
    }

    const testUrl = window.APP_SCRIPT_URL + "?sheet=test&t=" + Date.now();
    console.log("🔗 Testing connection to:", testUrl);

    // Use AbortController for timeout-safe fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(testUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Connection test successful:", data);
        return true;
      } else {
        console.warn("⚠️ Connection test failed:", response.status);
        return false;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.warn("⚠️ Connection test timed out - trying JSONP fallback");
        // Fallback ke JSONP jika fetch timeout
        try {
          const jsonpData = await window.fetchWithFallback(testUrl);
          console.log("✅ Connection test successful via JSONP:", jsonpData);
          return true;
        } catch (jsonpErr) {
          console.warn("⚠️ JSONP fallback also failed:", jsonpErr.message);
          return false;
        }
      } else {
        console.warn("⚠️ Connection test error:", err.message || err);
        return false;
      }
    }
  } catch (error) {
    console.warn("⚠️ Connection test error:", error.message);
    return false;
  }
}

// Tampilkan error koneksi
function showConnectionError() {
  const errorDiv = document.createElement("div");
  errorDiv.className = "bg-red-50 border-l-4 border-red-400 p-4 mb-4";
  errorDiv.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <i class="fas fa-exclamation-circle text-red-400"></i>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">
          <strong>Koneksi Error:</strong> URL Apps Script tidak ditemukan.
          Pastikan file config.js sudah dimuat dengan benar.
        </p>
      </div>
    </div>
  `;

  const container = document.querySelector(".container") || document.body;
  container.insertBefore(errorDiv, container.firstChild);
}

// Tampilkan error inisialisasi
function showInitError() {
  const errorDiv = document.createElement("div");
  errorDiv.className = "bg-red-50 border-l-4 border-red-400 p-4 mb-4";
  errorDiv.innerHTML = `
    <div class="flex">
      <div class="flex-shrink-0">
        <i class="fas fa-exclamation-circle text-red-400"></i>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700">
          <strong>Form Error:</strong> Gagal memuat form handler.
          Silakan refresh halaman atau cek console untuk detail.
        </p>
        <button onclick="location.reload()" class="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm">
          <i class="fas fa-redo mr-1"></i> Refresh Halaman
        </button>
      </div>
    </div>
  `;

  const container = document.querySelector(".container") || document.body;
  container.insertBefore(errorDiv, container.firstChild);
}
