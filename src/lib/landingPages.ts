// Service × city landing pages. These do not appear in the site navigation —
// they exist to match search intent ("food photographer delhi") and route
// visitors into the portfolio and contact page. Copy is fact-checked against
// the studio's real client list and locations; keep it that way.

export interface LandingFaq {
  q: string
  a: string
}

export interface LandingPageDef {
  slug: string
  service: 'food' | 'architectural' | 'corporate' | 'product' | 'video'
  serviceLabel: string
  city: string
  catId: 'culinary' | 'spaces' | 'portraits' | 'objects' | 'motion'
  catHref: string
  catLabel: string
  title: string
  metaDescription: string
  h1: string
  sub: string
  intro: string[]
  include: string[]
  clientsLine?: string
  faqs: LandingFaq[]
}

const SERVICE_LABELS: Record<LandingPageDef['service'], string> = {
  food: 'Food & Beverage',
  architectural: 'Architecture & Interiors',
  corporate: 'Corporate & Headshots',
  product: 'Product & Still Life',
  video: 'Video & Film',
}

const FOOD_INCLUDE = [
  'Menu and dish photography for restaurants and cafés',
  'Food and beverage campaigns for hospitality brands',
  'Editorial food stories and cookbook work',
  'Beverage, bar and cocktail programmes',
  'Styled studio still life for packaging and delivery platforms',
]

const ARCH_INCLUDE = [
  'Architectural exteriors and interior spaces',
  'Hotels, restaurants and hospitality properties',
  'Residences for architects and interior designers',
  'Offices, retail and commercial spaces',
  'Editorial interior stories',
]

const CORP_INCLUDE = [
  'Executive and leadership portraits',
  'Team headshots, shot consistently at your office or in studio',
  'Founder portraits for press, funding announcements and speaker profiles',
  'Office culture and workplace photography',
  'LinkedIn and company-site imagery, licensed for business use',
]

const HOSPITALITY_CLIENTS =
  'Commissions include work for Taj, The Leela, Six Senses, JW Marriott and Jumeirah, with editorial work appearing in Architectural Digest.'

const PRODUCT_CLIENTS =
  'Commissions include work for Tom Ford, Taj, The Leela and Six Senses, with editorial work appearing in Architectural Digest.'

const PRODUCT_INCLUDE = [
  'Styled still life for campaigns and packaging',
  'E-commerce and catalogue sets, shot consistently at volume',
  'Luxury goods, beauty and fragrance still life',
  'Tabletop, homeware and F&B product imagery',
  'Editorial object stories',
]

const VIDEO_INCLUDE = [
  'Brand and campaign films',
  'Food, hospitality and property films',
  'Product films and tabletop motion',
  'Short-form edits and cutdowns for social',
  'Direction through post-production and delivery',
]

export const STUDIO_WHATSAPP = '919999567676'

// SERVICE_LABELS is written for headings and reads badly inside a sentence
// ("video & film photography in Delhi"), so the chat opener gets its own
// wording per service.
const WHATSAPP_INTENT: Record<LandingPageDef['service'], string> = {
  food:          'food & beverage photography',
  architectural: 'architecture & interiors photography',
  corporate:     'corporate photography & headshots',
  product:       'product & still life photography',
  video:         'video production',
}

// Built from the page the visitor is actually on, so the architectural pages
// never open a chat about corporate work. WhatsApp shows the text in the
// compose box and the sender can edit it before sending.
//
// This also preserves attribution: a WhatsApp lead bypasses the contact form
// entirely, so without the opener it arrives as a context-free "hi".
export function whatsappHref(def: LandingPageDef): string {
  const text = `Hi — I'd like to enquire about ${WHATSAPP_INTENT[def.service]} in ${def.city}.`
  return `https://wa.me/${STUDIO_WHATSAPP}?text=${encodeURIComponent(text)}`
}

export const LANDING_PAGES: LandingPageDef[] = [
  // ── Food ────────────────────────────────────────────────
  {
    slug: 'food-photographer-delhi',
    service: 'food',
    serviceLabel: SERVICE_LABELS.food,
    city: 'New Delhi',
    catId: 'culinary',
    catHref: '/culinary',
    catLabel: 'View the culinary portfolio',
    title: 'Food Photographer in Delhi | Kshetej Sareen',
    metaDescription:
      'Food and beverage photographer in New Delhi. Menu, restaurant and hospitality photography for Taj, The Leela, JW Marriott and more. Studio on MG Road.',
    h1: 'Food photographer in New Delhi',
    sub: 'Studio on MG Road, New Delhi · On location across Delhi NCR',
    intro: [
      'Kshetej Sareen photographs food the way a kitchen actually produces it — patiently, in honest light, with the steam still rising. The studio works with restaurants, cafés, hotels and F&B brands across Delhi, from single-menu shoots to full campaign libraries.',
      'Shoots run either from the MG Road studio, where controlled light suits styled still life and beverage work, or on location in your kitchen and dining room, where the character of the space becomes part of the frame. Shot on Fujifilm GFX medium format for files that hold up from a delivery-app thumbnail to a lobby print.',
    ],
    include: FOOD_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'Do you shoot at our restaurant or in your studio?',
        a: 'Both. Menu and interior-led work is usually photographed at your venue; styled still life, packaging and beverage work tends to suit the MG Road studio. Most Delhi commissions combine the two.',
      },
      {
        q: 'What does a food shoot cost in Delhi?',
        a: 'Pricing is on request and scoped per project — a ten-dish menu update and a multi-day campaign are different undertakings. Write with your brief and you will receive a considered estimate, not a rate card.',
      },
      {
        q: 'Do you work with food stylists?',
        a: 'Yes. Depending on scope, the studio brings in styling and props, or works alongside your chef so the plates photographed are the plates you actually serve.',
      },
    ],
  },
  {
    slug: 'food-photographer-gurgaon',
    service: 'food',
    serviceLabel: SERVICE_LABELS.food,
    city: 'Gurgaon',
    catId: 'culinary',
    catHref: '/culinary',
    catLabel: 'View the culinary portfolio',
    title: 'Food Photographer in Gurgaon | Kshetej Sareen',
    metaDescription:
      'Food and restaurant photographer in Gurgaon (Gurugram). Menu, café and hospitality photography from a Phase 1 base — clients include Taj and JW Marriott.',
    h1: 'Food photographer in Gurgaon',
    sub: 'Based in Phase 1, Gurgaon · Serving Gurugram, Cyber City and Delhi NCR',
    intro: [
      'Gurgaon eats out — and its restaurants, breweries and cloud kitchens compete on the first image a customer sees. Kshetej Sareen photographs food and beverage for venues across Gurugram, from Galleria-market cafés to hotel dining rooms, working out of a base in Phase 1.',
      'The work spans menu libraries, launch campaigns and editorial-style dining stories, shot on medium format and lit to look like your food on your best day — not a stock photograph of somebody else’s.',
    ],
    include: FOOD_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'Do you cover restaurants anywhere in Gurugram?',
        a: 'Yes — Phase 1 to Golf Course Road, Cyber Hub to Sohna Road. Being based in Gurgaon means no outstation travel costs for NCR venues.',
      },
      {
        q: 'Can you shoot our full menu for Zomato and Swiggy?',
        a: 'Yes. Delivery-platform libraries are a common brief: consistent, appetising frames for every dish, delivered cropped and sized for each platform alongside hero images for your own channels.',
      },
      {
        q: 'How is a shoot priced?',
        a: 'On request, scoped to the brief — dish count, locations, styling and usage all shape the estimate. Share what you need and you will get a clear, itemised proposal.',
      },
    ],
  },
  {
    slug: 'food-photographer-bangalore',
    service: 'food',
    serviceLabel: SERVICE_LABELS.food,
    city: 'Bangalore',
    catId: 'culinary',
    catHref: '/culinary',
    catLabel: 'View the culinary portfolio',
    title: 'Food Photographer in Bangalore | Kshetej Sareen',
    metaDescription:
      'Food and beverage photographer in Bangalore. Restaurant, café and brand photography from a Richmond Town studio. Clients include Taj, The Leela and Six Senses.',
    h1: 'Food photographer in Bangalore',
    sub: 'Studio in Richmond Town, Bengaluru · On location across the city',
    intro: [
      'From speciality coffee to five-star dining rooms, Bangalore’s food scene rewards imagery with a point of view. Kshetej Sareen photographs food and beverage from a studio in Richmond Town — central enough to reach Indiranagar, Koramangala or a Whitefield brewery without losing the morning light.',
      'The studio’s F&B work leans editorial: real texture, real steam, frames composed to hold attention on a menu, a billboard or a feed. Shot on Fujifilm GFX medium format, matched deliberately to what each job demands.',
    ],
    include: FOOD_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'Where do Bangalore shoots happen?',
        a: 'Either at your venue — kitchen, dining room, bar — or at the Richmond Town studio for styled still life and beverage work. Many commissions use both across a single project.',
      },
      {
        q: 'Do you photograph for cafés and smaller brands, or only hotels?',
        a: 'Both. The client list includes large hospitality groups, but menu shoots for independent cafés and restaurants are a regular part of the calendar. The bar for craft stays the same.',
      },
      {
        q: 'What will it cost?',
        a: 'On request — pricing depends on dish count, styling, locations and how the images will be used. Send the brief and you will receive a scoped estimate.',
      },
    ],
  },
  {
    slug: 'food-photographer-hyderabad',
    service: 'food',
    serviceLabel: SERVICE_LABELS.food,
    city: 'Hyderabad',
    catId: 'culinary',
    catHref: '/culinary',
    catLabel: 'View the culinary portfolio',
    title: 'Food Photographer in Hyderabad | Kshetej Sareen',
    metaDescription:
      'Food and hospitality photographer available in Hyderabad. Restaurant, hotel and F&B campaign photography — clients include Taj, The Leela and JW Marriott.',
    h1: 'Food photographer in Hyderabad',
    sub: 'Available in Hyderabad on commission · Studios in Delhi NCR and Bangalore',
    intro: [
      'Kshetej Sareen photographs food and beverage commissions in Hyderabad on a travel basis, with full lighting and medium-format kit travelling with the studio. For hotels, restaurant groups and F&B brands, that means Delhi-and-Bangalore-calibre imagery without compromising on the crew you actually wanted.',
      'Seven years of hospitality work — for Taj, The Leela, Six Senses, JW Marriott and Jumeirah — has made travelling shoots routine: recces are done in advance, shot lists agreed before arrival, and shoot days used fully.',
    ],
    include: FOOD_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'How does a Hyderabad commission work if you are not based there?',
        a: 'The studio travels from Delhi or Bangalore with complete kit. Planning happens remotely — briefs, references and shot lists — so the days on the ground in Hyderabad are spent shooting, not deciding.',
      },
      {
        q: 'Is travel charged separately?',
        a: 'Travel and stay are itemised transparently in the estimate. For multi-day campaigns they are usually a small fraction of the overall production.',
      },
      {
        q: 'What kind of Hyderabad projects suit this best?',
        a: 'Hotel and restaurant campaigns, menu libraries for groups, and brand shoots where a full day or more of photography is planned. For a single-dish update, a local photographer may serve you better — and that is said honestly.',
      },
    ],
  },

  // ── Architecture & Interiors ────────────────────────────
  {
    slug: 'architectural-photographer-delhi',
    service: 'architectural',
    serviceLabel: SERVICE_LABELS.architectural,
    city: 'New Delhi',
    catId: 'spaces',
    catHref: '/spaces',
    catLabel: 'View the spaces portfolio',
    title: 'Architectural Photographer in Delhi | Kshetej Sareen',
    metaDescription:
      'Architectural and interior photographer in New Delhi photographing residences, hotels and offices. Published in Architectural Digest.',
    h1: 'Architectural photographer in New Delhi',
    sub: 'Studio on MG Road, New Delhi · Published in Architectural Digest',
    intro: [
      'Kshetej Sareen photographs buildings the way their designers intended them to be read: lines true, volumes honest, light waited for rather than faked. Architecture rewards that patience, and it shows in the frames.',
      'From the MG Road studio, the practice photographs residences, hotels, restaurants and workplaces across Delhi for architects, interior designers and developers. Editorial work has appeared in Architectural Digest; commissions include hospitality properties for Taj, The Leela and JW Marriott.',
    ],
    include: ARCH_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'How many spaces can be covered in a day?',
        a: 'Fewer than you might hope, photographed properly — light moves, and each room deserves its hour. A typical residence is a one-to-two-day commission; hotels are scoped room-type by room-type.',
      },
      {
        q: 'Do you photograph for publication submissions?',
        a: 'Yes. Having shot for Architectural Digest, the studio knows what publications look for and can build a submission-ready set alongside your own usage.',
      },
      {
        q: 'What does architectural photography cost in Delhi?',
        a: 'On request — scope depends on the size of the property, styling needs and usage. Share plans or photographs of the space and you will receive a considered estimate.',
      },
    ],
  },
  {
    slug: 'architectural-photographer-gurgaon',
    service: 'architectural',
    serviceLabel: SERVICE_LABELS.architectural,
    city: 'Gurgaon',
    catId: 'spaces',
    catHref: '/spaces',
    catLabel: 'View the spaces portfolio',
    title: 'Architectural Photographer in Gurgaon | Kshetej Sareen',
    metaDescription:
      'Architectural and interior photographer in Gurgaon (Gurugram). Residences, offices and hospitality spaces, photographed with an exacting editorial eye.',
    h1: 'Architectural photographer in Gurgaon',
    sub: 'Based in Phase 1, Gurgaon · Serving Gurugram and Delhi NCR',
    intro: [
      'Gurugram builds ambitiously — glass office campuses, golf-course residences, hotels that anchor whole districts. Kshetej Sareen photographs that architecture from a base in Phase 1, reading each building’s intent carefully before framing it.',
      'The work serves architects, interior designers, developers and workplace teams: exteriors at the right hour, interiors composed patiently, details that carry a project’s story in portfolios, pitches and publications.',
    ],
    include: ARCH_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'Do you photograph offices and commercial interiors?',
        a: 'Yes — workplaces are a natural fit in Gurgaon. Shoots are planned around your working hours where needed, including early-morning and weekend windows for occupied offices.',
      },
      {
        q: 'Can twilight and dusk exteriors be included?',
        a: 'They should be — dusk is often when a building is most itself. Twilight frames are planned into the schedule rather than squeezed in as an afterthought.',
      },
      {
        q: 'How is a commission priced?',
        a: 'On request, based on the property, the shot list and usage. NCR projects carry no travel costs.',
      },
    ],
  },
  {
    slug: 'architectural-photographer-bangalore',
    service: 'architectural',
    serviceLabel: SERVICE_LABELS.architectural,
    city: 'Bangalore',
    catId: 'spaces',
    catHref: '/spaces',
    catLabel: 'View the spaces portfolio',
    title: 'Architectural Photographer in Bangalore | Kshetej Sareen',
    metaDescription:
      'Architectural and interior photographer in Bangalore. Residences, hotels and workplaces photographed from Richmond Town. Published in Architectural Digest.',
    h1: 'Architectural photographer in Bangalore',
    sub: 'Studio in Richmond Town, Bengaluru · Published in Architectural Digest',
    intro: [
      'Bangalore’s architecture lives in its gardens and verandahs as much as its facades — a city of filtered light. Working from Richmond Town, Kshetej Sareen photographs residences, hotels, restaurants and offices across Bengaluru with the patience that interiors demand and an exacting eye for line and light.',
      'Clients are typically architects and designers who need their built work recorded faithfully, and hospitality brands — the studio has photographed properties for Taj, The Leela and Six Senses — who need spaces that sell the stay.',
    ],
    include: ARCH_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'Do you shoot residences for interior designers?',
        a: 'Regularly. The shoot is planned with your portfolio in mind — wide establishing frames, vignettes and details — and styled lightly so the home still feels lived in.',
      },
      {
        q: 'Can you photograph our property for Architectural Digest or similar?',
        a: 'The studio’s editorial work has appeared in Architectural Digest, and submission-standard sets can be built into any commission.',
      },
      {
        q: 'What does it cost?',
        a: 'On request. A two-bedroom apartment and a resort are different projects; estimates are scoped to the property and usage.',
      },
    ],
  },
  {
    slug: 'architectural-photographer-hyderabad',
    service: 'architectural',
    serviceLabel: SERVICE_LABELS.architectural,
    city: 'Hyderabad',
    catId: 'spaces',
    catHref: '/spaces',
    catLabel: 'View the spaces portfolio',
    title: 'Architectural Photographer in Hyderabad | Kshetej Sareen',
    metaDescription:
      'Architectural and interior photographer available in Hyderabad. Hotels, residences and offices photographed on commission with a travelling crew.',
    h1: 'Architectural photographer in Hyderabad',
    sub: 'Available in Hyderabad on commission · Studios in Delhi NCR and Bangalore',
    intro: [
      'For Hyderabad’s hotels, residences and workplaces, Kshetej Sareen takes architectural commissions on a travel basis — arriving with full kit and a pre-agreed shot list, so the days on site are spent making pictures.',
      'The practice’s hospitality and interiors work — Taj, The Leela, JW Marriott, and editorial in Architectural Digest — travels well: the same discipline about light, lines and honest spaces applies whether the property is in Banjara Hills or HITEC City.',
    ],
    include: ARCH_INCLUDE,
    clientsLine: HOSPITALITY_CLIENTS,
    faqs: [
      {
        q: 'How much notice does a Hyderabad shoot need?',
        a: 'Two to three weeks is comfortable — enough for a remote recce, references and scheduling around weather and light. Faster is possible for urgent launches.',
      },
      {
        q: 'Is it worth flying a photographer in?',
        a: 'For a property that took years to build, the difference between adequate and definitive photography outlasts any travel line-item. For small single-room jobs, honestly, a local photographer may be the better call.',
      },
      {
        q: 'How is pricing handled?',
        a: 'On request, with travel and stay itemised transparently alongside the photography estimate.',
      },
    ],
  },

  // ── Corporate & Headshots ───────────────────────────────
  {
    slug: 'corporate-photographer-delhi',
    service: 'corporate',
    serviceLabel: SERVICE_LABELS.corporate,
    city: 'New Delhi',
    catId: 'portraits',
    catHref: '/portraits',
    catLabel: 'View the portrait portfolio',
    title: 'Corporate Photographer in Delhi | Kshetej Sareen',
    metaDescription:
      'Corporate photographer in New Delhi for executive portraits, team headshots and workplace photography. Studio on MG Road or on location at your office.',
    h1: 'Corporate photographer in New Delhi',
    sub: 'Executive portraits · Team headshots · Studio on MG Road or at your office',
    intro: [
      'A leadership portrait does a lot of quiet work — on the company site, in the press kit, behind the funding announcement. Kshetej Sareen photographs executives and teams in Delhi with the same editorial patience he brings to magazine portraiture: honest light, unforced posture, no corporate stiffness.',
      'Shoots run at the MG Road studio or at your office, where a corner of good light becomes a portrait set for the day. Teams are photographed consistently — same light, same treatment — so the people page finally looks like one company.',
    ],
    include: CORP_INCLUDE,
    faqs: [
      {
        q: 'Can you photograph our whole leadership team in one day?',
        a: 'Usually, yes. With a set built at your office, each portrait needs ten to fifteen unhurried minutes; a day covers a leadership team with room for variations.',
      },
      {
        q: 'Studio or our office — which is better?',
        a: 'Studio gives total control; your office gives context and saves executive time. Both are offered in Delhi, and many companies alternate: office for the wide team, studio for the board.',
      },
      {
        q: 'How is corporate work priced?',
        a: 'On request — headcount, locations and usage rights shape the estimate. Licensing for business use is spelled out plainly in the proposal.',
      },
    ],
  },
  {
    slug: 'corporate-photographer-gurgaon',
    service: 'corporate',
    serviceLabel: SERVICE_LABELS.corporate,
    city: 'Gurgaon',
    catId: 'portraits',
    catHref: '/portraits',
    catLabel: 'View the portrait portfolio',
    title: 'Corporate Photographer in Gurgaon | Kshetej Sareen',
    metaDescription:
      'Corporate photographer in Gurgaon for executive portraits, team headshots and office photography. Based in Phase 1 — on-site shoots across Cyber City and NCR.',
    h1: 'Corporate photographer in Gurgaon',
    sub: 'Based in Phase 1, Gurgaon · On-site at offices across Gurugram and NCR',
    intro: [
      'Gurugram runs on first impressions — pitch decks, LinkedIn profiles, people pages. Working from Phase 1, Kshetej Sareen photographs founders, leadership teams and workplaces across Cyber City, Golf Course Road and the wider NCR, on site at your office with a portable studio set.',
      'The result is portraiture that reads as considered rather than processed: consistent across a team of two hundred, and dignified enough for the chairman who has fifteen minutes and not a second more.',
    ],
    include: CORP_INCLUDE,
    faqs: [
      {
        q: 'Can shoots happen at our Gurgaon office?',
        a: 'That is the default — a meeting room with decent space becomes the set. Being based in Phase 1 means scheduling is flexible and there are no travel costs within NCR.',
      },
      {
        q: 'How do you keep two hundred headshots consistent?',
        a: 'One lighting set-up, documented and locked, run identically across sessions — including retakes for new joiners months later, so the people page never drifts.',
      },
      {
        q: 'What about pricing?',
        a: 'On request, scoped by headcount, days and usage. Volume team shoots and executive sessions are estimated separately because they are genuinely different jobs.',
      },
    ],
  },
  {
    slug: 'corporate-photographer-bangalore',
    service: 'corporate',
    serviceLabel: SERVICE_LABELS.corporate,
    city: 'Bangalore',
    catId: 'portraits',
    catHref: '/portraits',
    catLabel: 'View the portrait portfolio',
    title: 'Corporate Photographer in Bangalore | Kshetej Sareen',
    metaDescription:
      'Corporate photographer in Bangalore for founder portraits, team headshots and workplace photography. Richmond Town studio or on-site at your office.',
    h1: 'Corporate photographer in Bangalore',
    sub: 'Studio in Richmond Town · On-site at offices across Bengaluru',
    intro: [
      'Bangalore’s companies are founded on stories, and the founder’s portrait is usually its first page. From a studio in Richmond Town, Kshetej Sareen photographs executives, startup teams and workplaces across Bengaluru — portraits with editorial weight rather than conference-badge flatness.',
      'Sessions run in studio or at your office anywhere from Koramangala to Whitefield. Team headshots are lit and framed identically across the company; leadership portraits get the longer, quieter treatment they deserve.',
    ],
    include: CORP_INCLUDE,
    faqs: [
      {
        q: 'We are announcing a funding round — can portraits be turned around quickly?',
        a: 'Yes. Announcement portraits are a familiar brief: a focused session, a tight edit, and press-ready files delivered on an agreed deadline.',
      },
      {
        q: 'Do you photograph offices and culture, not just faces?',
        a: 'Yes — workplace and culture photography (real people, actually working) pairs naturally with a headshot day and gives your site and careers page an honest look.',
      },
      {
        q: 'How is it priced?',
        a: 'On request. Headcount, studio versus on-site, and usage rights determine the estimate; you will get it itemised, not vague.',
      },
    ],
  },
  {
    slug: 'corporate-photographer-hyderabad',
    service: 'corporate',
    serviceLabel: SERVICE_LABELS.corporate,
    city: 'Hyderabad',
    catId: 'portraits',
    catHref: '/portraits',
    catLabel: 'View the portrait portfolio',
    title: 'Corporate Photographer in Hyderabad | Kshetej Sareen',
    metaDescription:
      'Corporate photographer available in Hyderabad for executive portraits, leadership headshots and workplace photography, on commission at your office.',
    h1: 'Corporate photographer in Hyderabad',
    sub: 'Available in Hyderabad on commission · Studios in Delhi NCR and Bangalore',
    intro: [
      'For Hyderabad companies, Kshetej Sareen photographs leadership portraits, team headshots and workplaces on a travel basis — a full portable studio arrives at your office in HITEC City, Gachibowli or Banjara Hills, and the day is planned so no executive waits.',
      'It suits organisations that want one photographic standard across cities: the same light and treatment for the Hyderabad office as for Delhi and Bangalore, so the company reads as one company everywhere it appears.',
    ],
    include: CORP_INCLUDE,
    faqs: [
      {
        q: 'Is a travelling photographer practical for headshots?',
        a: 'For a leadership team or a full-office headshot day, yes — one visit covers everyone consistently. For a single urgent headshot, a local photographer is the pragmatic choice, and that is said honestly.',
      },
      {
        q: 'How does scheduling work?',
        a: 'The session plan is built remotely with your team — a slot per person, buffers for the unavoidable meeting overrun — and the set is up before the first portrait.',
      },
      {
        q: 'What does it cost?',
        a: 'On request: headcount and days on site drive the estimate, with travel itemised transparently.',
      },
    ],
  },
  // ── Product & Still Life ────────────────────────────────
  {
    slug: 'product-photographer-delhi',
    service: 'product',
    serviceLabel: SERVICE_LABELS.product,
    city: 'New Delhi',
    catId: 'objects',
    catHref: '/objects',
    catLabel: 'View the objects portfolio',
    title: 'Product Photographer in Delhi | Kshetej Sareen',
    metaDescription:
      'Product and still life photographer in New Delhi. Campaign, packaging and e-commerce photography from a studio on MG Road. Commissions include Tom Ford.',
    h1: 'Product photographer in New Delhi',
    sub: 'Studio on MG Road, New Delhi · Styled still life & e-commerce',
    intro: [
      'Objects give a photographer nowhere to hide — there is only the thing, the light, and the decision of where to put both. Kshetej Sareen photographs products and still life at the MG Road studio in New Delhi: campaign imagery with editorial weight, and e-commerce sets shot consistently enough to build a store on.',
      'The studio’s object work spans luxury goods, tabletop and homeware, beauty and F&B packaging — commissions have included Tom Ford — shot on Fujifilm GFX medium format for files that survive retouching, print and the tightest crop.',
    ],
    include: PRODUCT_INCLUDE,
    clientsLine: PRODUCT_CLIENTS,
    faqs: [
      {
        q: 'Do you shoot e-commerce volume or only campaign imagery?',
        a: 'Both, and they are scoped differently. Campaign still life is lit and styled frame by frame; e-commerce runs on a locked set with consistent light so fifty SKUs look like one catalogue.',
      },
      {
        q: 'Can products be shipped to the studio?',
        a: 'Yes — most product work runs that way. Items are logged on arrival, handled with care, and returned or couriered back after the shoot.',
      },
      {
        q: 'How is product photography priced in Delhi?',
        a: 'On request — SKU count, styling complexity and usage shape the estimate. A per-SKU structure is offered for catalogue volume; campaign work is quoted per project.',
      },
    ],
  },
  {
    slug: 'product-photographer-gurgaon',
    service: 'product',
    serviceLabel: SERVICE_LABELS.product,
    city: 'Gurgaon',
    catId: 'objects',
    catHref: '/objects',
    catLabel: 'View the objects portfolio',
    title: 'Product Photographer in Gurgaon | Kshetej Sareen',
    metaDescription:
      'Product photographer in Gurgaon (Gurugram) for D2C brands, packaging and e-commerce. Styled still life with editorial craft, based in Phase 1.',
    h1: 'Product photographer in Gurgaon',
    sub: 'Based in Phase 1, Gurgaon · Serving D2C and consumer brands across NCR',
    intro: [
      'Gurugram’s D2C shelves are crowded, and the product photograph is usually the whole first impression. Working from Phase 1, Kshetej Sareen photographs products for consumer brands across NCR — hero imagery for launches, styled still life for campaigns, and e-commerce libraries built to stay consistent as the catalogue grows.',
      'The approach is editorial rather than catalogue-flat: real shadows, deliberate texture, objects photographed with the same intent as the studio’s work for Tom Ford and India’s leading hospitality brands.',
    ],
    include: PRODUCT_INCLUDE,
    clientsLine: PRODUCT_CLIENTS,
    faqs: [
      {
        q: 'We are a D2C brand with 80 SKUs — how does that work?',
        a: 'A locked set, a shot list per SKU, and a per-SKU price agreed up front. Consistency is the product: frame 80 should look like frame 1.',
      },
      {
        q: 'Do you handle styling and props?',
        a: 'Yes — styling, surfaces and props are scoped into the estimate, or the studio works with your art director if the brand look is already defined.',
      },
      {
        q: 'What does it cost?',
        a: 'On request. Catalogue volume is quoted per SKU; campaign and packaging imagery per project, with usage spelled out plainly.',
      },
    ],
  },
  {
    slug: 'product-photographer-bangalore',
    service: 'product',
    serviceLabel: SERVICE_LABELS.product,
    city: 'Bangalore',
    catId: 'objects',
    catHref: '/objects',
    catLabel: 'View the objects portfolio',
    title: 'Product Photographer in Bangalore | Kshetej Sareen',
    metaDescription:
      'Product and still life photographer in Bangalore. Campaign, packaging and e-commerce photography from a Richmond Town studio. Commissions include Tom Ford.',
    h1: 'Product photographer in Bangalore',
    sub: 'Studio in Richmond Town, Bengaluru · Styled still life & e-commerce',
    intro: [
      'Bangalore builds brands the way it builds companies — fast, and in need of imagery that keeps up without looking rushed. At the Richmond Town studio, Kshetej Sareen photographs products and still life for consumer brands, startups and hospitality groups across Bengaluru.',
      'The work runs from single hero images for a launch to full e-commerce libraries, shot on medium format with the patience objects demand. Commissions have included Tom Ford; the standard travels down to the smallest SKU.',
    ],
    include: PRODUCT_INCLUDE,
    clientsLine: PRODUCT_CLIENTS,
    faqs: [
      {
        q: 'Can you match our existing brand imagery?',
        a: 'Yes — share the brand guidelines or past shoots and the set is built to continue the look, not restart it. New direction is also offered when that is the brief.',
      },
      {
        q: 'Do you photograph food products and packaging?',
        a: 'Frequently — the studio’s food and object practices overlap naturally for F&B packaging, beverages and pantry brands.',
      },
      {
        q: 'How is pricing structured?',
        a: 'On request: per-SKU for catalogue volume, per-project for campaign and packaging work, always itemised.',
      },
    ],
  },
  {
    slug: 'product-photographer-hyderabad',
    service: 'product',
    serviceLabel: SERVICE_LABELS.product,
    city: 'Hyderabad',
    catId: 'objects',
    catHref: '/objects',
    catLabel: 'View the objects portfolio',
    title: 'Product Photographer in Hyderabad | Kshetej Sareen',
    metaDescription:
      'Product and still life photographer available for Hyderabad brands. Ship products to the Delhi or Bangalore studio, or commission an on-site shoot.',
    h1: 'Product photographer in Hyderabad',
    sub: 'Ship to studio, or on-site by commission · Studios in Delhi NCR and Bangalore',
    intro: [
      'For Hyderabad brands, product photography usually needs no travel at all: products ship to the MG Road or Richmond Town studio, are photographed under controlled light, and return with a finished library. For launches that need the brand team in the room, on-site commissions in Hyderabad are taken as well.',
      'Either way the standard is the same one applied to commissions for Tom Ford and India’s leading hospitality groups — objects photographed with intent, not processed through a conveyor.',
    ],
    include: PRODUCT_INCLUDE,
    clientsLine: PRODUCT_CLIENTS,
    faqs: [
      {
        q: 'How does ship-to-studio work from Hyderabad?',
        a: 'Courier the products with a shot list; each item is logged on arrival and photographed against the agreed direction. Files are delivered digitally and products returned insured.',
      },
      {
        q: 'When is an on-site Hyderabad shoot worth it?',
        a: 'When the products cannot travel — large pieces, fragile or high-value items — or when the team needs to art-direct live. Travel is itemised transparently.',
      },
      {
        q: 'What does it cost?',
        a: 'On request — per-SKU for volume, per-project for campaigns. Ship-to-studio usually costs meaningfully less than flying anyone anywhere.',
      },
    ],
  },

  // ── Video & Film ────────────────────────────────────────
  {
    slug: 'video-production-delhi',
    service: 'video',
    serviceLabel: SERVICE_LABELS.video,
    city: 'New Delhi',
    catId: 'motion',
    catHref: '/motion',
    catLabel: 'View the motion portfolio',
    title: 'Video Production in Delhi | Kshetej Sareen',
    metaDescription:
      'Video and film production in New Delhi — brand films, food and hospitality films, product motion. Directed by photographer Kshetej Sareen.',
    h1: 'Video & film production in New Delhi',
    sub: 'Brand, food & property films · Studio on MG Road, New Delhi',
    intro: [
      'The studio’s motion work grows out of its photography: the same eye for light and composition, moving at twenty-four frames a second. In Delhi, Kshetej Sareen directs and shoots brand films, food and beverage films, and property films for hotels and restaurants.',
      'Projects are kept deliberately close — direction, cinematography and post handled by a tight crew rather than a bloated production line — which keeps films personal, schedules short and budgets honest.',
    ],
    include: VIDEO_INCLUDE,
    faqs: [
      {
        q: 'What kind of films does the studio take on?',
        a: 'Brand films, food and hospitality films, product motion and short-form social edits. Feature-length work and event coverage are not the studio’s lane — and you will be told so honestly.',
      },
      {
        q: 'Can stills and film be shot together?',
        a: 'Yes, and it is often the most efficient brief: one crew, one styling budget, one day — a photography library and a film from the same production.',
      },
      {
        q: 'How is video priced in Delhi?',
        a: 'On request — length, shoot days, crew and post scope shape the estimate. A one-day social film and a multi-location brand film are quoted very differently.',
      },
    ],
  },
  {
    slug: 'video-production-gurgaon',
    service: 'video',
    serviceLabel: SERVICE_LABELS.video,
    city: 'Gurgaon',
    catId: 'motion',
    catHref: '/motion',
    catLabel: 'View the motion portfolio',
    title: 'Video Production in Gurgaon | Kshetej Sareen',
    metaDescription:
      'Video and film production in Gurgaon (Gurugram) — brand films, restaurant and property films, product motion. Based in Phase 1, serving Delhi NCR.',
    h1: 'Video & film production in Gurgaon',
    sub: 'Based in Phase 1, Gurgaon · Brand, F&B and workplace films across NCR',
    intro: [
      'Gurugram’s brands live on screens — launch films, founder stories, restaurant reels that fill tables by Friday. From a base in Phase 1, Kshetej Sareen directs and shoots motion work across Gurgaon and the wider NCR with a photographer’s discipline about light and frame.',
      'The studio keeps crews small and pre-production tight: a clear treatment before anyone rolls, shoot days that end on time, and edits delivered cut for every platform the brief names.',
    ],
    include: VIDEO_INCLUDE,
    faqs: [
      {
        q: 'Do you make short social films for restaurants and cafés?',
        a: 'Yes — food motion is a natural extension of the studio’s F&B photography, and shooting both in one production is the most budget-sane way to do it.',
      },
      {
        q: 'Can you film in our Gurgaon office?',
        a: 'Yes — workplace films, founder interviews and culture pieces are shot on location with lightweight kit that does not shut your office down.',
      },
      {
        q: 'What does a film cost?',
        a: 'On request, scoped by shoot days, crew and post. You will get an itemised treatment-plus-estimate, not a mystery number.',
      },
    ],
  },
  {
    slug: 'video-production-bangalore',
    service: 'video',
    serviceLabel: SERVICE_LABELS.video,
    city: 'Bangalore',
    catId: 'motion',
    catHref: '/motion',
    catLabel: 'View the motion portfolio',
    title: 'Video Production in Bangalore | Kshetej Sareen',
    metaDescription:
      'Video and film production in Bangalore — brand films, food and property films, product motion. Directed from Richmond Town by Kshetej Sareen.',
    h1: 'Video & film production in Bangalore',
    sub: 'Studio in Richmond Town, Bengaluru · Brand, food & property films',
    intro: [
      'Bangalore’s best brands sound like people, not press releases — and their films should too. From Richmond Town, Kshetej Sareen directs brand films, food and hospitality films and product motion across Bengaluru, carrying the studio’s photographic eye into moving image.',
      'Productions stay small on purpose: treatment, shoot and edit under one roof, so what was promised on paper is what arrives in the delivery folder.',
    ],
    include: VIDEO_INCLUDE,
    faqs: [
      {
        q: 'We need a launch film and stills — one shoot or two?',
        a: 'One, usually. Stills and motion share styling, locations and light; planning them together typically saves a full production day.',
      },
      {
        q: 'Who owns the footage?',
        a: 'Usage is licensed clearly in the estimate — the films are yours for the channels agreed, with raw-footage and extended-usage options priced up front.',
      },
      {
        q: 'How is it priced?',
        a: 'On request — a social cutdown and a flagship brand film are different productions. Share the brief and you will receive a treatment with an itemised estimate.',
      },
    ],
  },
  {
    slug: 'video-production-hyderabad',
    service: 'video',
    serviceLabel: SERVICE_LABELS.video,
    city: 'Hyderabad',
    catId: 'motion',
    catHref: '/motion',
    catLabel: 'View the motion portfolio',
    title: 'Video Production in Hyderabad | Kshetej Sareen',
    metaDescription:
      'Video and film production available in Hyderabad — hotel and restaurant films, brand films and product motion, on commission with a travelling crew.',
    h1: 'Video & film production in Hyderabad',
    sub: 'Available in Hyderabad on commission · Studios in Delhi NCR and Bangalore',
    intro: [
      'For Hyderabad hotels, restaurants and brands, the studio takes film commissions on a travel basis — a compact crew arriving with camera, light and a locked treatment, so the days on the ground are spent shooting rather than deciding.',
      'It suits property films, launch films and campaigns where a day or more of production is planned; the same honest advice applies here as everywhere — for a quick single-reel job, a local videographer may serve you better.',
    ],
    include: VIDEO_INCLUDE,
    faqs: [
      {
        q: 'How is a Hyderabad film production planned?',
        a: 'Remotely and thoroughly: brief, treatment, shot list and schedule agreed before travel, with a local recce day built in for larger properties.',
      },
      {
        q: 'Can stills be shot on the same trip?',
        a: 'Yes — combining a photography library with the film is the most efficient use of a travelling production, and most Hyderabad clients do exactly that.',
      },
      {
        q: 'What does it cost?',
        a: 'On request — shoot days, crew and post scope drive the estimate, with travel itemised transparently alongside.',
      },
    ],
  },
]

export const LANDING_PAGE_MAP: Record<string, LandingPageDef> = Object.fromEntries(
  LANDING_PAGES.map((p) => [p.slug, p]),
)

export function relatedPages(current: LandingPageDef): {
  sameServiceOtherCities: LandingPageDef[]
  sameCityOtherServices: LandingPageDef[]
} {
  return {
    sameServiceOtherCities: LANDING_PAGES.filter(
      (p) => p.service === current.service && p.slug !== current.slug,
    ),
    sameCityOtherServices: LANDING_PAGES.filter(
      (p) => p.city === current.city && p.slug !== current.slug,
    ),
  }
}
