/* Portraits — category content */
window.KS_CATEGORY = {
  cat: { n: "01", name: "Portraits" },
  intro: {
    label: "On the work",
    body: [
      "Faces, mostly. Made in studio and on location, ",
      { it: "the way someone holds their hands when nobody is looking." },
      " A working archive of strangers, friends, sitters who agreed to thirty quiet minutes in front of a lens."
    ],
  },
  pullQuote: {
    text: "A portrait is a transaction. The sitter gives an hour; the photographer gives them back to themselves.",
    attr: "Studio note · 2023",
  },
  flow: [
    { kind: "full-bleed", photo: { tint: "#1d1c1a", aspect: "wide",   subj: "Eli, between takes", loc: "Brooklyn Studio", yr: "2025" } },

    { kind: "asym",
      large:  { tint: "#1a1815", aspect: "tall",  subj: "Mira, late afternoon", loc: "Bombay", yr: "2025" },
      smalls: [
        { tint: "#22201d", aspect: "square", subj: "Mira, no. 2",   loc: "Bombay",    yr: "2025" },
        { tint: "#161513", aspect: "square", subj: "Mira, hands",   loc: "Bombay",    yr: "2025" },
      ],
    },

    { kind: "centered-tall",
      photo: { tint: "#1e1c19", aspect: "portrait", subj: "Jonas, porch", loc: "Catskills, NY", yr: "2024" },
      side: { num: "07", text: "From the long-form series. Pentax 67, 105mm, ambient porch light, no fill." },
    },

    { kind: "three-up", photos: [
      { tint: "#1a1916", aspect: "tall", subj: "Sade",   loc: "Studio · Vol. iv", yr: "2024" },
      { tint: "#1d1b18", aspect: "tall", subj: "Imran",  loc: "Mehrauli",         yr: "2023" },
      { tint: "#171614", aspect: "tall", subj: "Niloofar", loc: "Tehran",         yr: "2023" },
    ]},

    { kind: "pull-quote" },

    { kind: "full-bleed-pano", photo: { tint: "#16151a", aspect: "pano", subj: "Choir, before rehearsal", loc: "St. Mark&apos;s, NYC", yr: "2024" } },

    { kind: "diptych", photos: [
      { tint: "#1c1a17", aspect: "square", subj: "Twins · Maya",  loc: "Studio", yr: "2024" },
      { tint: "#1a1815", aspect: "square", subj: "Twins · Mira",  loc: "Studio", yr: "2024" },
    ]},

    { kind: "duo", photos: [
      { tint: "#1e1c19", aspect: "wide", subj: "Reader, no. 1",  loc: "Lisbon",   yr: "2024" },
      { tint: "#1a1816", aspect: "wide", subj: "Reader, no. 2",  loc: "Lisbon",   yr: "2024" },
    ]},

    { kind: "offset",
      photo: { tint: "#1c1a17", aspect: "portrait", subj: "Self, late", loc: "Studio mirror", yr: "2025" },
      text: "What stays, after the sitter has gone.",
    },

    { kind: "full-bleed", photo: { tint: "#1a1815", aspect: "wide", subj: "Last light, studio north", loc: "Brooklyn", yr: "2025" } },
  ],

  projects: [
    {
      id: "long-form",
      title: "Long form",
      it: "twelve sittings",
      yr: "2024",
      loc: "Studio · Various",
      count: 84,
      tint: "#1a1816",
      desc: "Twelve sitters, an hour each, six rolls of medium-format film per session. The portraits that survived the cut.",
    },
    {
      id: "strangers",
      title: "Strangers",
      it: "an open call",
      yr: "2023",
      loc: "Bombay · NYC",
      count: 56,
      tint: "#1d1b18",
      desc: "A monthlong project advertising free thirty-minute sittings to anyone who showed up. No prep, no styling, ambient light only.",
    },
    {
      id: "editors",
      title: "Editors",
      it: "publishing portraits",
      yr: "2025",
      loc: "London · NYC",
      count: 24,
      tint: "#22201d",
      desc: "Commissioned portraits of magazine and book editors — at desk, at home, in the spaces they make decisions.",
    },
    {
      id: "the-studio",
      title: "The Studio",
      it: "self portraits",
      yr: "2021&mdash;2026",
      loc: "Brooklyn",
      count: 38,
      tint: "#161513",
      desc: "A five-year self-portrait project. One frame a month, same chair, same window. The slow record of staying.",
    },
  ],
};
