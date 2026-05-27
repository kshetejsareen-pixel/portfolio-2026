export type FlowPhoto = {
  tint: string
  aspect: 'wide' | 'square' | 'tall' | 'pano' | 'portrait'
  title: string
  location: string
  year: string
  camera?: string
  image?: string
  focalX?: number
  focalY?: number
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
  year:string
  location:string
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
    { kind: 'full-bleed', photo: { tint: '#1d1c1a', aspect: 'wide', title:'Eli, between takes', location:'Brooklyn Studio', year:'2025' } },

    {
      kind: 'asym',
      large: { tint: '#1a1815', aspect: 'tall', title:'Mira, late afternoon', location:'Bombay', year:'2025' },
      smalls: [
        { tint: '#22201d', aspect: 'square', title:'Mira, no. 2', location:'Bombay', year:'2025' },
        { tint: '#161513', aspect: 'square', title:'Mira, hands', location:'Bombay', year:'2025' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#1c1a17', aspect: 'tall', title:'Jonas, sitting',  location:'Catskills, NY', year:'2024' },
        { tint: '#1e1c19', aspect: 'tall', title:'Jonas, porch',     location:'Catskills, NY', year:'2024' },
        { tint: '#1a1917', aspect: 'tall', title:'Jonas, profile',   location:'Catskills, NY', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#1a1916', aspect: 'tall', title:'Sade', location:'Studio · Vol. iv', year:'2024' },
        { tint: '#1d1b18', aspect: 'tall', title:'Imran', location:'Mehrauli', year:'2023' },
        { tint: '#171614', aspect: 'tall', title:'Niloofar', location:'Tehran', year:'2023' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#16151a', aspect: 'pano', title:'Choir, before rehearsal', location:"St. Mark's, NYC", year:'2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#1c1a17', aspect: 'square', title:'Twins · Maya', location:'Studio', year:'2024' },
        { tint: '#1a1815', aspect: 'square', title:'Twins · Mira', location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#1e1c19', aspect: 'wide', title:'Reader, no. 1', location:'Lisbon', year:'2024' },
        { tint: '#1a1816', aspect: 'wide', title:'Reader, no. 2', location:'Lisbon', year:'2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1c1a17', aspect: 'portrait', title:'Self, late', location:'Studio mirror', year:'2025' },
      text: 'What stays, after the sitter has gone.',
    },

    { kind: 'full-bleed', photo: { tint: '#1a1815', aspect: 'wide', title:'Last light, studio north', location:'Brooklyn', year:'2025' } },
  ],

  projects: [
    {
      id: 'long-form',
      title: 'Long form',
      it: 'twelve sittings',
      year:'2024',
      location:'Studio · Various',
      count: 84,
      tint: '#1a1816',
      desc: 'Twelve sitters, an hour each, six rolls of medium-format film per session. The portraits that survived the cut.',
    },
    {
      id: 'strangers',
      title: 'Strangers',
      it: 'an open call',
      year:'2023',
      location:'Bombay · NYC',
      count: 56,
      tint: '#1d1b18',
      desc: 'A monthlong project advertising free thirty-minute sittings to anyone who showed up. No prep, no styling, ambient light only.',
    },
    {
      id: 'editors',
      title: 'Editors',
      it: 'publishing portraits',
      year:'2025',
      location:'London · NYC',
      count: 24,
      tint: '#22201d',
      desc: 'Commissioned portraits of magazine and book editors — at desk, at home, in the spaces they make decisions.',
    },
    {
      id: 'the-studio',
      title: 'The Studio',
      it: 'self portraits',
      year:'2021—2026',
      location:'Brooklyn',
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
    { kind: 'full-bleed', photo: { tint: '#3a2a1c', aspect: 'wide', title:'Stone fruit, late summer', location:'Mallorca', year:'2025' } },

    {
      kind: 'asym',
      large: { tint: '#2a1f17', aspect: 'tall', title:'Brick lane kitchen pass', location:'London E1', year:'2024' },
      smalls: [
        { tint: '#3a2418', aspect: 'square', title:'Mise en place', location:'Studio', year:'2024' },
        { tint: '#1f1814', aspect: 'square', title:'Cast iron, no. 3', location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#241a14', aspect: 'tall', title:'Persimmons, study',      location:'Kyoto', year:'2024' },
        { tint: '#2a1814', aspect: 'tall', title:'Persimmons, after rain',  location:'Kyoto', year:'2024' },
        { tint: '#3a2418', aspect: 'tall', title:'Persimmons, detail',      location:'Kyoto', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#3a2e1a', aspect: 'tall', title:'Oil & paprika', location:'Sevilla', year:'2023' },
        { tint: '#241a14', aspect: 'tall', title:'Bread, day three', location:'Studio', year:'2024' },
        { tint: '#4a2e1a', aspect: 'tall', title:'Saffron threads', location:'Studio', year:'2024' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#1f1a14', aspect: 'pano', title:'Twelve, before service', location:'Copenhagen', year:'2023' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#2a1f17', aspect: 'square', title:'Hands, hers', location:'Tehran', year:'2023' },
        { tint: '#3a2a1c', aspect: 'square', title:'Hands, his', location:'Tehran', year:'2023' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#2c2014', aspect: 'wide', title:'Tomato, beefsteak', location:'Long Island', year:'2024' },
        { tint: '#1f1a14', aspect: 'wide', title:'Tomato, sungold', location:'Long Island', year:'2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#2a1814', aspect: 'portrait', title:'Knife, oak handle', location:'Studio', year:'2025' },
      text: 'A working archive — partial, particular, never finished.',
    },

    { kind: 'full-bleed', photo: { tint: '#3a2418', aspect: 'wide', title:'Last light, kitchen window', location:'Bombay', year:'2025' } },
  ],

  projects: [
    {
      id: 'twelve',
      title: 'Twelve',
      it: 'before service',
      year:'2023',
      location:'Copenhagen',
      count: 42,
      tint: '#1f1a14',
      desc: 'A residency at a single-seating restaurant. Forty-two frames made in the hour before twelve guests arrived for dinner.',
    },
    {
      id: 'fruit-table',
      title: 'The Fruit Table',
      it: 'studies',
      year:'2024',
      location:'Studio · Kyoto',
      count: 28,
      tint: '#2a1814',
      desc: 'An ongoing study of seasonal fruit photographed on a single Japanese pine table, large-format, ambient light only.',
    },
    {
      id: 'passing',
      title: 'Passing',
      it: 'kitchens of London',
      year:'2024',
      location:'London',
      count: 60,
      tint: '#2a1f17',
      desc: 'Six kitchens, twelve shifts, sixty frames. A portrait of the working line at the pass — the moment a plate leaves the kitchen.',
    },
    {
      id: 'hands',
      title: 'Hands',
      it: 'a tabletop book',
      year:'2023',
      location:'Tehran · Studio',
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
    { kind: 'full-bleed', photo: { tint: '#1a2226', aspect: 'wide', title:'Marble stair, north light', location:'Tribeca Loft', year:'2025' } },

    {
      kind: 'asym',
      large: { tint: '#1c2428', aspect: 'tall', title:'Atelier, morning', location:'Lisbon', year:'2024' },
      smalls: [
        { tint: '#181f23', aspect: 'square', title:'Table, after lunch', location:'Lisbon', year:'2024' },
        { tint: '#161c1f', aspect: 'square', title:'Window, north', location:'Lisbon', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#181f23', aspect: 'tall', title:'Chapel, approach',  location:'Naoshima', year:'2023' },
        { tint: '#16191d', aspect: 'tall', title:'Concrete chapel',   location:'Tadao Ando, Naoshima', year:'2023' },
        { tint: '#1c2428', aspect: 'tall', title:'Chapel, interior',  location:'Naoshima', year:'2023' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#1a2226', aspect: 'tall', title:'Library, west wing', location:'Cambridge', year:'2023' },
        { tint: '#171c1f', aspect: 'tall', title:'Stair, marble', location:'Roma', year:'2024' },
        { tint: '#1c2428', aspect: 'tall', title:'Kitchen, empty', location:'Aarhus', year:'2024' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#161c1f', aspect: 'pano', title:'Auditorium, before talk', location:'Helsinki', year:'2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#1a2226', aspect: 'square', title:'Door, open', location:'Lisbon', year:'2024' },
        { tint: '#181f23', aspect: 'square', title:'Door, closed', location:'Lisbon', year:'2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#1c2428', aspect: 'wide', title:'Pool, empty', location:'Mexico City', year:'2025' },
        { tint: '#161c1f', aspect: 'wide', title:'Court, empty', location:'Mexico City', year:'2025' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1a2226', aspect: 'portrait', title:'Chapel, lower nave', location:'Naoshima', year:'2023' },
      text: 'Light, made architecture.',
    },

    { kind: 'full-bleed', photo: { tint: '#181f23', aspect: 'wide', title:'Hall, last light', location:'Lisbon', year:'2024' } },
  ],

  projects: [
    {
      id: 'tadao',
      title: 'Tadao',
      it: 'Naoshima',
      year:'2023',
      location:'Naoshima, Japan',
      count: 32,
      tint: '#16191d',
      desc: 'A two-week residency photographing Tadao Ando\'s concrete works on the art island. Long exposures, no people, the building as subject.',
    },
    {
      id: 'domestic-light',
      title: 'Domestic light',
      it: 'twelve homes',
      year:'2024',
      location:'Lisbon',
      count: 48,
      tint: '#1c2428',
      desc: 'Twelve homes across Lisbon, photographed at the same hour over twelve months. Same light, twelve different lives.',
    },
    {
      id: 'loft',
      title: 'Loft',
      it: 'an apartment over a year',
      year:'2025',
      location:'Tribeca',
      count: 60,
      tint: '#1a2226',
      desc: 'One Tribeca loft, twelve site visits, sixty interiors. A portrait of a single space across four seasons.',
    },
    {
      id: 'sacred',
      title: 'Sacred',
      it: 'rooms set apart',
      year:'2024',
      location:'Various',
      count: 28,
      tint: '#181f23',
      desc: 'Churches, temples, prayer halls, library reading rooms — spaces that ask for quiet. Photographed without people.',
    },
  ],
}

export const objectsData: CategoryData = {
  cat: { n: '04', name: 'Objects' },
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
    { kind: 'full-bleed', photo: { tint: '#24211a', aspect: 'wide', title:'Brass kettle, no. 4', location:'Studio', year:'2025' } },

    {
      kind: 'asym',
      large: { tint: '#26231c', aspect: 'tall', title:'Vessels, set of eight', location:'Studio', year:'2024' },
      smalls: [
        { tint: '#221f18', aspect: 'square', title:'Cup, single', location:'Studio', year:'2024' },
        { tint: '#1e1c16', aspect: 'square', title:'Cup, two', location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#26231c', aspect: 'tall', title:'Linen, no. 1',    location:'Studio', year:'2024' },
        { tint: '#22201a', aspect: 'tall', title:'Linen, folded',   location:'Studio', year:'2024' },
        { tint: '#1e1c16', aspect: 'tall', title:'Linen, draped',   location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#24211a', aspect: 'tall', title:'Knife, oak handle', location:'Studio', year:'2025' },
        { tint: '#1e1c16', aspect: 'tall', title:'Spoon, brass', location:'Studio', year:'2025' },
        { tint: '#26231c', aspect: 'tall', title:'Tongs, salvaged', location:'Studio', year:'2025' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#1e1c16', aspect: 'pano', title:'The full catalogue · 48 objects', location:'Studio', year:'2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#24211a', aspect: 'square', title:'Empty bowl', location:'Studio', year:'2024' },
        { tint: '#221f18', aspect: 'square', title:'Full bowl', location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#26231c', aspect: 'wide', title:'Linen, white', location:'Studio', year:'2024' },
        { tint: '#22201a', aspect: 'wide', title:'Linen, ecru', location:'Studio', year:'2024' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#1e1c16', aspect: 'portrait', title:'Salt cellar, single', location:'Studio', year:'2025' },
      text: 'A working archive — partial, particular, never finished.',
    },

    { kind: 'full-bleed', photo: { tint: '#24211a', aspect: 'wide', title:'Table, after the shoot', location:'Studio', year:'2025' } },
  ],

  projects: [
    {
      id: 'vessels',
      title: 'Vessels',
      it: 'set of eight',
      year:'2024',
      location:'Studio',
      count: 24,
      tint: '#26231c',
      desc: 'Eight hand-thrown vessels by potter Hye-Jin Park, photographed individually and as a set under identical light over three weeks.',
    },
    {
      id: 'linen',
      title: 'Linen',
      it: 'fold studies',
      year:'2024',
      location:'Studio',
      count: 36,
      tint: '#22201a',
      desc: 'Three dozen photographs of a single piece of linen, folded and refolded. A study in tone and shadow.',
    },
    {
      id: 'catalogue',
      title: 'The Catalogue',
      it: 'forty-eight objects',
      year:'2024',
      location:'Studio',
      count: 48,
      tint: '#1e1c16',
      desc: 'A reference archive of forty-eight everyday objects, shot from identical angles and distances. Made for a forthcoming monograph.',
    },
    {
      id: 'kitchen-tools',
      title: 'Kitchen tools',
      it: 'an inventory',
      year:'2025',
      location:'Studio',
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
    { kind: 'full-bleed', photo: { tint: '#0f1418', aspect: 'wide', title:'Rain, 24fps', location:'Bombay Monsoon', year:'2024' } },

    {
      kind: 'asym',
      large: { tint: '#12161a', aspect: 'tall', title:'Loop · 8mm', location:'Goa', year:'2023' },
      smalls: [
        { tint: '#0c1115', aspect: 'square', title:'Frame · 04 / 240', location:'Goa', year:'2023' },
        { tint: '#101418', aspect: 'square', title:'Frame · 88 / 240', location:'Goa', year:'2023' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#12161a', aspect: 'tall', title:'Frame study · 01',           location:'Marfa, TX', year:'2024' },
        { tint: '#0e1216', aspect: 'tall', title:'Single-shot · sixty seconds', location:'Marfa, TX', year:'2024' },
        { tint: '#0c1115', aspect: 'tall', title:'Frame study · 60',           location:'Marfa, TX', year:'2024' },
      ],
    },

    {
      kind: 'three-up',
      photos: [
        { tint: '#0f1418', aspect: 'tall', title:'Curtain · loop', location:'Studio', year:'2025' },
        { tint: '#12161a', aspect: 'tall', title:'Hand · loop', location:'Studio', year:'2025' },
        { tint: '#0c1115', aspect: 'tall', title:'Window · loop', location:'Studio', year:'2025' },
      ],
    },

    { kind: 'pull-quote' },

    { kind: 'full-bleed-pano', photo: { tint: '#101418', aspect: 'pano', title:'Monsoon · twelve minutes', location:'Bombay', year:'2024' } },

    {
      kind: 'diptych',
      photos: [
        { tint: '#0f1418', aspect: 'square', title:'Before', location:'Marfa', year:'2024' },
        { tint: '#12161a', aspect: 'square', title:'After', location:'Marfa', year:'2024' },
      ],
    },

    {
      kind: 'duo',
      photos: [
        { tint: '#0c1115', aspect: 'wide', title:'Tide, incoming', location:'Goa', year:'2023' },
        { tint: '#0e1216', aspect: 'wide', title:'Tide, outgoing', location:'Goa', year:'2023' },
      ],
    },

    {
      kind: 'offset',
      photo: { tint: '#101418', aspect: 'portrait', title:'Smoke, slow', location:'Studio', year:'2025' },
      text: 'Time, given a frame.',
    },

    { kind: 'full-bleed', photo: { tint: '#0f1418', aspect: 'wide', title:'Last reel, ARRI A', location:'Bombay', year:'2024' } },
  ],

  projects: [
    {
      id: 'monsoon',
      title: 'Monsoon',
      it: 'a twelve-minute film',
      year:'2024',
      location:'Bombay',
      count: 1,
      tint: '#101418',
      desc: 'A single-take twelve-minute portrait of Bombay\'s first rain. ARRI Alexa Mini, 35mm prime, no cut.',
    },
    {
      id: '8mm-diary',
      title: '8mm Diary',
      it: 'five reels',
      year:'2023',
      location:'Goa · Catskills',
      count: 5,
      tint: '#12161a',
      desc: 'Five reels of Super-8 Kodachrome shot across a year and edited into a thirty-minute personal diary. Silent.',
    },
    {
      id: 'loops',
      title: 'Loops',
      it: 'studio studies',
      year:'2025',
      location:'Studio',
      count: 12,
      tint: '#0c1115',
      desc: 'Twelve four-second loops of small studio gestures — a curtain moving, a hand turning, smoke leaving a cup.',
    },
    {
      id: 'marfa',
      title: 'Marfa, sixty seconds',
      it: 'single takes',
      year:'2024',
      location:'Marfa, TX',
      count: 18,
      tint: '#0e1216',
      desc: 'Eighteen single-take, sixty-second 16mm films made over a two-week residency in west Texas.',
    },
  ],
}
