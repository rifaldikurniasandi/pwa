// Tambahkan di common.js untuk debug dan production support
document.addEventListener("DOMContentLoaded", function () {
  console.log("=== SYSTEM INIT ===");
  console.log("✅ APP_SCRIPT_URL:", window.APP_SCRIPT_URL);
  console.log(
    "✅ fetchWithFallback available:",
    typeof window.fetchWithFallback === "function",
  );
  console.log("📄 Current page:", window.location.pathname);

  // Ensure fetchWithFallback exists as fallback
  if (typeof window.fetchWithFallback !== "function") {
    console.warn(
      "⚠️ fetchWithFallback not loaded, creating fallback version...",
    );
    window.fetchWithFallback = async function (url, options = {}) {
      const response = await fetch(url, options);
      return await response.json();
    };
  }

  // Test fetch jika di halaman bank data
  if (window.location.pathname.includes("bankdata") && window.APP_SCRIPT_URL) {
    setTimeout(function () {
      const testUrl = window.APP_SCRIPT_URL + "?sheet=borongan&t=" + Date.now();
      console.log("🧪 Testing connection to:", testUrl);

      window
        .fetchWithFallback(testUrl)
        .then((data) => {
          console.log("✅ Test response:", {
            success: data.success,
            count: data.data ? data.data.length : 0,
          });
        })
        .catch((err) => {
          console.error("❌ Test failed:", err.message);
        });
    }, 2000);
  }

  // Register service worker dengan error handling
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js", { scope: "/" })
      .then((registration) => {
        console.log("✅ SW registered:", registration.scope);
        // Check untuk updates setiap 1 jam
        setInterval(() => registration.update(), 3600000);
      })
      .catch((err) => {
        console.warn("⚠️ SW registration failed:", err);
        // Show offline message jika SW gagal
        const offlineNote = document.createElement("div");
        offlineNote.style.cssText =
          "background:#fff3cd;padding:8px;text-align:center;font-size:12px;color:#856404;";
        offlineNote.textContent =
          "⚠️ Offline mode tidak tersedia. Aplikasi memerlukan koneksi internet.";
        document.body.insertBefore(offlineNote, document.body.firstChild);
      });
  }

  // Mobile Menu Toggle - universal
  const mobileMenuButton = document.getElementById("mobile-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");

      // Ganti icon
      const icon = this.querySelector("i");
      if (mobileMenu.classList.contains("hidden")) {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      } else {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      }
    });

    // Close menu ketika link diklik
    const mobileLinks = mobileMenu.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        const icon = mobileMenuButton.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      });
    });
  }

  // Back to Top button - universal
  const backToTopBtn = document.getElementById("backToTop");
  const scrollProgress = document.getElementById("scrollProgress");

  if (backToTopBtn || scrollProgress) {
    window.addEventListener(
      "scroll",
      function () {
        const scrolled = window.scrollY || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight - window.innerHeight;
        const pct = height > 0 ? Math.round((scrolled / height) * 100) : 0;

        if (scrollProgress) {
          scrollProgress.style.width = pct + "%";
        }

        if (backToTopBtn) {
          if (scrolled > 300) {
            backToTopBtn.style.display = "block";
          } else {
            backToTopBtn.style.display = "none";
          }
        }
      },
      { passive: true },
    );

    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }
});
