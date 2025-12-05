// js/form-handler.js

class FormHandler {
  constructor(formId, sheetName) {
    this.form = document.getElementById(formId);
    this.sheetName = sheetName;

    if (this.form) {
      console.log(`✅ Form ${formId} ditemukan untuk sheet ${sheetName}`);
      this.init();
    } else {
      console.error(`❌ Form ${formId} tidak ditemukan`);
    }
  }

  init() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    console.log(`📝 Submitting form ${this.sheetName}`);

    // Tampilkan loading
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    submitBtn.disabled = true;

    try {
      // Kumpulkan data dari form
      const formData = new FormData(this.form);
      const data = {};

      // Convert FormData ke object
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Tambahkan timestamp
      data.timestamp = new Date().toISOString();

      // Buat payload untuk Apps Script
      const payload = {
        sheet: this.sheetName,
        data: Object.values(data), // Kirim sebagai array values
      };

      console.log("📤 Sending payload:", payload);

      // Kirim ke Apps Script
      const response = await fetch(window.APP_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log("📥 Response:", result);

      if (result.success) {
        alert("✅ Data berhasil disimpan!");
        this.form.reset();

        // Redirect setelah 2 detik
        setTimeout(() => {
          window.location.href = `bankdata_${this.sheetName}.html`;
        }, 2000);
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert(`❌ Gagal menyimpan: ${error.message}`);
    } finally {
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }
}

// Inisialisasi otomatis
document.addEventListener("DOMContentLoaded", function () {
  // Deteksi form yang sedang aktif
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
  const formConfig = formMap[currentPage];

  if (formConfig) {
    console.log(
      `🚀 Initializing form: ${formConfig.id} for ${formConfig.sheet}`
    );
    new FormHandler(formConfig.id, formConfig.sheet);
  }
});
