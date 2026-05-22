export type FlowPhoto = {
  tint: string
  aspect: 'wide' | 'square' | 'tall' | 'pano' | 'portrait'
  subj: string
  loc: string
  yr: string
  image?: string
}

export type FlowRow =
  | { kind: 'full-bleed'; photo: FlowPhoto }
  | { kind: 'full-bleed-pano'; photo: FlowPhoto }
  | { kind: 'asym'; large: FlowPhoto; smalls: FlowPhoto[] }
  | { kind: 'centered-tall'; photo: FlowPhoto; side?: { text: string } }
  | { kind: 'three-up'; photos: FlowPhoto[] }
  | { kind: 'diptych'; photos: FlowPhoto[] }
  | { kind: 'duo'; photos: FlowPhoto[] }
  | { kind: 'offset'; photo: FlowPhoto; text: string }
  | { kind: 'pull-quote' }

export type IntroPart = string | { it: string }

export interface Project {
  id: string
  title: string
  it?: string
  yr: string
  loc: string
  count: number
  tint: string
  desc: string
  image?: string
}

export interface CategoryData {
  cat: { n: string; name: string }
  intro: { label: string; body: IntroPart[] }
  pullQuote: { text: string; attr: string }
  flow: FlowRow[]
  projects: Project[]
}

export const portraitsData: CategoryData = {
  cat: { n: '03', name: 'Portraits' },
  intro: {
    label: 'On the work',
    body: [
      'Faces, mostly. Made in studio and on location, ',
      { it: 'the way someone holds their hands when nobody is looking.' },
      ' A working archive of strangers, friends, sitters who agreed to thirty quiet minutes in front of a lens.',
    ],
  },
  pullQuote: {
    text: 'A portrait is a transaction. The sitter gives an hour; the photographer gives them back to themselves.',
    attr: 'Studio note · 2023',
  },
  flow: [
    { kind: 'full-bleed', photo: { tint: '#1d1c1a', aspect: 'wide', subj: 'Eli, between takes', loc: 'Brooklyn Studio', yr: '2025' } },

    {
      kind: 'asym',
      large: { tint: '#1a1815', aspect: 'tall', subj: 'Mira, late afternoon', loc: 'Bombay', yr: '2025' },
      smalls: [
        { tint: '#22201d', aspect: 'square', subj: 'Mira, no. 2', loc: 'Bombay', yr: '2025' },
        { tint: '#161513', aspect: 'square', subj: 'Mira, hands', loc: 'Bombay', yr: '2025' },
      ],
    },

    {
      kind: 'centered-tall',
      photo: { tint: '#1e1c19', aspect: 'portrait', subj: 'Jonas, porch', loc: 'Catskills, NY', yr: '2024' },
      side: { text: 'From the long-form series. Pentax 67, 105mm, ambient porch light, no fill.' },
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#1a1916', aspect: 'tall', subj: 'Sade', loc: 'Studio · Vol. iv', yr: '2024' },
        { tint: '#1d1b18', aspect: 'tall', subj: 'Imran', loc: 'Mehrauli', yr: '2023' },
        { tint: '#171614', aspect: 'tall', subj: 'Niloofar', loc: 'Tehran', yr: '2023' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#16151a', aspect: 'pano', subj: 'Choir, before rehearsal', loc: "St. Mark's, NYC", yr: '2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#1c1a17', aspect: 'square', subj: 'Twins · Maya', loc: 'Studio', yr: '2024' },
        { tint: '#1a1815', aspect: 'square', subj: 'Twins · Mira', loc: 'Studio', yr: '2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#1e1c19', aspect: 'wide', subj: 'Reader, no. 1', loc: 'Lisbon', yr: '2024' },
        { tint: '#1a1816', aspect: 'wide', subj: 'Reader, no. 2', loc: 'Lisbon', yr: '2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1c1a17', aspect: 'portrait', subj: 'Self, late', loc: 'Studio mirror', yr: '2025' },
      text: 'What stays, after the sitter has gone.',
    },

    { kind: 'full-bleed', photo: { tint: '#1a1815', aspect: 'wide', subj: 'Last light, studio north', loc: 'Brooklyn', yr: '2025' } },
  ],

  projects: [
    {
      id: 'long-form',
      title: 'Long form',
      it: 'twelve sittings',
      yr: '2024',
      loc: 'Studio · Various',
      count: 84,
      tint: '#1a1816',
      desc: 'Twelve sitters, an hour each, six rolls of medium-format film per session. The portraits that survived the cut.',
    },
    {
      id: 'strangers',
      title: 'Strangers',
      it: 'an open call',
      yr: '2023',
      loc: 'Bombay · NYC',
      count: 56,
      tint: '#1d1b18',
      desc: 'A monthlong project advertising free thirty-minute sittings to anyone who showed up. No prep, no styling, ambient light only.',
    },
    {
      id: 'editors',
      title: 'Editors',
      it: 'publishing portraits',
      yr: '2025',
      loc: 'London · NYC',
      count: 24,
      tint: '#22201d',
      desc: 'Commissioned portraits of magazine and book editors — at desk, at home, in the spaces they make decisions.',
    },
    {
      id: 'the-studio',
      title: 'The Studio',
      it: 'self portraits',
      yr: '2021—2026',
      loc: 'Brooklyn',
      count: 38,
      tint: '#161513',
      desc: 'A five-year self-portrait project. One frame a month, same chair, same window. The slow record of staying.',
    },
  ],
}

export const culinaryData: CategoryData = {
  cat: { n: '01', name: 'Culinary' },
  intro: {
    label: 'On the work',
    body: [
      'Five years between studio and kitchen pass, photographing the moments before service ',
      { it: 'and the quiet ones after.' },
      ' A working archive of ingredients, hands, light, and the small accidents that make a plate worth keeping.',
    ],
  },
  pullQuote: {
    text: 'Cooking is mostly waiting. The photograph is the wait, made visible.',
    attr: 'Studio note · 2024',
  },
  flow: [
    { kind: 'full-bleed', photo: { tint: '#3a2a1c', aspect: 'wide', subj: 'Stone fruit, late summer', loc: 'Mallorca', yr: '2025' } },

    {
      kind: 'asym',
      large: { tint: '#2a1f17', aspect: 'tall', subj: 'Brick lane kitchen pass', loc: 'London E1', yr: '2024' },
      smalls: [
        { tint: '#3a2418', aspect: 'square', subj: 'Mise en place', loc: 'Studio', yr: '2024' },
        { tint: '#1f1814', aspect: 'square', subj: 'Cast iron, no. 3', loc: 'Studio', yr: '2024' },
      ],
    },

    {
      kind: 'centered-tall',
      photo: { tint: '#2a1814', aspect: 'portrait', subj: 'Persimmons, after rain', loc: 'Kyoto', yr: '2024' },
      side: { text: 'Untitled, from the fruit table series. 4×5 large format, Velvia 50.' },
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#3a2e1a', aspect: 'tall', subj: 'Oil & paprika', loc: 'Sevilla', yr: '2023' },
        { tint: '#241a14', aspect: 'tall', subj: 'Bread, day three', loc: 'Studio', yr: '2024' },
        { tint: '#4a2e1a', aspect: 'tall', subj: 'Saffron threads', loc: 'Studio', yr: '2024' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#1f1a14', aspect: 'pano', subj: 'Twelve, before service', loc: 'Copenhagen', yr: '2023' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#2a1f17', aspect: 'square', subj: 'Hands, hers', loc: 'Tehran', yr: '2023' },
        { tint: '#3a2a1c', aspect: 'square', subj: 'Hands, his', loc: 'Tehran', yr: '2023' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#2c2014', aspect: 'wide', subj: 'Tomato, beefsteak', loc: 'Long Island', yr: '2024' },
        { tint: '#1f1a14', aspect: 'wide', subj: 'Tomato, sungold', loc: 'Long Island', yr: '2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#2a1814', aspect: 'portrait', subj: 'Knife, oak handle', loc: 'Studio', yr: '2025' },
      text: 'A working archive — partial, particular, never finished.',
    },

    { kind: 'full-bleed', photo: { tint: '#3a2418', aspect: 'wide', subj: 'Last light, kitchen window', loc: 'Bombay', yr: '2025' } },
  ],

  projects: [
    {
      id: 'twelve',
      title: 'Twelve',
      it: 'before service',
      yr: '2023',
      loc: 'Copenhagen',
      count: 42,
      tint: '#1f1a14',
      desc: 'A residency at a single-seating restaurant. Forty-two frames made in the hour before twelve guests arrived for dinner.',
    },
    {
      id: 'fruit-table',
      title: 'The Fruit Table',
      it: 'studies',
      yr: '2024',
      loc: 'Studio · Kyoto',
      count: 28,
      tint: '#2a1814',
      desc: 'An ongoing study of seasonal fruit photographed on a single Japanese pine table, large-format, ambient light only.',
    },
    {
      id: 'passing',
      title: 'Passing',
      it: 'kitchens of London',
      yr: '2024',
      loc: 'London',
      count: 60,
      tint: '#2a1f17',
      desc: 'Six kitchens, twelve shifts, sixty frames. A portrait of the working line at the pass — the moment a plate leaves the kitchen.',
    },
    {
      id: 'hands',
      title: 'Hands',
      it: 'a tabletop book',
      yr: '2023',
      loc: 'Tehran · Studio',
      count: 36,
      tint: '#3a2a1c',
      desc: 'A collaboration with chef Niloofar K. Thirty-six photographs of hands at work — kneading, sorting, pouring, plating.',
    },
  ],
}

export const spacesData: CategoryData = {
  cat: { n: '02', name: 'Spaces' },
  intro: {
    label: 'On the work',
    body: [
      'Rooms, mostly empty. ',
      { it: 'Interiors photographed when no one is using them' },
      ' — the chairs pushed in, the light arriving sideways, the dust caught in mid-air. Architecture as portraiture.',
    ],
  },
  pullQuote: {
    text: 'A room is a person, photographed in absence.',
    attr: 'Studio note · 2025',
  },
  flow: [
    { kind: 'full-bleed', photo: { tint: '#1a2226', aspect: 'wide', subj: 'Marble stair, north light', loc: 'Tribeca Loft', yr: '2025' } },

    {
      kind: 'asym',
      large: { tint: '#1c2428', aspect: 'tall', subj: 'Atelier, morning', loc: 'Lisbon', yr: '2024' },
      smalls: [
        { tint: '#181f23', aspect: 'square', subj: 'Table, after lunch', loc: 'Lisbon', yr: '2024' },
        { tint: '#161c1f', aspect: 'square', subj: 'Window, north', loc: 'Lisbon', yr: '2024' },
      ],
    },

    {
      kind: 'centered-tall',
      photo: { tint: '#16191d', aspect: 'portrait', subj: 'Concrete chapel', loc: 'Tadao Ando, Naoshima', yr: '2023' },
      side: { text: 'From the sacred spaces series. Mamiya 7, 65mm, ambient daylight only.' },
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#1a2226', aspect: 'tall', subj: 'Library, west wing', loc: 'Cambridge', yr: '2023' },
        { tint: '#171c1f', aspect: 'tall', subj: 'Stair, marble', loc: 'Roma', yr: '2024' },
        { tint: '#1c2428', aspect: 'tall', subj: 'Kitchen, empty', loc: 'Aarhus', yr: '2024' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#161c1f', aspect: 'pano', subj: 'Auditorium, before talk', loc: 'Helsinki', yr: '2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#1a2226', aspect: 'square', subj: 'Door, open', loc: 'Lisbon', yr: '2024' },
        { tint: '#181f23', aspect: 'square', subj: 'Door, closed', loc: 'Lisbon', yr: '2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#1c2428', aspect: 'wide', subj: 'Pool, empty', loc: 'Mexico City', yr: '2025' },
        { tint: '#161c1f', aspect: 'wide', subj: 'Court, empty', loc: 'Mexico City', yr: '2025' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1a2226', aspect: 'portrait', subj: 'Chapel, lower nave', loc: 'Naoshima', yr: '2023' },
      text: 'Light, made architecture.',
    },

    { kind: 'full-bleed', photo: { tint: '#181f23', aspect: 'wide', subj: 'Hall, last light', loc: 'Lisbon', yr: '2024' } },
  ],

  projects: [
    {
      id: 'tadao',
      title: 'Tadao',
      it: 'Naoshima',
      yr: '2023',
      loc: 'Naoshima, Japan',
      count: 32,
      tint: '#16191d',
      desc: 'A two-week residency photographing Tadao Ando\'s concrete works on the art island. Long exposures, no people, the building as subject.',
    },
    {
      id: 'domestic-light',
      title: 'Domestic light',
      it: 'twelve homes',
      yr: '2024',
      loc: 'Lisbon',
      count: 48,
      tint: '#1c2428',
      desc: 'Twelve homes across Lisbon, photographed at the same hour over twelve months. Same light, twelve different lives.',
    },
    {
      id: 'loft',
      title: 'Loft',
      it: 'an apartment over a year',
      yr: '2025',
      loc: 'Tribeca',
      count: 60,
      tint: '#1a2226',
      desc: 'One Tribeca loft, twelve site visits, sixty interiors. A portrait of a single space across four seasons.',
    },
    {
      id: 'sacred',
      title: 'Sacred',
      it: 'rooms set apart',
      yr: '2024',
      loc: 'Various',
      count: 28,
      tint: '#181f23',
      desc: 'Churches, temples, prayer halls, library reading rooms — spaces that ask for quiet. Photographed without people.',
    },
  ],
}

export const objectsData: CategoryData = {
  cat: { n: '04', name: 'Products' },
  intro: {
    label: 'On the work',
    body: [
      'Things, alone on a table. ',
      { it: 'Catalogued, weighed, returned to themselves' },
      ' — vessels, linens, tools. Studio still-life as a way of paying attention.',
    ],
  },
  pullQuote: {
    text: 'Photograph the kettle long enough and the kettle photographs you back.',
    attr: 'Studio note · 2024',
  },
  flow: [
    { kind: 'full-bleed', photo: { tint: '#24211a', aspect: 'wide', subj: 'Brass kettle, no. 4', loc: 'Studio', yr: '2025' } },

    {
      kind: 'asym',
      large: { tint: '#26231c', aspect: 'tall', subj: 'Vessels, set of eight', loc: 'Studio', yr: '2024' },
      smalls: [
        { tint: '#221f18', aspect: 'square', subj: 'Cup, single', loc: 'Studio', yr: '2024' },
        { tint: '#1e1c16', aspect: 'square', subj: 'Cup, two', loc: 'Studio', yr: '2024' },
      ],
    },

    {
      kind: 'centered-tall',
      photo: { tint: '#22201a', aspect: 'portrait', subj: 'Linen, folded', loc: 'Studio', yr: '2024' },
      side: { text: 'From the catalogue series. Phase One, 120mm macro, north-window light.' },
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#24211a', aspect: 'tall', subj: 'Knife, oak handle', loc: 'Studio', yr: '2025' },
        { tint: '#1e1c16', aspect: 'tall', subj: 'Spoon, brass', loc: 'Studio', yr: '2025' },
        { tint: '#26231c', aspect: 'tall', subj: 'Tongs, salvaged', loc: 'Studio', yr: '2025' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#1e1c16', aspect: 'pano', subj: 'The full catalogue · 48 objects', loc: 'Studio', yr: '2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#24211a', aspect: 'square', subj: 'Empty bowl', loc: 'Studio', yr: '2024' },
        { tint: '#221f18', aspect: 'square', subj: 'Full bowl', loc: 'Studio', yr: '2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#26231c', aspect: 'wide', subj: 'Linen, white', loc: 'Studio', yr: '2024' },
        { tint: '#22201a', aspect: 'wide', subj: 'Linen, ecru', loc: 'Studio', yr: '2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1e1c16', aspect: 'portrait', subj: 'Salt cellar, single', loc: 'Studio', yr: '2025' },
      text: 'A working archive — partial, particular, never finished.',
    },

    { kind: 'full-bleed', photo: { tint: '#24211a', aspect: 'wide', subj: 'Table, after the shoot', loc: 'Studio', yr: '2025' } },
  ],

  projects: [
    {
      id: 'vessels',
      title: 'Vessels',
      it: 'set of eight',
      yr: '2024',
      loc: 'Studio',
      count: 24,
      tint: '#26231c',
      desc: 'Eight hand-thrown vessels by potter Hye-Jin Park, photographed individually and as a set under identical light over three weeks.',
    },
    {
      id: 'linen',
      title: 'Linen',
      it: 'fold studies',
      yr: '2024',
      loc: 'Studio',
      count: 36,
      tint: '#22201a',
      desc: 'Three dozen photographs of a single piece of linen, folded and refolded. A study in tone and shadow.',
    },
    {
      id: 'catalogue',
      title: 'The Catalogue',
      it: 'forty-eight objects',
      yr: '2024',
      loc: 'Studio',
      count: 48,
      tint: '#1e1c16',
      desc: 'A reference archive of forty-eight everyday objects, shot from identical angles and distances. Made for a forthcoming monograph.',
    },
    {
      id: 'kitchen-tools',
      title: 'Kitchen tools',
      it: 'an inventory',
      yr: '2025',
      loc: 'Studio',
      count: 30,
      tint: '#24211a',
      desc: 'Knives, spoons, tongs, brushes — the tools chef Niloofar K. has carried between five kitchens over twenty years.',
    },
  ],
}

export const motionData: CategoryData = {
  cat: { n: '05', name: 'Motion' },
  intro: {
    label: 'On the work',
    body: [
      'Moving pictures, slowly. ',
      { it: 'Short films, loops, single-shot studies' },
      ' — work made on the side of the still camera, mostly 8mm and 16mm, sometimes ARRI.',
    ],
  },
  pullQuote: {
    text: 'Twenty-four still frames a second is a still photograph, taking its time.',
    attr: 'Studio note · 2025',
  },
  flow: [
    { kind: 'full-bleed', photo: { tint: '#0f1418', aspect: 'wide', subj: 'Rain, 24fps', loc: 'Bombay Monsoon', yr: '2024' } },

    {
      kind: 'asym',
      large: { tint: '#12161a', aspect: 'tall', subj: 'Loop · 8mm', loc: 'Goa', yr: '2023' },
      smalls: [
        { tint: '#0c1115', aspect: 'square', subj: 'Frame · 04 / 240', loc: 'Goa', yr: '2023' },
        { tint: '#101418', aspect: 'square', subj: 'Frame · 88 / 240', loc: 'Goa', yr: '2023' },
      ],
    },

    {
      kind: 'centered-tall',
      photo: { tint: '#0e1216', aspect: 'portrait', subj: 'Single-shot · sixty seconds', loc: 'Marfa, TX', yr: '2024' },
      side: { text: 'Bolex H16, 16mm, Tri-X reversal. One continuous take, no edit.' },
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#0f1418', aspect: 'tall', subj: 'Curtain · loop', loc: 'Studio', yr: '2025' },
        { tint: '#12161a', aspect: 'tall', subj: 'Hand · loop', loc: 'Studio', yr: '2025' },
        { tint: '#0c1115', aspect: 'tall', subj: 'Window · loop', loc: 'Studio', yr: '2025' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#101418', aspect: 'pano', subj: 'Monsoon · twelve minutes', loc: 'Bombay', yr: '2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#0f1418', aspect: 'square', subj: 'Before', loc: 'Marfa', yr: '2024' },
        { tint: '#12161a', aspect: 'square', subj: 'After', loc: 'Marfa', yr: '2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#0c1115', aspect: 'wide', subj: 'Tide, incoming', loc: 'Goa', yr: '2023' },
        { tint: '#0e1216', aspect: 'wide', subj: 'Tide, outgoing', loc: 'Goa', yr: '2023' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#101418', aspect: 'portrait', subj: 'Smoke, slow', loc: 'Studio', yr: '2025' },
      text: 'Time, given a frame.',
    },

    { kind: 'full-bleed', photo: { tint: '#0f1418', aspect: 'wide', subj: 'Last reel, ARRI A', loc: 'Bombay', yr: '2024' } },
  ],

  projects: [
    {
      id: 'monsoon',
      title: 'Monsoon',
      it: 'a twelve-minute film',
      yr: '2024',
      loc: 'Bombay',
      count: 1,
      tint: '#101418',
      desc: 'A single-take twelve-minute portrait of Bombay\'s first rain. ARRI Alexa Mini, 35mm prime, no cut.',
    },
    {
      id: '8mm-diary',
      title: '8mm Diary',
      it: 'five reels',
      yr: '2023',
      loc: 'Goa · Catskills',
      count: 5,
      tint: '#12161a',
      desc: 'Five reels of Super-8 Kodachrome shot across a year and edited into a thirty-minute personal diary. Silent.',
    },
    {
      id: 'loops',
      title: 'Loops',
      it: 'studio studies',
      yr: '2025',
      loc: 'Studio',
      count: 12,
      tint: '#0c1115',
      desc: 'Twelve four-second loops of small studio gestures — a curtain moving, a hand turning, smoke leaving a cup.',
    },
    {
      id: 'marfa',
      title: 'Marfa, sixty seconds',
      it: 'single takes',
      yr: '2024',
      loc: 'Marfa, TX',
      count: 18,
      tint: '#0e1216',
      desc: 'Eighteen single-take, sixty-second 16mm films made over a two-week residency in west Texas.',
    },
  ],
}
