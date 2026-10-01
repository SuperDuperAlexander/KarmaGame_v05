# GAME MASTER SPEC

**Projekt:** Browser- und Mobile-Spiel mit Babylon.js  
**Dokument:** Zentrale Spezifikation für Design, Code und 3D-Assets  
**Zielversion:** Vertical Slice v0.1  
**Status:** Implementation-ready  
**Sprache im Spiel:** Englisch für erste Texte. Texte müssen später lokalisierbar sein.  
**Technik:** Babylon.js, TypeScript, Vite, WebGL 2 mit sauberem WebGL-1-Fallback

---

## 1. Zweck und feste Regeln

Dieses Dokument ist die einzige Hauptquelle für Version v0.1. Der Coding-Agent darf kleine technische Entscheidungen selbst treffen. Er muss jede wichtige Entscheidung in `DEVELOPMENT_DECISIONS.md` festhalten.

Die vorhandenen Concept Arts sind visuelle Referenzen. Sie sind keine fertigen Spiel-Assets. Der Agent soll echte GLB- oder glTF-Dateien erzeugen, wenn seine Werkzeuge das sicher können. Sonst soll er austauschbare Platzhalter mit denselben Node-Namen, Größen, Pivots, Animationen und Material-Slots bauen.

Feste Regeln:

- Das Spiel hat echte freie 3D-Bewegung.
- Mobile Geräte sind das erste Leistungsziel.
- Schönheit kommt vor allem aus Licht, Nebel, Farbe und wenigen Partikeln.
- Schönheit kommt nicht aus sehr vielen Polygonen.
- Outer World und Inner World zeigen denselben seelischen Zustand auf zwei Arten.
- Ein gemeinsamer World State steuert Welt, Figuren, Gedanken und Bilder.
- Das Spiel nutzt Events und Bedingungen. Es nutzt keine starre Quest-Kette.
- Reflexionen sind frei. Es gibt keine richtige Antwort.
- Das Spiel stellt keine Diagnose.
- Das Spiel sagt nicht, dass Karma messbar ist.
- Das Spiel verspricht keinen Gewinn durch eine Handlung.
- Lower Position bedeutet dienen und helfen. Es bedeutet nicht knien oder sich klein machen.
- Der Agent darf den Inhalt dieser Regeln nicht still ändern.

## 2. Game Vision

Der Spieler trägt ein Finance Package in eine schöne, aber gespannte Stadt. Das Paket steht für die eigene Beziehung zu Geld. Eine sichtbare Kette zeigt Last und Bindung. Sie ist kein Zeichen von Schuld.

Im Zentrum stehen der Central Tree und das Source Water. Der Baum verbindet Outer World und Inner World. Das Wasser zeigt Fluss. Beide reagieren auf Handlungen und auf den gemeinsamen World State.

Der Spieler erkundet frei. Er trifft Menschen mit kleinen Geldgeschichten. Er kann geben, empfangen und helfen. Er sieht Fear und Attachment als Bilder. Er kann nach innen wechseln. Dort sieht er Wurzeln, Wasser, Gedanken und den Attachment Beetle.

Das Ziel ist keine Prüfung. Das Ziel ist klares Sehen. Der Spieler soll seine eigene Antwort finden.

## 3. Design Principles

1. **Show, then ask.** Das Spiel zeigt erst ein Ereignis. Danach stellt es eine kurze Frage.
2. **No moral score.** Es gibt keinen guten oder bösen Geldwert.
3. **Choice without punishment.** Eine freie Antwort sperrt keinen Inhalt.
4. **Service, not submission.** Hilfe ist aktive Stärke. Sie ist keine Unterwerfung.
5. **Give and Receive belong together.** Geben und Empfangen sind zwei Seiten eines gesunden Austauschs.
6. **Inner mirrors outer.** Eine äußere Änderung hat ein inneres Bild. Eine innere Einsicht kann die äußere Welt sanft ändern.
7. **Small stories carry the lesson.** Kurze NPC-Szenen tragen die Finanzthemen.
8. **Quiet interface.** Die Welt bleibt sichtbar. Die Benutzeroberfläche bleibt klein.
9. **Mobile first.** Jede Szene muss auf einem mittleren Mobilgerät funktionieren.
10. **Metaphor stays metaphor.** Wasser, Baum, Käfer und Dunkelheit sind Bilder. Das Spiel stellt sie nicht als Fakten über den Spieler dar.

## 4. Dr. Rulins Finanzlehren als Spielregeln

Diese Lehren gelten im Spiel als Reflexionsrahmen. Sie sind keine persönliche Finanzberatung.

- Geld ist ein Mittel für Austausch.
- Geld kann Bewegung, Sicherheit, Hilfe und Gestaltung möglich machen.
- Der Spieler darf Geld empfangen.
- Der Spieler darf Geld geben.
- Gesundes Geben braucht eine freie Wahl.
- Gesundes Empfangen braucht Offenheit.
- Lower Position heißt: Sieh, was eine andere Person braucht. Hilf mit einer echten Handlung.
- Lower Position heißt nicht: Knie nieder.
- Lower Position heißt nicht: Mache dich wertlos.
- Dienst schafft Wert. Er garantiert keine spätere Zahlung.
- Fear kann Entscheidungen eng und schnell machen.
- Attachment kann aus einem Wunsch ein Festhalten machen.
- Besitz ist nicht automatisch Attachment.
- Der Wunsch nach mehr ist nicht automatisch falsch.
- Das Problem beginnt, wenn der Wunsch die freie Wahl nimmt.
- Give ohne Receive kann Erschöpfung erzeugen.
- Receive ohne Give kann den Austausch starr machen.
- Ein klarer Austausch achtet beide Seiten.
- Genug ist eine persönliche Frage. Das Spiel gibt keine feste Zahl vor.
- Der Spieler darf seine Bedeutung von Geld selbst schreiben.
- Das Spiel bewertet diese Antwort nicht.
- Das Spiel behauptet nicht, dass eine Handlung Karma erzeugt oder entfernt.

Dr. Rulin darf diese Lehren als kurze Fragen oder Beobachtungen sagen. Er darf nicht predigen. Er darf nicht sagen, was der Spieler tief im Inneren „wirklich“ fühlt.

## 5. Vollständiges MVP-Level: Finanzen

### 5.1 Orte

- **Arrival Path:** Ruhiger Start. Der Spieler erhält das Finance Package.
- **City Gate:** Lernt Bewegung, Kamera und Interaktion.
- **Central Square:** Zeigt Central Tree und Source Water.
- **Market:** Zeigt Wunsch, Preis, Mangel, Geben und Empfangen.
- **Service Corner:** Zeigt Lower Position durch konkrete Hilfe.
- **Exchange House:** Zeigt bewussten Austausch und das Finale.
- **Inner World:** Zeigt Wurzeln, Wasser, Fear, Attachment und Thought Waves.

### 5.2 MVP-Ablauf als offenes Netz

Der Spieler kann nach dem City Gate Markt, Central Square und Exchange House in eigener Reihenfolge besuchen. Einige Ereignisse brauchen Bedingungen. Die Bedingungen dürfen aber keine unsichtbare starre Reihenfolge bauen.

Wichtige Ereignisse:

| Event | Auslöser | Bedingung | Ergebnis |
|---|---|---|---|
| `PACKAGE_RECEIVED` | Startinteraktion | keine | Paket und lockere Kette erscheinen |
| `CITY_ENTERED` | Tor passiert | Paket erhalten | Stadt wird frei |
| `TREE_DISCOVERED` | Baumzone betreten | Stadt betreten | Look Within wird möglich |
| `INNER_WORLD_ENTERED` | Look Within halten | Baum entdeckt | Wechsel in Inner World |
| `MONEY_REFLECTION_SAVED` | freie Texteingabe | Inner World betreten | lokale Reflexion gespeichert |
| `MARKET_VISITED` | Marktzone betreten | Stadt betreten | Marktgeschichten werden aktiv |
| `ATTACHMENT_TRIGGERED` | Wunschobjekt ansehen oder kaufen wollen | Markt besucht | Thought Wave „I want more...“; Käferzustand 1 |
| `ATTACHMENT_SEEN` | Inner World besuchen | Attachment ausgelöst | Beetle sichtbar |
| `FEAR_TRIGGERED` | Fear Child oder Dark NPC erleben | Stadt betreten | kalte World-State-Schicht; Fear-Welle |
| `FEAR_SEEN` | Inner World besuchen | Fear ausgelöst | dunkle Wurzelzone sichtbar |
| `SERVICE_OFFERED` | Hilfsaktion wählen | passende NPC-Geschichte aktiv | Help-Animation; Service zählt |
| `GIVE_COMPLETED` | Gegenstand oder Zeit geben | freie Wahl | Give-State gespeichert |
| `RECEIVE_COMPLETED` | Geschenk annehmen | Angebot liegt vor | Receive-State gespeichert |
| `EXCHANGE_UNDERSTOOD` | Give und Receive erlebt | keine Reihenfolge | Exchange Guide öffnet Abschluss |
| `ATTACHMENT_TRANSFORMED` | Käfer beobachten und loslassen | Attachment gesehen | Käfer wird weich/hell, nicht getötet |
| `FINANCE_MVP_COMPLETE` | Baum, Reflexion, Service, Give/Receive und Transformation erlebt | Reihenfolge frei | Abschlussbild am Source Water |

### 5.3 NPC Micro Stories

Jede Geschichte dauert 20 bis 90 Sekunden. Jede Geschichte hat eine sichtbare Handlung.

1. **Merchant and the heavy crate**  
   Der Merchant kann eine Kiste nicht allein tragen. Der Spieler hilft. Das ist Lower Position. Der Spieler kniet nicht. Der Merchant bietet später ein kleines Geschenk an. Der Spieler kann es annehmen oder freundlich ablehnen.

2. **Fear Child and the missing coin**  
   Ein Kind glaubt, eine verlorene Münze mache alles unsicher. Der Spieler kann suchen, zuhören oder weggehen. Das Spiel nennt keine Wahl falsch.

3. **Dark NPC and closed exchange**  
   Der Dark NPC erwartet immer Verlust. Seine Thought Waves sind kurz. Der Spieler kann zuhören. Der Spieler muss ihn nicht heilen.

4. **Citizen who gives too much**  
   Eine Person gibt alles sofort weg und wirkt müde. Die Szene zeigt, dass Geben Grenzen braucht.

5. **Citizen who cannot receive**  
   Eine Person weist Hilfe aus Scham ab. Die Szene zeigt Receive als aktive Fähigkeit.

6. **Exchange Guide**  
   Der Guide verbindet Give und Receive. Er verspricht keine Belohnung. Er fragt: „Can both sides leave with dignity?“

## 6. Vertical Slice v0.1

Version v0.1 baut nur diesen geprüften Weg:

1. Start auf dem Arrival Path.
2. Paket erhalten.
3. Durch das City Gate gehen.
4. Den Central Tree erreichen.
5. Look Within auslösen.
6. Inner Tree, Roots und Source Water sehen.
7. Die Frage „What does money mean to you?“ beantworten oder überspringen.
8. Zur Outer World zurückkehren.
9. Den Market besuchen.
10. Den Thought Wave „I want more...“ auslösen.
11. Wieder nach innen wechseln.
12. Den Attachment Beetle in Zustand `attached` sehen.

v0.1 enthält schon die echte Architektur für spätere Fear-, Service-, Give-, Receive- und Exchange-Ereignisse. Diese späteren Inhalte müssen noch nicht spielbar sein.

## 7. World State

### 7.1 Datenmodell

```ts
export type WorldEventType =
  | 'PACKAGE_RECEIVED'
  | 'CITY_ENTERED'
  | 'TREE_DISCOVERED'
  | 'INNER_WORLD_ENTERED'
  | 'MONEY_REFLECTION_SAVED'
  | 'MARKET_VISITED'
  | 'ATTACHMENT_TRIGGERED'
  | 'ATTACHMENT_SEEN'
  | 'FEAR_TRIGGERED'
  | 'FEAR_SEEN'
  | 'SERVICE_OFFERED'
  | 'GIVE_COMPLETED'
  | 'RECEIVE_COMPLETED'
  | 'EXCHANGE_UNDERSTOOD'
  | 'ATTACHMENT_TRANSFORMED'
  | 'FINANCE_MVP_COMPLETE';

export interface FinanceState {
  packageOwned: boolean;
  attachment: number; // 0..1. Bildwert, kein Moralwert.
  fear: number;       // 0..1. Bildwert, keine Diagnose.
  serviceActs: number;
  giveCount: number;
  receiveCount: number;
}

export interface WorldState {
  schemaVersion: 1;
  scene: 'outer' | 'inner';
  events: Record<string, { at: number; data?: unknown }>;
  finance: FinanceState;
  reflections: ReflectionEntry[];
  player: { position: number[]; rotationY: number };
  settings: { music: number; sfx: number; quality: 'low' | 'medium' | 'high' };
}
```

Ein Event ist unveränderlich. Ein System leitet daraus aktuelle Bedingungen ab. Szenen lesen nur Selectors. Szenen schreiben keine fremden Zustände direkt.

### 7.2 Kernregeln

- `EventBus` nimmt Ereignisse an.
- `WorldStore` speichert den Zustand.
- `ConditionEngine` prüft Bedingungen.
- `WorldStatePresenter` setzt Licht, Nebel, Material und sichtbare Nodes.
- `NarrativeDirector` wählt mögliche Micro Stories.
- Kein NPC besitzt die Hauptgeschichte allein.
- Ein erneuter Trigger darf kein Event doppelt zählen, wenn das Event einmalig ist.
- Jeder Event-Handler muss sicher wiederholt werden können.

## 8. Outer World und Inner World

### 8.1 Outer World

Die Outer World ist warm, lebendig und leicht stilisiert. Sie zeigt Stadt, Markt, Baum und Menschen. Spannungen erscheinen als kleine Änderungen in Licht, Haltung, Geräusch und Thought Waves.

### 8.2 Inner World

Die Inner World nutzt dieselbe räumliche Grundachse wie der Central Square. Der Central Tree wird zu einem großen Wurzelraum. Das Source Water fließt zwischen Plattformen. Die Welt darf traumhaft sein. Die Steuerung bleibt gleich.

### 8.3 Spiegelregeln

| Outer World | Inner World |
|---|---|
| Paket am Körper | Paket nahe der Hauptwurzel |
| Kette sichtbar | Kette führt zum Attachment Beetle |
| Wunsch am Markt | goldene, enge Wurzeladern |
| Fear Child oder Dark NPC | kalte, dunkle Wurzelzone |
| Give/Receive | Wasser fließt zwischen zwei Becken |
| Service | kleine Pflanzen richten sich auf |
| Transformation | Käfer wird ruhig; Kette wird locker |

## 9. Central Tree und Source Water

Der Central Tree ist Landmarke, Portal und World-State-Anzeige.

Pflichtfunktionen:

- Der Baum ist aus allen Hauptwegen sichtbar.
- Der Stamm markiert die Look-Within-Zone.
- Blattfarbe, Licht und kleine Partikel reagieren auf World State.
- Das Source Water beginnt sichtbar an oder unter den Wurzeln.
- Wasser nutzt keine echte Flüssigkeitssimulation.
- Das Wasser nutzt ein schmales Mesh, fließende UVs und kleine Lichtpartikel.
- Der Baum darf nie wie eine Menü-Säule wirken.
- Der Baum braucht klare Silhouette bei kleinem Bildschirm.

## 10. Reflection, Thought Waves und optionale KI

### 10.1 Reflection Storage

```ts
export interface ReflectionEntry {
  id: string;
  promptId: string;
  text: string;
  createdAt: number;
  sourceEvent?: WorldEventType;
  skipped?: boolean;
}
```

- Speichere v0.1 nur lokal in `localStorage`.
- Nutze den Schlüssel `light-within-save-v1`.
- Begrenze eine Antwort auf 2.000 Zeichen.
- Nutze Plain Text. Rendere nie ungefiltertes HTML.
- Biete `Skip` und `Delete all reflections` an.
- Sende keine Reflexion an einen Server.
- Zeige vor einer späteren Cloud-Funktion eine klare Einwilligung.

### 10.2 Thought Waves

Thought Waves sind kurze sichtbare Gedanken. Sie sind keine Untertitel des Spiels.

- Maximal 64 Zeichen pro Wave.
- Maximal zwei Waves gleichzeitig.
- Dauer: 2,5 bis 5 Sekunden.
- Weltposition über dem Ursprung. Bildschirmrand-Clamp ist Pflicht.
- Farbe zeigt Thema. Farbe zeigt nicht gut oder böse.
- Attachment: warmes Gold mit enger Bewegung.
- Fear: kaltes Blau-Violett mit kurzer Unruhe.
- Service: weiches Grün oder warmes Weiß.
- Unterstütze `reduced motion` mit statischem Fade.

### 10.3 Spätere optionale LLM-Integration

LLM bedeutet Large Language Model. Das ist ein Textmodell.

- Die Funktion ist standardmäßig aus.
- Sie braucht eine aktive Einwilligung.
- Sie darf eine Reflexion zusammenfassen oder eine offene Frage stellen.
- Sie darf keine Diagnose geben.
- Sie darf keine Finanzentscheidung empfehlen.
- Sie darf keine Aussage über Karma als Tatsache machen.
- Sie darf nicht behaupten, verborgene Motive zu kennen.
- Sie muss sagen, wenn sie unsicher ist.
- Ein lokaler Regeltext bleibt als sichere Alternative verfügbar.

## 11. Player, Kamera und Steuerung

### 11.1 Player

- Dritte Person.
- Gehgeschwindigkeit: 2,8 m/s.
- Laufgeschwindigkeit: 4,6 m/s.
- Drehung folgt weich der Bewegungsrichtung.
- Capsule Collider: Radius 0,32 m; Höhe 1,65 m.
- Stufenhöhe: höchstens 0,25 m.
- Keine Sprungmechanik in v0.1.
- `Fly` ist nur ein späterer Clip. Es ist keine v0.1-Funktion.

### 11.2 Kamera

- Arc-Rotate-ähnliche Follow Camera.
- Abstand: 4,5 bis 6,5 m.
- Zielhöhe: 1,2 m.
- Vertikaler Winkel: 20 bis 55 Grad.
- Kamera-Kollision verhindert Wanddurchsicht.
- Gebäude dürfen beim Verdecken weich ausblenden.
- Keine starke Kamerabewegung bei Interaktionen.

### 11.3 Desktop

- `WASD` oder Pfeiltasten bewegen.
- Maus oder rechte Maustaste dreht die Kamera.
- `E` interagiert.
- `Shift` läuft.
- `Esc` öffnet Pause.

### 11.4 Mobile

- Linker Daumen: virtueller Stick.
- Rechter Bildschirmbereich: Kamera ziehen.
- Kontextknopf: Interaktion.
- Hold-Knopf am Baum: Look Within.
- Touch-Ziele sind mindestens 48 x 48 CSS-Pixel.
- Steuerung darf keine Seite scrollen.
- UI muss Safe Areas beachten.

## 12. Szenenwechsel

Es gibt eine Boot Scene und zwei spielbare Szenen.

- `BootScene` lädt Kernsysteme und kleine Pflicht-Assets.
- `OuterWorldScene` enthält Stadt, Markt und Central Tree.
- `InnerWorldScene` enthält Wurzeln, Source Water und Spiegelobjekte.

Wechselablauf:

1. Eingabe sperren.
2. Kamera sanft zum Baum ausrichten.
3. World State speichern.
4. Kurzen Baum- und Nebelübergang zeigen.
5. Zielszene laden oder aktivieren.
6. Spieler am gespiegelten Anker setzen.
7. World State anwenden.
8. Eingabe freigeben.

Zielzeit auf mittlerem Mobilgerät: weniger als 2 Sekunden nach erstem Asset-Cache. Bei längerer Zeit erscheint ein ruhiges Ladezeichen.

## 13. Architektur und Ordner

```text
/
├─ GAME_MASTER_SPEC.md
├─ DEVELOPMENT_DECISIONS.md
├─ README.md
├─ package.json
├─ vite.config.ts
├─ public/
│  └─ assets/
│     ├─ characters/
│     ├─ creatures/
│     ├─ core/
│     ├─ city/
│     ├─ market/
│     ├─ inner-world/
│     ├─ vegetation/
│     ├─ props/
│     ├─ textures/
│     └─ audio/
├─ src/
│  ├─ app/GameApp.ts
│  ├─ engine/createEngine.ts
│  ├─ scenes/BootScene.ts
│  ├─ scenes/OuterWorldScene.ts
│  ├─ scenes/InnerWorldScene.ts
│  ├─ state/WorldStore.ts
│  ├─ state/events.ts
│  ├─ state/selectors.ts
│  ├─ state/ConditionEngine.ts
│  ├─ narrative/NarrativeDirector.ts
│  ├─ narrative/microStories.ts
│  ├─ player/PlayerController.ts
│  ├─ camera/FollowCameraController.ts
│  ├─ interaction/InteractionSystem.ts
│  ├─ transition/WorldTransition.ts
│  ├─ presentation/WorldStatePresenter.ts
│  ├─ reflection/ReflectionStore.ts
│  ├─ thought-waves/ThoughtWaveSystem.ts
│  ├─ assets/AssetRegistry.ts
│  ├─ assets/AssetLoader.ts
│  ├─ assets/AssetContract.ts
│  ├─ ui/Hud.ts
│  ├─ ui/ReflectionPanel.ts
│  ├─ ui/MobileControls.ts
│  ├─ save/SaveService.ts
│  ├─ config/performance.ts
│  └─ main.ts
└─ tests/
   ├─ state.spec.ts
   ├─ conditions.spec.ts
   ├─ save.spec.ts
   └─ e2e/vertical-slice.spec.ts
```

Architekturregeln:

- Babylon.js-spezifischer Code bleibt in Szenen, Präsentation und Asset-Adaptern.
- Der World State bleibt ohne Babylon.js testbar.
- Asset-Pfade kommen nur aus `AssetRegistry`.
- Platzhalter und finale GLBs erfüllen denselben `AssetContract`.
- UI sendet Commands. UI ändert keine Szene direkt.
- Nutze dünne Instanzen für oft wiederholte, starre Objekte.
- Lade Bereiche bei Bedarf. Halte nicht die ganze Stadt aktiv.

## 14. Save State

- Speichere nach wichtigen Events und beim Szenenwechsel.
- Speichere höchstens einmal pro Sekunde.
- Nutze `schemaVersion` und eine Migrationsfunktion.
- Bei kaputten Daten sichere die alte Zeichenfolge unter `light-within-save-recovery`.
- Starte danach mit einem sicheren Default.
- Ein `New Game` löscht den aktiven Save erst nach Bestätigung.
- Ein `Delete reflections` kann nur die Reflexionen löschen.

## 15. Grafik und Leistung

### 15.1 Stil

- Stylized 3D.
- Painterly Farbflächen.
- Cinematic Licht.
- Einfache, klare Geometrie.
- Runde oder leicht facettierte Formen.
- Keine fotorealistischen Hautporen.
- Keine harten schwarzen Konturen.
- Warme Outer World.
- Kühle, leuchtende Inner World.

### 15.2 Mobile-first Budget

Zielgerät: mittleres Android- oder iOS-Gerät der letzten vier Jahre.

| Wert | v0.1 Ziel | Harte Obergrenze |
|---|---:|---:|
| Bilder pro Sekunde | 30 stabil | nie länger unter 24 |
| Draw Calls im normalen Blick | 80 | 120 |
| sichtbare Dreiecke | 180.000 | 250.000 |
| aktive Skinned Meshes | 6 | 10 |
| dynamische Hauptlichter | 1 | 2 |
| Schatten-Caster | 12 | 20 |
| transparente Partikel | 250 | 500 |
| Start-Download ohne Audio | 12 MB | 18 MB |
| gesamter v0.1-Asset-Download | 35 MB | 50 MB |
| normale Texturgröße | 512 px | 1024 px |
| Hero-Texturgröße | 1024 px | 2048 px nur begründet |

Weitere Regeln:

- Nutze KTX2-Texturen, wenn die Pipeline sie sicher erzeugt.
- Nutze Meshopt oder Draco nur mit sauberem Loader und Fallback.
- Nutze höchstens eine Shadow Map mit 1024 px auf Mobile.
- Nutze baked Ambient Occlusion in Vertex Colors oder Textur.
- Nutze keine echte volumetrische Flüssigkeit.
- Nutze begrenzten Fog und billige Billboard-Partikel.
- Halbiere Partikel auf `low`.
- Deaktiviere entfernte Animationen.
- Teste echte mobile Viewports. Desktop-Erfolg reicht nicht.

## 16. Gemeinsamer 3D-Asset-Vertrag

### 16.1 Maßstab und Achsen

- 1 Babylon-Einheit entspricht 1 Meter.
- Y ist oben.
- Z zeigt in Blender nach vorn. Prüfe die importierte Babylon-Ausrichtung.
- Charaktere blicken im exportierten Asset nach `+Z`.
- Der Root Node heißt `ROOT`.
- Der Root hat Position `0,0,0`, Rotation `0,0,0` und Scale `1,1,1`.
- Wende Transformationswerte vor Export an.
- Der Boden liegt bei Y = 0.

### 16.2 Pivots

- Charakter-Pivot: Mitte zwischen den Füßen auf Bodenhöhe.
- Gebäude-Pivot: Mitte der Bodenfläche.
- Wand-Pivot: Mitte der unteren Kante.
- Tor-Pivot: Mitte der Bodenöffnung.
- Brücken-Pivot: Mitte der Deckfläche.
- Kleine Props: Mitte der Unterseite.
- Hängende Props: Aufhängung als Pivot.

### 16.3 Materialien und Texturen

- Nutze PBR-Materialien.
- Nutze wenige Material-Slots.
- Packe Metallic, Roughness und Ambient Occlusion, wenn möglich.
- Nutze Alpha nur, wenn nötig.
- Nutze Alpha-Test für Blätter. Nutze kein weiches Blend für große Blattflächen.
- Nutze Vertex Colors für kleine Farbänderungen.
- Benenne Materialien `MAT_<asset>_<part>`.
- Benenne Meshes `MESH_<asset>_<part>`.
- Benenne Collider `COL_<asset>_<part>`.

### 16.4 Kollision

- Sichtbares Mesh ist nicht automatisch Collider.
- Nutze einfache Boxen, Kapseln oder konvexe Hüllen.
- Kleine Deko hat keine Kollision.
- Treppen erhalten eine schräge Kollisionsrampe.
- Blattwerk hat keine Kollision.

### 16.5 LOD

LOD bedeutet Level of Detail. Es ist eine einfachere Form für große Entfernung.

- Hero-Objekte: LOD0, LOD1 und LOD2.
- Normale Props: LOD0 und LOD1.
- Kleine Props: ein Mesh oder Instanz.
- LOD1 hat etwa 50 Prozent der Dreiecke von LOD0.
- LOD2 hat etwa 20 Prozent der Dreiecke von LOD0.
- Material-Slots bleiben über LODs gleich.

### 16.6 Animationsregeln

- 30 Bilder pro Sekunde.
- Root Motion ist aus. Code bewegt den Charakter.
- Clips loopen nur, wenn der Name `_Loop` endet.
- Keine Skalierung in Knochenanimationen.
- Maximal 45 Bones pro normalem Charakter.
- Maximal vier Bone-Gewichte pro Vertex.
- Clip-Namen müssen exakt der Liste entsprechen.

## 17. Asset Manifest

### 17.1 Must-have für v0.1

```text
public/assets/
├─ characters/player.glb
├─ characters/merchant.glb
├─ characters/citizen_female.glb
├─ characters/citizen_male.glb
├─ creatures/attachment_beetle.glb
├─ core/finance_package.glb
├─ core/package_chain.glb
├─ core/central_tree_outer.glb
├─ core/central_tree_inner.glb
├─ city/city_gate.glb
├─ city/wall_modules.glb
├─ city/building_modules.glb
├─ city/bridge_modules.glb
├─ market/market_stall_A.glb
├─ market/market_stall_B.glb
├─ market/market_props.glb
├─ inner-world/floating_platforms.glb
├─ inner-world/rock_modules.glb
├─ inner-world/crystals.glb
├─ vegetation/vegetation_set.glb
└─ props/key_props.glb
```

### 17.2 Später im Finance MVP

```text
public/assets/
├─ characters/fear_child.glb
├─ characters/dark_npc.glb
├─ characters/exchange_guide.glb
├─ core/exchange_house.glb
└─ props/service_and_exchange_props.glb
```

## 18. Direkt nutzbare 3D-Generation-Prompts

Jeder Prompt fordert GLB. Wenn ein Generator keine Animationen oder Node-Namen sicher liefert, muss der Agent das Modell danach in einer 3D-Pipeline prüfen und korrigieren.

### 18.1 Player

```text
Create a production-ready GLB character for a stylized painterly third-person 3D browser game. The character is a gentle young adult traveler with a clear readable silhouette, simple layered clothing, boots, a small scarf, and a neutral gender-flexible appearance. Use cinematic shapes, soft hand-painted colors, simple geometry, and no photoreal skin. Height 1.72 meters. Face +Z. Feet on Y=0. Root node ROOT at the midpoint between the feet. Use one humanoid armature with 45 bones or fewer and four weights per vertex. Use no root motion. Keep LOD0 under 18,000 triangles, LOD1 under 9,000, and LOD2 under 4,000. Use no more than three PBR material slots: skin, cloth, detail. Use 1024 textures or smaller. Add a simple capsule collision proxy named COL_player_capsule. Provide exact clips: Idle_Loop, Walk_Loop, Run_Loop, Carry_Loop, Give, Receive, Help, Sit_Loop, Fear, Look, Interact, and Fly_Loop. Keep hands readable during Give, Receive, and Help. Export one clean GLB with applied transforms and no hidden objects.
```

Required nodes: `ROOT`, `ARM_player`, `MESH_player_body`, `MESH_player_scarf`, `COL_player_capsule`.

### 18.2 Merchant

```text
Create a production-ready GLB merchant for a stylized painterly mobile and browser 3D game. The merchant is a warm middle-aged market worker with an apron, rolled sleeves, a cloth cap, and strong hands. Avoid stereotypes and luxury symbols. Height 1.75 meters. Use simple cinematic geometry and hand-painted PBR colors. Face +Z, feet on Y=0, ROOT at the midpoint between the feet. Use one humanoid armature with 45 bones or fewer, no root motion, and four weights per vertex. LOD0 under 16,000 triangles, LOD1 under 8,000, LOD2 under 3,500. Use three material slots or fewer and 1024 textures or smaller. Provide exact clips: Idle_Loop, Walk_Loop, Carry_Loop, Give, Receive, Help, Talk_Loop, and Point. The Help clip must show active lifting or carrying. It must not show kneeling. Add COL_merchant_capsule. Export one clean GLB.
```

Required nodes: `ROOT`, `ARM_merchant`, `MESH_merchant_body`, `MESH_merchant_apron`, `COL_merchant_capsule`.

### 18.3 Citizen Female Variant

```text
Create a modular stylized painterly adult female citizen GLB for a mobile and browser 3D game. Use a respectful everyday city design with tunic, trousers or long skirt, simple shoes, and two optional hair nodes. Height 1.68 meters. Use a clear silhouette and simple geometry. Face +Z, feet on Y=0, ROOT between the feet. Use one humanoid armature with 40 bones or fewer and no root motion. LOD0 under 12,000 triangles, LOD1 under 6,000, LOD2 under 2,500. Use two material slots and one 1024 atlas. Provide clips Idle_A_Loop, Idle_B_Loop, Walk_Loop, Give, Receive, Talk_Loop, Worry_Loop, and Help. Add switchable nodes VAR_hair_A, VAR_hair_B, VAR_clothes_A, and VAR_clothes_B. Add COL_citizen_capsule. Export one clean GLB.
```

### 18.4 Citizen Male Variant

```text
Create a modular stylized painterly adult male citizen GLB for a mobile and browser 3D game. Use a respectful everyday city design with simple jacket, shirt, trousers, shoes, and two optional hair or hat nodes. Height 1.78 meters. Use a clear silhouette and simple geometry. Face +Z, feet on Y=0, ROOT between the feet. Use one humanoid armature with 40 bones or fewer and no root motion. LOD0 under 12,000 triangles, LOD1 under 6,000, LOD2 under 2,500. Use two material slots and one 1024 atlas. Provide clips Idle_A_Loop, Idle_B_Loop, Walk_Loop, Give, Receive, Talk_Loop, Worry_Loop, and Help. Add switchable nodes VAR_head_A, VAR_head_B, VAR_clothes_A, and VAR_clothes_B. Add COL_citizen_capsule. Export one clean GLB.
```

### 18.5 Fear Child

```text
Create a respectful stylized painterly child character GLB for a reflective mobile and browser 3D game. The child looks worried about a missing coin but must not look abused, monstrous, or helpless. Use a small satchel, simple layered clothes, and a readable guarded pose. Height 1.25 meters. Face +Z, feet on Y=0, ROOT between the feet. Use one armature with 35 bones or fewer and no root motion. LOD0 under 10,000 triangles, LOD1 under 5,000, LOD2 under 2,000. Use two PBR materials and 1024 textures or smaller. Provide clips Idle_Worried_Loop, Walk_Loop, Search_Loop, LookUp, Receive, Relief, and Talk_Loop. Add COL_fear_child_capsule. Do not include tears, injury, chains, or kneeling. Export one clean GLB.
```

### 18.6 Dark NPC

```text
Create a stylized painterly adult NPC GLB for a reflective mobile and browser 3D game. The character represents a closed expectation of loss through posture, dark layered clothing, and cool colors. The person must remain human and dignified. Do not create a demon, villain, corpse, or horror figure. Height 1.82 meters. Face +Z, feet on Y=0, ROOT between the feet. Use one humanoid armature with 40 bones or fewer and no root motion. LOD0 under 13,000 triangles, LOD1 under 6,500, LOD2 under 2,500. Provide clips Idle_Closed_Loop, Walk_Loop, Talk_Loop, Refuse, Listen, and OpenPosture. Use three materials or fewer. Add COL_dark_npc_capsule. Export one clean GLB.
```

### 18.7 Exchange Guide

```text
Create a stylized painterly Exchange Guide character GLB for a cinematic mobile and browser 3D game. The guide is calm, grounded, and practical. Use balanced asymmetrical clothing with two joined color fields, warm neutral fabric, and a small ledger token. Avoid priest, judge, banker, or royal symbols. Height 1.76 meters. Face +Z, feet on Y=0, ROOT between the feet. Use one humanoid armature with 45 bones or fewer and no root motion. LOD0 under 15,000 triangles, LOD1 under 7,500, LOD2 under 3,000. Provide clips Idle_Loop, Walk_Loop, Welcome, Give, Receive, BalanceGesture, Talk_Loop, and OpenDoor. Use three PBR materials or fewer. Add COL_exchange_guide_capsule. Export one clean GLB.
```

### 18.8 Attachment Beetle

```text
Create a stateful stylized painterly beetle GLB for an inner-world mobile and browser 3D game. The beetle symbolizes attachment. It must feel strange and weighty but not disgusting or evil. Use a rounded shell, six simple legs, subtle gold vein lines, and one chain anchor on the shell. Body length 0.8 meters. Face +Z and place ROOT at the ground center. Use a compact armature with 24 bones or fewer. Keep LOD0 under 8,000 triangles, LOD1 under 4,000, and LOD2 under 1,500. Use separate meshes MESH_beetle_body, MESH_beetle_shell, MESH_beetle_gold_veins, and MESH_beetle_chain_anchor. Use material slots MAT_beetle_body, MAT_beetle_shell, and MAT_beetle_glow. Provide clips Dormant_Loop, Attached_Loop, Pull, Resist, Observe_Loop, Release, and Transformed_Loop. Attached_Loop has tense legs and a closed shell. Release relaxes the body. Transformed_Loop uses a softer posture and dim warm glow. Do not make the beetle die or explode. Add COL_beetle_body and export one clean GLB.
```

State rules: `hidden`, `dormant`, `attached`, `observed`, `released`, `transformed`. Code controls glow and visibility. Animation does not own the state.

### 18.9 Finance Package and Chain

```text
Create two coordinated production-ready GLB assets for a stylized painterly mobile and browser 3D game: finance_package.glb and package_chain.glb. The package is a compact cloth-wrapped parcel with simple cord, a small blank wax seal, and no readable brand or currency mark. Size 0.45 x 0.28 x 0.22 meters. Use separate nodes MESH_package_wrap, MESH_package_cord, MESH_package_seal, and SOCKET_chain. Pivot at the center of the bottom. Keep it under 2,500 triangles and use two PBR materials with 512 textures. Add COL_package_box. The chain is a low-cost curved segmented chain or skinned chain with ends SOCKET_player and SOCKET_package. It must support loose and tense poses. Keep it under 1,800 triangles. Provide chain clips Loose_Loop, Tighten, Tense_Loop, and Release. Use no physics-dependent geometry. Export both clean GLB files with applied transforms.
```

### 18.10 Central Tree Outer

```text
Create a hero central tree GLB for a stylized painterly cinematic mobile and browser 3D game. The tree is the visual heart of a city square. It has a broad ancient trunk, a clear doorway-like root space, two strong main branches, clustered leaf masses, and a small source-water opening near the roots. It must feel welcoming and alive, not sacred in a specific religion. Total height 16 meters and crown width about 14 meters. Pivot at the trunk center on Y=0. Use separate nodes MESH_tree_trunk, MESH_tree_root_main, MESH_tree_branch_left, MESH_tree_branch_right, MESH_tree_leaves_A, MESH_tree_leaves_B, MESH_tree_leaves_C, MESH_tree_source_stone, FX_anchor_crown, FX_anchor_source, PORTAL_anchor, and INTERACT_look_within. Use separate materials MAT_tree_bark, MAT_tree_leaves, MAT_tree_source, and MAT_tree_state_glow. Use alpha-test leaf cards only where needed. LOD0 under 45,000 triangles, LOD1 under 22,000, LOD2 under 8,000. Use one 1024 bark atlas and one 1024 leaf atlas. Add simple trunk and root colliders. Leaves have no collision. Export one clean GLB.
```

### 18.11 Inner Tree and Root System

```text
Create a hero inner-world tree and root-system GLB for a stylized painterly cinematic mobile and browser 3D game. It mirrors the outer central tree but reveals luminous roots, open cavities, water channels, attachment veins, and a cool fear zone. The form must be beautiful and readable, not horror. Overall visible root chamber spans 22 meters and the main trunk rises 10 meters. Pivot at the trunk center on Y=0. Use separate nodes MESH_inner_trunk, MESH_root_main, MESH_root_attachment, MESH_root_fear, MESH_root_service, MESH_water_channel, MESH_source_basin, SOCKET_package, SOCKET_beetle, FX_anchor_source, FX_anchor_attachment, and FX_anchor_fear. Use material slots MAT_inner_bark, MAT_root_glow, MAT_attachment_gold, MAT_fear_cool, and MAT_source_water. LOD0 under 55,000 triangles, LOD1 under 28,000, LOD2 under 10,000. Use simple walkable and blocking colliders separate from visible roots. Use no baked text. Export one clean GLB.
```

### 18.12 Exchange House

```text
Create a modular Exchange House GLB for a stylized painterly mobile and browser 3D city. The building represents balanced exchange. Use an open two-sided entrance, two equal side wings, warm stone, wood, cloth, and a visible central table. Avoid bank columns, currency signs, temples, and luxury. Footprint 12 x 10 meters and height 8 meters. Pivot at the center of the ground footprint. Separate nodes: MESH_exchange_shell, MESH_exchange_roof, MESH_exchange_door_left, MESH_exchange_door_right, MESH_exchange_table, MESH_exchange_sign_blank, SOCKET_guide, INTERACT_door, and FX_anchor_exchange. Use four materials or fewer. LOD0 under 35,000 triangles, LOD1 under 17,000, LOD2 under 6,000. Add box colliders for walls and a clear door trigger. Doors must have hinge pivots. Export one clean GLB.
```

### 18.13 Market Stalls and Props

```text
Create three clean GLB files for a stylized painterly mobile and browser market: market_stall_A.glb, market_stall_B.glb, and market_props.glb. Stall A is a warm wood frame with a cloth canopy and open counter. Stall B uses the same module scale but a side shelf and different canopy silhouette. Each stall footprint is about 3 x 2 meters and height 2.7 meters. Keep each stall under 7,000 triangles and two materials. Use separate canopy nodes for color variants and simple box colliders. The props file contains separate origin-ready meshes for crate, basket, folded cloth, ceramic jar, bread bundle, fruit pile, blank price tag, small scale, and coin pouch. No readable text and no real currency logo. Each prop stays under 800 triangles. Use one 1024 atlas for all props. Set each prop pivot at the bottom center. Export three clean GLB files.
```

### 18.14 Modular City Buildings, Walls, Gates and Bridges

```text
Create four coordinated modular GLB kits for a stylized painterly mobile and browser city: building_modules.glb, wall_modules.glb, city_gate.glb, and bridge_modules.glb. Use warm stone, muted plaster, dark wood, soft irregular edges, and simple cinematic forms. Use a 1 meter grid. Building modules include 4 m wall, 4 m wall with window, 4 m wall with door, inside corner, outside corner, floor, flat roof, sloped roof, balcony, and blank sign. Wall modules include 4 m straight wall, corner, end cap, and short tower. City gate has a 4 m wide and 4.5 m high clear opening, separate doors with hinge pivots, INTERACT_gate, and simple colliders. Bridge modules include 4 m straight deck, 8 m straight deck, ramp, side rail, and arch support. Keep each large module under 5,000 triangles. Use at most three shared PBR material atlases at 1024. Provide LOD1 for modules over 2,000 triangles. Use separate simple colliders. Export four clean GLB files with each module as a named child of ROOT.
```

### 18.15 Inner-world Platforms, Rocks and Crystals

```text
Create three coordinated GLB kits for a stylized painterly inner world: floating_platforms.glb, rock_modules.glb, and crystals.glb. Platforms include 4 m round, 6 m oval, 4 x 8 m path, broken edge, and water-channel platform. Use soft carved stone, root seams, and simple underside silhouettes. Add walkable colliders. Rocks include six low-poly shapes from 0.3 to 2.5 meters with bottom-center pivots and no collision on the smallest two. Crystals include five calm translucent-looking shapes from 0.2 to 1.5 meters. Use opaque or alpha-test materials with emissive accents instead of expensive true transparency. Add material variants MAT_crystal_source, MAT_crystal_attachment, and MAT_crystal_fear. Keep each module under 3,000 triangles. Use one 1024 shared atlas and vertex colors. Export three clean GLB files.
```

### 18.16 Vegetation

```text
Create vegetation_set.glb for a stylized painterly mobile and browser 3D game. Include eight separate origin-ready meshes: grass_clump_A, grass_clump_B, fern_A, fern_B, flower_warm, flower_cool, shrub_A, and young_tree. Use simple clustered geometry, hand-painted color blocks, and alpha-test cards only where needed. No mesh except young_tree exceeds 700 triangles. Young_tree stays under 2,000 triangles. Use one 1024 texture atlas and one shared PBR material. Pivots are at bottom center. Use no colliders. Make all meshes safe for GPU instancing. Export one clean GLB.
```

### 18.17 Key Props and Service Props

```text
Create key_props.glb and service_and_exchange_props.glb for a stylized painterly mobile and browser 3D game. key_props includes an origin-ready heavy crate, hand cart, bench, lantern, blank notice board, water bowl, small bridge lamp, and simple gate lever. service_and_exchange_props includes a two-person carry crate with SOCKET_left and SOCKET_right, a gift pouch, a wrapped meal, a ledger with blank pages, two exchange bowls, and a balance beam with no currency marks. Use simple geometry, soft painted colors, bottom-center pivots, one 1024 atlas per file, and no more than 1,500 triangles per prop. Add simple colliders only to the crate, cart, bench, and lever. Export two clean GLB files.
```

## 19. Asset Validation

Der Agent muss jedes GLB automatisch und visuell prüfen.

Automatische Prüfung:

- Datei lädt ohne Fehler.
- Alle Pflicht-Nodes sind vorhanden.
- Root-Transform ist sauber.
- Maße liegen im erlaubten Bereich.
- Materialzahl und Dreieckzahl liegen im Budget.
- Animationen haben die exakten Namen.
- Keine fehlenden Texturen.
- Keine externen absoluten Pfade.
- Collider sind getrennt.

Visuelle Prüfung:

- Screenshot von vorn, Seite und im Spiel.
- Richtige Person oder richtiges Objekt.
- Richtige Größe.
- Richtiger Pivot.
- Keine abgeschnittenen Teile.
- Keine falschen Symbole oder lesbaren Marken.
- Zustands-Nodes lassen sich einzeln schalten.
- Animationen zeigen keine starken Fuß- oder Handfehler.

## 20. Implementierungsphasen

### Phase 0: Projekt und Beweise

- Vite, TypeScript und Babylon.js einrichten.
- Test- und Browser-Test-Pipeline einrichten.
- Performance Overlay für Entwicklungsmodus bauen.
- Asset Contract und Registry bauen.
- Einen Platzhalter laden und austauschen.

### Phase 1: Kernbewegung

- Outer World Greybox bauen.
- Player, Kamera, Desktop- und Mobile-Steuerung bauen.
- Kollision und Interaktion bauen.
- City Gate bis Central Square spielbar machen.

### Phase 2: World State

- EventBus, WorldStore, Selectors und ConditionEngine bauen.
- Save Migration und Wiederherstellung bauen.
- Debug-Panel nur im Entwicklungsmodus bauen.

### Phase 3: Herz der Welt

- Central Tree und Source Water integrieren.
- Look Within bauen.
- Szenenwechsel und gespiegelte Anker bauen.
- Inner Tree, Wurzeln und Paket integrieren.

### Phase 4: Reflexion und Markt

- Reflection Panel mit Skip und lokaler Speicherung bauen.
- Marktbereich und Merchant integrieren.
- Thought Wave System bauen.
- Attachment Event bauen.
- Beetle-Zustand `attached` im Inner World zeigen.

### Phase 5: Kunst und Leistung

- Platzhalter durch echte Assets ersetzen, wenn vorhanden.
- Licht, Fog und Partikel abstimmen.
- LOD, Instancing und Bereichsladen prüfen.
- Desktop und Mobile messen.

### Phase 6: Prüfung

- Unit Tests ausführen.
- Browser-Journey auf Desktop ausführen.
- Browser-Journey in Mobile-Viewport ausführen.
- Save und Reload prüfen.
- Screenshots und Messwerte ablegen.
- Bekannte Grenzen in `README.md` nennen.

## 21. Acceptance Criteria für v0.1

v0.1 ist nur fertig, wenn alle Punkte wahr sind.

### Spielweg

- Der Spieler kann den ganzen v0.1-Weg ohne Debug-Befehl spielen.
- Paket und Kette erscheinen nach der ersten Interaktion.
- Der Spieler kann das City Gate passieren.
- Der Central Tree ist klar sichtbar.
- Look Within wechselt sicher in die Inner World.
- Der Spieler kann die Reflexion speichern oder überspringen.
- Reload erhält Event, Reflexion und letzte sichere Position.
- Der Markt löst genau einmal „I want more...“ aus.
- Der zweite innere Besuch zeigt den Beetle in `attached`.
- Outer und Inner World lesen denselben World State.

### Bedienung

- Tastatur und Maus funktionieren.
- Touch-Steuerung funktioniert bei 390 x 844 CSS-Pixeln.
- UI überdeckt keine wichtige Interaktion.
- Kamera geht nicht dauerhaft durch Wände.
- Der Spieler kann nicht aus der Spielzone fallen.

### Technik

- `npm run build` läuft ohne Fehler.
- TypeScript hat keine Fehler.
- Unit Tests für Events, Bedingungen und Save laufen.
- Der vollständige Browser-Test läuft auf Desktop.
- Der vollständige Browser-Test läuft mit Mobile-Viewport.
- Es gibt keine nicht behandelten Fehler in der Browser-Konsole.
- Alle Assets kommen aus `AssetRegistry`.
- Ein Platzhalter kann ohne Codeänderung durch das finale GLB ersetzt werden.

### Leistung und Bild

- Das normale Mobilbild bleibt unter 120 Draw Calls.
- Das normale Mobilbild bleibt unter 250.000 sichtbaren Dreiecken.
- Das Ziel von 30 Bildern pro Sekunde wird auf dem gewählten Testgerät erreicht.
- Falls nur Software-Rendering verfügbar ist, nennt der Bericht das klar.
- Central Tree, Source Water, Paket, Markt und Beetle sind visuell eindeutig.
- Fog und Partikel verdecken nicht den Weg.

### Inhalt und Sicherheit

- Lower Position zeigt Hilfe. Es zeigt kein Knien.
- Die freie Reflexion wird nicht bewertet.
- Das Spiel gibt keine Diagnose.
- Das Spiel verspricht keine finanzielle Belohnung.
- Das Spiel macht keine Tatsachenbehauptung über Karma.
- Keine Reflexion verlässt das Gerät.

## 22. Nicht Teil von v0.1

- Vollständige Fear-Geschichte.
- Vollständiger Service- und Give/Receive-Bogen.
- Exchange-House-Finale.
- Relationship Package.
- Online-Konto.
- Cloud Save.
- LLM-Verbindung.
- Mehrspieler.
- echtes Fliegen.
- große offene Stadt.
- fotorealistische Grafik.

## 23. Initial Coding Agent Prompt

```text
Build Vertical Slice v0.1 of the Babylon.js and TypeScript game defined in GAME_MASTER_SPEC.md.

Treat GAME_MASTER_SPEC.md as the source of truth. Build a playable vertical slice, not only an architecture demo. Use Vite, TypeScript, Babylon.js, and a mobile-first design.

Implement this complete playable path:
start -> receive Finance Package -> enter City Gate -> reach Central Tree -> use Look Within -> enter Inner World -> see Inner Tree, roots, Source Water, and package -> answer or skip “What does money mean to you?” -> return to Outer World -> visit Market -> trigger “I want more...” -> return to Inner World -> see the Attachment Beetle in the attached state.

Use an event-and-condition World State. Do not build a rigid linear quest controller. Keep World State independent from Babylon.js so it can be unit tested. Make Outer World and Inner World read the same state. Implement local save data with schema versioning and safe recovery.

Create the required GLB assets yourself when your environment can produce and validate real GLB files. Follow every asset prompt, node name, scale, pivot, material, animation, LOD, collision, and performance rule in this document. If real asset creation is not possible, create clean replaceable placeholders that obey the same AssetContract. Do not block programming while waiting for final art. Never claim an asset is complete until it loads and passes both automatic and visual checks.

Keep the game true 3D with free movement. Make it beautiful through lighting, fog, color, composition, and limited particles. Do not spend the mobile budget on dense geometry. Use simple collision meshes, instancing, LOD, area loading, and limited animation.

Implement desktop and touch controls. Test both. Add a development-only performance overlay that shows frames per second, draw calls, active meshes, visible triangles, and texture count. Do not treat software-renderer speed as proof of real mobile graphics speed.

Keep reflections local. Allow Save, Skip, and Delete. Render plain text only. Do not add an LLM in v0.1. Do not diagnose the player. Do not judge answers. Do not promise money outcomes. Do not state that karma is a fact.

Use Lower Position only as active service to another person. Do not show kneeling or self-humiliation.

Make small implementation decisions yourself. Record every important decision and any departure from this specification in DEVELOPMENT_DECISIONS.md. Keep the architecture open for later Fear, Service, Give, Receive, Transformation, Exchange House, and optional consent-based LLM features.

Work in phases. After each phase, run the relevant checks. At the end, run the build, TypeScript checks, unit tests, the complete desktop browser journey, and the complete mobile-viewport journey. Check the browser console. Save screenshots and performance measurements. State clearly what you verified and what you could not verify.

Do not stop at scaffolding. Continue until every v0.1 acceptance criterion is met or until a real external blocker prevents progress. If blocked, document the exact blocker, the evidence, and the smallest next action.
```

---

**End of specification.**
