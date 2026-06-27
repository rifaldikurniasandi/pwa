// ============================================
// APPS SCRIPT - SISTEM MANAJEMEN PABRIK
// Sinkron dengan payload frontend PWA.
// Copy seluruh file ini ke Google Apps Script, lalu Deploy > Web app.
// ============================================

const SPREADSHEET_ID = "1BfIQmLYeuD-bTvmdGBOVWWcBDVWQI_NPwW2TDlh4Mxc";

const CONFIG = {
  API_KEY: "sk_live_REPLACE_ME_DO_NOT_COMMIT",
  REQUIRE_API_KEY: false,
  MAX_REQUESTS_PER_MINUTE: 100,
  PAGE_SIZE: 1000,
};

const SHEET_CONFIGS = {
  borongan: {
    headers: ["Timestamp", "Nama", "Barang", "Tipe", "Ukuran", "Warna", "Hasil"],
    fields: ["timestamp", "nama", "barang", "tipe", "ukuran", "warna", "hasil"],
  },
  injectbusa: {
    headers: ["Timestamp", "Shift", "Ukuran", "Tipe", "Warna", "Hasil"],
    fields: ["timestamp", "shift", "ukuran", "tipe", "warna", "hasil"],
  },
  kardus: {
    headers: ["Timestamp", "Nama Kardus", "Tipe", "Ukuran", "Jumlah"],
    fields: ["timestamp", "nama_kardus", "tipe", "ukuran", "jumlah"],
  },
  ambilbarang: {
    headers: ["Timestamp", "Nama", "Barang", "Warna", "Ukuran", "Tipe", "Jumlah"],
    fields: ["timestamp", "nama", "barang", "warna", "ukuran", "tipe", "jumlah"],
  },
  produksi: {
    headers: ["Timestamp", "Shift", "Nama Barang", "Tipe", "Ukuran", "Warna", "Hasil"],
    fields: ["timestamp", "shift", "nama_barang", "tipe", "ukuran", "warna", "hasil"],
  },
  komponen: {
    headers: [
      "Timestamp",
      "Nama Barang",
      "Ukuran",
      "Tipe",
      "Berat (kg)",
      "Berat (gram)",
      "Jumlah",
      "Keterangan",
    ],
    fields: [
      "timestamp",
      "nama_barang",
      "ukuran",
      "tipe",
      "berat_kg",
      "berat_grm",
      "jumlah",
      "keterangan",
    ],
  },
  stok_assembling: {
    headers: [
      "Timestamp",
      "Barang",
      "Warna",
      "Ukuran",
      "Tipe",
      "Stok Awal",
      "Masuk",
      "Keluar",
      "Sisa Stok",
      "Keterangan",
    ],
    fields: [
      "timestamp",
      "barang",
      "warna",
      "ukuran",
      "tipe",
      "stok_awal",
      "masuk",
      "keluar",
      "sisa_stok",
      "keterangan",
    ],
  },
  feedback: {
    headers: ["Timestamp", "Nama", "Email", "Pesan", "Status"],
    fields: ["timestamp", "nama", "email", "pesan", "status"],
  },
};

function doGet(e) {
  try {
    const params = e.parameter || {};
    const callback = params.callback || null;
    const action = params.action || "";

    if (action === "test") {
      return createResponse(testAPI(), callback);
    }

    checkRateLimit(getClientId(e));

    const sheetName = normalizeSheetName(params.sheet || "borongan");
    const page = Math.max(1, parseInt(params.page, 10) || 1);
    const search = String(params.search || "").toLowerCase().trim();

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return createResponse(
        {
          success: false,
          message: `Sheet "${sheetName}" tidak ditemukan`,
          availableSheets: ss.getSheets().map((s) => s.getName()).sort(),
        },
        callback,
      );
    }

    const values = sheet.getDataRange().getValues();
    const configuredHeaders = SHEET_CONFIGS[sheetName]?.headers || [];
    const headers = values.length > 0 && values[0].length > 0
      ? values[0].map((header, index) => header || configuredHeaders[index] || `Kolom ${index + 1}`)
      : configuredHeaders;

    let rows = values.length > 1 ? values.slice(1) : [];
    if (search) {
      rows = rows.filter((row) =>
        row.some((cell) => String(cell).toLowerCase().includes(search)),
      );
    }

    const pageSize = Math.max(1, parseInt(params.pageSize, 10) || CONFIG.PAGE_SIZE);
    const totalRecords = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

    return createResponse(
      {
        success: true,
        sheet: sheetName,
        headers,
        data: paginatedRows,
        pagination: {
          page,
          pageSize,
          totalRecords,
          totalPages,
          hasMore: page < totalPages,
        },
        timestamp: new Date().toISOString(),
      },
      callback,
    );
  } catch (error) {
    console.error("Error in doGet:", error);
    return createErrorResponse(error, e?.parameter?.callback || null);
  }
}

function doPost(e) {
  try {
    checkRateLimit(getClientId(e));
    validateApiKey(e?.parameter?.["x-api-key"] || "");

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Tidak ada data yang diterima");
    }

    const payload = JSON.parse(e.postData.contents);
    const sheetName = normalizeSheetName(payload.sheet);
    if (!sheetName) {
      throw new Error("Nama sheet harus disertakan");
    }

    if (sheetName === "ambilbarang" && payload.ambil_barang !== undefined) {
      const normalized = String(payload.ambil_barang || "").trim();
      if (normalized) {
        payload.nama = payload.nama || normalized;
        payload.barang = payload.barang || normalized;
      }
    }

    const config = SHEET_CONFIGS[sheetName];
    if (!config) {
      throw new Error(`Sheet "${sheetName}" belum punya konfigurasi field`);
    }

    validatePayload(sheetName, payload);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getOrCreateSheet(ss, sheetName);
    ensureHeaders(sheet, config.headers);

    const rowData = config.fields.map((field) => {
      if (field === "timestamp") {
        return payload.timestamp || new Date().toISOString();
      }
      return payload[field] ?? "";
    });

    sheet.appendRow(rowData);
    const newRowNumber = sheet.getLastRow();

    let stockUpdate = null;
    if (sheetName === "produksi" || sheetName === "borongan") {
      stockUpdate = updateStockAutomatically(sheetName, payload, ss);
    }

    return createResponse({
      success: true,
      message: "Data berhasil disimpan",
      sheet: sheetName,
      row: newRowNumber,
      timestamp: new Date().toISOString(),
      stockUpdate,
    });
  } catch (error) {
    console.error("Error in doPost:", error);
    return createErrorResponse(error);
  }
}

function validatePayload(sheetName, payload) {
  const requiredBySheet = {
    borongan: ["nama", "barang", "tipe", "ukuran", "warna", "hasil"],
    injectbusa: ["shift", "ukuran", "tipe", "warna", "hasil"],
    kardus: ["nama_kardus", "tipe", "ukuran", "jumlah"],
    ambilbarang: ["nama", "barang", "warna", "ukuran", "tipe", "jumlah"],
    produksi: ["shift", "nama_barang", "tipe", "ukuran", "warna", "hasil"],
    komponen: ["nama_barang", "ukuran", "tipe"],
  };

  const requiredFields = requiredBySheet[sheetName] || [];
  const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === "");
  if (missing.length > 0) {
    throw new Error(`Field wajib belum lengkap: ${missing.join(", ")}`);
  }

  const numberFields = ["hasil", "jumlah", "berat_kg", "berat_grm"];
  numberFields.forEach((field) => {
    if (payload[field] !== undefined && payload[field] !== "" && Number(payload[field]) < 0) {
      throw new Error(`Field ${field} tidak boleh negatif`);
    }
  });
}

function updateStockAutomatically(formType, payload, spreadsheet) {
  try {
    const stockSheet = getOrCreateSheet(spreadsheet, "stok_assembling");
    ensureHeaders(stockSheet, SHEET_CONFIGS.stok_assembling.headers);

    const barang = String(payload.nama_barang || payload.barang || "").trim();
    const warna = String(payload.warna || "").trim();
    const ukuran = String(payload.ukuran || "").trim();
    const tipe = String(payload.tipe || "").trim();
    const jumlah = Number(payload.hasil || payload.jumlah || 0);

    if (!barang || !warna || !ukuran || !tipe || jumlah <= 0) {
      return {
        success: false,
        message: "Data stok tidak lengkap, data utama tetap tersimpan",
      };
    }

    const data = stockSheet.getDataRange().getValues();
    let targetRow = -1;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (
        String(row[1]).trim() === barang &&
        String(row[2]).trim() === warna &&
        String(row[3]).trim() === ukuran &&
        String(row[4]).trim() === tipe
      ) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) {
      const masuk = formType === "produksi" ? jumlah : 0;
      const keluar = formType === "borongan" ? jumlah : 0;
      const sisa = masuk - keluar;
      stockSheet.appendRow([
        new Date().toISOString(),
        barang,
        warna,
        ukuran,
        tipe,
        0,
        masuk,
        keluar,
        sisa,
        `Dibuat otomatis dari ${formType}`,
      ]);

      return {
        success: true,
        action: "created",
        message: `Stok baru dibuat untuk ${barang}`,
        stock: sisa,
      };
    }

    const stokAwalCell = stockSheet.getRange(targetRow, 6);
    const masukCell = stockSheet.getRange(targetRow, 7);
    const keluarCell = stockSheet.getRange(targetRow, 8);
    const sisaCell = stockSheet.getRange(targetRow, 9);
    const keteranganCell = stockSheet.getRange(targetRow, 10);

    const currentStokAwal = Number(stokAwalCell.getValue()) || 0;
    const currentMasuk = Number(masukCell.getValue()) || 0;
    const currentKeluar = Number(keluarCell.getValue()) || 0;
    let newMasuk = currentMasuk;
    let newKeluar = currentKeluar;

    if (formType === "produksi") {
      newMasuk += jumlah;
    } else {
      newKeluar += jumlah;
    }

    const newSisa = currentStokAwal + newMasuk - newKeluar;
    masukCell.setValue(newMasuk);
    keluarCell.setValue(newKeluar);
    sisaCell.setValue(newSisa);
    keteranganCell.setValue(
      String(keteranganCell.getValue() || "") +
        ` | ${new Date().toLocaleDateString("id-ID")}: ${formType} ${formType === "produksi" ? "+" : "-"}${jumlah}`,
    );

    return {
      success: true,
      action: "updated",
      message: `Stok ${barang} diperbarui`,
      stock: newSisa,
    };
  } catch (error) {
    console.error("Error update stok:", error);
    return {
      success: false,
      message: "Data utama tersimpan, tetapi stok gagal diperbarui: " + error.message,
    };
  }
}

function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const created = [];
  const updated = [];

  Object.keys(SHEET_CONFIGS).forEach((sheetName) => {
    const sheet = getOrCreateSheet(ss, sheetName, created);
    if (ensureHeaders(sheet, SHEET_CONFIGS[sheetName].headers)) {
      updated.push(sheetName);
    }
  });

  return {
    success: true,
    message: "Setup sheets selesai",
    created,
    updated,
    timestamp: new Date().toISOString(),
  };
}

function getOrCreateSheet(spreadsheet, sheetName, created = null) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (created) created.push(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  if (!headers || headers.length === 0) return false;

  const currentLastColumn = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, currentLastColumn).getValues()[0].slice(0, headers.length);
  const isSame = JSON.stringify(currentHeaders) === JSON.stringify(headers);

  if (!isSame) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#4f46e5");
    headerRange.setFontColor("white");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
    return true;
  }

  return false;
}

function normalizeSheetName(sheetName) {
  if (!sheetName) return "";
  if (sheetName === "komponen_barang") return "komponen";
  return String(sheetName).trim();
}

function validateApiKey(providedKey) {
  if (CONFIG.REQUIRE_API_KEY === false) return true;
  if (!providedKey || providedKey !== CONFIG.API_KEY) {
    throw {
      code: 401,
      message: "API key tidak valid atau belum dikirim",
    };
  }
  return true;
}

function checkRateLimit(clientId) {
  const cache = CacheService.getScriptCache();
  const key = `rate_${clientId}`;
  const current = Number(cache.get(key) || 0);

  if (current >= CONFIG.MAX_REQUESTS_PER_MINUTE) {
    throw {
      code: 429,
      message: "Terlalu banyak request. Coba lagi sebentar.",
    };
  }

  cache.put(key, String(current + 1), 60);
}

function getClientId(e) {
  const source = [
    e?.parameter?.client || "",
    e?.sourceIp || "",
    e?.userAgent || "",
    Session.getTemporaryActiveUserKey() || "anonymous",
  ].join("|");

  return Utilities.base64EncodeWebSafe(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, source),
  ).slice(0, 32);
}

function createErrorResponse(error, callback = null) {
  let statusCode = 500;
  let message = error?.message || String(error);

  if (typeof error === "object" && error.code && error.message) {
    statusCode = error.code;
    message = error.message;
  } else if (message.includes("JSON")) {
    statusCode = 400;
  }

  return createResponse(
    {
      success: false,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
    callback,
  );
}

function createResponse(data, callback = null) {
  const json = JSON.stringify(data);
  const output = callback
    ? ContentService.createTextOutput(`${callback}(${json});`)
    : ContentService.createTextOutput(json);

  output.setMimeType(
    callback
      ? ContentService.MimeType.JAVASCRIPT
      : ContentService.MimeType.JSON,
  );

  return output;
}

function testAPI() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return {
    success: true,
    message: "Apps Script API siap dipakai",
    version: "3.0-frontend-contract",
    sheets: ss.getSheets().map((s) => s.getName()),
    timestamp: new Date().toISOString(),
  };
}

function testFormSubmission() {
  const e = {
    parameter: {},
    postData: {
      contents: JSON.stringify({
        sheet: "produksi",
        shift: "1",
        nama_barang: "Test Barang",
        tipe: "Test",
        ukuran: "10",
        warna: "Biru",
        hasil: 1,
      }),
    },
  };

  return doPost(e);
}