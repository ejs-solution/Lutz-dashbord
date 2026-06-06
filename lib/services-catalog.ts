export type ServiceCatalogItem = {
  id: string;
  name: string;
  categoryId: string;
  durationMin: number;
  durationMax: number;
  priceMin: number;
  priceMax: number;
  description?: string;
  isOnlineBookable: boolean;
};

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string; // lucide icon name
  sortOrder: number;
};

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "damen",    name: "Haarschnitt (Damen)",    icon: "Scissors",  sortOrder: 1 },
  { id: "herren",   name: "Haarschnitt (Herren)",   icon: "Scissors",  sortOrder: 2 },
  { id: "bart",     name: "Bart & Rasur",           icon: "Zap",       sortOrder: 3 },
  { id: "color",    name: "Coloration",             icon: "Palette",   sortOrder: 4 },
  { id: "welle",    name: "Dauerwelle & Glättung",  icon: "Wind",      sortOrder: 5 },
  { id: "pflege",   name: "Pflege & Treatments",    icon: "Sparkles",  sortOrder: 6 },
  { id: "styling",  name: "Styling",                icon: "Star",      sortOrder: 7 },
  { id: "spezial",  name: "Spezial / Premium",      icon: "Crown",     sortOrder: 8 },
];

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  // ── Haarschnitt Damen ────────────────────────────────────
  { id: "d-kurz",    categoryId: "damen", name: "Damenhaarschnitt kurz",        durationMin: 45, durationMax: 45, priceMin: 35, priceMax: 45,  isOnlineBookable: true  },
  { id: "d-mittel",  categoryId: "damen", name: "Damenhaarschnitt mittellang",   durationMin: 60, durationMax: 60, priceMin: 45, priceMax: 65,  isOnlineBookable: true  },
  { id: "d-lang",    categoryId: "damen", name: "Damenhaarschnitt lang",         durationMin: 75, durationMax: 75, priceMin: 55, priceMax: 85,  isOnlineBookable: true  },
  { id: "d-xlang",   categoryId: "damen", name: "Damenhaarschnitt extra lang",   durationMin: 90, durationMax: 90, priceMin: 65, priceMax: 95,  isOnlineBookable: true  },
  { id: "d-pony",    categoryId: "damen", name: "Pony-Schnitt",                  durationMin: 15, durationMax: 15, priceMin: 12, priceMax: 18,  isOnlineBookable: true  },
  { id: "d-spitzen", categoryId: "damen", name: "Spitzen schneiden",             durationMin: 30, durationMax: 30, priceMin: 25, priceMax: 35,  isOnlineBookable: true  },
  { id: "d-bob",     categoryId: "damen", name: "Bob",                           durationMin: 60, durationMax: 60, priceMin: 45, priceMax: 65,  isOnlineBookable: true  },
  { id: "d-pixie",   categoryId: "damen", name: "Pixie Cut",                     durationMin: 45, durationMax: 45, priceMin: 38, priceMax: 52,  isOnlineBookable: true  },
  { id: "d-shag",    categoryId: "damen", name: "Shag",                          durationMin: 75, durationMax: 75, priceMin: 55, priceMax: 75,  isOnlineBookable: true  },

  // ── Haarschnitt Herren ───────────────────────────────────
  { id: "h-klass",   categoryId: "herren", name: "Herrenhaarschnitt klassisch",  durationMin: 30, durationMax: 30, priceMin: 22, priceMax: 28,  isOnlineBookable: true  },
  { id: "h-modern",  categoryId: "herren", name: "Herrenhaarschnitt modern",     durationMin: 45, durationMax: 45, priceMin: 28, priceMax: 38,  isOnlineBookable: true  },
  { id: "h-fade",    categoryId: "herren", name: "Fade",                         durationMin: 45, durationMax: 45, priceMin: 32, priceMax: 42,  isOnlineBookable: true  },
  { id: "h-skin",    categoryId: "herren", name: "Skin Fade",                    durationMin: 50, durationMax: 50, priceMin: 35, priceMax: 45,  isOnlineBookable: true  },
  { id: "h-under",   categoryId: "herren", name: "Undercut",                     durationMin: 40, durationMax: 40, priceMin: 30, priceMax: 40,  isOnlineBookable: true  },
  { id: "h-buzz",    categoryId: "herren", name: "Buzz Cut",                     durationMin: 15, durationMax: 15, priceMin: 15, priceMax: 20,  isOnlineBookable: true  },
  { id: "h-kid1",    categoryId: "herren", name: "Kinderhaarschnitt (bis 10 J.)",durationMin: 20, durationMax: 20, priceMin: 15, priceMax: 20,  isOnlineBookable: true  },
  { id: "h-kid2",    categoryId: "herren", name: "Kinderhaarschnitt (11–15 J.)", durationMin: 25, durationMax: 25, priceMin: 18, priceMax: 25,  isOnlineBookable: true  },
  { id: "h-senior",  categoryId: "herren", name: "Senior-Schnitt",               durationMin: 25, durationMax: 25, priceMin: 18, priceMax: 24,  isOnlineBookable: true  },

  // ── Bart & Rasur ─────────────────────────────────────────
  { id: "b-schnitt", categoryId: "bart", name: "Bartschnitt",                    durationMin: 20, durationMax: 20, priceMin: 12, priceMax: 18,  isOnlineBookable: true  },
  { id: "b-kontur",  categoryId: "bart", name: "Bart-Konturen",                  durationMin: 15, durationMax: 15, priceMin: 10, priceMax: 15,  isOnlineBookable: true  },
  { id: "b-nass",    categoryId: "bart", name: "Klassische Nassrasur",            durationMin: 30, durationMax: 30, priceMin: 18, priceMax: 28,  isOnlineBookable: true  },
  { id: "b-royal",   categoryId: "bart", name: "Royal Shave (Heißtuch)",         durationMin: 45, durationMax: 45, priceMin: 35, priceMax: 50,  isOnlineBookable: true  },
  { id: "b-farbe",   categoryId: "bart", name: "Bart färben",                    durationMin: 30, durationMax: 30, priceMin: 25, priceMax: 40,  isOnlineBookable: true  },

  // ── Coloration ───────────────────────────────────────────
  { id: "c-ansatz",  categoryId: "color", name: "Ansatzfarbe",                   durationMin: 60,  durationMax: 60,  priceMin: 45,  priceMax: 65,  isOnlineBookable: true  },
  { id: "c-vk",     categoryId: "color", name: "Vollcoloration kurz",            durationMin: 90,  durationMax: 90,  priceMin: 60,  priceMax: 85,  isOnlineBookable: true  },
  { id: "c-vm",     categoryId: "color", name: "Vollcoloration mittellang",      durationMin: 120, durationMax: 120, priceMin: 75,  priceMax: 110, isOnlineBookable: true  },
  { id: "c-vl",     categoryId: "color", name: "Vollcoloration lang",            durationMin: 150, durationMax: 150, priceMin: 95,  priceMax: 140, isOnlineBookable: true  },
  { id: "c-strk",   categoryId: "color", name: "Foliensträhnen kurz",            durationMin: 90,  durationMax: 90,  priceMin: 75,  priceMax: 110, isOnlineBookable: true  },
  { id: "c-strm",   categoryId: "color", name: "Foliensträhnen mittellang",      durationMin: 120, durationMax: 120, priceMin: 95,  priceMax: 140, isOnlineBookable: true  },
  { id: "c-strl",   categoryId: "color", name: "Foliensträhnen lang",            durationMin: 150, durationMax: 150, priceMin: 120, priceMax: 180, isOnlineBookable: true  },
  { id: "c-balay",  categoryId: "color", name: "Balayage",                       durationMin: 180, durationMax: 180, priceMin: 140, priceMax: 220, isOnlineBookable: true  },
  { id: "c-ombre",  categoryId: "color", name: "Ombré",                          durationMin: 180, durationMax: 180, priceMin: 140, priceMax: 220, isOnlineBookable: true  },
  { id: "c-high",   categoryId: "color", name: "Highlights klassisch",           durationMin: 120, durationMax: 120, priceMin: 90,  priceMax: 130, isOnlineBookable: true  },
  { id: "c-low",    categoryId: "color", name: "Lowlights",                      durationMin: 120, durationMax: 120, priceMin: 85,  priceMax: 125, isOnlineBookable: true  },
  { id: "c-bleach", categoryId: "color", name: "Blondierung Komplettbleach",     durationMin: 240, durationMax: 240, priceMin: 180, priceMax: 280, isOnlineBookable: false },
  { id: "c-korr",   categoryId: "color", name: "Farbkorrektur",                  durationMin: 240, durationMax: 240, priceMin: 150, priceMax: 350, isOnlineBookable: false },
  { id: "c-gloss",  categoryId: "color", name: "Glossing / Tönung",              durationMin: 45,  durationMax: 45,  priceMin: 35,  priceMax: 55,  isOnlineBookable: true  },

  // ── Dauerwelle & Glättung ────────────────────────────────
  { id: "w-dk",     categoryId: "welle", name: "Dauerwelle kurz",                durationMin: 90,  durationMax: 90,  priceMin: 75,  priceMax: 95,  isOnlineBookable: true  },
  { id: "w-dm",     categoryId: "welle", name: "Dauerwelle mittellang",          durationMin: 120, durationMax: 120, priceMin: 95,  priceMax: 130, isOnlineBookable: true  },
  { id: "w-dl",     categoryId: "welle", name: "Dauerwelle lang",                durationMin: 150, durationMax: 150, priceMin: 120, priceMax: 170, isOnlineBookable: true  },
  { id: "w-vol",    categoryId: "welle", name: "Volumenwelle (Ansatz)",          durationMin: 60,  durationMax: 60,  priceMin: 55,  priceMax: 75,  isOnlineBookable: true  },
  { id: "w-kerk",   categoryId: "welle", name: "Keratin-Glättung kurz",          durationMin: 120, durationMax: 120, priceMin: 150, priceMax: 200, isOnlineBookable: false },
  { id: "w-kerm",   categoryId: "welle", name: "Keratin-Glättung mittellang",    durationMin: 150, durationMax: 150, priceMin: 200, priceMax: 280, isOnlineBookable: false },
  { id: "w-kerl",   categoryId: "welle", name: "Keratin-Glättung lang",          durationMin: 180, durationMax: 180, priceMin: 250, priceMax: 350, isOnlineBookable: false },
  { id: "w-ola",    categoryId: "welle", name: "Olaplex-Behandlung",             durationMin: 45,  durationMax: 45,  priceMin: 35,  priceMax: 55,  isOnlineBookable: true  },

  // ── Pflege & Treatments ──────────────────────────────────
  { id: "p-wash",   categoryId: "pflege", name: "Waschen + Föhnen",              durationMin: 30, durationMax: 30, priceMin: 15, priceMax: 25,  isOnlineBookable: true  },
  { id: "p-mass",   categoryId: "pflege", name: "Kopfmassage",                   durationMin: 20, durationMax: 20, priceMin: 18, priceMax: 28,  isOnlineBookable: true  },
  { id: "p-kur",    categoryId: "pflege", name: "Haarkur intensiv",              durationMin: 30, durationMax: 30, priceMin: 25, priceMax: 40,  isOnlineBookable: true  },
  { id: "p-kopf",   categoryId: "pflege", name: "Kopfhautbehandlung",            durationMin: 45, durationMax: 45, priceMin: 35, priceMax: 55,  isOnlineBookable: true  },
  { id: "p-spitz",  categoryId: "pflege", name: "Haarspitzenpflege",             durationMin: 20, durationMax: 20, priceMin: 15, priceMax: 22,  isOnlineBookable: true  },
  { id: "p-oil",    categoryId: "pflege", name: "Hot Oil Treatment",             durationMin: 30, durationMax: 30, priceMin: 30, priceMax: 45,  isOnlineBookable: true  },

  // ── Styling ──────────────────────────────────────────────
  { id: "s-fk",     categoryId: "styling", name: "Föhnen kurz",                  durationMin: 20, durationMax: 20, priceMin: 18, priceMax: 25,  isOnlineBookable: true  },
  { id: "s-fm",     categoryId: "styling", name: "Föhnen mittellang",            durationMin: 30, durationMax: 30, priceMin: 25, priceMax: 35,  isOnlineBookable: true  },
  { id: "s-fl",     categoryId: "styling", name: "Föhnen lang",                  durationMin: 45, durationMax: 45, priceMin: 35, priceMax: 48,  isOnlineBookable: true  },
  { id: "s-hoch",   categoryId: "styling", name: "Hochsteckfrisur",              durationMin: 60, durationMax: 60, priceMin: 65, priceMax: 95,  isOnlineBookable: true  },
  { id: "s-braut",  categoryId: "styling", name: "Brautstyling",                 durationMin: 90, durationMax: 90, priceMin: 95, priceMax: 150, isOnlineBookable: true  },
  { id: "s-lock",   categoryId: "styling", name: "Locken",                       durationMin: 45, durationMax: 45, priceMin: 35, priceMax: 55,  isOnlineBookable: true  },
  { id: "s-glatt",  categoryId: "styling", name: "Glätten",                      durationMin: 30, durationMax: 30, priceMin: 25, priceMax: 38,  isOnlineBookable: true  },

  // ── Spezial / Premium ────────────────────────────────────
  { id: "x-berat",  categoryId: "spezial", name: "Beratungstermin (Coloration)", durationMin: 30,  durationMax: 30,  priceMin: 0,   priceMax: 25,  isOnlineBookable: true  },
  { id: "x-botox",  categoryId: "spezial", name: "Hair Botox",                   durationMin: 90,  durationMax: 90,  priceMin: 80,  priceMax: 120, isOnlineBookable: true  },
  { id: "x-ext",    categoryId: "spezial", name: "Extensions Anbringen",         durationMin: 240, durationMax: 240, priceMin: 250, priceMax: 500, isOnlineBookable: false },
  { id: "x-extp",   categoryId: "spezial", name: "Extensions Pflege",            durationMin: 60,  durationMax: 60,  priceMin: 45,  priceMax: 75,  isOnlineBookable: true  },
  { id: "x-micro",  categoryId: "spezial", name: "Microblading Augenbrauen",     durationMin: 90,  durationMax: 90,  priceMin: 250, priceMax: 400, isOnlineBookable: false },
  { id: "x-wimper", categoryId: "spezial", name: "Wimpernlifting",               durationMin: 45,  durationMax: 45,  priceMin: 55,  priceMax: 75,  isOnlineBookable: true  },
];
