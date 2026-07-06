import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { itemsHandlers } from '../items/items.handlers.js';
import crypto from 'node:crypto'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR_PATH = path.join(__dirname, '..', 'data', 'borrowed-entries');

if (!fs.existsSync(DATA_DIR_PATH)) {
  fs.mkdirSync(DATA_DIR_PATH, { recursive: true });
}

export const createBorrowedEntry = (req, res) => {
  try {
    const newEntry = req.body;
    
    newEntry.id =  crypto.randomUUID();

    const individualFilePath = path.join(DATA_DIR_PATH, `${newEntry.id}.json`);

    fs.writeFileSync(individualFilePath, JSON.stringify(newEntry), 'utf-8');

    res.status(201).json(newEntry);

  } catch (error) {
    console.error("Error while creating history entry:", error);
    res.status(500).json({ error: 'Internal Server Error', message: 'Could not Create Borrow Entry.' });
  }
};



export const putEntry = (req, res) => {
  try{
    const newEntry = req.body;

    if (!newEntry || !newEntry.id) {
      return res.status(400).json({ error: 'Bad Request', message: 'Missing entry ID.' });
    }

    const individualFilePath = path.join(DATA_DIR_PATH, `${newEntry.id}.json`);
    if (!fs.existsSync(individualFilePath)) {
      return res.status(404).json({ error: 'Not Found', message: 'Borrow Entry not found.' });
    }

    const oldEntry = JSON.parse(fs.readFileSync(individualFilePath, 'utf-8'));

    oldEntry.person = newEntry.person;
    if (newEntry.notes && newEntry.notes.trim() !== "") {
      oldEntry.notes = oldEntry.notes ? `${oldEntry.notes}\n\n${newEntry.notes}` : newEntry.notes;
    }
    fs.writeFileSync(individualFilePath, JSON.stringify(oldEntry, null, 2), 'utf-8');
    
    return res.status(200).json(oldEntry);

  } catch (error) {
    console.error("Error while updating history entry:", error);
    return res.status(500).json({ error: 'Internal Server Error', message: 'Could not update Borrow Entry.' });
  }
}

export const getEntry = (req, res) => {
  try {
    const { id } = req.params;

    const individualFilePath = path.join(DATA_DIR_PATH, `${id}.json`);

    if (!fs.existsSync(individualFilePath)) {
      return res.status(404).json({ error: 'Not Found', message: "Borrowed entry file not found" });
    }

    const fileData = fs.readFileSync(individualFilePath, 'utf-8');
    const entry = JSON.parse(fileData);
    
    return res.status(200).json(entry);

  } catch (error) {
    console.error("Error reading borrowed entry file:", error);
    return res.status(500).json({ error: 'Internal Server Error', message: "Internal server error" });
  }
};