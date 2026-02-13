// APPS SCRIPT UNTUK PT. NASIONAL FARINDO JAYA - FINAL VERSION
const SPREADSHEET_ID = "1BfIQmLYeuD-bTvmdGBOVWWcBDVWQI_NPwW2TDlh4Mxc";

// Handle GET requests (untuk mengambil data)
function doGet(e) {
  try {
    const params = e.parameter || {};
    const sheetName = params.sheet || "borongan";
    const callback = params.callback || null;

    console.log("GET request for sheet:", sheetName);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      const availableSheets = ss.getSheets().map((s) => s.getName());
      const errorMsg = {
        success: false,
        message: `Sheet "${sheetName}" tidak ditemukan.`,
        availableSheets: availableSheets,
      };
      return createResponse(errorMsg, callback);
    }

    const data = sheet.getDataRange().getValues();
    const result = {
      success: true,
      sheet: sheetName,
      data: data,
      headers: data.length > 0 ? data[0] : [],
      count: data.length,
    };

    console.log(`Mengembalikan ${data.length} baris dari sheet "${sheetName}"`);
    return createResponse(result, callback);
  } catch (error) {
    console.error("Error in doGet:", error);
    const errorMsg = {
      success: false,
      message: error.toString(),
      stack: error.stack,
    };
    return createResponse(errorMsg, e?.parameter?.callback || null);
  }
}

// Handle POST requests (untuk menyimpan data)
function doPost(e) {
  try {
    console.log("POST request received");

    if (!e || !e.postData || !e.postData.contents) {
      return createResponse({
        success: false,
        message: "Tidak ada data yang diterima",
      });
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
      console.log("Payload:", payload);
    } catch (parseError) {
      return createResponse({
        success: false,
        message: "Format JSON tidak valid",
        error: parseError.toString(),
      });
    }

    if (!payload.sheet) {
      return createResponse({
        success: false,
        message: "Nama sheet harus disertakan",
      });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(payload.sheet);

    if (!sheet) {
      return createResponse({
        success: false,
        message: `Sheet "${payload.sheet}" tidak ditemukan di spreadsheet`,
      });
    }

    // Persiapkan data untuk disimpan
    let rowData = [];

    if (Array.isArray(payload.data)) {
      // Data sudah dalam format array
      rowData = payload.data;
    } else if (payload.data && typeof payload.data === "object") {
      // Data dalam format object, konversi ke array
      rowData = Object.values(payload.data);
    } else {
      rowData = [payload.data || ""];
    }

    // Tambahkan timestamp di kolom pertama
    const timestamp = new Date();
    rowData.unshift(timestamp.toISOString());

    console.log("Row data to append:", rowData);

    // Tambahkan ke sheet
    sheet.appendRow(rowData);
    const newRowNumber = sheet.getLastRow();

    // Log untuk debugging
    console.log(`Data berhasil disimpan di baris ${newRowNumber}`);

    return createResponse({
      success: true,
      message: "Data berhasil disimpan",
      sheet: payload.sheet,
      row: newRowNumber,
      timestamp: timestamp.toISOString(),
      data: rowData,
    });
  } catch (error) {
    console.error("Error in doPost:", error);
    return createResponse({
      success: false,
      message: error.toString(),
      stack: error.stack,
    });
  }
}

// Handle OPTIONS requests untuk CORS
function doOptions(e) {
  return ContentService.createTextOutput()
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader("Access-Control-Allow-Origin", "*")
    .addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .addHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Helper function untuk membuat response
function createResponse(data, callback = null) {
  const json = JSON.stringify(data, null, 2);

  if (callback) {
    // JSONP response
    const output = ContentService.createTextOutput(`${callback}(${json});`);
    output.setMimeType(ContentService.MimeType.JAVASCRIPT);
    return output;
  } else {
    // JSON response biasa
    const output = ContentService.createTextOutput(json);
    output.setMimeType(ContentService.MimeType.JSON);

    // Tambahkan header CORS untuk semua response
    output.setHeaders({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    return output;
  }
}

// TEST FUNCTION untuk debugging
function testConnection() {
  console.log("Testing connection...");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = ss.getSheets();

  const sheetInfo = sheets.map((sheet) => {
    return {
      name: sheet.getName(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn(),
    };
  });

  console.log("Available sheets:", sheetInfo);
  return sheetInfo;
}

// Function untuk setup awal spreadsheet
function setupSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // List semua sheet yang diperlukan
  const requiredSheets = [
    "borongan",
    "injectbusa",
    "kardus",
    "ambilbarang",
    "produksi",
    "komponen_barang",
    "stok_assembling",
    "feedback",
  ];

  const existingSheets = ss.getSheets().map((s) => s.getName());
  const createdSheets = [];

  requiredSheets.forEach((sheetName) => {
    if (!existingSheets.includes(sheetName)) {
      const newSheet = ss.insertSheet(sheetName);

      // Tambah header default berdasarkan jenis sheet
      switch (sheetName) {
        case "borongan":
          newSheet
            .getRange(1, 1, 1, 7)
            .setValues([
              [
                "Timestamp",
                "Nama",
                "Barang",
                "Tipe",
                "Ukuran",
                "Warna",
                "Hasil",
              ],
            ]);
          break;
        case "injectbusa":
          newSheet
            .getRange(1, 1, 1, 6)
            .setValues([
              ["Timestamp", "Shift", "Ukuran", "Tipe", "Warna", "Hasil"],
            ]);
          break;
        case "kardus":
          newSheet
            .getRange(1, 1, 1, 5)
            .setValues([
              ["Timestamp", "Nama Kardus", "Tipe", "Ukuran", "Jumlah"],
            ]);
          break;
        case "ambilbarang":
          newSheet
            .getRange(1, 1, 1, 4)
            .setValues([["Timestamp", "Nama Barang", "Jumlah", "Keterangan"]]);
          break;
        case "produksi":
          newSheet
            .getRange(1, 1, 1, 7)
            .setValues([
              [
                "Timestamp",
                "Shift",
                "Nama Barang",
                "Tipe",
                "Ukuran",
                "Warna",
                "Hasil",
              ],
            ]);
          break;
        case "komponen_barang":
          newSheet
            .getRange(1, 1, 1, 9)
            .setValues([
              [
                "Timestamp",
                "Nama Barang",
                "Ukuran",
                "Tipe",
                "Berat (kg)",
                "Berat (gram)",
                "Jumlah",
                "Keterangan",
                "Status",
              ],
            ]);
          break;
        case "stok_assembling":
          newSheet
            .getRange(1, 1, 1, 11)
            .setValues([
              [
                "Timestamp",
                "Barang",
                "Warna",
                "Ukuran",
                "Tipe",
                "Stok Awal",
                "Masuk",
                "Keluar",
                "Sisa Stok",
                "Stok Opname",
                "Keterangan",
              ],
            ]);
          break;
        case "feedback":
          newSheet
            .getRange(1, 1, 1, 5)
            .setValues([["Timestamp", "Nama", "Email", "Pesan", "Status"]]);
          break;
        default:
          newSheet.getRange(1, 1).setValue("Timestamp");
      }

      createdSheets.push(sheetName);
      console.log(`Created sheet: ${sheetName}`);
    }
  });

  return {
    success: true,
    message: `Setup completed. Created sheets: ${createdSheets.join(", ")}`,
    existingSheets: existingSheets,
    createdSheets: createdSheets,
  };
}
