import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getToastService } from "./toast-service.js";

export class InventoryService {

  static _fetchFromAPI(url) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          resolve([]);
        }
      });
      xhr.send();
    });
  }

  static _saveItemToAPI(item) {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/items?force=true");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.addEventListener("load", () => {
        resolve(xhr.status === 200 || xhr.status === 201);
      });
      xhr.send(JSON.stringify(item));
    });
  }

  static exportAsCSV(items) {
    if (!items || items.length === 0) {
      getToastService().showToast("No items found to export.", "error");
      return;
    }

    let csvContent = "ID;Name;Current Location ID;Categories;Location History;Borrowed;Favorite;Description\n";

    items.forEach((item) => {
      const id = item.id || "";
      const name = item.name ? `"${item.name.replace(/"/g, '""')}"` : "";
      const currentLoc = item.location || ""; 
      const categoriesStr = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories.join(", ")
        : "-";
      const categories = `"${categoriesStr.replace(/"/g, '""')}"`;
      
      const historyStr = Array.isArray(item.locationHistory) && item.locationHistory.length > 0
        ? item.locationHistory.map(h => {
            const dateStr = h.date ? new Date(h.date).toISOString() : "";
            return `${h.locationName || "Unknown"}_${dateStr}`;
          }).join("|")
        : "-";
      const history = `"${historyStr.replace(/"/g, '""')}"`;
      
      const isBorrowed = item.borrowed === true ? "Yes" : "No";
      const isFavorite = item.favorite === true ? "Yes" : "No";
      const desc = item.description ? `"${item.description.replace(/"/g, '""')}"` : "";

      csvContent += `${id};${name};${currentLoc};${categories};${history};${isBorrowed};${isFavorite};${desc}\n`;
    });

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "detailed_inventory_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link); 
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    getToastService().showToast("CSV export successfully started.");
  }

  static async exportAsPDF(items) {
    if (!items || items.length === 0) {
      getToastService().showToast("No items found to export.", "error");
      return;
    }

    const doc = new jsPDF("l", "mm", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Detailed Inventory Export", 14, 18);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    const existingCategories = await this._fetchFromAPI("/api/categories");
    const existingLocations = await this._fetchFromAPI('/api/locations');

    const tableRows = items.map(item => {
      const categories = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories.map(c => existingCategories.find(x => x.id == c)?.name || "Unknown").join(", ") 
        : "-";

      const history = Array.isArray(item.locationHistory) && item.locationHistory.length > 0
        ? item.locationHistory.map(h => {
            const dateStr = h.date ? new Date(h.date).toLocaleDateString() : "";
            return `${h.locationName || "Unknown"} (${dateStr})`;
          }).join(" | ")
        : "-";

      const isBorrowed = item.borrowed ? "Yes" : "No";
      const isFavorite = item.favorite === true ? "Yes" : "No";
      const locName = existingLocations.find(l => l.id == item.location)?.name || "-";

      return [
        item.id ? item.id : "-", 
        item.name || "-",
        locName, 
        categories,
        history,
        isBorrowed,
        isFavorite,
        item.description && item.description.trim() !== "" ? item.description : "-"
      ];
    });

    autoTable(doc, {
      startY: 30,
      head: [[
        "ID", "Name", "Current Location", "Categories", "Location History", "Borrowed", "Favorite", "Description"
      ]],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { font: "helvetica", fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 55 },
        5: { cellWidth: 18 },
        6: { cellWidth: 20 },
        7: { cellWidth: "auto" }
      },
      rowPageBreak: "avoid"
    });

    const stringBlob = doc.output("bloburl");
    window.open(stringBlob, "_blank");

    getToastService().showToast("Detailed PDF generated successfully.");
  }

  static async handleCSVImport(event, onSuccessCallback) {
    const file = event.target.files[0];
    if (!file) return;

    getToastService().showToast("Validating and importing data...");

    const existingLocations = await this._fetchFromAPI("/api/locations");
    const existingCategories = await this._fetchFromAPI("/api/categories");

    const validLocationIds = existingLocations.map(l => String(l.id));
    const validCategoryIds = existingCategories.map(c => String(c.id));

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length <= 1) {
        getToastService().showToast("The CSV file is empty.", "error");
        return;
      }

      const headers = lines[0].split(";").map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      
      const idxName = headers.indexOf("name");
      const idxLoc = headers.indexOf("current location id");
      const idxCats = headers.indexOf("categories");
      const idxLocationHistory = headers.indexOf("location history");
      const idxBorrowed = headers.indexOf("borrowed");
      const idxFav = headers.indexOf("favorite");
      const idxDesc = headers.indexOf("description");

      const itemsToSave = [];
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(";").map(col => col.trim().replace(/^"|"$/g, ''));

        const name = columns[idxName];
        const locationId = columns[idxLoc];
        const categoriesString = columns[idxCats];
        const locationHistoryString = columns[idxLocationHistory];
        const borrowedStr = columns[idxBorrowed];
        const favoriteStr = columns[idxFav];
        const description = columns[idxDesc];

        if (!name || name === "-") {
          console.warn(`Row ${i}: Skipped because 'Name' is missing.`);
          errorCount++;
          continue;
        }

        const isBorrowed = borrowedStr ? borrowedStr.toLowerCase() === "yes" : false;

        if (locationId && locationId !== "-" && locationId.trim() !== "") {
          if (!isBorrowed && !validLocationIds.includes(locationId)) {
            console.error(`Row ${i}: Location ID '${locationId}' does not exist!`);
            errorCount++;
            continue;
          }
        }

        let itemCategories = [];
        if (categoriesString && categoriesString !== "-") {
          itemCategories = categoriesString.split(",").map(id => id.trim()).filter(id => id.length > 0);
          const allCatsValid = itemCategories.every(id => validCategoryIds.includes(id));
          if (!allCatsValid) {
            console.error(`Row ${i}: One or more Category IDs are invalid!`);
            errorCount++;
            continue;
          }
        }

        let locationHistory = [];
        if (locationHistoryString && locationHistoryString !== "-") {
          const data = locationHistoryString.split('|');
          locationHistory = data.map(entry => {
            let hName = entry.split("_")[0];
            let dateStr = entry.split("_")[1];
            let date = dateStr ? new Date(dateStr) : new Date();
            
            if (isNaN(date.getTime())) {
              date = new Date();
            }
            return {
              locationName: hName,
              date: date.toISOString()
            }
          });
        }

        const newItem = {
          name: name,
          description: (description === "-" || !description) ? "" : description,
          location: (locationId === "-" || !locationId || locationId.trim() === "") ? null : locationId,
          categories: itemCategories,
          borrowed: isBorrowed,
          favorite: favoriteStr ? favoriteStr.toLowerCase() === "yes" : false,
          locationHistory: locationHistory
        };

        itemsToSave.push(newItem);
      }

      if (itemsToSave.length > 0) {
        let successCount = 0;
        for (const item of itemsToSave) {
          const success = await this._saveItemToAPI(item);
          if (success) successCount++;
        }

        getToastService().showToast(`Import finished! Successfully created ${successCount} items. Errors: ${errorCount}`);
        
        if (typeof onSuccessCallback === "function") {
          onSuccessCallback();
        }
      } else {
        getToastService().showToast(`Import failed. All items had validation errors.`, "error");
      }
    };

    reader.readAsText(file);
  }
}