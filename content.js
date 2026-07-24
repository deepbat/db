/* ============================================================
   SITE CONTENT — EDIT THIS FILE TO UPDATE THE SITE
   ============================================================
   This is the ONE file you need to touch to add or change:
     - Gallery photos
     - Skills (with the little radial percentage gauges)

   You do NOT need to touch index.html or style.css for these.
   Everything else (About text, Experience, Projects, Awards,
   Contact info) lives directly in index.html — search for the
   matching "EDIT HERE" comment in that file.
   ============================================================ */

const SITE_CONTENT = {

  /* ---------------------------------------------------------
     GALLERY
     Add a new photo: drop the image file in /images, then add
     one line below. "src" is the filename WITHOUT extension —
     the site automatically looks for both a .webp and a .jpg
     version, so provide both files with the same name.
     --------------------------------------------------------- */
  gallery: [
    { src: "images/gallery-01", alt: "Team collaboration session at the office" },
    { src: "images/gallery-02", alt: "Project planning whiteboard session" },
    { src: "images/gallery-03", alt: "Document management system setup" },
    { src: "images/gallery-04", alt: "Workspace organization and setup" },
    { src: "images/gallery-05", alt: "AI tools demonstration presentation" },
    { src: "images/gallery-06", alt: "Office equipment and technology setup" },
    { src: "images/gallery-07", alt: "Stakeholder meeting and coordination" },
    { src: "images/gallery-08", alt: "Training workshop on productivity tools" },
    { src: "images/gallery-09", alt: "Professional development conference" },
    { src: "images/gallery-10", alt: "Team building and office culture event" },
    { src: "images/gallery-12", alt: "Certification and achievement recognition" },
    { src: "images/gallery-13", alt: "Behind the scenes of a project launch" },
    { src: "images/hero", alt: "Professional portrait and workspace" }
  ],

  /* ---------------------------------------------------------
     SKILLS
     "value" is a percentage from 0-100, shown as a glowing
     radial gauge. Add or remove rows freely — the grid
     reflows automatically.
     --------------------------------------------------------- */
  skills: [
    { name: "Microsoft Office", value: 95 },
    { name: "Email Writing", value: 90 },
    { name: "Documentation", value: 92 },
    { name: "Google Workspace", value: 88 },
    { name: "AI Tools", value: 85 },
    { name: "Problem Solving", value: 90 }
  ]

};
