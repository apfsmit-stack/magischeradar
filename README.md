# MagischeRadar 4.0 | De levende tekenfilmwereld

Deze versie bouwt voort op 3.3 en behoudt het ouderportaal, oudercode, vijf figuren, postcode- en locatie-instellingen, aankomsttijd, persoonlijke boodschap, 30-secondenvoorbeeld en aankomstfeest.

## Nieuwe animatiewereld

- Realtime geanimeerde wolken en mist, twinkelende lichtjes, bewegende bomen en draaiende windmolens.
- Verlichte huisjes en vuurvliegjes, vallende sterren en een goudkleurig lichtspoor bij het reizende figuur.
- Reacties met sterren en confetti wanneer een kind zwaait of een verrassing activeert.
- Extra effecten bij tussenstops tijdens de voorbeeldreis en bij aankomst.
- Animatie-intensiteit volgt de instelling Rustig, Spannend of Extra magisch.
- Houdt rekening met `prefers-reduced-motion`.
- De animatie is realtime en reageert op instellingen. Het is geen vooraf gerenderde animatiefilm.
- De gestileerde 3D-personages uit 3.3 blijven optioneel beschikbaar via Three.js CDN. Als die niet laadt, zijn de geanimeerde 2D-figuren zichtbaar.

## Publiceren

Pak de ZIP uit en upload **alle bestanden uit de ZIP** naar de root van de bestaande GitHub Pages-repository. Overschrijf de oudere bestanden. Ververs na publicatie de site met Ctrl+F5. De serviceworker-cache is bijgewerkt naar 4.0.

## Privacy

Instellingen worden lokaal in de browser bewaard. De standaardoudercode is 2468 en moet bij eerste gebruik gewijzigd worden. Dit is een eenvoudige afscherming, geen veilige authenticatie.

## Techniek

Statische HTML/CSS/JavaScript, 2D Canvas, SVG en optionele Three.js. Geen server nodig. `cinema.js` verzorgt de animatiewereld. De bestaande `app.js` regelt de route en de ouderbediening.
