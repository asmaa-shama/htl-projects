import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'locations');


export const locationsHandlers = {

updateItem: (id, data, force = false) => {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) return false;

    if (!force && data.name) {
      const locations = locationsHandlers.getAll();
      const duplicate = locations.find(l => l.name.toLowerCase() === data.name.toLowerCase() && l.id !== id);
      if (duplicate) {
        const err = new Error("Duplicate location");
        err.code = "DUPLICATE";
        throw err;
      }
    }

    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      if (err.code === "DUPLICATE") throw err;
      return false;
    }
  },

  getAll: () => {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

    return files.map(file => {
      return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
    });
  },
  addItem: (loc, force = false) => {
    if (!force && loc.name) {
      const locations = locationsHandlers.getAll();
      const duplicate = locations.find(l => l.name.toLowerCase() === loc.name.toLowerCase());
      if (duplicate) {
        const err = new Error("Duplicate location");
        err.code = "DUPLICATE";
        throw err;
      }
    }

     loc.id = crypto.randomUUID();

    fs.writeFileSync(path.join(DATA_DIR, `${loc.id}.json`), JSON.stringify(loc, null, 2));
    return true;
  },

getById: (id) => {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    
    if (!fs.existsSync(filePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      return null;
    }
  },

   deleteItem: (id) => {
     const filePath = path.join(DATA_DIR, `${id}.json`);

    if (!fs.existsSync(filePath)) return null;

    fs.unlinkSync(filePath);
    return true;
  }

  
}

