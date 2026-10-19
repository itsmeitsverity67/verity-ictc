/*
  data.js - Product list for Fletch & Fern Outfitters (demo store).
  All products, prices and descriptions are fictional and written for this school project.
  Each product has: id, name, category, price (USD), description, icon (used for the CSS placeholder image).
*/
const PRODUCTS = [
  { id: "p1", name: "Ridgeback Compound Bow", category: "Bows", price: 549.0, icon: "🏹",
    description: "Adjustable 40–70 lb draw weight with a smooth cam system for hunters and target shooters." },
  { id: "p2", name: "Willow Trail Recurve Bow", category: "Bows", price: 189.0, icon: "🏹",
    description: "Lightweight take-down recurve with laminated limbs, ideal for beginners and clubs." },
  { id: "p3", name: "Youth Sparrow Starter Bow", category: "Bows", price: 79.0, icon: "🎯",
    description: "Safe, low-draw-weight bow kit sized for young archers learning the basics." },
  { id: "p4", name: "Carbon Flight Arrows (12-pack)", category: "Arrows", price: 64.0, icon: "➶",
    description: "Straight, durable carbon shafts with pre-fitted vanes for consistent groups." },
  { id: "p5", name: "Fieldpoint Practice Tips (24)", category: "Arrows", price: 18.5, icon: "📍",
    description: "Steel screw-in practice points for target and backyard sessions." },
  { id: "p6", name: "Pinewood Hip Quiver", category: "Accessories", price: 39.0, icon: "🎒",
    description: "Canvas and leather quiver that holds up to 15 arrows with a quick-clip belt loop." },
  { id: "p7", name: "Steady Grip Release Aid", category: "Accessories", price: 54.0, icon: "✋",
    description: "Wrist-strap trigger release for cleaner, more repeatable shots." },
  { id: "p8", name: "Foam Block Target 60cm", category: "Targets", price: 89.0, icon: "🎯",
    description: "Self-healing layered foam target that stops field points easily." },
  { id: "p9", name: "3D Deer Practice Target", category: "Targets", price: 159.0, icon: "🦌",
    description: "Life-size foam deer with a replaceable vital-zone insert for realistic practice." },
  { id: "p10", name: "Canopy Camo Jacket", category: "Outdoor Gear", price: 119.0, icon: "🧥",
    description: "Quiet, water-resistant shell in a woodland pattern for early-morning outings." },
  { id: "p11", name: "Trailhead Daypack 25L", category: "Outdoor Gear", price: 72.0, icon: "🎒",
    description: "Padded pack with a bow-carry strap, hydration sleeve and rain cover." },
  { id: "p12", name: "Ember Folding Camp Stool", category: "Outdoor Gear", price: 29.0, icon: "🪵",
    description: "Compact aluminium stool that folds flat for blinds and campsites." }
];

/* Helper: find one product by its id */
function getProductById(id) {
  return PRODUCTS.find(function (p) { return p.id === id; });
}