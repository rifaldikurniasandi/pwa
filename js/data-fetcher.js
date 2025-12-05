// js/data-fetcher.js - Untuk mengambil data dari semua bank data

class DataFetcher {
  constructor(sheetName, containerId) {
    this.sheetName = sheetName;
    this.containerId = containerId;
    this.currentData = [];
    this.filteredData = [];
    this.currentPage = 1;
    this.rowsPerPage = 10;

    // Ambil config dari FORM_CONFIGS untuk form data
    // Untuk stok, kita gunakan config khusus
    if (window.FORM_CONFIGS[sheetName]) {
      this.config = window.FORM_CONFIGS[sheetName];
    } else if (sheetName === "stok_assembling") {
      // Config khusus untuk stok
      this.config = {
        fields: [
          { label: "Tanggal" },
          { label: "Barang" },
          { label: "Warna" },
          { label: "Ukuran" },
          { label: "Tipe" },
          { label: "Stok Awal" },
          { label: "Masuk" },
          { label: "Keluar" },
          { label: "Sisa Stok" },
          { label: "Stok Opname" },
          { label: "Keterangan" },
        ],
      };
    }

    console.log(`📊 DataFetcher diinisialisasi untuk: ${sheetName}`);
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupSearch();
    this.setupPagination();
  }

  async loadData() {
    this.showLoading();

    try {
      if (!window.APP_SCRIPT_URL) {
        throw new Error("Konfigurasi Apps Script URL belum dimuat");
      }

      // Tambahkan timestamp untuk menghindari cache
      const url = `${window.APP_SCRIPT_URL}?sheet=${encodeURIComponent(
        this.sheetName
      )}&action=getData&t=${Date.now()}`;
      console.log("📥 Memuat data dari:", url);

      const response = await fetch(url, {
        cache: "no-cache",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log(
        "✅ Data diterima, jumlah baris:",
        data.data ? data.data.length : 0
      );

      if (data.success && data.data) {
        // Skip header row
        this.currentData = data.data.slice(1);
        this.filteredData = [...this.currentData];
        this.showData();

        // Update count
        const dataCount = document.getElementById("dataCount");
        if (dataCount) {
          dataCount.textContent = this.filteredData.length;
        }
      } else {
        throw new Error(data.message || "Format data tidak valid");
      }
    } catch (error) {
      console.error("❌ Error loading data:", error);
      this.showError(error.message);
    }
  }

  showLoading() {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="loading mx-auto mb-4" style="width: 40px; height: 40px"></div>
          <p class="text-gray-600">Memuat data dari spreadsheet...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-exclamation-triangle text-red-400 text-6xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal memuat data</h3>
          <p class="text-gray-500 mb-4">${message}</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <i class="fas fa-redo mr-2"></i>Coba Lagi
          </button>
        </div>
      `;
    }
  }

  showData() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.filteredData.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <i class="fas fa-inbox text-gray-300 text-6xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Tidak ada data ditemukan</h3>
          <p class="text-gray-500">
            Data belum tersedia atau terjadi kesalahan
          </p>
        </div>
      `;
      return;
    }

    // Untuk stok, gunakan tampilan khusus
    if (this.sheetName === "stok_assembling") {
      this.showStokData();
    } else {
      this.showFormData();
    }
  }

  showStokData() {
    const container = document.getElementById(this.containerId);
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    // Build table untuk stok
    let tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead>
            <tr class="bg-blue-600 text-white">
              <th class="py-3 px-4 text-left">No</th>
              <th class="py-3 px-4 text-left">Tanggal</th>
              <th class="py-3 px-4 text-left">Barang</th>
              <th class="py-3 px-4 text-left">Warna</th>
              <th class="py-3 px-4 text-left">Ukuran</th>
              <th class="py-3 px-4 text-left">Tipe</th>
              <th class="py-3 px-4 text-left">Stok Awal</th>
              <th class="py-3 px-4 text-left">Masuk</th>
              <th class="py-3 px-4 text-left">Keluar</th>
              <th class="py-3 px-4 text-left">Sisa Stok</th>
              <th class="py-3 px-4 text-left">Keterangan</th>
            </tr>
          </thead>
          <tbody>
    `;

    pageData.forEach((row, rowIndex) => {
      const rowClass = rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white";
      tableHTML += `<tr class="${rowClass} hover:bg-blue-50">`;

      // Nomor urut
      tableHTML += `<td class="py-3 px-4 border-b">${
        startIndex + rowIndex + 1
      }</td>`;

      // Data kolom
      row.forEach((cell, cellIndex) => {
        let value = cell || "-";

        // Format tanggal
        if (cellIndex === 0 && cell) {
          try {
            const date = new Date(cell);
            if (!isNaN(date.getTime())) {
              value = date.toLocaleDateString("id-ID");
            }
          } catch (e) {
            // Biarkan value asli
          }
        }

        // Format number
        if (cellIndex >= 6 && cellIndex <= 9 && cell) {
          value = Number(cell).toLocaleString("id-ID");
        }

        tableHTML += `<td class="py-3 px-4 border-b">${value}</td>`;
      });

      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table></div>`;

    container.innerHTML = tableHTML;
    this.updatePagination();
  }

  showFormData() {
    const container = document.getElementById(this.containerId);
    if (!this.config) return;

    const columns = ["Tanggal", ...this.config.fields.map((f) => f.label)];
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    const pageData = this.filteredData.slice(startIndex, endIndex);

    // Build table
    let tableHTML = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead>
            <tr class="bg-blue-600 text-white">
    `;

    columns.forEach((header) => {
      tableHTML += `<th class="py-3 px-4 text-left">${header}</th>`;
    });

    tableHTML += `</tr></thead><tbody>`;

    pageData.forEach((row, rowIndex) => {
      const rowClass = rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white";
      tableHTML += `<tr class="${rowClass} hover:bg-blue-50">`;

      row.forEach((cell, cellIndex) => {
        let value = cell || "-";

        if (cellIndex === 0 && cell) {
          value = this.formatDate(cell);
        }

        if (this.config.fields[cellIndex - 1]?.type === "number") {
          value = Number(cell).toLocaleString("id-ID");
        }

        tableHTML += `<td class="py-3 px-4 border-b">${value}</td>`;
      });

      tableHTML += `</tr>`;
    });

    tableHTML += `</tbody></table></div>`;

    container.innerHTML = tableHTML;
    this.updatePagination();
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  }

  setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        this.filteredData = [...this.currentData];
      } else {
        this.filteredData = this.currentData.filter((row) =>
          row.some(
            (cell) => cell && cell.toString().toLowerCase().includes(query)
          )
        );
      }
      this.currentPage = 1;
      this.showData();
    });
  }

  setupPagination() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.showData();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const totalPages = Math.ceil(
          this.filteredData.length / this.rowsPerPage
        );
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.showData();
        }
      });
    }
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.rowsPerPage);
    const currentPageSpan = document.getElementById("currentPage");
    const totalPagesSpan = document.getElementById("totalPages");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
      prevBtn.classList.toggle("opacity-50", this.currentPage === 1);
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
      nextBtn.classList.toggle(
        "opacity-50",
        this.currentPage === totalPages || totalPages === 0
      );
    }
  }
}

// Inisialisasi DataFetcher
document.addEventListener("DOMContentLoaded", function () {
  const currentPage = window.location.pathname.split("/").pop();

  const bankDataMap = {
    "bankdata_borongan.html": "borongan",
    "bankdata_injectbusa.html": "injectbusa",
    "bankdata_kardus.html": "kardus",
    "bankdata_ambilbarang.html": "ambilbarang",
    "bankdata_produksi.html": "produksi",
    "bankdata_komponen.html": "komponen_barang",
    "stok_barang.html": "stok_assembling", // Perbaiki mapping ini
  };

  const sheetName = bankDataMap[currentPage];
  if (sheetName) {
    console.log(`🚀 Inisialisasi DataFetcher untuk: ${sheetName}`);
    const containerId =
      sheetName === "stok_assembling" ? "dataContent" : "dataContent";
    new DataFetcher(sheetName, containerId);
  }
});
