/* Objects — category content */
window.KS_CATEGORY = {
  cat: { n: "04", name: "Objects" },
  intro: {
    label: "On the work",
    body: [
      "Things, alone on a table. ",
      { it: "Catalogued, weighed, returned to themselves" },
      " — vessels, linens, tools. Studio still-life as a way of paying attention."
    ],
  },
  pullQuote: {
    text: "Photograph the kettle long enough and the kettle photographs you back.",
    attr: "Studio note · 2024",
  },
  flow: [
    { kind: "full-bleed", photo: { tint: "#24211a", aspect: "wide",   subj: "Brass kettle, no. 4", loc: "Studio", yr: "2025" } },

    { kind: "asym",
      large: { tint: "#26231c", aspect: "tall", subj: "Vessels, set of eight", loc: "Studio", yr: "2024" },
      smalls: [
        { tint: "#221f18", aspect: "square", subj: "Cup, single",  loc: "Studio", yr: "2024" },
        { tint: "#1e1c16", aspect: "square", subj: "Cup, two",     loc: "Studio", yr: "2024" },
      ],
    },

    { kind: "centered-tall",
      photo: { tint: "#22201a", aspect: "portrait", subj: "Linen, folded", loc: "Studio", yr: "2024" },
      side: { num: "07", text: "From the catalogue series. Phase One, 120mm macro, north-window light." },
    },

    { kind: "three-up", photos: [
      { tint: "#24211a", aspect: "tall", subj: "Knife, oak handle", loc: "Studio", yr: "2025" },
      { tint: "#1e1c16", aspect: "tall", subj: "Spoon, brass",       loc: "Studio", yr: "2025" },
      { tint: "#26231c", aspect: "tall", subj: "Tongs, salvaged",    loc: "Studio", yr: "2025" },
    ]},

    { kind: "pull-quote" },

    { kind: "full-bleed-pano", photo: { tint: "#1e1c16", aspect: "pano", subj: "The full catalogue · 48 objects", loc: "Studio", yr: "2024" } },

    { kind: "diptych", photos: [
      { tint: "#24211a", aspect: "square", subj: "Empty bowl",  loc: "Studio", yr: "2024" },
      { tint: "#221f18", aspect: "square", subj: "Full bowl",   loc: "Studio", yr: "2024" },
    ]},

    { kind: "duo", photos: [
      { tint: "#26231c", aspect: "wide", subj: "Linen, white", loc: "Studio", yr: "2024" },
      { tint: "#22201a", aspect: "wide", subj: "Linen, ecru",  loc: "Studio", yr: "2024" },
    ]},

    { kind: "offset",
      photo: { tint: "#1e1c16", aspect: "portrait", subj: "Salt cellar, single", loc: "Studio", yr: "2025" },
      text: "A working archive — partial, particular, never finished.",
    },

    { kind: "full-bleed", photo: { tint: "#24211a", aspect: "wide", subj: "Table, after the shoot", loc: "Studio", yr: "2025" } },
  ],

  projects: [
    {
      id: "vessels",
      title: "Vessels",
      it: "set of eight",
      yr: "2024",
      loc: "Studio",
      count: 24,
      tint: "#26231c",
      desc: "Eight hand-thrown vessels by potter Hye-Jin Park, photographed individually and as a set under identical light over three weeks.",
    },
    {
      id: "linen",
      title: "Linen",
      it: "fold studies",
      yr: "2024",
      loc: "Studio",
      count: 36,
      tint: "#22201a",
      desc: "Three dozen photographs of a single piece of linen, folded and refolded. A study in tone and shadow.",
    },
    {
      id: "catalogue",
      title: "The Catalogue",
      it: "forty-eight objects",
      yr: "2024",
      loc: "Studio",
      count: 48,
      tint: "#1e1c16",
      desc: "A reference archive of forty-eight everyday objects, shot from identical angles and distances. Made for a forthcoming monograph.",
    },
    {
      id: "kitchen-tools",
      title: "Kitchen tools",
      it: "an inventory",
      yr: "2025",
      loc: "Studio",
      count: 30,
      tint: "#24211a",
      desc: "Knives, spoons, tongs, brushes — the tools chef Niloofar K. has carried between five kitchens over twenty years.",
    },
  ],
};
