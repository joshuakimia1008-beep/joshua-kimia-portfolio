"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminAppearance = {
  imageUrl: string;
  overlay: number;
  blur: number;
};

const links = [
  { href: "/admin", label: "Overview", icon: "⌂" },
  { href: "/admin/projects", label: "Projects", icon: "▰" },
  { href: "/admin/messages", label: "Messages", icon: "✉" },
  { href: "/admin/experience", label: "Experience", icon: "▣" },
  { href: "/admin/skills", label: "Skills", icon: "✧" },
  { href: "/admin#appearance", label: "Media & Background", icon: "▧" },
  { href: "/admin/certifications", label: "Certifications", icon: "✳" },
  { href: "/admin/achievements", label: "Achievements", icon: "☆" },
  { href: "/admin/settings", label: "Site Settings", icon: "⚙" },
];

export default function AdminShell({
  children,
  appearance,
}: {
  children: React.ReactNode;
  appearance: AdminAppearance;
}) {
  const pathname = usePathname();

  return (
    <div
      className={`admin-shell${appearance.imageUrl ? " has-admin-background" : ""}`}
    >
      {appearance.imageUrl && (
        <div
          className="admin-background"
          aria-hidden="true"
          style={{
            backgroundImage: `url("${appearance.imageUrl.replace(/["\\]/g, "")}")`,
            filter: `blur(${appearance.blur}px)`,
            transform: appearance.blur
              ? `scale(${1 + appearance.blur / 100})`
              : undefined,
          }}
        >
          <div
            className="admin-background-overlay"
            style={{
              backgroundColor: `rgba(8, 17, 37, ${appearance.overlay / 100})`,
            }}
          />
        </div>
      )}

      <aside className="admin-sidebar">
        <Link
          className="admin-brand"
          href="/admin"
          aria-label="Portfolio dashboard home"
        >
          <span className="admin-brand-mark" aria-hidden="true">
            K
          </span>
          <span className="admin-brand-copy">
            <strong>Joshua Kimia</strong>
            <small>PORTFOLIO STUDIO</small>
          </span>
        </Link>

        <div className="admin-nav-label">WORKSPACE</div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : link.href === "/admin#appearance"
                  ? false
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="admin-nav-icon" aria-hidden="true">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-spacer" />

        <div className="admin-sidebar-profile">
          <span className="admin-avatar">JK</span>
          <span>
            <strong>Joshua Kimia</strong>
            <small>Portfolio owner</small>
          </span>
          <Link
            href="/admin/settings"
            aria-label="Open profile settings"
            className="admin-profile-settings"
          >
            ···
          </Link>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Workspace</span>
            <span aria-hidden="true">/</span>
            <strong>
              {pathname === "/admin"
                ? "Overview"
                : (links.find(
                    (link) =>
                      link.href !== "/admin" &&
                      link.href !== "/admin#appearance" &&
                      (pathname === link.href ||
                        pathname.startsWith(`${link.href}/`)),
                  )?.label ?? "Dashboard")}
            </strong>
          </div>

          <div className="admin-top-actions">
            <a
              className="admin-live-link"
              href="/"
              target="_blank"
              rel="noreferrer"
            >
              <span aria-hidden="true">↗</span> View live site
            </a>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
