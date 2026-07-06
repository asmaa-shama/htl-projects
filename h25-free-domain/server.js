import express from 'express';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sets } from './data/vocabSets.js';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8080;
const app = express();
let nextId = sets.length + 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

function saveSetsToFile() {
  const filePath = path.join(__dirname, 'data', 'vocabSets.js');
  const fileContent = `export const sets = ${JSON.stringify(sets, null, 2)};\n`;
  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

app.get('/sets', (req, res) => {
  let setsFilteredSorted = [...sets];

  if (req.query.search) {
    const searchTerm = req.query.search.trim().toLowerCase();
    if (searchTerm !== "") {
      setsFilteredSorted = setsFilteredSorted.filter(r => 
        r.title.trim().toLowerCase().includes(searchTerm)
      );
    }
  }

  if (req.query.sort) {
    setsFilteredSorted.sort((a, b) => {
      const modifier = req.query.sort === "title_asc" ? 1 : -1;
      return a.title.localeCompare(b.title) * modifier;
    });
  }

  return res.json(setsFilteredSorted);
});

app.post('/sets', (req, res) => {
  const { title, vocab } = req.body;

  if (!title || !vocab || !Array.isArray(vocab) || vocab.length === 0) {
    return res.status(400).json({ error: 'Ungültige Daten. Titel und Vokabeln werden benötigt.' });
  }

  const newSet = {
    id: nextId,
    title: title,
    vocab: vocab
  };

  sets.push(newSet);
  nextId++;

  saveSetsToFile();
  return res.status(201).json(newSet);
});

app.delete('/sets/:id', (req, res) => {
  const setId = parseInt(req.params.id, 10);
  const index = sets.findIndex(s => s.id === setId);

  if (index === -1) {
    return res.status(404).json({ error: 'Vokabelset nicht gefunden.' });
  }

  sets.splice(index, 1);
  saveSetsToFile();
  return res.status(204).send();
});

// ── PUT: Vokabel-Zustand (known: true/false) aktualisieren ──
app.put('/sets/:setId/vocab/:vocabIndex', (req, res) => {
  const setId = parseInt(req.params.setId, 10);
  const vocabIndex = parseInt(req.params.vocabIndex, 10);
  const { known } = req.body;

  const set = sets.find(s => s.id === setId);
  if (!set) {
    return res.status(404).json({ error: 'Vokabelset nicht gefunden.' });
  }

  if (!set.vocab || !set.vocab[vocabIndex]) {
    return res.status(404).json({ error: 'Vokabel an diesem Index existiert nicht.' });
  }

  set.vocab[vocabIndex].known = known;

  saveSetsToFile();
  return res.json({ 
    message: 'Status erfolgreich aktualisiert', 
    vocab: set.vocab[vocabIndex] 
  });
});

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));