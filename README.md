# ChatbotOT

Deterministische proceschatbot die volledig in de browser werkt.

Website: https://basbrws.github.io/ChatbotOT/

## Gebruik

1. Open de website en laad lokaal een XLS, XLSX, XLSM, CSV of TSV.
2. Stel vragen en vervolgvragen over processen, activiteiten, rollen, systemen en relaties.
3. Schakel **Lokaal kwaliteitslog bijhouden** in de linkerkolom aan als je antwoorden wilt evalueren.
4. Gebruik **Goed** of **Fout / aanvullen** onder een antwoord. Bij fouten kun je een toelichting en het verwachte antwoord opslaan.
5. Kies desgewenst **Toon mijn correctie bij exact dezelfde vraag en dataset**. Dit is een expliciete lokale gebruikerscorrectie, geen aanpassing van de Excelbron.
6. Download via **Exporteer leerrapport (JSON)** het leerrapport. Je kunt dat in ChatGPT delen voor een analyse en gerichte wijzigingen aan de deterministische code.

## Wat het kwaliteitslog bevat

- Bestandsmetadata: bestandsnaam, grootte, wijzigingsdatum, namen en regelaantallen van tabbladen.
- Vragen, beknopte antwoordfragmenten, bronverwijzingen, relevante activiteitcodes, gesprekscontext en duur van een antwoord.
- Waarschuwingen van heuristische automatische kwaliteitscontroles.
- Expliciete beoordelingen, toelichtingen, verwachte antwoorden en optionele exact-match-correcties.

De oorspronkelijke inhoud van het Excelbestand wordt niet als geheel in het log bewaard. Antwoordfragmenten en bronverwijzingen kunnen wel vertrouwelijke inhoud bevatten.

## Privacy en veiligheid

De website leest je spreadsheet in het geheugen van je browser. Er vindt geen automatische upload plaats naar GitHub of ChatGPT. Het kwaliteitslog staat standaard **uit**. Als je het inschakelt, worden loggegevens lokaal in de browser opgeslagen via `localStorage`, zolang de browser opslag toestaat. Als de opslag niet beschikbaar of vol is, kan het log alleen tijdelijk beschikbaar zijn. Maak dan een export voordat je de pagina verlaat.

Logs en correcties worden niet gedeeld of gesynchroniseerd. Controleer de JSON export voordat je die deelt. Via **Wis kwaliteitslog** verwijder je de lokaal bijgehouden gegevens op het gebruikte browserprofiel.

## Grenzen van het leren

Er draait geen AI model in ChatbotOT. Een handmatige correctie wordt alleen teruggetoond bij dezelfde vraag, dataset en voorafgaande proces- en activiteitscontext. Deze correctie is duidelijk gemarkeerd en vervangt de standaard brongebonden uitkomst niet.

Voor algemene verbetering van intentherkenning, matching, contextafhandeling en bronselectie is beoordeling van een geëxporteerd leerrapport nodig en moeten expliciet deterministische regels in de code worden aangepast en getest.

De automatische signalen zijn alleen controles op patronen zoals ontbrekende bronnen, lege resultaten en brede matches. Ze bewijzen niet of een antwoord inhoudelijk juist is.

## Versie 2.3, relationele procesvragen

De vraagrouter gebruikt deterministische patronen voor het combineren van proces, activiteit, actor, handeling, object en bronconditie. Specifieke brongebonden routes ondersteunen:

- Alarmen per proces, gevolgd door de vraag 'En welke stappen?' zonder verlies van de eerdere selectie.
- Slagboombediening door (c)WVL, met bronactiviteit, procestitel, rol en rechtstreeks gekoppelde conditie. Zonder bewezen actor of conditie wordt dat expliciet vermeld.
- Videowandimpact via activiteit, systeem en middelenallocatie. Getoonde hoofdprocesgroepen zijn afkomstig uit het Excel procesregister.
- Indicatieve veiligheidsrelevantie van assets op basis van expliciete veiligheidsactiviteiten. Dit is geen gevalideerde risicorangorde; generieke hulpmiddelen en menselijke rollen worden niet uitsluitend op aantallen bovenaan gezet.
- Getypte correcties worden als feedback op het vorige antwoord herkend en niet als een nieuwe zoekopdracht. Automatisch toevoegen aan het log werkt alleen als het kwaliteitslog ingeschakeld is.
- Vervolgvragen over activiteiten, rollen, systemen en processen werken vanuit de eerder geselecteerde bronregels.

## Regressiecontrole

Gebruik Node.js 22 of hoger in de root van de repository:

```bash
node tests/semantic-regression.test.mjs
```

De negen controles dekken de acht vragen uit het aangeleverde gesprekslog plus een bestaande functie en een dry-run zonder contextwijziging. De tests draaien op kleine synthetische tabellen. Daarnaast is een browsertest uitgevoerd met een lokaal XLSX testbestand, inclusief feedback en JSON-export.

**Beperking:** De oorspronkelijke werkmap `UPP_processen_volledig_uniform.xlsx` maakt geen deel uit van deze repository. Zonder dat bronbestand kunnen procesinhoud, volledigheid, formele veiligheidsklassificaties en de correcte uitvoeringsmomenten niet onafhankelijk worden gevalideerd.

## Deployment

`index.html` bevat de hele chatbot, zonder externe JavaScriptbibliotheken. GitHub Actions publiceert nieuwe commits op `main` naar GitHub Pages via `.github/workflows/pages.yml`.
