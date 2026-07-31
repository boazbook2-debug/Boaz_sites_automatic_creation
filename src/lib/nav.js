// Permanent nav structure — same links for every client, in every place the
// nav is rendered (header + footer).
const navItems = [
  { label: "עמוד הבית", href: "/" },
  { label: "אודות", href: "/about" },
  { label: "כל הנכסים", href: "/properties" },
  { label: "נכסים למכירה", href: "/properties?status=sale" },
  { label: "נכסים להשכרה", href: "/properties?status=rent" },
  { label: "הסוכנים", href: "/agents" },
  { label: "צור קשר", href: "/contact" },
];

export default navItems;
