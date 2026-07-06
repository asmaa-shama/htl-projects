import { Router } from 'express';
import express from 'express';
// Handler importieren
import { createBorrowedEntry, putEntry, getEntry } from './borrowed.handlers.js';

export const router = Router();
router.use(express.json({ limit: '10mb' }));

// Die Routen verbinden sich einfach mit den Handler-Funktionen
router.post('/', createBorrowedEntry);
router.put('/', putEntry);
router.get('/:id', getEntry);