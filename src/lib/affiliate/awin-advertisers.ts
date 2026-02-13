/**
 * Domain-to-AdvertiserID mapping for AWIN partner shops.
 *
 * Each entry maps a hostname (without "www.") to the AWIN advertiser ID.
 * Used to detect whether a product URL belongs to an AWIN partner
 * and to generate deep links via cread.php.
 *
 * To add new advertisers: join the program in AWIN, then add the
 * domain and advertiser ID here.
 */
export const AWIN_ADVERTISERS: Record<string, number> = {
  // --- Department Stores / Generalisten ---
  "etsy.com": 7634, // Etsy DACH
  "lidl.de": 13936,
  "tchibo.de": 11792,
  "wmf.com": 42784,
  "galeria.de": 46809,
  "baur.de": 14537,

  // --- Baby & Kinder ---
  "babymarkt.com": 14824,
  "baby-walz.de": 12387,
  "sigikid.de": 19670,
  "de.schleich-s.com": 16322, // subdomain
  "haba-play.com": 26709,
  "spielemax.de": 118573,
  "stapelstein.de": 20615,
  "cybex-online.com": 103281,
  "bugaboo.com": 18076,
  "ernstings-family.de": 15170,
  "laessig-fashion.de": 40520,
  "edurino.com": 76954,
  "joolz.com": 43419,
  "nuk.de": 29395,
  "ergobaby.de": 50173,
  "vertbaudet.de": 11730,
  "nici.de": 22292,

  // --- Buecher ---
  "buecher.de": 14584,
  "thalia.de": 14158,
  "thienemann-esslinger.de": 23269,

  // --- Spielzeug & Games ---
  "carrera-toys.com": 40446,
  "revell.de": 14789,
  "moses-verlag.de": 16430,
  "tipp-kick.de": 116381,
  "malennachzahlen-schipper.com": 108306, // Schipper
  "bakerross.de": 16576,
  "ideeundspiel.com": 75052,
  "puzzle.de": 11438,

  // --- PC & Video Games ---
  "g2a.com": 12798,
  "startselect.com": 21994,
  "kinguin.net": 9862,
  "konsolenkost.de": 14672,

  // --- Elektronik ---
  "samsung.com": 14815,
  "lg.com": 63126,
  "coolblue.de": 85171,
  "expert.de": 30007,
  "tink.de": 13686,
  "soundcore.com": 30687,
  "medion.com": 10092,
  "panasonic.com": 32279,
  "proshop.de": 18501,
  "reichelt.de": 14954,

  // --- Schmuck & Uhren ---
  "thomassabo.com": 14968,
  "christ.de": 11786,
  "purelei.com": 22860,
  "casio.com": 86925,

  // --- Geschenke & Erlebnisse ---
  "jochen-schweizer.de": 11717,
  "jochen-schweizer-shop.de": 60667,
  "mydays.de": 14087,
  "puzzleyou.de": 15100,
  "personalnovel.de": 13559,
  "1a-geschenkeshop.de": 17464,
  "weihnachtsplaner.de": 15163,
  "dallmayr-versand.de": 11832,

  // --- Mode ---
  "nike.com": 16329, // Nike DE
  "footlocker.de": 14437,
  "salomon.com": 86253,
  "chiemsee.com": 30981,

  // --- Beauty & Gesundheit ---
  "clarins.de": 44459,
  "docmorris.de": 14485,

  // --- Home ---
  "eu.ooni.com": 77084, // subdomain
};
