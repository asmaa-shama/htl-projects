import express from 'express';
import { Router } from 'express';
import { categoriesHandlers } from './categories.handlers.js';

export const router = Router();

router.use(express.json());

router.get('/', (_req, res) => {
    res.json(categoriesHandlers.getAll());
});

router.get('/:id', (req, res) => {
    const id = req.params.id;
    const category = categoriesHandlers.getById(id);

    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
});

router.post('/', (req, res) => {
    const cat = req.body;
    const force = req.query.force === 'true';
    if (!cat.name || !cat.name.trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }

    try {
        const category = categoriesHandlers.addCategory(cat, force);
        res.status(201).json(category);
    } catch (err) {
        if (err.code === "DUPLICATE") {
            return res.status(409).json({ error: 'Duplicate', message: 'A category with this name already exists.' });
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
        const success = categoriesHandlers.updateCategory(id, updatedData, force); 

        if (success) {
            res.json({ message: 'updated successfully' });
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (err) {
        if (err.code === "DUPLICATE") {
            return res.status(409).json({ error: 'Duplicate', message: 'A category with this name already exists.' });
        }
        return res.status(500).json({ error: 'Server error' });
    }
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;

    const category = categoriesHandlers.deleteCategory(id);

    if (category === null) {
        return res.status(404).json({ error: 'Category not found' });
    }

    res.status(204).send();
});
