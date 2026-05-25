export interface Tag {
  id: string
  label: string
  color: string
}

export const PROJECT_TAGS: Tag[] = [
  { id: 'food-beverage',    label: 'Food & Beverage',       color: '#4a7fc1' },
  { id: 'culinary',         label: 'Culinary',               color: '#b8803a' },
  { id: 'interiors',        label: 'Interiors',              color: '#4a9d8e' },
  { id: 'architecture',     label: 'Architecture',           color: '#507090' },
  { id: 'portraits',        label: 'Portraits',              color: '#9e5b5b' },
  { id: 'headshots',        label: 'Headshots',              color: '#8c7040' },
  { id: 'products',         label: 'Products',               color: '#606060' },
  { id: 'lifestyle',        label: 'Lifestyle',              color: '#4a8c58' },
  { id: 'editorial',        label: 'Editorial',              color: '#505068' },
  { id: 'restaurants',      label: 'Restaurants',            color: '#9a6a30' },
  { id: 'hotels',           label: 'Hotels',                 color: '#7a7030' },
  { id: 'press-kit',        label: 'Press Kit',              color: '#a04040' },
  { id: 'menu-design',      label: 'Menu Design',            color: '#8a4848' },
  { id: 'campaign',         label: 'Campaign',               color: '#4a5a9a' },
  { id: 'events',           label: 'Events',                 color: '#7a4a90' },
  { id: 'motion',           label: 'Motion',                 color: '#6a50a0' },
  { id: 'videos',           label: 'Videos & Films',         color: '#6a4838' },
]
