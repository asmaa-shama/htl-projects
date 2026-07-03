import express from 'express';
import http from 'http';

import path, { dirname } from 'node:path';
import { fileURLToPath } from 'url';

import { apiRouter } from './api/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLIENT_FOLDER = `client-dist`;

const app = express();
const PORT = 8080;


app.use(express.static(CLIENT_FOLDER));
app.use('/api', apiRouter);
// Nutze __dirname, um vom Ort der server.js aus zu starten
app.use('/images', express.static(path.join(__dirname, 'api', 'data', 'images')));
// https://expressjs.com/en/guide/migrating-5.html#path-syntax
app.get('/*splat', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  res.sendFile(path.join(__dirname, CLIENT_FOLDER, 'index.html'))
});

http.createServer(app).listen(PORT, '0.0.0.0', () => {
  console.log(`Item-Finder up and running on http://0.0.0.0:${PORT}`);
});


