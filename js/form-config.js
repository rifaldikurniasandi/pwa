// js/form-config.js - Konfigurasi form untuk semua halaman form
// Mendefinisikan struktur field untuk setiap jenis form

window.FORM_CONFIGS = {
  borongan: {
    title: "Form Borongan",
    sheetName: "borongan",
    fields: [
      {
        id: "nama",
        label: "Nama",
        type: "text",
        required: true,
        placeholder: "Masukkan nama",
      },
      {
        id: "barang",
        label: "Barang",
        type: "text",
        required: true,
        placeholder: "Masukkan jenis barang",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe barang",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "warna",
        label: "Warna",
        type: "text",
        required: true,
        placeholder: "Masukkan warna",
      },
      {
        id: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        placeholder: "Masukkan hasil",
        min: 0,
      },
    ],
  },

  injectbusa: {
    title: "Form Inject Busa",
    sheetName: "injectbusa",
    fields: [
      {
        id: "shift",
        label: "Shift",
        type: "text",
        required: true,
        placeholder: "Masukkan shift",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "warna",
        label: "Warna",
        type: "text",
        required: true,
        placeholder: "Masukkan warna",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe",
      },
      {
        id: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        placeholder: "Masukkan hasil",
        min: 0,
      },
    ],
  },

  kardus: {
    title: "Form Kardus",
    sheetName: "kardus",
    fields: [
      {
        id: "nama_kardus",
        label: "Nama Kardus",
        type: "text",
        required: true,
        placeholder: "Masukkan nama kardus",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe",
      },
      {
        id: "warna",
        label: "Warna",
        type: "text",
        required: true,
        placeholder: "Masukkan warna",
      },
      {
        id: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        placeholder: "Masukkan hasil",
        min: 0,
      },
    ],
  },

  ambilbarang: {
    title: "Form Ambil Barang",
    sheetName: "ambilbarang",
    fields: [
      {
        id: "ambilbarang",
        label: "Nama Barang",
        type: "text",
        required: true,
        placeholder: "Masukkan nama",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe",
      },
      {
        id: "jumlah",
        label: "Jumlah",
        type: "number",
        required: true,
        placeholder: "Masukkan jumlah",
        min: 0,
      },
    ],
  },

  produksi: {
    title: "Form Produksi",
    sheetName: "produksi",
    fields: [
      {
        id: "shift",
        label: "Shift",
        type: "text",
        required: true,
        placeholder: "Masukkan shift",
      },
      {
        id: "namabarang",
        label: "Nama Barang",
        type: "text",
        required: true,
        placeholder: "Masukkan nama barang",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "warna",
        label: "Warna",
        type: "text",
        required: true,
        placeholder: "Masukkan warna",
      },
      {
        id: "hasil",
        label: "Hasil",
        type: "number",
        required: true,
        placeholder: "Masukkan hasil",
        min: 0,
      },
    ],
  },

  komponen: {
    title: "Form Komponen Barang",
    sheetName: "komponen",
    fields: [
      {
        id: "namabarang",
        label: "Nama Barang",
        type: "text",
        required: true,
        placeholder: "Masukkan nama barang",
      },
      {
        id: "ukuran",
        label: "Ukuran",
        type: "text",
        required: true,
        placeholder: "Masukkan ukuran",
      },
      {
        id: "tipe",
        label: "Tipe",
        type: "text",
        required: true,
        placeholder: "Masukkan tipe",
      },
      {
        id: "berat",
        label: "Berat (kg)",
        type: "number",
        required: true,
        placeholder: "Masukkan berat",
        min: 0,
        step: "0.01",
      },
      {
        id: "keterangan",
        label: "Keterangan",
        type: "text",
        required: true,
        placeholder: "Masukkan keterangan (opsional)",
      },
    ],
  },
};

console.log("✅ FORM_CONFIGS loaded successfully");
