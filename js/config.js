// js/config.js - KONFIGURASI UTAMA
// URL Apps Script v2.0 dengan Auto-Stock & Validation
window.APP_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwDHUenYXMAEhqX70Jli_aiNWT6AKDO1jn8sa6qdtWxbpffVfCmh9rPlT_fVtM_iow_LQ/exec";

// API Key untuk authentication
// NOTE: API key must NOT be committed. Replace locally using js/config.js (ignored).
window.API_KEY = "sk_live_REPLACE_ME_DO_NOT_COMMIT";
window.SPREADSHEET_ID = "1BfIQmLYeuD-bTvmdGBOVWWcBDVWQI_NPwW2TDlh4Mxc";

// Helper function untuk fetch dengan JSONP fallback (untuk CORS compatibility)
window.fetchWithFallback = async function (url, options = {}) {
  try {
    // Coba fetch biasa dulu
    const response = await fetch(url, {
      ...options,
      credentials: "omit",
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn("⚠️ Fetch gagal, mencoba fallback...", error.message);

    // Fallback: Gunakan JSONP
    if (options.method !== "POST") {
      return new Promise((resolve, reject) => {
        const callbackName = `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const jsonpUrl =
          url + (url.includes("?") ? "&" : "?") + `callback=${callbackName}`;

        const script = document.createElement("script");
        script.src = jsonpUrl;
        script.async = true;

        window[callbackName] = (data) => {
          delete window[callbackName];
          document.head.removeChild(script);
          resolve(data);
        };

        script.onerror = () => {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error("JSONP fallback juga gagal"));
        };

        document.head.appendChild(script);
        setTimeout(() => {
          if (window[callbackName]) {
            script.onerror();
          }
        }, 10000);
      });
    }

    throw error;
  }
};

console.log("✅ CONFIG.JS LOADED");
console.log("🌐 APPS SCRIPT URL:", window.APP_SCRIPT_URL);
console.log("📊 SPREADSHEET ID:", window.SPREADSHEET_ID);
