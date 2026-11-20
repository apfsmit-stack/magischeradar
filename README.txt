MAGISCHERADAR 1.0
=================

INHOUD
index.html              Het kinderscherm en ouderportaal
style.css               De vormgeving en animaties
app.js                  De logica en instellingen
icon.svg                Het app-icoon
manifest.webmanifest    Instellingen voor installatie als webapp
sw.js                   Offline ondersteuning na eerste online bezoek

LOKAAL TESTEN
Open index.html in een browser. Voor volledige PWA-functionaliteit gebruik je
localhost of een HTTPS-website. Bijvoorbeeld met Python:
python -m http.server 8000
Open daarna http://localhost:8000/magischeradar/ als de server vanuit
bovenliggende map gestart is, of http://localhost:8000/ vanuit deze map.

ONLINE ZETTEN MET GITHUB PAGES
1. Maak gratis een account op https://github.com
2. Maak een nieuwe openbare repository, bijvoorbeeld magischeradar.
3. Upload alle zes bestanden uit deze map naar de hoofdmap van de repository.
4. Ga naar Settings > Pages.
5. Kies onder Build and deployment: Deploy from a branch.
6. Selecteer main en / (root), en klik Save.
7. Wacht tot GitHub Pages de URL toont, bijvoorbeeld:
   https://JOUWGEBRUIKERSNAAM.github.io/magischeradar/

GEBRUIK
Open de app, druk op het tandwiel, voer standaardcode 2468 in.
Verander die code in het ouderportaal en stel thema, afstand, datum en boodschap in.
Instellingen worden op dit apparaat in de browser bewaard.

BELANGRIJK
De radar is fictief en gebruikt geen GPS of persoonsgegevens.
De oudercode is bedoeld als eenvoudige kinderdrempel, niet als beveiliging.
Wie browseropslag verwijdert, verliest ook de instellingen en aangepaste code.
Een andere browser of telefoon heeft zijn eigen instellingen.
