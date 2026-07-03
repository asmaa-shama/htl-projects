import express from 'express';
import { Router } from 'express';
import { locationsHandlers } from './location.handler.js';

export const router = Router();

router.use(express.json());

router.get('/', (_req, res) => {
  res.json(locationsHandlers.getAll());
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;

  const location = locationsHandlers.deleteItem(id);

  if (location === null) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.status(204).send();
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const location = locationsHandlers.getById(id);

  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }

  res.json(location);
});
router.post('/', (req, res) => {
  const loc = req.body;
  const force = req.query.force === 'true';
  if (!loc.name || !loc.name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const location = locationsHandlers.addItem(loc, force);
    res.status(201).json(location);
  } catch (err) {
    if (err.code === "DUPLICATE") {
      return res.status(409).json({ error: 'Duplicate', message: 'A location with this name already exists.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;
  const force = req.query.force === 'true';

  if (!updatedData.name || !updatedData.name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const success = locationsHandlers.updateItem(id, updatedData, force);

    if (success) {
      res.json({ message: 'Erfolgreich aktualisiert' });
    } else {
      res.status(404).json({ error: 'Standort nicht gefunden' });
    }
  } catch (err) {
    if (err.code === "DUPLICATE") {
      return res.status(409).json({ error: 'Duplicate', message: 'A location with this name already exists.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});


