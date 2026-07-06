import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'items');


export const itemsHandlers = {

  getAll: () => {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    return files.reduce((acc, file) => {
      try {
        acc.push(JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')));
      } catch (err) {
        console.error(`Error parsing item JSON file: ${file}`, err);
      }
      return acc;
    }, []);
  },
  updateItem: (id, updateData, force = false) => {
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) return null;

    if (!force && updateData.name) {
      const items = itemsHandlers.getAll();
      const duplicate = items.find(i => i.name.toLowerCase() === updateData.name.toLowerCase() && i.id !== id);
      if (duplicate) {
        const err = new Error("Duplicate item");
        err.code = "DUPLICATE";
        throw err;
      }
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const existingItem = JSON.parse(fileContent);

      const updatedItem = {
        id: existingItem.id,
        name: updateData.name !== undefined ? updateData.name : existingItem.name,
        description: updateData.description !== undefined ? updateData.description : existingItem.description,
        location: updateData.location !== undefined ? updateData.location : existingItem.location,
        categories: updateData.categories !== undefined ? updateData.categories : existingItem.categories,
        locationHistory: updateData.locationHistory !== undefined ? updateData.locationHistory : existingItem.locationHistory,
        image: updateData.image !== undefined ? updateData.image : existingItem.image,
        borrowed: updateData.borrowed !== undefined ? updateData.borrowed : existingItem.borrowed,
        favorite: updateData.favorite !== undefined ? updateData.favorite : existingItem.favorite
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedItem, null, 2));

      return updatedItem;
    } catch (err) {
      if (err.code === "DUPLICATE") throw err;
      console.error(`Error updating item ${id}:`, err);
      return null;
    }
  },
  getById: (id) => {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.error(`Error parsing item ${id}:`, err);
      return null;
    }
  },

 addItem: (itemData, force = false) => {
    if (!force && itemData.name) {
      const items = itemsHandlers.getAll();
      const duplicate = items.find(i => i.name.toLowerCase() === itemData.name.toLowerCase());
      if (duplicate) {
        const err = new Error("Duplicate item");
        err.code = "DUPLICATE";
        throw err;
      }
    }

    const id = crypto.randomUUID();
    
    const item = {
      id: id,
      name: itemData.name,
      description: itemData.description || "",
      location: itemData.location || null,
      categories: Array.isArray(itemData.categories) ? itemData.categories : [],
      locationHistory: Array.isArray(itemData.locationHistory) ? itemData.locationHistory : [],
      image: itemData.image || null,
      // FIX: Übernehme den Wert aus dem Frontend, falls vorhanden, sonst default false
      borrowed: itemData.borrowed !== undefined ? itemData.borrowed : false,
      favorite: itemData.favorite !== undefined? itemData.favorite : false
    };

    fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(item, null, 2));

    return item; 
  },

  deleteItem: (id) => {
    const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) return null;

    fs.unlinkSync(filePath);
    return true;
  }
}

// I just made a comment here so I can commit smth cuz I have problems