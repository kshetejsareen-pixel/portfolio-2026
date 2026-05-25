/* Culinary — category content */
window.KS_CATEGORY = {
  cat: { n: "02", name: "Culinary" },
  intro: {
    label: "On the work",
    body: [
      "Five years between studio and kitchen pass, photographing the moments before service ",
      { it: "and the quiet ones after." },
      " A working archive of ingredients, hands, light, and the small accidents that make a plate worth keeping."
    ],
  },
  pullQuote: {
    text: "Cooking is mostly waiting. The photograph is the wait, made visible.",
    attr: "Studio note · 2024",
  },
  // Editorial flow rows
  flow: [
    { kind: "full-bleed", photo: { tint: "#3a2a1c", aspect: "wide",   subj: "Stone fruit, late summer", loc: "Mallorca",    yr: "2025" } },

    { kind: "asym",
      large: { tint: "#2a1f17", aspect: "tall",  subj: "Brick lane kitchen pass", loc: "London E1", yr: "2024" },
      smalls: [
        { tint: "#3a2418", aspect: "square", subj: "Mise en place",  loc: "Studio",       yr: "2024" },
        { tint: "#1f1814", aspect: "square", subj: "Cast iron, no. 3", loc: "Studio",     yr: "2024" },
      ],
    },

    { kind: "centered-tall",
      photo: { tint: "#2a1814", aspect: "portrait", subj: "Persimmons, after rain", loc: "Kyoto", yr: "2024" },
      side: { num: "07", text: "Untitled, from the fruit table series. 4×5 large format, Velvia 50." },
    },

    { kind: "three-up", photos: [
      { tint: "#3a2e1a", aspect: "tall",   subj: "Oil & paprika",     loc: "Sevilla",   yr: "2023" },
      { tint: "#241a14", aspect: "tall",   subj: "Bread, day three",  loc: "Studio",    yr: "2024" },
      { tint: "#4a2e1a", aspect: "tall",   subj: "Saffron threads",   loc: "Studio",    yr: "2024" },
    ]},

    { kind: "pull-quote" },

    { kind: "full-bleed-pano", photo: { tint: "#1f1a14", aspect: "pano", subj: "Twelve, before service", loc: "Copenhagen", yr: "2023" } },

    { kind: "diptych", photos: [
      { tint: "#2a1f17", aspect: "square", subj: "Hands, hers",       loc: "Tehran",    yr: "2023" },
      { tint: "#3a2a1c", aspect: "square", subj: "Hands, his",        loc: "Tehran",    yr: "2023" },
    ]},

    { kind: "duo", photos: [
      { tint: "#2c2014", aspect: "wide", subj: "Tomato, beefsteak",   loc: "Long Island", yr: "2024" },
      { tint: "#1f1a14", aspect: "wide", subj: "Tomato, sungold",     loc: "Long Island", yr: "2024" },
    ]},

    { kind: "offset",
      photo: { tint: "#2a1814", aspect: "portrait", subj: "Knife, oak handle", loc: "Studio", yr: "2025" },
      text: "A working archive — partial, particular, never finished.",
    },

    { kind: "full-bleed", photo: { tint: "#3a2418", aspect: "wide", subj: "Last light, kitchen window", loc: "Bombay", yr: "2025" } },
  ],

  // Projects shown at bottom
  projects: [
    {
      id: "twelve",
      title: "Twelve",
      it: "before service",
      yr: "2023",
      loc: "Copenhagen",
      count: 42,
      tint: "#1f1a14",
      desc: "A residency at a single-seating restaurant. Forty-two frames made in the hour before twelve guests arrived for dinner.",
    },
    {
      id: "fruit-table",
      title: "The Fruit Table",
      it: "studies",
      yr: "2024",
      loc: "Studio · Kyoto",
      count: 28,
      tint: "#2a1814",
      desc: "An ongoing study of seasonal fruit photographed on a single Japanese pine table, large-format, ambient light only.",
    },
    {
      id: "passing",
      title: "Passing",
      it: "kitchens of London",
      yr: "2024",
      loc: "London",
      count: 60,
      tint: "#2a1f17",
      desc: "Six kitchens, twelve shifts, sixty frames. A portrait of the working line at the pass — the moment a plate leaves the kitchen.",
    },
    {
      id: "hands",
      title: "Hands",
      it: "a tabletop book",
      yr: "2023",
      loc: "Tehran · Studio",
      count: 36,
      tint: "#3a2a1c",
      desc: "A collaboration with chef Niloofar K. Thirty-six photographs of hands at work — kneading, sorting, pouring, plating.",
    },
  ],
};
