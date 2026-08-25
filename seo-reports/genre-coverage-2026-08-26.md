# Genre coverage — architectural, hospitality, F&B, FMCG, lifestyle

Run 26 Aug 2026. Two Keyword Planner passes (one Discover, one targeted volume),
cross-checked against 480 days of Search Console query data.

Nothing in this report has been applied to the site. Section 6 is a proposal.

---

## 0. Correction to the 25 Aug conclusion

The earlier report said architectural vocabulary showed "no measurable demand." That
was overstated, and the method behind it was too narrow. Two things were wrong:

1. **"—" in Keyword Planner is a reporting floor, not a zero.** On a zero-spend account
   Google withholds anything below its disclosure threshold. "—" means *fewer than
   roughly ten searches a month, or suppressed* — it does not mean nobody searched.
2. **"Get search volume and forecasts" can only score terms I type in.** It confirms or
   denies my guesses; it cannot surface vocabulary I failed to think of. Everything in
   the 25 Aug run was my own guess list.

Both were fixed this run: a Discover pass (Google's own associated vocabulary,
1,109 ideas returned, top 100 harvested) plus Search Console as ground truth.

---

## 1. How to actually track architectural searches

Search Console is the answer, not Keyword Planner. GSC records real impressions at
volumes far below Keyword Planner's disclosure floor. Over the last 480 days it has
already recorded, unprompted:

| Impressions | Position | Query |
|---|---|---|
| 2 | 25.5 | architectural photography agency in gurgaon |
| 1 | 21.0 | architecture photographer in delhi |

Small, but real — and the first one contains a word the site uses **nowhere**: *agency*.
That is exactly the class of vocabulary the guess-list method could never have found.

Keyword Planner's own read on the architectural vocabulary (23 terms, 25 Aug) stands:
nothing clears 100/month, seven terms register at 10–100, and Delhi is the only city
where they register at all. So the ceiling is genuinely low — but "low" and "zero" are
different, and the tracking mechanism is GSC.

---

## 2. Targeted volume pass — 32 terms, India, Aug 2025 – Jul 2026

Sorted by bucket. Competition column is Google's, for advertisers.

### Registers at 1K – 10K/month

| Keyword | Searches | Competition |
|---|---|---|
| hotel photoshoot | 1K – 10K | Low |
| interior design photoshoot | 1K – 10K | Low |

### Registers at 100 – 1K/month

| Keyword | Searches | Competition | Top-of-page bid |
|---|---|---|---|
| commercial photographer near me | 100 – 1K | **Medium** | ₹21.06 – ₹41.98 |
| product photographer near me | 100 – 1K | **Medium** | ₹22.38 – ₹76.37 |
| food photographer near me | 100 – 1K | Low | ₹24.63 – ₹101.53 |
| video production near me | 100 – 1K | Low | ₹20.85 – ₹116.14 |
| ecommerce photography delhi | 100 – 1K | Low | ₹31.64 – ₹93.99 |
| product photography delhi | 100 – 1K | Low | ₹29.64 – ₹45.21 |
| interior design photographer | 100 – 1K | Low | ₹15.00 – ₹98.92 |

### Registers at 10 – 100/month

hospitality photographer (Medium) · product photography agency (Medium) ·
product photography gurgaon (Medium) · hotel photographer · hotel photography services ·
resort photographer · restaurant photographer · menu photography ·
commercial photography agency · food photography agency · corporate photographer near me ·
interior photographer near me

### Below the reporting floor ("—")

beverage photography india · brand photography india · cafe photographer delhi ·
catalogue photography delhi · drinks photography india · lifestyle photographer delhi ·
lifestyle photography india · photography agency delhi · photography agency gurgaon ·
restaurant food photography delhi · restaurant photography delhi

---

## 3. Genre by genre

**Hotels / hospitality.** Weak as a search category, and this is now confirmed twice.
`hotel photographer`, `hotel photography services`, `resort photographer` and
`hospitality photographer` all sit at 10–100. Hospitality did not appear anywhere in the
top 100 Discover ideas. The one exception is **`hotel photoshoot` at 1K–10K** — and that
term's intent is mixed; a large share is consumers looking for hotels to shoot *in*, not
hotels hiring photographers. Hotel work is won by referral and reputation, not search.
The site should say it does hotel work because it is true and because it converts people
who arrive by other routes — not because the query volume justifies a page.

**F&B.** Demand is real but it hides under *category* words rather than "F&B". Discover
returned `restaurant food photo` at 1K–10K and a 100–1K tail of `drinks photography`,
`beverage photography`, plus product-specific terms (wine, honey, chocolate photoshoot).
The India-suffixed variants the site would naturally write — `beverage photography india`,
`restaurant photography delhi` — are all below the floor. The lesson: write the food
words plainly, not geo-suffixed and not as "F&B".

**FMCG.** **Not search vocabulary.** `fmcg product photography` did not make the top 100
Discover ideas, and the acronym appears nowhere in real GSC queries. Buyers search by
what the thing is — packaging, catalogue, e-commerce, product — never by the sector
label. Keep FMCG in portfolio prose where it signals credibility to a human reader;
do not target it.

**Product / e-commerce.** By a wide margin the largest addressable demand in the whole
research set. Discover: `product photography`, `product photos`, `product photoshoot`,
`product shoot` all at 1K–10K, with a deep 100–1K tail. Targeted pass confirms
`product photography delhi` and `ecommerce photography delhi` at 100–1K. This is where
the site's effort belongs.

**Lifestyle / interiors.** The word "architectural" is the problem, not the demand.
Interiors demand lives under **"interior design"**: `interior design photoshoot` 1K–10K,
`interior design photographer` 100–1K. Meanwhile `lifestyle photographer delhi` and
`lifestyle photography india` are both below the floor — "lifestyle" is a studio's word,
not a buyer's.

---

## 4. Two vocabulary patterns the site uses nowhere

**"near me."** Four terms at 100–1K, and the only *Medium*-competition terms found in
either pass — advertisers are paying for them, which is the honest signal that they
convert. The site has no "near me" surface at all. GSC corroborates: `haiku near me`
already draws 6 impressions.

**"agency."** `photography agency` and `photo agencies` both 100–1K in Discover;
`product photography agency`, `commercial photography agency`, `food photography agency`
all register in the targeted pass. And the single real architectural query GSC ever
recorded is *architectural photography agency in gurgaon*. The site presents itself as a
photographer and a studio; a meaningful slice of buyers is looking for an agency.

Neither is a request to change how the studio describes itself. It is a note that two
common buyer words are absent from every page.

---

## 5. What we are missing — the headline

**73% of the site's search impressions land on pages that return 404.**

Search Console, 480 days:

| | Pages | Impressions | Clicks |
|---|---|---|---|
| Legacy Notion-style URLs | 53 | **767** | 9 |
| Live URLs | 18 | 288 | 31 |

Verified with curl — `/Haiku-Hyderabad-2952ffd3…`, `/Bruma-Coffee-Studio-…`,
`/Auro-Kitchen-Bar-Architecture-Delhi-…` all return **404**, while
`/corporate-photographer-gurgaon` returns 200.

**Root cause:** `src/app/[slug]/page.tsx` sets `dynamicParams = false`, so any slug not in
`LANDING_PAGES` 404s. `src/middleware.ts` matches only `/admin/:path*` — there is no
redirect handling for legacy URLs anywhere.

**Why it matters for this specific question:** the 47 dead paths are *exactly* the genres
asked about.

- Hotels: Crowne Plaza, Fiyavalhu Maldives, Meliá Desert Palm Dubai, Edge Creekside
  Dubai, L'Osteria Bella Holiday Inn, JW Marriott Aerocity, Le Méridien Taido,
  Taj Exotica Dubai, DLF City Club
- F&B: Haiku, Auro, Encanto, Bruma, Ladurée, Sip Society, Pasta Bowl, La Marinate,
  Patissa, MDH
- FMCG / product: Biokriti FMCG Packaging, Kitchenrama, Meteorique, Episode Chrome
  Finish, Gifting Hampers, Popcorn Co, Festive Hampers
- Lifestyle / interiors: Bruma Lifestyle, RAVOH Experience Centre, Archive Construction
  Symphony, Auro Architecture

The single biggest one: `/Haiku-Hyderabad-…` has drawn **212 impressions** and returns 404.

**Second finding, same root:** named-venue queries produced **521 impressions and 2
clicks** in 480 days. People search "haiku restaurant" (30 impressions), "encanto cafe",
"bruma coffee studio menu", "crowne plaza hotel gurgaon", "taj exotica resort & spa the
palm dubai" — and the site surfaces at positions 25–70 on a *category* page, because the
project page they were looking for no longer exists.

Total named-query performance today: 521 impressions → 2 clicks. That is a 0.4% CTR
against demand that has already found the domain.

---

## 6. Proposal — approved 26 Aug, applied in 50580d9

Ordered by return per unit of effort.

1. **Redirect the 47 legacy paths.** A `next.config` redirect map, or middleware with a
   lookup table. Each legacy path points at the closest live category or landing page.
   No visual change, no new pages. This is the cheapest fix on the list and it recovers
   the largest loss.
2. **Project pages for the top ~12 venues.** Haiku, Bruma, Auro, Encanto, RAVOH,
   Patissa, DLF City Club, Crowne Plaza, Fiyavalhu, Ladurée, Sip Society, Pasta Bowl.
   Redirect the legacy URL to the new page instead of to a category. This converts named
   demand that already exists into clicks, and it puts hotel and F&B work back on the
   site as indexable pages — the honest way to cover genres whose head terms are too thin
   to justify a landing page. **This is a front-end change and needs your sign-off on
   design before anything is built.**
3. **Add project pages and any new routes to `src/app/sitemap.ts`.** It currently lists
   only the base, five categories, /info, /contact and the landing pages.
4. **Retarget interiors vocabulary.** Wherever the site says "architectural", consider
   "interior design" alongside it — that is where the 1K–10K sits. Copy change only.
5. **Consider "near me" and "agency" surfaces.** The two absent buyer words. Lowest
   confidence item here; raised because the data raised it, not because it is obviously
   right for the brand.

Not recommended: an FMCG page, a hospitality head-term page, or geo-suffixed F&B pages.
The demand is not there and building them would be manufacturing work.

### What shipped

**1. Legacy redirects — done.** `src/lib/legacyRedirects.ts` holds all 47 measured paths,
each with its impression count in a trailing comment. Every one resolves to the same
venue's live project page where one exists, and to the right category otherwise. Ten
mappings were judgement calls and are documented inline — the two worth knowing about:
*Crowne Plaza* (17 imp) has no discipline word in its slug and went to `/culinary` on the
strength of the surrounding work, and *JW Marriott Aerocity* (6 imp) went to `/culinary`
rather than to the live JW Marriott project, which is a different property (Prestige
Golfshire, Bangalore). A catch-all for any remaining 32-hex Notion id sends it to the
homepage; it is last in the list because Next.js applies the first matching rule.

**2. Project pages — turned out to be a metadata fix, not new pages.** The routes already
existed. `KsProjectPage` is a client component that fetches `/api/projects` in a
`useEffect`, so the server shipped no title, description, canonical or share card —
which is why the named-venue impressions never converted. All five category routes now
resolve the project in `generateMetadata`. Descriptions are templated on purpose: the
stored records carry only a title and a cover image, so a specific description would be
invented. No design sign-off was needed after all, because nothing visual changed.

**3. Sitemap — done.** Now async, reads Firestore per request with `revalidate = 3600`,
and falls back to the static list if Firestore is unreachable. 17 project URLs added.

**4. Interiors vocabulary — partly applied, deliberately.** The four architectural
`metaDescription`s and two `ARCH_INCLUDE` body lines now say "interior design", as does
the WhatsApp intent string. **Titles and h1s were reverted.** Two reasons, both measured:

- `Architectural & Interior Design Photographer in Bangalore | Kshetej Sareen` is 74
  characters against the repo's own `TITLE_MAX` of 60. Google would truncate it at
  roughly "…in Bangalor…", cutting the studio name out of the result — a bad trade for a
  brand that already ranks on its own name.
- The longer h1 wrapped to three lines on desktop with "Delhi" orphaned on the last one,
  and the matching `SERVICE_LABELS` change wrapped the mobile kicker (382px of text in a
  335px container, splitting "NEW / DELHI"). Both are front-end design changes, which
  need your approval, and neither was worth asking for.

The exact phrase still leads every architectural description, which is the strongest
placement available inside the limits.

**5. "Near me" and "agency" — not applied.** "Near me" results are resolved by Google
from proximity and a Google Business Profile, not from page copy; writing the phrase into
a portfolio site is a low-value tactic, and claiming a Business Profile is an account
action I can't take on your behalf. "Agency" is a positioning claim about a
photographer-led studio — a brand decision, not an SEO edit. Both are yours to call.

### Verified

`tsc` clean, eslint clean, build green. Routes manifest: 52 redirects, all 308, 47
Notion-specific, catch-all last. Live checks against a local production server —
`/Haiku-Hyderabad-…` → `/culinary`, `/Fiyavalhu-…` → its project page, `/RAVOH-…` → its
project page, `/Shashi-Bhushan-…` → `/portraits`, `/Biokriti-FMCG-…` → `/objects`, and a
fabricated id → `/`. Project head confirmed: real title, description, canonical, og:image;
unknown ids return `robots: noindex`. Mobile and desktop rendering after the reverts is
pixel-identical to before.

---

## 7. Method notes

- Google Ads account 751-134-2056, zero spend, so all volumes are buckets, not integers.
- Discover pass: 10 seeds (the cap), 1,109 ideas returned, top 100 by volume harvested.
- Targeted pass: 32 terms, India, all languages, Google only, Aug 2025 – Jul 2026.
- GSC via the service account in `.env.local`; window 2025-05-02 → 2026-08-22 (the
  3-day reporting lag applies).
- CSV export was not used — downloading files needs your explicit permission.
