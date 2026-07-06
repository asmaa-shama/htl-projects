import express from 'express';
import { Router } from 'express';
import { itemsHandlers } from './items.handlers.js';

export const router = Router();

router.use(express.json({ limit: '10mb' }));

router.get('/', (_req, res) => {
  res.json(itemsHandlers.getAll());
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  const item = itemsHandlers.getById(id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json(item);
});

router.post('/', (req, res) => {
  const itemData = req.body;
  const force = req.query.force === 'true';

  if (!itemData.name || !itemData.name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }

  itemData.name = itemData.name.trim();

  try {
    const item = itemsHandlers.addItem(itemData, force);
    res.status(201).json(item);
  } catch (err) {
    if (err.code === "DUPLICATE") {
      return res.status(409).json({ error: 'Duplicate', message: 'An item with this name already exists.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const force = req.query.force === 'true';
  
  try {
    const updatedItem = itemsHandlers.updateItem(id, updateData, force);

    if (updatedItem === null) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    if (err.code === "DUPLICATE") {
      return res.status(409).json({ error: 'Duplicate', message: 'An item with this name already exists.' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', (req, res) => {
  //const { id } = req.params;
  const id = req.params.id;

  const item = itemsHandlers.deleteItem(id);

  if (item === null) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.status(204).send();
});

