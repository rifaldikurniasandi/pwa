// js/form-config.js - DIPERBAIKI
const FORM_CONFIGS = {
  // FORM BORONGAN
  borongan: {
    sheetName: "borongan",
    redirectPage: "bankdata_borongan.html",
    successMessage: "✅ Data borongan berhasil disimpan!",
    fields: [
      {
        id: "nama",
        name: "nama",
        label: "Nama",
        type: "text",
        required: true, // ← HANYA INI YANG REQUIRED
      },
      {
        id: "barang",
        name: "barang",
        label: "Barang",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true, // ← HANYA INI YANG REQUIRED
        min: 0,
      },
    ],
    sheetOrder: ["nama", "barang", "tipe", "ukuran", "warna", "hasil"],
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
        required: false, // ← TIDAK REQUIRED
        options: [
          { value: "1", label: "Pagi" },
          { value: "2", label: "Malam" },
        ],
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "select",
        required: false, // ← TIDAK REQUIRED
        options: [
          { value: "6", label: "6 L" },
          { value: "8", label: "8 L" },
          { value: "17", label: "17 L" },
          { value: "26", label: "26 L" },
          { value: "30", label: "30 L" },
        ],
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "select",
        required: false, // ← TIDAK REQUIRED
        options: [
          { value: "Cream", label: "Cream" },
          { value: "Macaroon", label: "Macaroon" },
        ],
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "select",
        required: false, // ← TIDAK REQUIRED
        options: [
          { value: "Pink", label: "Pink" },
          { value: "Merah", label: "Merah" },
          { value: "Hijau", label: "Hijau" },
          { value: "Biru", label: "Biru" },
          { value: "Ungu", label: "Ungu" },
        ],
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true, // ← HANYA INI YANG REQUIRED
        min: 0,
      },
    ],
    sheetOrder: ["shift", "ukuran", "tipe", "warna", "hasil"],
  },

  // FORM AMBIL BARANG
  ambilbarang: {
    sheetName: "ambilbarang",
    redirectPage: "bankdata_ambilbarang.html",
    successMessage: "✅ Data pengambilan barang berhasil disimpan!",
    fields: [
      {
        id: "nama",
        name: "nama",
        label: "Nama Barang",
        type: "select",
        required: true, // ← REQUIRED
        options: [
          { value: "VendonA", label: "Vendon A" },
          { value: "VendonB", label: "Vendon B" },
          { value: "Pipa", label: "Pipa" },
          { value: "Seal", label: "Seal" },
          { value: "Kawat", label: "Kawat" },
        ],
      },
      {
        id: "jumlah",
        name: "jumlah",
        label: "Kuantitas",
        type: "number",
        required: true, // ← REQUIRED
        min: 0,
      },
    ],
    sheetOrder: ["nama", "jumlah"],
  },

  // FORM KARDUS
  kardus: {
    sheetName: "kardus",
    redirectPage: "bankdata_kardus.html",
    successMessage: "✅ Data kardus berhasil disimpan!",
    fields: [
      {
        id: "nama_kardus",
        name: "nama_kardus",
        label: "Nama Kardus",
        type: "text",
        required: true, // ← REQUIRED
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "jumlah",
        name: "jumlah",
        label: "Jumlah",
        type: "number",
        required: true, // ← REQUIRED
        min: 0,
      },
    ],
    sheetOrder: ["nama_kardus", "tipe", "ukuran", "jumlah"],
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
        required: false, // ← TIDAK REQUIRED
        options: [
          { value: "1", label: "Pagi" },
          { value: "2", label: "Siang" },
          { value: "3", label: "Malam" },
        ],
      },
      {
        id: "nama_barang",
        name: "nama_barang",
        label: "Nama Barang",
        type: "text",
        required: true, // ← REQUIRED
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "warna",
        name: "warna",
        label: "Warna",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "hasil",
        name: "hasil",
        label: "Hasil",
        type: "number",
        required: true, // ← REQUIRED
        min: 0,
      },
    ],
    sheetOrder: ["shift", "nama_barang", "tipe", "ukuran", "warna", "hasil"],
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
        required: true, // ← REQUIRED
      },
      {
        id: "ukuran",
        name: "ukuran",
        label: "Ukuran",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
      {
        id: "tipe",
        name: "tipe",
        label: "Tipe",
        type: "text",
        required: false, // ← TIDAK REQUIRED
      },
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
        id: "jumlah",
        name: "jumlah",
        label: "Jumlah",
        type: "number",
        required: true, // ← REQUIRED
        min: 0,
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
    sheetOrder: [
      "nama_barang",
      "ukuran",
      "tipe",
      "berat_kg",
      "berat_grm",
      "jumlah",
      "keterangan",
    ],
  },
};

window.FORM_CONFIGS = FORM_CONFIGS;
