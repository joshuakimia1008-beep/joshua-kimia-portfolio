import Link from "next/link";

const links = [
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/certifications", label: "Certifications" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/achievements", label: "Achievements" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{ width: 200, padding: 16, borderRight: "1px solid #e2e8f0" }}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ display: "block", padding: "8px 0" }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
