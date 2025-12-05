// js/common.js - PERBAIKAN untuk semua halaman

// Format tanggal Indonesia
function formatDate(dateString, includeTime = true) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }

    return date.toLocaleDateString("id-ID", options);
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
}

// Navigation scroll dan mobile menu
function initNavigation() {
  // Mobile Menu Toggle
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
      const icon = this.querySelector("i");
      if (icon.classList.contains("fa-bars")) {
        icon.classList.replace("fa-bars", "fa-times");
      } else {
        icon.classList.replace("fa-times", "fa-bars");
      }
    });

    // Tutup menu saat klik di luar
    document.addEventListener("click", function (event) {
      if (
        !mobileMenu.contains(event.target) &&
        !mobileMenuButton.contains(event.target) &&
        !mobileMenu.classList.contains("hidden")
      ) {
        mobileMenu.classList.add("hidden");
        const icon = mobileMenuButton.querySelector("i");
        if (icon.classList.contains("fa-times")) {
          icon.classList.replace("fa-times", "fa-bars");
        }
      }
    });
  }

  // Back to Top Button
  if (!document.getElementById("backToTop")) {
    const backToTopButton = document.createElement("button");
    backToTopButton.id = "backToTop";
    backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTopButton.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            z-index: 99;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary, #3b82f6);
            color: white;
            border: none;
            cursor: pointer;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
        `;
    document.body.appendChild(backToTopButton);
  }

  // Scroll Progress Bar
  if (!document.getElementById("scrollProgress")) {
    const scrollProgress = document.createElement("div");
    scrollProgress.id = "scrollProgress";
    scrollProgress.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #4e6dd4);
            z-index: 9998;
            transition: width 0.3s ease;
        `;
    document.body.insertBefore(scrollProgress, document.body.firstChild);
  }

  // Scroll Events
  window.addEventListener("scroll", handleScroll);

  // Back to Top Click
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    backToTopBtn.addEventListener("mouseenter", () => {
      backToTopBtn.style.transform = "translateY(-3px)";
      backToTopBtn.style.backgroundColor = "var(--primary-dark, #1e40af)";
    });

    backToTopBtn.addEventListener("mouseleave", () => {
      backToTopBtn.style.transform = "translateY(0)";
      backToTopBtn.style.backgroundColor = "var(--primary, #3b82f6)";
    });
  }
}

function handleScroll() {
  // Scroll Progress
  const winHeight = window.innerHeight;
  const docHeight = document.documentElement.scrollHeight;
  const scrollTop = window.pageYOffset;
  const trackLength = docHeight - winHeight;
  const progress = Math.floor((scrollTop / trackLength) * 100);

  const scrollProgress = document.getElementById("scrollProgress");
  if (scrollProgress) {
    scrollProgress.style.width = progress + "%";
  }

  // Back to Top Button
  const backToTopBtn = document.getElementById("backToTop");
  if (backToTopBtn) {
    if (window.pageYOffset > 300) {
      backToTopBtn.style.display = "block";
    } else {
      backToTopBtn.style.display = "none";
    }
  }
}

// Set active navigation
function setActiveNav() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Remove active class from all
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.remove("active");
  });

  // Add active to current
  const pageMap = {
    "index.html": "nav-home",
    "form.html": "nav-form",
    "bank_data.html": "nav-bank-data",
    "bankdata_borongan.html": "nav-bank-data",
    "bankdata_injectbusa.html": "nav-bank-data",
    "bankdata_kardus.html": "nav-bank-data",
    "bankdata_ambilbarang.html": "nav-bank-data",
    "bankdata_produksi.html": "nav-bank-data",
    "bankdata_komponen.html": "nav-bank-data",
    "stok_barang.html": "nav-bank-data",
    "form_borongan.html": "nav-form",
    "form_injectbusa.html": "nav-form",
    "form_kardus.html": "nav-form",
    "form_ambilbarang.html": "nav-form",
    "form_produksi.html": "nav-form",
    "form_komponen.html": "nav-form",
  };

  const activeNavId = pageMap[currentPage];
  if (activeNavId) {
    const activeNav = document.getElementById(activeNavId);
    const activeNavMobile = document.getElementById(`${activeNavId}-mobile`);

    if (activeNav) activeNav.classList.add("active");
    if (activeNavMobile) activeNavMobile.classList.add("active");
  }
}
window.CommonUtils = {
  formatDate,

  // Format number dengan separator ribuan
  formatNumber: (num) => {
    return num?.toLocaleString("id-ID") || "0";
  },

  // Debounce untuk optimasi pencarian
  debounce: (func, delay) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  },

  // Validasi email
  isValidEmail: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
};

/**
 * JSONP Loader - untuk cross-origin GET requests jika CORS gagal
 * Gunakan: fetchWithJsonpFallback(url, options)
 * Contoh: fetchWithJsonpFallback(url, { timeoutMs: 10000 })
 *   .then(data => console.log(data))
 *   .catch(err => console.error(err))
 */
function fetchWithJsonpFallback(url, options = {}) {
  const timeoutMs = options.timeoutMs || 10000;

  // Coba fetch normal dulu (lebih cepat)
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .catch((fetchError) => {
      // Jika fetch gagal (misalnya CORS), fallback ke JSONP
      console.warn(`Fetch gagal (${fetchError.message}), coba JSONP...`);
      return jsonpRequest(url, timeoutMs);
    });
}

/**
 * JSONP request helper
 * Menambah parameter callback ke URL dan inject script tag
 */
function jsonpRequest(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const callbackName =
      "jsonpCallback_" + Date.now() + Math.random().toString(36).substr(2, 9);
    const timeoutId = setTimeout(() => {
      delete window[callbackName];
      const scriptEl = document.querySelector(
        `script[data-jsonp="${callbackName}"]`
      );
      if (scriptEl) scriptEl.remove();
      reject(new Error("JSONP request timeout"));
    }, timeoutMs);

    window[callbackName] = (data) => {
      clearTimeout(timeoutId);
      delete window[callbackName];
      const scriptEl = document.querySelector(
        `script[data-jsonp="${callbackName}"]`
      );
      if (scriptEl) scriptEl.remove();
      resolve(data);
    };

    // Tambah callback param ke URL
    const separator = url.includes("?") ? "&" : "?";
    const jsonpUrl = url + separator + "callback=" + callbackName;

    // Inject script tag
    const script = document.createElement("script");
    script.src = jsonpUrl;
    script.dataset.jsonp = callbackName;
    script.onerror = () => {
      clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
      reject(new Error("JSONP script load failed"));
    };
    document.head.appendChild(script);
  });
}

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Common.js loaded");

  // Inisialisasi navigation
  initNavigation();

  // Set active navigation
  setActiveNav();

  // Auto-focus search input pada halaman bank data
  if (
    window.location.pathname.includes("bankdata") ||
    window.location.pathname.includes("stok")
  ) {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 500);
    }
  }

  // Tambahkan tahun saat ini di footer
  const yearSpan = document.getElementById("currentYear");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Initial scroll check
  handleScroll();
});
