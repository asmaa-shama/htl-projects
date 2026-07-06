# VocabTrain

Ein einfacher und interaktiver Vokabeltrainer auf Basis von Node.js, Express und Bootstrap. Du kannst Vokabelsets erstellen, per CSV-Datei importieren und im Lernmodus mit Karteikarten üben.

## Features

* **Übersicht & Filter:** Alle Vokabelsets werden auf der Startseite angezeigt. Du kannst nach Titeln suchen und sie alphabetisch sortieren.
* **Lernmodus (Flashcards):** Interaktive Wendekarten, die sich per Klick umdrehen (Begriff -> Definition).
* **Direktes Feedback (X / Hackerl):** Bewerte Vokabeln direkt beim Lernen. Gewusste Karten werden automatisch hauchzart grün, nicht gewusste rot eingefärbt.
* **Persistente Speicherung:** Der Zustand (`known: true/false`) sowie neue Sets werden permanent im Backend in der Datei `data/vocabSets.js` gesichert.
* **CSV-Import:** Schnelles Laden von Vokabeln aus Tabellen (unterstützt Komma `,` und Semikolon `;`).

---

## Projektstruktur

```text
├── client/
│   ├── index.html        # Hauptseite (Übersicht der Sets)
│   ├── create-set.html   # Formular zum Erstellen & CSV-Importieren
│   ├── vocab.html        # Der Lernmodus mit den Flashcards
│   ├── styles.css        # Custom Styles & Pastell-Farben für die Karten
│   ├── client.js         # Logik für die Set-Übersicht
│   ├── create-set.js     # Logik für die Formular-Handhabung
│   └── vocab.js          # Logik für das Karussell und das X/Hackerl-System
├── data/
│   └── vocabSets.js      # Hier liegen die Vokabeldaten (wird automatisch überschrieben)
├── package.json          # Projektabhängigkeiten
└── server.js             # Express-Server mit REST-API (GET, POST, PUT, DELETE)
```

## Installation & Start
### 1. Abhängigkeiten installieren
Stelle sicher, dass du Node.js installiert hast. Öffne das Terminal im Projektordner und installiere Express:

```Bash
npm install express
```

### 2. Server starten
Starte die App mit folgendem Befehl im Terminal:

```Bash
node server.js
```

### 3. Im Browser öffnen
Öffne deinen Browser und rufe die App auf: http://localhost:8080

## API Endpoints
Der Server bietet folgende Routen für das Frontend:

* GET /sets – Lädt alle Sets (unterstützt ?search=... und ?sort=title_asc|title_desc).
* POST /sets – Erstellt ein komplett neues Vokabelset.
* DELETE /sets/:id – Löscht ein Set anhand seiner ID.
* PUT /sets/:setId/vocab/:vocabIndex – Aktualisiert das known-Feld einer spezifischen Vokabel und speichert es in der Datei.