// js/debug.js - Untuk debugging

window.debugApp = {
  testConnection: async function () {
    try {
      console.log("🔗 Testing connection to:", window.APP_SCRIPT_URL);

      const response = await fetch(
        window.APP_SCRIPT_URL + "?sheet=borongan&action=getData",
      );
      const data = await response.json();

      console.log("📊 Connection test result:", data);

      if (data.success) {
        alert(
          `✅ Koneksi berhasil!\nSheet: ${data.sheet || "N/A"}\nData rows: ${
            data.count || 0
          }`,
        );
      } else {
        alert(`❌ Koneksi gagal: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Test connection error:", error);
      alert(`❌ Error: ${error.message}`);
    }
  },

  listSheets: async function () {
    try {
      if (typeof SpreadsheetApp === "undefined") {
        alert(
          "Fungsi ini hanya tersedia di Apps Script editor. Buka Apps Script untuk melihat daftar sheet.",
        );
        return;
      }

      const ss = SpreadsheetApp.openById(window.SPREADSHEET_ID);
      const sheets = ss.getSheets();
      const sheetNames = sheets.map((s) => s.getName());

      console.log("📋 Available sheets:", sheetNames);
      alert(`Sheets yang tersedia:\n${sheetNames.join("\n")}`);
    } catch (error) {
      console.error("❌ Error listing sheets:", error);
    }
  },
};

// Tambahkan debug button ke semua halaman
document.addEventListener("DOMContentLoaded", function () {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    const debugDiv = document.createElement("div");
    debugDiv.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      z-index: 9999;
      background: #333;
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
    `;

    debugDiv.innerHTML = `
      <button onclick="debugApp.testConnection()" style="background: #4CAF50; color: white; border: none; padding: 5px 10px; margin: 2px; border-radius: 3px; cursor: pointer;">
        Test Connection
      </button>
      <div style="margin-top: 5px; font-size: 10px; color: #ccc;">
        URL: ${window.APP_SCRIPT_URL || "Not set"}
      </div>
    `;

    document.body.appendChild(debugDiv);
  }
});
