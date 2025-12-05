// APPS SCRIPT UNTUK PT. NASIONAL FARINDO JAYA
// Versi Perbaikan: Tanpa setHeader (CORS tidak reliable di Apps Script)
// Dengan JSONP fallback untuk GET requests

const SPREADSHEET_ID = "1BfIQmLYeuD-bTvmdGBOVWWcBDVWQI_NPwW2TDlh4Mxc";

/**
 * Handle GET requests
 * Parameter: sheet (nama sheet), callback (untuk JSONP)
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const sheetName = params.sheet || "borongan";
    const callbackName = params.callback || null;

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      const availableSheets = ss.getSheets().map((s) => s.getName());
      return jsonOutput(
        {
          success: false,
          message: `Sheet "${sheetName}" tidak ditemukan`,
          available: availableSheets,
        },
        callbackName
      );
    }

    const data = sheet.getDataRange().getValues();
    const result = {
      success: true,
      sheet: sheetName,
      data: data,
      count: data.length,
      headers: data.length > 0 ? data[0] : [],
    };

    return jsonOutput(result, callbackName);
  } catch (err) {
    return jsonOutput(
      {
        success: false,
        message: err.toString(),
        stack: err.stack,
      },
      (e && e.parameter && e.parameter.callback) || null
    );
  }
}

/**
 * Handle POST requests (append data ke sheet)
 */
function doPost(e) {
  try {
    // Cek apakah ada POST data
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput({
        success: false,
        message: "Tidak ada data POST yang diterima",
      });
    }

    // Parse JSON payload
    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonOutput({
        success: false,
        message: "JSON payload tidak valid",
        error: parseErr.toString(),
      });
    }

    // Cek sheet name
    if (!payload.sheet) {
      return jsonOutput({
        success: false,
        message: "Field 'sheet' harus ada di payload",
      });
    }

    // Buka sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(payload.sheet);

    if (!sheet) {
      return jsonOutput({
        success: false,
        message: `Sheet "${payload.sheet}" tidak ditemukan`,
      });
    }

    // Siapkan data baris
    let rowData = [];
    if (Array.isArray(payload.data)) {
      rowData = payload.data;
    } else if (payload.data && typeof payload.data === "object") {
      rowData = Object.values(payload.data);
    } else {
      rowData = [payload.data];
    }

    // Tambah timestamp ISO jika belum ada
    const hasIsoTimestamp = rowData.some(
      (item) =>
        typeof item === "string" && item.includes("T") && item.includes("Z")
    );
    if (!hasIsoTimestamp) {
      rowData.push(new Date().toISOString());
    }

    // Append ke sheet
    sheet.appendRow(rowData);
    const newRow = sheet.getLastRow();

    return jsonOutput({
      success: true,
      message: "Data berhasil disimpan",
      sheet: payload.sheet,
      row: newRow,
      data: rowData,
    });
  } catch (err) {
    return jsonOutput({
      success: false,
      message: err.toString(),
      stack: err.stack,
    });
  }
}

/**
 * Handle preflight OPTIONS request
 */
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Helper: output JSON atau JSONP (tanpa setHeader yang tidak reliable)
 */
function jsonOutput(data, callbackName) {
  const json = JSON.stringify(data);

  if (callbackName) {
    // JSONP response (untuk GET cross-origin tanpa CORS)
    const output = ContentService.createTextOutput(
      callbackName + "(" + json + ");"
    );
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return output;
  } else {
    // JSON response biasa
    const output = ContentService.createTextOutput(json);
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}
