// js/data-fetcher.js - Mengambil dan menampilkan data dari Google Sheets
// Digunakan untuk halaman bankdata_*.html

class DataFetcher {
  constructor(sheetName, containerId) {
    this.sheetName = sheetName;
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    this.allData = [];
    this.filteredData = [];
    this.headers = [];
    this.currentPage = 1;
    this.itemsPerPage = 10;

    if (!this.container) {
      console.warn(`Container dengan ID "${containerId}" tidak ditemukan`);
      return;
    }

    this.init();
  }

  async init() {
    console.log(`Initializing DataFetcher for sheet: ${this.sheetName}`);
    this.setupSearch();
    await this.fetchData();

    this.autoRefreshInterval = setInterval(() => {
      this.fetchData();
    }, 30000);
  }

  setupSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput || searchInput.dataset.searchReady === "true") return;

    searchInput.dataset.searchReady = "true";
    searchInput.addEventListener(
      "input",
      this.debounce((e) => this.handleSearch(e), 300),
    );
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  async fetchData() {
    const loadingState = document.getElementById("loadingState");
    const errorState = document.getElementById("errorState");

    try {
      if (loadingState) loadingState.classList.remove("hidden");
      if (errorState) errorState.classList.add("hidden");
      if (this.container) this.container.classList.add("hidden");

      const url = `${
        window.APP_SCRIPT_URL ||
        "https://script.google.com/macros/s/AKfycbw7mpK9LPKIdd7VJtRTMeZma0mFclImdlAaHlVvNMp1_-i74EXfXI7K1fRlfSWfAi3ddg/exec"
      }?sheet=${encodeURIComponent(this.sheetName)}&t=${Date.now()}`;

      const result = window.fetchWithFallback
        ? await window.fetchWithFallback(url)
        : await fetch(url, { cache: "no-cache", credentials: "omit" }).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          });

      if (result.success === false) {
        throw new Error(result.message || "Gagal mengambil data");
      }

      const normalized = this.normalizeResponse(result);
      this.headers = normalized.headers;
      this.allData = normalized.rows.reverse(); // Menampilkan data terbaru di atas
      this.filteredData = [...this.allData];
      this.currentPage = 1;
      this.displayData();
      this.updateDataCount();

      if (loadingState) loadingState.classList.add("hidden");
      if (this.container) this.container.classList.remove("hidden");
    } catch (error) {
      console.error("Error fetching data:", error);

      if (loadingState) loadingState.classList.add("hidden");
      if (this.container) this.container.classList.add("hidden");
      if (errorState) errorState.classList.remove("hidden");

      const retryButton = document.getElementById("retryButton");
      if (retryButton && retryButton.dataset.retryReady !== "true") {
        retryButton.dataset.retryReady = "true";
        retryButton.addEventListener("click", () => this.fetchData());
      }
    }
  }

  normalizeResponse(result) {
    const rawRows = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];
    const headers = Array.isArray(result?.headers) ? result.headers : [];

    if (rawRows.length === 0) {
      return { headers: headers.map((header) => String(header)), rows: [] };
    }

    if (Array.isArray(rawRows[0])) {
      const safeHeaders = headers.length
        ? headers.map((header, index) => String(header || `Kolom ${index + 1}`))
        : rawRows[0].map((_, index) => `Kolom ${index + 1}`);

      return {
        headers: safeHeaders,
        rows: rawRows.map((row) => {
          const item = {};
          safeHeaders.forEach((header, index) => {
            item[header] = row[index] ?? "";
          });
          return item;
        }),
      };
    }

    const objectHeaders = headers.length ? headers : Object.keys(rawRows[0]);
    return {
      headers: objectHeaders.map((header) => String(header)),
      rows: rawRows,
    };
  }

  handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (!searchTerm) {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = this.allData.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm),
        ),
      );
    }

    this.currentPage = 1;
    this.displayData();
    this.updateDataCount();

    const searchLoading = document.getElementById("searchLoading");
    if (searchLoading) {
      searchLoading.classList.remove("hidden");
      setTimeout(() => searchLoading.classList.add("hidden"), 300);
    }
  }

  displayData() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="table-container">
        ${this.renderTable()}
      </div>
      ${this.renderCards()}
    `;

    this.updatePagination();
  }

  renderTable() {
    if (this.filteredData.length === 0) {
      return '<p class="text-center text-gray-500 py-8">Tidak ada data ditemukan</p>';
    }

    const headers = this.getTableHeaders();
    const paginatedData = this.getPaginatedData();

    let html = '<table class="w-full table">';
    html += "<thead><tr>";
    headers.forEach((header) => {
      html += `<th>${this.escapeHtml(header)}</th>`;
    });
    html += "</tr></thead>";

    html += "<tbody>";
    paginatedData.forEach((item) => {
      html += "<tr>";
      headers.forEach((header) => {
        html += `<td>${this.escapeHtml(this.formatValue(header, item[header]))}</td>`;
      });
      html += "</tr>";
    });
    html += "</tbody></table>";

    return html;
  }

  renderCards() {
    if (this.filteredData.length === 0) return "";

    const headers = this.getTableHeaders();
    const paginatedData = this.getPaginatedData();

    return paginatedData
      .map((item) => {
        const rows = headers
          .map(
            (header) => `
          <div class="card-row">
            <span class="card-label">${this.escapeHtml(header)}:</span>
            <span class="card-value">${this.escapeHtml(this.formatValue(header, item[header]))}</span>
          </div>
        `,
          )
          .join("");
        return `<div class="data-card">${rows}</div>`;
      })
      .join("");
  }

  getTableHeaders() {
    if (this.headers.length > 0) return this.headers;
    if (this.filteredData.length === 0) return [];
    return Object.keys(this.filteredData[0]);
  }

  getPaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredData.slice(start, end);
  }

  updatePagination() {
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredData.length / this.itemsPerPage),
    );
    const paginationContainer = document.getElementById("paginationContainer");

    if (!paginationContainer) return;

    if (this.filteredData.length <= this.itemsPerPage) {
      paginationContainer.classList.add("hidden");
      return;
    }

    paginationContainer.classList.remove("hidden");

    const currentPageSpan = document.getElementById("currentPage");
    const totalPagesSpan = document.getElementById("totalPages");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 1;
      if (prevBtn.dataset.pageReady !== "true") {
        prevBtn.dataset.pageReady = "true";
        prevBtn.addEventListener("click", () => this.previousPage());
      }
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentPage === totalPages;
      if (nextBtn.dataset.pageReady !== "true") {
        nextBtn.dataset.pageReady = "true";
        nextBtn.addEventListener("click", () => this.nextPage());
      }
    }
  }

  updateDataCount() {
    const dataCount = document.getElementById("dataCount");
    if (dataCount) dataCount.textContent = this.filteredData.length;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.displayData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async refreshData() {
    await this.fetchData();
  }

  destroy() {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
    }
  }

  formatValue(header, value) {
    if (value === null || value === undefined || value === "") return "-";
    const lowerHeader = String(header).toLowerCase();
    if (
      lowerHeader.includes("date") ||
      lowerHeader.includes("tanggal") ||
      lowerHeader.includes("waktu") ||
      lowerHeader.includes("timestamp")
    ) {
      return this.formatDate(value);
    }
    return String(value);
  }

  formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString("id-ID");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = String(text ?? "");
    return div.innerHTML;
  }
}

window.DataFetcher = DataFetcher;

document.addEventListener("DOMContentLoaded", function () {
  const pathname = window.location.pathname;
  let sheetName = null;

  if (pathname.includes("bankdata_borongan")) sheetName = "borongan";
  else if (pathname.includes("bankdata_injectbusa")) sheetName = "injectbusa";
  else if (pathname.includes("bankdata_kardus")) sheetName = "kardus";
  else if (pathname.includes("bankdata_ambilbarang")) sheetName = "ambilbarang";
  else if (pathname.includes("bankdata_produksi")) sheetName = "produksi";
  else if (pathname.includes("bankdata_komponen")) sheetName = "komponen";

  if (sheetName && !window.dataFetcher) {
    window.dataFetcher = new DataFetcher(sheetName, "dataContent");
  }

  console.log("Data fetcher ready");
});
