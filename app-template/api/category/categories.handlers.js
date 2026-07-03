import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'categories');

export const categoriesHandlers = {
    getAll: () => {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

        return files.reduce((acc, file) => {
            try {
                acc.push(JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8')));
            } catch (err) {
                console.error(`Error parsing category JSON file: ${file}`, err);
            }
            return acc;
        }, []);
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

    addCategory: (cat, force = false) => {
        if (!force && cat.name) {
            const categories = categoriesHandlers.getAll();
            const duplicate = categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
            if (duplicate) {
                const err = new Error("Duplicate category");
                err.code = "DUPLICATE";
                throw err;
            }
        }

        cat.id = crypto.randomUUID();

        fs.writeFileSync(path.join(DATA_DIR, `${cat.id}.json`), JSON.stringify(cat, null, 2));
        return cat;
    },  

    updateCategory: (id, data, force = false) => {
        const filePath = path.join(DATA_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) return false;

        if (!force && data.name) {
            const categories = categoriesHandlers.getAll();
            const duplicate = categories.find(c => c.name.toLowerCase() === data.name.toLowerCase() && c.id !== id);
            if (duplicate) {
                const err = new Error("Duplicate category");
                err.code = "DUPLICATE";
                throw err;
            }
        }

        try {
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const updated = { ...existing, ...data, id: existing.id }; // id wird nie überschrieben
            fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
            return true;
        } catch (err) {
            if (err.code === "DUPLICATE") throw err;
            return false;
        }
    },


    deleteCategory: (id) => {
        const filePath = path.join(DATA_DIR, `${id}.json`);

        if (!fs.existsSync(filePath)) return null;

        fs.unlinkSync(filePath);
        return true;
    }
}