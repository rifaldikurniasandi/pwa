// js/data-fetcher.js - VERSI SIMPLIFIED
class DataFetcher {
  constructor(sheetName, containerId) {
    this.sheetName = sheetName;
    this.containerId = containerId;
    this.currentData = [];
    this.filteredData = [];

    console.log(`DataFetcher: ${sheetName} -> ${containerId}`);
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupSearch();
  }

  async loadData() {
    this.showLoading();

    try {
      var url = `${window.APP_SCRIPT_URL}?sheet=${encodeURIComponent(
        this.sheetName,
      )}&t=${Date.now()}`;
      console.log("Fetching:", url);

      // Gunakan fetchWithFallback untuk CORS compatibility
      var data = await window.fetchWithFallback(url);

      console.log("Received data:", data);

      if (data.success && data.data && Array.isArray(data.data)) {
        this.currentData = data.data;
        this.filteredData = data.data.length > 1 ? data.data.slice(1) : [];
        this.showData();

        // Update count
        var countElement = document.getElementById("dataCount");
        if (countElement) {
          countElement.textContent = this.filteredData.length;
        }

        // Show pagination if needed
        this.togglePagination();
      } else {
        this.showError("Data tidak valid dari server");
      }
    } catch (error) {
      console.error("Load error:", error);
      this.showError("Gagal memuat data: " + error.message);
    }
  }

  showLoading() {
    var container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="loading mx-auto mb-4" style="width:40px;height:40px"></div>
          <p class="text-gray-600">Memuat data...</p>
        </div>
      `;
    }
  }

  showError(message) {
    var container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Gagal memuat</h3>
          <p class="text-gray-600 mb-4">${message}</p>
          <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Coba Lagi
          </button>
        </div>
      `;
    }
  }

  showData() {
    var container = document.getElementById(this.containerId);
    if (!container) return;

    if (this.filteredData.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-gray-400 text-4xl mb-4">📭</div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada data</h3>
          <p class="text-gray-600">Silakan tambah data melalui form input.</p>
        </div>
      `;
      return;
    }

    var headers = this.currentData[0] || [];
    var html = `
      <div class="overflow-x-auto border rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-blue-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">No</th>
    `;

    // Add headers
    headers.forEach(function (header, index) {
      var displayHeader = header || `Kolom ${index + 1}`;
      html += `<th class="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">${displayHeader}</th>`;
    });

    html += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;

    // Add data rows
    this.filteredData.forEach(function (row, rowIndex) {
      html += `<tr class="${
        rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
      } hover:bg-blue-50">`;
      html += `<td class="px-6 py-4 text-sm font-medium text-gray-900">${
        rowIndex + 1
      }</td>`;

      row.forEach(function (cell) {
        var displayValue =
          cell === null || cell === undefined || cell === "" ? "-" : cell;
        html += `<td class="px-6 py-4 text-sm text-gray-700">${displayValue}</td>`;
      });

      html += `</tr>`;
    });

    html += `</tbody></table></div>`;

    container.innerHTML = html;
  }

  setupSearch() {
    var searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    var self = this;
    searchInput.addEventListener("input", function () {
      var query = this.value.toLowerCase().trim();

      if (!query) {
        self.filteredData =
          self.currentData.length > 1 ? self.currentData.slice(1) : [];
      } else {
        self.filteredData = self.currentData.slice(1).filter(function (row) {
          return row.some(function (cell) {
            if (!cell) return false;
            return cell.toString().toLowerCase().includes(query);
          });
        });
      }

      self.showData();

      // Update count
      var countElement = document.getElementById("dataCount");
      if (countElement) {
        countElement.textContent = self.filteredData.length;
      }
    });
  }

  togglePagination() {
    var pagination = document.getElementById("paginationContainer");
    if (pagination) {
      if (this.filteredData.length > 10) {
        pagination.classList.remove("hidden");
      } else {
        pagination.classList.add("hidden");
      }
    }
  }
}

// Simple initialization - hanya untuk halaman bank data
document.addEventListener("DOMContentLoaded", function () {
  console.log("Page loaded:", window.location.pathname);

  // Mapping halaman ke sheet
  var pageMap = {
    "bankdata_borongan.html": "borongan",
    "bankdata_injectbusa.html": "injectbusa",
    "bankdata_kardus.html": "kardus",
    "bankdata_ambilbarang.html": "ambilbarang",
    "bankdata_produksi.html": "produksi",
    "bankdata_komponen.html": "komponen_barang",
    "stok_barang.html": "stok_assembling",
  };

  var currentPage = window.location.pathname.split("/").pop();
  var sheetName = pageMap[currentPage];

  if (sheetName) {
    console.log("Initializing DataFetcher for:", sheetName);

    // Tunggu sebentar untuk memastikan DOM siap
    setTimeout(function () {
      if (document.getElementById("dataContent")) {
        new DataFetcher(sheetName, "dataContent");
      } else {
        console.error("Element #dataContent not found");
      }
    }, 100);
  }
});
