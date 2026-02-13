// js/index-script.js - FUNGSI KHUSUS INDEX.HTML
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Initializing index page...");

  // Register service worker (PWA support)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("SW registered:", reg.scope))
      .catch((err) => console.warn("SW registration failed:", err));
  }

  // Typewriter Effect
  function setupTypewriter() {
    const typewriterElement = document.getElementById("typewriterText");
    if (!typewriterElement) return;

    typewriterElement.style.width = "0";
    setTimeout(() => {
      typewriterElement.style.animation =
        "typing 3s steps(40, end) forwards, blink-caret 0.75s step-end infinite";
    }, 100);
  }

  // Load Stock Preview
  async function loadStockPreview() {
    const tbody = document.getElementById("previewTableBody");
    if (!tbody) return;

    try {
      // Show loading
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-8">
            <div class="flex items-center justify-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span class="text-gray-600">Memuat data stok...</span>
            </div>
          </td>
        </tr>
      `;

      if (!window.APP_SCRIPT_URL) {
        throw new Error("APP_SCRIPT_URL tidak ditemukan");
      }

      // Gunakan fetchWithFallback untuk compatibility
      const url = `${window.APP_SCRIPT_URL}?sheet=stok_assembling&t=${Date.now()}`;
      const data = await window.fetchWithFallback(url);

      if (data.success && data.data && data.data.length > 1) {
        updateStockTable(data.data.slice(1));
      } else {
        showStockMessage("Belum ada data stok tersedia");
      }
    } catch (error) {
      console.error("Error loading stock:", error);
      showStockMessage("Gagal memuat data stok - " + error.message);
    }
  }

  function updateStockTable(stockData) {
    const tbody = document.getElementById("previewTableBody");
    if (!tbody) return;

    if (!stockData || stockData.length === 0) {
      showStockMessage("Belum ada data stok");
      return;
    }

    // Ambil 5 data terbaru dengan stok tersedia
    const validStock = stockData.filter((row) => {
      const sisaStok = parseInt(row[8]) || 0;
      return sisaStok > 0;
    });

    const displayData = validStock.slice(-5).reverse();

    if (displayData.length === 0) {
      showStockMessage("Semua stok kosong");
      return;
    }

    let html = "";

    displayData.forEach((row) => {
      const barang = row[1] || "-";
      const warna = row[2] || "-";
      const ukuran = row[3] || "-";
      const tipe = row[4] || "-";
      const sisaStok = parseInt(row[8]) || 0;

      let stockClass = "stock-good";
      if (sisaStok === 0) stockClass = "stock-low";
      else if (sisaStok < 10) stockClass = "stock-medium";

      html += `
        <tr class="hover:bg-gray-50 transition-colors">
          <td class="py-3 px-4 font-medium text-gray-800">${barang}</td>
          <td class="py-3 px-4 text-gray-600">${warna}</td>
          <td class="py-3 px-4 text-gray-600">${ukuran}</td>
          <td class="py-3 px-4 text-gray-600">${tipe}</td>
          <td class="py-3 px-4 ${stockClass} font-semibold">${sisaStok}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
  }

  function showStockMessage(message) {
    const tbody = document.getElementById("previewTableBody");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-8 text-gray-500">
          <div class="flex flex-col items-center">
            <i class="fas fa-info-circle text-3xl text-blue-400 mb-2"></i>
            <p>${message}</p>
          </div>
        </td>
      </tr>
    `;
  }

  // Feedback Form Handler
  function setupFeedbackForm() {
    const form = document.getElementById("feedbackForm");
    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const message = document.getElementById("message").value.trim();

      if (!name || !email || !message) {
        alert("Harap isi semua field!");
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
      submitBtn.disabled = true;

      try {
        const payload = {
          sheet: "feedback",
          data: [name, email, message],
        };

        // Gunakan fetchWithFallback untuk compatibility
        const response = await window.fetchWithFallback(window.APP_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // Jika fetchWithFallback gagal, try POST dengan fetch biasa
        let result = response;
        if (!response.success && typeof response !== "object") {
          const postResponse = await fetch(window.APP_SCRIPT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          result = await postResponse.json();
        }

        if (result.success) {
          alert("✅ Terima kasih! Pesan Anda telah dikirim.");
          form.reset();
        } else {
          throw new Error(result.message || "Gagal mengirim");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("❌ Gagal mengirim pesan: " + error.message);
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Initialize
  setupTypewriter();
  loadStockPreview();
  setupFeedbackForm();

  // Mobile menu toggle
  const mobileBtn = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Back to top button + scroll progress
  const backToTop = document.getElementById("backToTop");
  const scrollProgress = document.getElementById("scrollProgress");

  function updateScrollUI() {
    const scrolled = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const pct = height > 0 ? Math.round((scrolled / height) * 100) : 0;
    if (scrollProgress) scrollProgress.style.width = pct + "%";

    if (backToTop) {
      if (scrolled > 300) backToTop.style.display = "block";
      else backToTop.style.display = "none";
    }
  }

  window.addEventListener("scroll", updateScrollUI, { passive: true });
  updateScrollUI();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Auto-refresh setiap 30 detik
  setInterval(loadStockPreview, 30000);
});
