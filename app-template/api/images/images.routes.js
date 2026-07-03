import { Router } from 'express';
import { imagesHandlers } from './images.handlers.js';
import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';

export const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'API', 'data', 'images'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext);
  }
});

const upload = multer({ storage });

router.delete('/:filename', (req, res) => {
  const filename = req.params.filename; 

  if (filename) {
    imagesHandlers.deleteImage(filename);
    
    res.status(200).json({ 
      message: `Bild ${filename} erfolgreich gelöscht.` 
    });
  } else {
    res.status(400).json({ 
      error: 'Kein Dateiname angegeben.' 
    });
  }
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const oldImage = req.query.oldImage;
  if (oldImage) {
    imagesHandlers.deleteImage(oldImage);
  }

  res.json({
    file: req.file.filename
  });
});