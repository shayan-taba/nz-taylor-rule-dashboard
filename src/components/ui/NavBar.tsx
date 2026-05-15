"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "DASHBOARD", href: "/" },
  { label: "ANALYTICS", href: "/analytics" },
  { label: "METHODOLOGY", href: "/methodology" },
  { label: "ABOUT", href: "/about" },
];

const PAGE_BADGES: Record<string, string> = {
  "/": "DASHBOARD",
  "/analytics": "ANALYTICS",
  "/methodology": "METHODOLOGY",
  "/about": "ABOUT",
};

export function NavBar() {
  const pathname = usePathname();
  const badge = PAGE_BADGES[pathname] ?? null;

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "0 32px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10,10,10,0.82)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span
          className="font-display"
          style={{
            fontSize: "16px",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "var(--text)",
          }}
        >
          Policy Tracker
        </span>

        <span
          style={{
            fontSize: "10px",
            color: "var(--text-3)",
            letterSpacing: "0.12em",
            marginLeft: 6,
          }}
        >
          NZ
        </span>

        {badge && (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: 4,
              letterSpacing: "0.06em",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <nav
        style={{
          display: "flex",
          gap: 24,
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              style={{
                color: isActive ? "var(--accent)" : "var(--text-3)",
                textDecoration: "none",
                transition: "color 0.15s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
