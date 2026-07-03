# Item-Finder
Eine moderne Full-Stack-Webanwendung (Single-Page-Application) zur Inventar- und Standortverwaltung von Gegenständen inklusive eines integrierten Verleihsystems.

## Projektziele & Nutzen (Warum & Wozu)
Viele Menschen verlieren im Alltag den Überblick über ihre Besitztümer, was zu Zeitverlust, Frustration und ineffizientem Haushaltsmanagement führt. Der Item-Finder löst dieses Problem durch folgende Kernziele:

### 1. Verbesserung der Auffindbarkeit & Übersicht
* **Hintergrund:** Das zeitaufwändige Suchen nach Gegenständen führt zu Frustration und Stress im Haushalt oder Team.

* **Ziel:** Personen und Familien erhalten einen klaren Überblick über eigene und gemeinsam genutzte Besitztümer.

* **Messbarkeit:** Eine spürbare Reduktion der Suchzeiten durch zentral erfasste Ablageorte und Standorte.

### 2. Vermeidung von Mehrfachanschaffungen
* **Hintergrund:** Gegenstände werden oft mehrfach gekauft, weil ihr Vorhandensein vergessen oder nicht kommuniziert wird.

* **Ziel:** Transparenz über vorhandene Gegenstände und deren aktuellen Status, um unnötige Neuanschaffungen zu vermeiden.

* **Nutzen:** Das spart Kosten und leistet einen wichtigen Beitrag zu nachhaltigem Konsumverhalten.

### 3. Förderung von Ordnung und Struktur
* **Hintergrund:** Fehlende Struktur erschwert Abläufe und mindert die Lebensqualität.

* **Ziel:** Haushaltsgegenstände werden nachvollziehbar geordnet (Kategorien) und langfristig strukturiert aufbewahrt (Standorte).

* **Nachhaltigkeit:** Durch die bewusstere Zuweisung von Ablageorten innerhalb der Anwendung wird ein langfristiges Ordnungssystem etabliert.

## Architektur
* `client-src/` -> Lit-Frontend (Web Components, SPA)

* `api/` -> Express-Backend (REST-API unter /api)

* `server.js` -> Einstiegspunkt: Express-Server, statische Auslieferung des Builds

* `vite.config.js` -> Vite-Dev-Server für das Frontend inkl. Proxy zu /api und /images

Im Entwicklungsmodus laufen zwei Server parallel (via concurrently):

* Backend (nodemon, Port 8080): startet bei Änderungen automatisch neu
* Frontend (Vite, Port 8081): Hot Module Replacement, leitet `/api`- und `/image`s-Requests per Proxy an Port 8080 weiter

Im Produktionsbetrieb läuft nur ein einziger Express-Server (Port 8080), der sowohl das gebaute Frontend als statische Dateien ausliefert als auch die API bedient.

## Kernfeatures
* **Dashboard (Home):** Schneller Überblick über Statistiken (Gesamtanzahl Gegenstände, Kategorien, Standorte, aktuell verliehene Objekte) sowie eine Favoritenliste.
* **Gegenstandsverwaltung:** Erfassen (inklusive Bild-Upload via Multer), Bearbeiten, Löschen und Kategorisieren von Gegenständen mit eingebauter Duplikaterkennung.
* **Standortverwaltung:** Zuordnung von Gegenständen zu festen Standorten sowie die lückenlose Erfassung und Anzeige eines Standortverlaufs (Historie mit Zeitstempel).
* **Ausleihen & Rückgaben:** Strukturierte Verwaltung von Leihvorgängen mit Zuordnung zu Personen, Notizen und automatischen Datumsstempeln.
* **Daten-Kompatibilität (Settings):** Integrierter Datenexport und -import (CSV) sowie die Generierung von tabellarischen PDF-Reports via jspdf und jspdf-autotable.
* **Customization:** Dynamischer App-Theme-Wechsel (Farbpalette) direkt über die Einstellungen.

## how to run (Entwicklung)
### 1. Abhängigkeiten installieren (einmalig)
```Bash
npm install
```
### 2. Backend + Frontend-Dev-Server gleichzeitig starten
```Bash
npm run dev
```
### 3. Verfügbare URLs im Dev-Modus
* http://localhost:8081 -> Frontend (Vite Dev-Server mit HMR)
* http://localhost:8081/api/ -> API - über den Vite-Proxy weitergeleitet
* http://localhost:8081/images/ -> Bilder - über den Vite-Proxy weitergeleitet
* http://localhost:8080/api/ -> API - direkt am Express-Server

## how to build (Produktion)
### 1. Frontend mit Vite nach client-dist/ bauen
```Bash
npm run client:build
```
### 2. Express-Server starten (Port 8080)
```Bash
npm start
```
Vite kompiliert und optimiert das Frontend (Tree-Shaking, Minification) und legt das Ergebnis in `client-dist/` ab. Der Express-Server liefert diesen Ordner dann als statische Dateien aus - gemeinsam mit der REST-API und den Bildern auf demselben Port.

* http://localhost:8080 -> Frontend (vom Express-Server ausgelesen)
* http://localhost:8080/api/ -> REST-API