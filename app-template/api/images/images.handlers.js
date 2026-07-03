import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data', 'images');

export const imagesHandlers = {
  deleteImage: (filename) => {
    if (!filename || filename === 'null' || filename === 'undefined' || filename === 'default.jpg') {
      return;
    }

    const filepath = path.join(DATA_DIR, filename);

    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
      } catch (err) {
      }
    }
  },

  addImage: (base64Image, extension) => {
    const filename = crypto.randomUUID() + '.' + extension;
    const filepath = path.join(DATA_DIR, filename);
    const buffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(filepath, buffer);
    return filename;
  }
};