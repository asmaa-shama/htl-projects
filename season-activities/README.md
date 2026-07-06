# Season Activities Management App

Eine moderne Desktop-Anwendung zur Verwaltung von Personen und deren saisonalen Aktivitäten. Das Projekt wurde im Zuge der Ausbildung an der HTBLuVA Villach entwickelt und setzt auf eine saubere Software-Architektur und ein flexibles Datenhaltungsmodell.

## Features
* **Personenverwaltung:** Erstellen, Bearbeiten und Löschen von Personen inklusive Zuweisung zu Aktivitäten.
* **Aktivitäten-Management:** Dynamische Verwaltung von Aktivitäten, gekoppelt an die Jahreszeiten.
* **Live-Datenbindung:** Bidirektionales Binding (JavaFX), wodurch Änderungen in den Eingabefeldern sofort synchronisiert werden.
* **Sicherheitsabfragen:** Automatische Warnmeldungen (Alerts) bei ungespeicherten Änderungen beim Wechsel zwischen Einträgen.

## Technische Details & Architektur
Das Projekt demonstriert die Umsetzung moderner Software-Patterns in Java:

* **Architekturmuster:** **MVVM (Model-View-ViewModel)** zur strikten Trennung von Benutzeroberfläche und Geschäftslogik.
* **UI-Framework:** **JavaFX** kombiniert mit **FXML** für das Layout.
* **Service- & Repository-Pattern:** Lose Kopplung durch ein Interface-basiertes Repository (`Repository.java`).
* **Datenbank-Anbindung:** Robustes `DatabaseRepository` via **JDBC (Oracle SQL)** unter Verwendung von *Try-with-Resources* für sicheres Ressourcen-Management.
* **Streams API:** Effizientes Mapping von Model-Objekten zu ViewModels mittels Java Streams.

## Projektstruktur
```text
└───at.htlvillach.e_15_season_activities
    ├───model          # Datenmodelle (Activity, Person, Season)
    ├───repository     # Datenzugriffsschicht (SQL / Interfaces)
    ├───service        # Business-Logik / Vermittlungsschicht
    └───viewmodel      # JavaFX-Properties und Datenbindungen für die View
```

Voraussetzungen
* Java 21 oder höher
* JavaFX SDK
* Oracle SQL Datenbank (oder entsprechend angepasste JDBC-Verbindung im DatabaseRepository)