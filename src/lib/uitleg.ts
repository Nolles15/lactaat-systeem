// Korte uitleg van de begrippen, voor in de app en de output (ADR-0011).
// MEER_INFO_URL is een algemene bron; de eigenaar kan 'm later vervangen door een voorkeursbron.

export const MEER_INFO_URL = 'https://en.wikipedia.org/wiki/Lactate_threshold'

export const UITLEG: { term: string; tekst: string }[] = [
  {
    term: 'LT1',
    tekst:
      'Eerste (aerobe) lactaatdrempel: de intensiteit waarbij het lactaat net begint te stijgen boven de rustwaarde (baseline + delta). Daaronder train je grotendeels aeroob.',
  },
  {
    term: 'LT2',
    tekst:
      'Tweede (anaerobe) lactaatdrempel: de hoogste intensiteit die je langere tijd kunt volhouden zonder dat lactaat blijft oplopen. Bepaald via de Dmax- of Modified-Dmax-methode.',
  },
  {
    term: 'Dmax',
    tekst:
      'Het punt op de curve met de grootste loodrechte afstand tot de rechte lijn tussen het eerste en laatste meetpunt.',
  },
  {
    term: 'Modified-Dmax',
    tekst:
      'Als Dmax, maar de lijn start bij het punt vlak vóór de eerste duidelijke lactaatstijging (> 0,4 mmol/L). Vaak realistischer.',
  },
  {
    term: 'OBLA',
    tekst:
      'Onset of Blood Lactate Accumulation: de intensiteit waarbij de curve een vast lactaatniveau kruist (instelbaar; standaard 4,0 mmol/L).',
  },
  {
    term: 'R²',
    tekst:
      'Hoe goed de curve bij de meetpunten past (1,0 = perfect). Een lage R² betekent: beoordeel de curve kritisch.',
  },
]
