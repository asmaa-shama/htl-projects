# Wordle Game

Ein interaktives, desktopbasiertes Worträtsel-Spiel im Stil des bekannten "Wordle", umgesetzt als moderne JavaFX-Applikation nach dem MVC-Architekturmuster.

---

## Projektbeschreibung

Das Ziel des Spiels ist es, ein zufällig ausgewähltes Wort mit 5 Buchstaben in maximal 6 Versuchen zu erraten. Nach jedem Versuch gibt das Spiel farbliches Feedback:
* 🟩 **Grün:** Der Buchstabe ist korrekt und an der richtigen Stelle.
* 🟨 **Gelb:** Der Buchstabe kommt im Wort vor, steht aber an der falschen Stelle.
* ⬛ **Grau:** Der Buchstabe kommt nicht im gesuchten Wort vor.

Das Projekt speichert persönliche Highscores, die Anzahl der gespielten Runden und führt ein serverunabhängiges, lokales Leaderboard.

---

## Architektur & Technologien

Das Projekt ist strikt nach dem **MVC-Prinzip (Model-View-Controller)** strukturiert, um Logik und Benutzeroberfläche sauber voneinander zu trennen:

* **Backend/Logik (Model):** Reines Java zur Validierung von Eingaben, Berechnung des Spielstatus (RUNNING, WON, LOST) und Verwaltung der Spielerdaten.
* **Frontend (View):** `hello-view.fxml` und `log-in.fxml` für das responsive, tabellarische Grid-Layout.
* **Steuerung (Controller):** `HelloController` und `LogInController` zur Event-Verarbeitung (Tastatureingaben, Fokus-Sprünge, Button-Klicks).
* **UI-Framework:** **JavaFX 21+** (mit CSS-Styling für das Grid).
* **Build-Tool:** Maven / Gradle.

### Ordnerstruktur & Kernklassen
* `model/DataManager.java` – Verwaltet das Laden der Wörter (`words.csv`) sowie das Lesen/Schreiben des globalen Leaderboards (`leaderboard.csv`).
* `model/GameSession.java` – Verwaltet die aktuelle Spielsitzung eines Spielers und serialisiert den Zustand als `.bin`-Datei.
* `model/WordleGame.java` – Die Kernlogik des Spiels (Vergleich der Buchstaben, Punkteberechnung, Runden-Limitierung).

---

## Kernfeatures

* **Intelligente Grid-Steuerung:** Automatischer Fokus-Sprung zum nächsten Textfeld beim Tippen sowie intelligente Handhabung der `BACK_SPACE`- und `ENTER`-Tasten innerhalb der aktiven Zeile.
* **Lokales Leaderboard (CSV):** Speicherung aller registrierten Spieler inklusive Gesamtpunkten, gespielten Runden und individuellem Highscore.
* **Cross-Platform AppData-Anbindung:** Daten werden nicht relativ im Installationspfad gesichert (Schreibschutz-Gefahr bei `.exe`-Builds), sondern plattformunabhängig im offiziellen Anwendungsdaten-Verzeichnis des Betriebssystems (`AppData/Roaming` unter Windows, `.config` unter Linux).
* **Session-Serialisierung:** Persistente Speicherung des aktuellen Spielstands via Java-Objektserialisierung (`.bin`), um Spielstände sitzungsübergreifend zu sichern.
* **Robustes Fehlermanagement:** Abfangmechanismen für ungültige Wörter, leere Felder und Sonderzeichen.

---

## Inbetriebnahme (Entwicklung)

### Voraussetzungen
* Java Development Kit (JDK) 21 oder höher.
* Eine JavaFX-kompatible IDE (z. B. IntelliJ IDEA) mit installiertem JavaFX-Plugin.

### Projekt starten
1. Klone das Repository oder importiere den Projektordner in deine IDE.
2. Lass Maven/Gradle die Projektabhängigkeiten synchronisieren.
3. Starte die Anwendung über die Hauptklasse `Launcher.java`.

---

## Deployment (Produktivbetrieb als .exe)

Wenn die Anwendung als native Windows-Applikation (`.exe`) gebaut wird, greift die automatische Pfad-Erkennung. Das Spiel generiert beim ersten Start autonom folgende Verzeichnisstruktur im Benutzerverzeichnis, um uneingeschränkte Schreibrechte zu garantieren:

```text
C:\Users\<Dein-Benutzername>\AppData\Roaming\wordle\
├── leaderboard.csv     ← Globales Leaderboard aller Spieler
└── game-sessions\      
    └── <Spielername>.bin  ← Serialisierter Zustand der Spielrunden
```