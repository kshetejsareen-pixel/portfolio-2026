// The site used to run on Notion, where every project lived at a URL of the
// form /Project-Name-<32 hex chars>. Those URLs are still the majority of what
// Google shows: over the 480 days to 22 Aug 2026, Search Console recorded 767
// impressions on legacy paths against 288 on live ones. Every one of them
// returned 404, because src/app/[slug]/page.tsx sets dynamicParams = false and
// nothing else claimed the path.
//
// Each entry below is a real path taken from Search Console, mapped to the
// closest thing that exists today: the project page when that project is still
// in the portfolio, otherwise its category. Impression counts are noted so the
// weight of each redirect is visible; they are from the same 480-day window.
//
// Project ids are Firestore-generated and stable unless a project is deleted
// and re-added in the admin panel. If that happens, the id in the comment is
// how you find which line to update.

export interface LegacyRedirect {
  source: string
  destination: string
}

// Live project pages, named so the mapping below reads as venues, not ids.
const P = {
  tajExotica:  '/culinary/projects/proj_1779770789885', // Taj Exotica Resort and Spa, The Palm | Dubai
  meliaDesert: '/culinary/projects/proj_1779787764323', // Meliá Desert Palm | Dubai
  leMeridien:  '/culinary/projects/proj_1779780393161', // Le Méridien | Gurgaon
  auro:        '/culinary/projects/proj_1779788565921', // Auro | New Delhi
  laduree:     '/culinary/projects/proj_1779780251448', // Laduree India Delhi
  edgeCreek:   '/culinary/projects/proj_1779770849684', // Edge Creekside Hotel Dubai
  fiyavalhu:   '/culinary/projects/proj_1779777940864', // Fiyavalhu Resort Maldives
  ravoh:       '/spaces/projects/proj_1780339285414',   // RAVOH — Experience Centre Gurgaon
  dlfCityClub: '/spaces/projects/proj_1780339155798',   // DLF — City Club, Club 5 Gurgaon
  archive:     '/spaces/projects/proj_1780338949617',   // Archive — Construction Symphony Gurgaon
} as const

export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  // ── Culinary: venue has a live project page ─────────────
  { source: '/Fiyavalhu-Resort-Maldives-3082ffd3ead4807b8b20c7cdfc5ba335',                      destination: P.fiyavalhu },   //  14
  { source: '/Laduree-India-Delhi-2bc2ffd3ead48022a44fdcad849ad56d',                            destination: P.laduree },     //  14
  { source: '/Meli-Desert-Palm-Member-of-Meli-Collection-Dubai-3082ffd3ead48048b552ff439f33168a', destination: P.meliaDesert }, // 10
  { source: '/Edge-Creekside-Hotel-Dubai-2c52ffd3ead48078a1a2ebdd2db7c0cd',                      destination: P.edgeCreek },   //   8
  { source: '/Le-M-ridien-Taido-Gurgaon-2c52ffd3ead480e0a6f1d0c3efc187ec',                       destination: P.leMeridien },  //   8
  { source: '/Taj-Exotica-Resort-Spa-The-Palm-Dubai-3082ffd3ead480ad9d06c69f0f85fca1',           destination: P.tajExotica },  //   1
  // Auro's architecture and menu-design pages both go to the Auro project —
  // same venue, and the only Auro work still on the site.
  { source: '/Auro-Kitchen-Bar-Architecture-Delhi-28c2ffd3ead480519ea7d1af165a3115',             destination: P.auro },        //  60
  { source: '/Auro-Photography-For-Menu-Design-28c2ffd3ead480dd8eeac618d3fe8f8b',                destination: P.auro },        //   3
  // A Ladurée campaign film. Sent to the Ladurée project rather than /motion
  // because the client name is what the query was after.
  { source: '/Laduree-India-x-Air-India-Diwali-Ad-2962ffd3ead480d9adbcef0f8c633a01',             destination: P.laduree },     //   2

  // ── Culinary: no live project, category is the honest target ──
  { source: '/Haiku-Hyderabad-2952ffd3ead4805ca152c3959a5ddda2',                                 destination: '/culinary' },   // 212
  { source: '/Bruma-Coffee-Studio-Lifestyle-Gurgaon-28d2ffd3ead48025ae4fed6e7a13c5f7',           destination: '/culinary' },   //  72
  { source: '/Encanto-Gurgaon-2952ffd3ead48085a101d55e80d7efbd',                                 destination: '/culinary' },   //  52
  // Crowne Plaza carries no discipline word in its slug. Sent to culinary
  // because every other hotel commission on the site sits there.
  { source: '/Crowne-Plaza-Gurgaon-2c52ffd3ead480cf8291ea156a166711',                            destination: '/culinary' },   //  17
  { source: '/The-Sip-Society-Chandigarh-2e92ffd3ead480ef9358f1abe5a54145',                      destination: '/culinary' },   //  13
  { source: '/The-Pasta-Bowl-Company-Gurgaon-2bc2ffd3ead48086bdc5eab4c88a4e45',                  destination: '/culinary' },   //  10
  { source: '/L-Osteria-Bella-Holiday-Inn-Hotel-Delhi-2962ffd3ead480438effc7ed0704aacc',         destination: '/culinary' },   //   9
  { source: '/La-Marinate-Gurgaon-2bc2ffd3ead480b99e99e389f9d4347a',                             destination: '/culinary' },   //   8
  // The live JW Marriott project is Prestige Golfshire, Bangalore — a
  // different property, so this goes to the category, not to that page.
  { source: '/JW-Mariott-Aerocity-Adrift-Kaya-Delhi-28d2ffd3ead4802e9067ff1ca5a29a6d',           destination: '/culinary' },   //   6
  { source: '/F-B-Textures-2952ffd3ead480d48c51c7ff1538165a',                                    destination: '/culinary' },   //   5

  // ── Spaces ──────────────────────────────────────────────
  { source: '/RAVOH-Experience-Centre-Gurgaon-2962ffd3ead48013859fe4d444efafc5',                 destination: P.ravoh },       //  27
  { source: '/DLF-City-Club-Club-5-Gurgaon-2952ffd3ead480898adac1b7b8bc2a8b',                    destination: P.dlfCityClub }, //  24
  { source: '/Archive-Construction-Symphony-Gurgaon-3082ffd3ead480dea752d97c7ad1998f',           destination: P.archive },     //   6
  // Club 3 has no page of its own; Club 5 is the same venue.
  { source: '/DLF-City-Club-Club-3-28d2ffd3ead480ddb8b7e1bb24f706cf',                            destination: P.dlfCityClub }, //   5
  // Brioni is a different brand from the Tom Ford project, so this goes to the
  // category rather than to that page.
  { source: '/Brioni-DS-Luxury-Delhi-2bc2ffd3ead4808d9f7de845cb47d484',                          destination: '/spaces' },     //   3

  // ── Objects ─────────────────────────────────────────────
  { source: '/Patissa-Product-Catalogue-Gurgaon-2962ffd3ead480449237ff62b4cc6769',               destination: '/objects' },    //  24
  { source: '/Biokriti-FMCG-Packaging-2c52ffd3ead480288daafe45aede8440',                         destination: '/objects' },    //   9
  { source: '/Patissa-Craftsmanship-At-Display-2962ffd3ead48099bca6e0978034387f',                destination: '/objects' },    //   9
  { source: '/Gifting-Hampers-Products-2c52ffd3ead480059b74e0d450c0b2d4',                        destination: '/objects' },    //   8
  { source: '/Kitchenrama-Commercial-Kitchen-Equipment-Product-Photography-2962ffd3ead480599c74d73dbd2ca4c1', destination: '/objects' }, // 6
  { source: '/Meteorique-Concept-Product-Photography-2962ffd3ead48045a89ad3a27f792269',          destination: '/objects' },    //   6
  { source: '/Patissa-Craftsmanship-At-Display-Gurgaon-2962ffd3ead48099bca6e0978034387f',        destination: '/objects' },    //   4
  { source: '/Episode-Chrome-Finish-Products-2c52ffd3ead4808990ebe3d91e3abc8b',                  destination: '/objects' },    //   3
  { source: '/Festive-Hampers-Baked-By-Ratna-Saluja-28d2ffd3ead48089b0a1e49245372280',           destination: '/objects' },    //   2
  { source: '/Popcorn-Co-2c52ffd3ead480918c57f6d1bc4bbf5a',                                      destination: '/objects' },    //   1

  // ── Portraits ───────────────────────────────────────────
  { source: '/Shashi-Bhushan-MD-Cushman-Wakefield-2c52ffd3ead480febcbbc1168f73fa58',             destination: '/portraits' },  //  58
  { source: '/Chef-August-Cabrera-2bc2ffd3ead4805094bfd88dbf83e953',                             destination: '/portraits' },  //  14
  { source: '/Ramita-Arora-MD-Cushman-Wakefield-2c52ffd3ead480b2b3e4c69efac0fcb3',               destination: '/portraits' },  //   8
  { source: '/Dr-Kiran-Chaddha-2962ffd3ead4802aa7bcc11c7863a00d',                                destination: '/portraits' },  //   7
  { source: '/Ravish-Vohra-RAVOH-2962ffd3ead480128c50df5d852d00b8',                              destination: '/portraits' },  //   4
  { source: '/Founder-s-Presskit-Chef-Yuvraj-Kohli-Moti-Mahal-x-Bobachee-28d2ffd3ead480538832ea48b3b3f278', destination: '/portraits' }, // 3
  { source: '/Veera-Babu-MD-Cushman-Wakefield-2c52ffd3ead480ef91fefd5ad26992e3',                 destination: '/portraits' },  //   3
  { source: '/Founders-Presskit-Anant-Tusheeta-Encanto-2952ffd3ead480f29236d80c7a7b3f7a',        destination: '/portraits' },  //   2
  { source: '/Aishwarya-Sahu-Yoga-2952ffd3ead48035abbffbe54b251564',                             destination: '/portraits' },  //   1
  { source: '/Founder-s-Presskit-Mishthi-Agarwal-93-Degrees-Coffee-Roasters-28d2ffd3ead480d78578fdc969b75fe3', destination: '/portraits' }, // 1
  { source: '/Meeta-Nagpal-Founder-of-Musical-Dreams-2c52ffd3ead480b1bb1eed0461d42894',          destination: '/portraits' },  //   1

  // ── Motion ──────────────────────────────────────────────
  { source: '/MDH-Recipe-Videos-Gurgaon-2bc2ffd3ead4803880cff97b3b7500e2',                       destination: '/motion' },     //   3

  // ── No sensible category ────────────────────────────────
  { source: '/Humanitive-2c52ffd3ead480bb9f08dca0a5138816',                                      destination: '/' },           //   1
]

// Search Console lists 53 legacy pages but only 47 have enough impressions to
// be named individually. This catches the rest, plus any old link that never
// reached Search Console at all: anything ending in a 32-character Notion id
// goes to the home page rather than 404. It must stay last — Next.js applies
// the first matching rule.
export const LEGACY_NOTION_CATCH_ALL = {
  source: '/:path(.*-[0-9a-fA-F]{32})',
  destination: '/',
}
