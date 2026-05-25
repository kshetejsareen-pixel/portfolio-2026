/* Spaces — category content */
window.KS_CATEGORY = {
  cat: { n: "03", name: "Spaces" },
  intro: {
    label: "On the work",
    body: [
      "Rooms, mostly empty. ",
      { it: "Interiors photographed when no one is using them" },
      " — the chairs pushed in, the light arriving sideways, the dust caught in mid-air. Architecture as portraiture."
    ],
  },
  pullQuote: {
    text: "A room is a person, photographed in absence.",
    attr: "Studio note · 2025",
  },
  flow: [
    { kind: "full-bleed", photo: { tint: "#1a2226", aspect: "wide",   subj: "Marble stair, north light", loc: "Tribeca Loft", yr: "2025" } },

    { kind: "asym",
      large: { tint: "#1c2428", aspect: "tall", subj: "Atelier, morning", loc: "Lisbon", yr: "2024" },
      smalls: [
        { tint: "#181f23", aspect: "square", subj: "Table, after lunch", loc: "Lisbon", yr: "2024" },
        { tint: "#161c1f", aspect: "square", subj: "Window, north",      loc: "Lisbon", yr: "2024" },
      ],
    },

    { kind: "centered-tall",
      photo: { tint: "#16191d", aspect: "portrait", subj: "Concrete chapel", loc: "Tadao Ando, Naoshima", yr: "2023" },
      side: { num: "07", text: "From the sacred spaces series. Mamiya 7, 65mm, ambient daylight only." },
    },

    { kind: "three-up", photos: [
      { tint: "#1a2226", aspect: "tall", subj: "Library, west wing",   loc: "Cambridge",  yr: "2023" },
      { tint: "#171c1f", aspect: "tall", subj: "Stair, marble",         loc: "Roma",       yr: "2024" },
      { tint: "#1c2428", aspect: "tall", subj: "Kitchen, empty",        loc: "Aarhus",     yr: "2024" },
    ]},

    { kind: "pull-quote" },

    { kind: "full-bleed-pano", photo: { tint: "#161c1f", aspect: "pano", subj: "Auditorium, before talk", loc: "Helsinki", yr: "2024" } },

    { kind: "diptych", photos: [
      { tint: "#1a2226", aspect: "square", subj: "Door, open",   loc: "Lisbon", yr: "2024" },
      { tint: "#181f23", aspect: "square", subj: "Door, closed", loc: "Lisbon", yr: "2024" },
    ]},

    { kind: "duo", photos: [
      { tint: "#1c2428", aspect: "wide", subj: "Pool, empty",   loc: "Mexico City", yr: "2025" },
      { tint: "#161c1f", aspect: "wide", subj: "Court, empty",  loc: "Mexico City", yr: "2025" },
    ]},

    { kind: "offset",
      photo: { tint: "#1a2226", aspect: "portrait", subj: "Chapel, lower nave", loc: "Naoshima", yr: "2023" },
      text: "Light, made architecture.",
    },

    { kind: "full-bleed", photo: { tint: "#181f23", aspect: "wide", subj: "Hall, last light", loc: "Lisbon", yr: "2024" } },
  ],

  projects: [
    {
      id: "tadao",
      title: "Tadao",
      it: "Naoshima",
      yr: "2023",
      loc: "Naoshima, Japan",
      count: 32,
      tint: "#16191d",
      desc: "A two-week residency photographing Tadao Ando's concrete works on the art island. Long exposures, no people, the building as subject.",
    },
    {
      id: "domestic-light",
      title: "Domestic light",
      it: "twelve homes",
      yr: "2024",
      loc: "Lisbon",
      count: 48,
      tint: "#1c2428",
      desc: "Twelve homes across Lisbon, photographed at the same hour over twelve months. Same light, twelve different lives.",
    },
    {
      id: "loft",
      title: "Loft",
      it: "an apartment over a year",
      yr: "2025",
      loc: "Tribeca",
      count: 60,
      tint: "#1a2226",
      desc: "One Tribeca loft, twelve site visits, sixty interiors. A portrait of a single space across four seasons.",
    },
    {
      id: "sacred",
      title: "Sacred",
      it: "rooms set apart",
      yr: "2024",
      loc: "Various",
      count: 28,
      tint: "#181f23",
      desc: "Churches, temples, prayer halls, library reading rooms — spaces that ask for quiet. Photographed without people.",
    },
  ],
};
