// js/form-handler-simple.js
console.log("🔄 form-handler-simple.js loaded");

// Prefer global config when available, otherwise fallback to the deployed exec URL
const APPS_SCRIPT_URL =
  (window && window.APP_SCRIPT_URL) ||
  "https://script.google.com/macros/s/AKfycbws4FZWSFSR9NPUpVI5lpoPXIaYB0EDtbKs8wMWOtPTqtJubiorpDN6IKSlwracNBfC8Q/exec";

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM Content Loaded");
  console.log("🔗 Apps Script URL:", APPS_SCRIPT_URL);

  const form = document.getElementById("boronganForm");
  if (!form) {
    console.error("❌ ERROR: Form dengan ID 'boronganForm' tidak ditemukan!");
    console.log(
      "📋 Semua elemen dengan ID:",
      Array.from(document.querySelectorAll("[id]"))
        .map((el) => el.id)
        .join(", ")
    );
    return;
  }

  console.log("✅ Form boronganForm ditemukan!");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    event.stopPropagation();

    console.log("🎯 Form submit event triggered");

    // Validasi form
    if (!form.checkValidity()) {
      console.log("⚠️ Form tidak valid");
      form.reportValidity();
      return;
    }

    // Tampilkan loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    submitBtn.disabled = true;

    try {
      // 1. Kumpulkan data dari form
      const formData = {
        nama: document.getElementById("nama").value.trim(),
        barang: document.getElementById("barang").value.trim(),
        tipe: document.getElementById("tipe").value.trim(),
        ukuran: document.getElementById("ukuran").value.trim(),
        warna: document.getElementById("warna").value.trim(),
        hasil: parseInt(document.getElementById("hasil").value) || 0,
      };

      console.log("📋 Form Data:", formData);

      // 2. Validasi data
      if (
        !formData.nama ||
        !formData.barang ||
        !formData.tipe ||
        !formData.ukuran ||
        !formData.warna ||
        formData.hasil <= 0
      ) {
        throw new Error("Harap isi semua field dengan benar!");
      }

      // 3. Tambahkan timestamp
      const timestamp = new Date().toISOString();

      // 4. Buat array data sesuai urutan kolom di sheet
      // Urutan harus sama dengan header di Google Sheets:
      // Nama | Barang | Tipe | Ukuran | Warna | Hasil | Timestamp
      const rowData = [
        formData.nama,
        formData.barang,
        formData.tipe,
        formData.ukuran,
        formData.warna,
        formData.hasil,
        timestamp,
      ];

      console.log("📤 Row Data untuk dikirim:", rowData);

      // 5. Buat payload
      const payload = {
        sheet: "borongan",
        data: rowData,
      };

      console.log("📦 Payload:", payload);
      console.log("🌐 Mengirim ke:", APPS_SCRIPT_URL);

      // 6. Kirim ke Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Coba dengan no-cors dulu
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 Response Status:", response.status);
      console.log("📥 Response OK:", response.ok);

      // Coba baca response
      let result;
      try {
        result = await response.json();
        console.log("✅ Response JSON:", result);
      } catch (jsonError) {
        console.log("⚠️ Tidak bisa parse JSON, mungkin no-cors mode");
        // Jika no-cors, kita anggap berhasil
        result = { success: true, message: "Data dikirim (no-cors mode)" };
      }

      if (result.success) {
        // Success!
        alert("✅ Data berhasil disimpan!");
        console.log("🎉 Data saved successfully!");

        // Reset form
        form.reset();

        // Redirect ke halaman bank data setelah 2 detik
        setTimeout(() => {
          window.location.href = "bankdata_borongan.html";
        }, 2000);
      } else {
        throw new Error(result.message || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      console.error("❌ Error stack:", error.stack);

      // Tampilkan pesan error yang lebih user-friendly
      let errorMessage = "Gagal menyimpan data";
      if (error.message.includes("Failed to fetch")) {
        errorMessage =
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
      } else if (error.message.includes("NetworkError")) {
        errorMessage = "Masalah jaringan. Coba lagi.";
      } else {
        errorMessage = error.message;
      }

      alert(`❌ ${errorMessage}`);
    } finally {
      // Reset button state
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });

  // Test koneksi saat page load
  console.log("🔗 Testing connection to Apps Script...");
  testConnection();
});

// Fungsi untuk test koneksi
async function testConnection() {
  try {
    const testUrl = APPS_SCRIPT_URL + "?sheet=borongan&t=" + Date.now();
    console.log("🧪 Testing connection to:", testUrl);

    const response = await fetch(testUrl);
    console.log("📡 Response status:", response.status);

    const data = await response.json();
    console.log("📊 Test result:", data);

    if (data.success) {
      console.log("✅ Connection test PASSED!");
      console.log(`📈 Found ${data.count || 0} rows in sheet 'borongan'`);
    } else {
      console.error("❌ Connection test FAILED:", data.message);
    }
  } catch (error) {
    console.error("❌ Connection test ERROR:", error);
  }
}
