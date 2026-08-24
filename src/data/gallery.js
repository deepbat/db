// ─────────────────────────────────────────────────────────────
//  GALLERY CONFIG
//
//  To add a photo:
//    1. Drop the image file into  public/images/
//    2. Add an entry below:  { src, alt, caption, category }
//       - src      : file name (webp recommended, ~<400KB)
//       - alt      : describe the photo for screen readers
//       - caption  : short line shown in the viewer (optional)
//       - category : FAMILY | PLACES | MOMENTS | TRAVEL
//
//  To remove a photo: delete its entry (and the file if unused).
//  Order below = order shown in the gallery.
// ─────────────────────────────────────────────────────────────

export const gallery = [
  {
    src: "images/gallery-02.webp",
    alt: "Standing among framed photographs at a photo exhibition",
    caption: "At a photography exhibition",
    category: "PLACES",
  },
  {
    src: "images/hero.webp",
    alt: "With family in a garden full of flowers, mountains behind",
    caption: "Mountains, flowers, good company",
    category: "TRAVEL",
  },
  {
    src: "images/gallery-01.webp",
    alt: "Family photo at a formal function",
    caption: "Family function",
    category: "FAMILY",
  },
  {
    src: "images/gallery-04.webp",
    alt: "Under a neon sign that reads Jalandhariye",
    caption: "Jalandhariye",
    category: "PLACES",
  },
  {
    src: "images/gallery-06.webp",
    alt: "Family birthday celebration at home",
    caption: "Birthday at home",
    category: "FAMILY",
  },
  {
    src: "images/gallery-05.webp",
    alt: "On a rooftop lawn at night",
    caption: "Rooftop, after dark",
    category: "MOMENTS",
  },
  {
    src: "images/gallery-11.webp",
    alt: "Relatives gathered at a family wedding function",
    caption: "Wedding season",
    category: "FAMILY",
  },
  {
    src: "images/gallery-08.webp",
    alt: "Reflection in a store mirror",
    caption: "Store mirror",
    category: "MOMENTS",
  },
  {
    src: "images/gallery-12.webp",
    alt: "In front of an armoured vehicle at a night exhibition",
    caption: "Armoured vehicle, night show",
    category: "TRAVEL",
  },
];
