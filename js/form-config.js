// js/form-configs.js
// Konfigurasi untuk semua form

const FORM_CONFIGS = {
  // FORM BORONGAN
  borongan: {
    sheetName: "borongan",
    redirectPage: "bankdata_borongan.html",
    successMessage: "✅ Data borongan berhasil disimpan!",
    fields: [
      { id: "nama", name: "nama", label: "Nama", type: "text", required: true },
      {
        id: "barang",
        name: "barang",
        label: "Barang",
        type: "text",
        required: true,
      },
      { id: "tipe", name: "tipe", label: "Tipe", type: "text", required: true },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "text",
        required: true,
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // FORM INJECT BUSA
  injectbusa: {
    sheetName: "injectbusa",
    redirectPage: "bankdata_injectbusa.html",
    successMessage: "✅ Data inject busa berhasil disimpan!",
    fields: [
      {
        id: "shift",
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options: ["Pagi", "Siang", "Malam"],
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "select",
        required: true,
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "select",
        required: true,
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "select",
        required: true,
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // FORM AMBIL BARANG
  ambilbarang: {
    sheetName: "ambilbarang",
    redirectPage: "bankdata_ambilbarang.html",
    successMessage: "✅ Data pengambilan barang berhasil disimpan!",
    fields: [
      { id: "nama", name: "nama", label: "Nama", type: "text", required: true },
      {
        id: "barang",
        name: "barang",
        label: "Barang",
        type: "text",
        required: true,
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "text",
        required: true,
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
      },
      { id: "tipe", name: "tipe", label: "Tipe", type: "text", required: true },
      {
        id: "jumlah",
        name: "jumlah",
        label: "Jumlah",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // FORM KARDUS
  kardus: {
    sheetName: "kardus",
    redirectPage: "bankdata_kardus.html",
    successMessage: "✅ Data kardus berhasil disimpan!",
    fields: [
      {
        id: "shift",
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options: ["Pagi", "Siang", "Malam"],
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "select",
        required: true,
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "select",
        required: true,
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "select",
        required: true,
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // FORM PRODUKSI
  produksi: {
    sheetName: "produksi",
    redirectPage: "bankdata_produksi.html",
    successMessage: "✅ Data produksi berhasil disimpan!",
    fields: [
      {
        id: "shift",
        name: "shift",
        label: "Shift",
        type: "select",
        required: true,
        options: ["Pagi", "Siang", "Malam"],
      },
      {
        id: "nama_barang",
        name: "nama_barang",
        label: "Nama Barang",
        type: "text",
        required: true,
      },
      { id: "tipe", name: "tipe", label: "Tipe", type: "text", required: true },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "text",
        required: true,
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        min: 0,
      },
    ],
  },

  // FORM KOMPONEN BARANG
  komponen_barang: {
    sheetName: "komponen_barang",
    redirectPage: "bankdata_komponen.html",
    successMessage: "✅ Data komponen barang berhasil disimpan!",
    fields: [
      {
        id: "nama_barang",
        name: "nama_barang",
        label: "Nama Barang",
        type: "text",
        required: true,
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
      },
      { id: "tipe", name: "tipe", label: "Tipe", type: "text", required: true },
      {
        id: "berat_kg",
        name: "berat_kg",
        label: "Berat (kg)",
        type: "number",
        required: false,
        min: 0,
        step: 0.01,
      },
      {
        id: "berat_grm",
        name: "berat_grm",
        label: "Berat (gram)",
        type: "number",
        required: false,
        min: 0,
        step: 1,
      },
      {
        id: "keterangan",
        name: "keterangan",
        label: "Keterangan",
        type: "text",
        required: false,
        maxLength: 500,
      },
    ],
  },

  // FORM FEEDBACK/KONTAK
  feedback: {
    sheetName: "feedback",
    redirectPage: "index.html#kontak",
    successMessage: "✅ Terima kasih! Pesan Anda telah dikirim.",
    fields: [
      {
        id: "name",
        name: "name",
        label: "Nama Lengkap",
        type: "text",
        required: true,
        maxLength: 100,
      },
      {
        id: "email",
        name: "email",
        label: "Email",
        type: "email",
        required: true,
        maxLength: 100,
      },
      {
        id: "subject",
        name: "subject",
        label: "Subjek",
        type: "text",
        required: true,
        maxLength: 200,
      },
      {
        id: "message",
        name: "message",
        label: "Pesan",
        type: "textarea",
        required: true,
        maxLength: 1000,
        rows: 5,
      },
    ],
  },
};

// Export untuk penggunaan global
window.FORM_CONFIGS = FORM_CONFIGS;

// Helper untuk inisialisasi form
window.initForm = function (formType) {
  const config = FORM_CONFIGS[formType];
  if (config) {
    return new FormHandler(`${formType}Form`, config.sheetName);
  } else {
    console.error(`Config untuk form ${formType} tidak ditemukan`);
    return null;
  }
};
