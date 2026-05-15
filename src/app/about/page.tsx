"use client";

import { useEffect, useState } from "react";
import { siGithub, siGmail } from "simple-icons/icons";
import { SimpleIcon } from "../../components/ui/simpleIcon";
import { NavBar } from "../../components/ui/NavBar";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.14em",
          color: "var(--text-3)",
          marginBottom: 18,
          paddingBottom: 10,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "13px",
        color: "var(--text-2)",
        lineHeight: 1.8,
        marginBottom: 14,
        maxWidth: 760,
      }}
    >
      {children}
    </p>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--text)" }}>{children}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// VINTAGE CARD
// ─────────────────────────────────────────────────────────────────────────────

function VintageCard() {
  const [vintage, setVintage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/series?startDate=2024-01-01")
      .then((r) => r.json())
      .then((d) => {
        type Row = { dataVintage?: string | null };
        const rows: Row[] = Array.isArray(d) ? d : [];
        const latest =
          [...rows]
            .reverse()
            .find((r) => r?.dataVintage != null && r?.dataVintage !== "")
            ?.dataVintage ?? null;
        setVintage(latest);
      })
      .catch(() => setVintage(null))
      .finally(() => setLoading(false));
  }, []);

  function formatVintage(v: string): string {
    const month = v.replace(/[0-9]/g, "");
    const year = v.replace(/[a-zA-Z]/g, "");
    return month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
  }

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 16px",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          flexShrink: 0,
          background: loading
            ? "var(--text-3)"
            : vintage
              ? "var(--accent)"
              : "var(--hawkish)",
        }}
      />
      <div>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "0.1em",
            color: "var(--text-3)",
            marginBottom: 2,
          }}
        >
          CURRENT MPS VINTAGE
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {loading
            ? "Loading..."
            : vintage
              ? formatVintage(vintage)
              : "Unknown"}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA ROW
// ─────────────────────────────────────────────────────────────────────────────

function DataRow({
  source,
  sourceUrl,
  series,
  coverage,
  notes,
}: {
  source: string;
  sourceUrl: string;
  series: string;
  coverage: string;
  notes: string;
}) {
  const cell: React.CSSProperties = {
    fontSize: "11px",
    padding: "10px 12px",
    borderBottom: "1px solid var(--border)",
    verticalAlign: "top",
  };
  return (
    <tr
      style={{ transition: "background 0.15s" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      <td style={cell}>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {source}
        </a>
      </td>
      <td style={{ ...cell, color: "var(--text-2)" }}>{series}</td>
      <td style={{ ...cell, color: "var(--text-3)", whiteSpace: "nowrap" }}>
        {coverage}
      </td>
      <td
        style={{
          ...cell,
          color: "var(--text-3)",
          maxWidth: 320,
          lineHeight: 1.6,
        }}
      >
        {notes}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPCOMING FEATURE
// ─────────────────────────────────────────────────────────────────────────────

function UpcomingFeature({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: "planned" | "in-progress";
}) {
  const statusColor =
    status === "in-progress" ? "var(--accent)" : "var(--text-3)";
  const statusLabel = status === "in-progress" ? "IN PROGRESS" : "PLANNED";
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        marginBottom: 8,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          letterSpacing: "0.12em",
          color: statusColor,
          border: `1px solid ${statusColor}`,
          padding: "2px 6px",
          borderRadius: 3,
          whiteSpace: "nowrap",
          marginTop: 1,
          flexShrink: 0,
        }}
      >
        {statusLabel}
      </div>
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text)",
            marginBottom: 4,
            fontWeight: 500,
          }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: "11px", color: "var(--text-3)", lineHeight: 1.6 }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <NavBar />
      <main
        style={{ padding: "40px 32px 90px", maxWidth: 920, margin: "0 auto" }}
      >
        {/* ── OVERVIEW ──────────────────────────────────────────────── */}
        <Section title="OVERVIEW">
          <P>
            This platform benchmarks the RBNZ's Official Cash Rate (OCR) against
            the <Hl>Taylor Rule</Hl> — a rule-based framework that prescribes an
            interest rate from inflation and the output gap. The goal is not to
            argue the RBNZ should follow any rule mechanically, but to provide a
            structured lens for analysing how actual policy has differed from
            rule-based recommendations across governors, economic episodes, and
            parameter assumptions.
          </P>
          <P>
            The <Hl>Dashboard</Hl> shows the OCR versus the Taylor Rule over
            time, with a decomposition of what drives the prescribed rate and a
            deviation chart showing how far the RBNZ ran above or below the rule
            at each point. Parameters are adjustable in real time — change the
            inflation response, output gap weight, or neutral rate assumption
            and all charts update immediately.
          </P>
          <P>
            The <Hl>Analytics</Hl> page provides a statistical breakdown of
            deviations: distributions, rolling trends, scatter correlations, and
            a regime comparison table estimating each governor's implicit policy
            reaction function.
          </P>
          <P>
            All data is sourced from official RBNZ publications. A core
            limitation applies throughout: the RBNZ set each OCR using
            information available at that time, whereas Taylor estimates here
            use the latest revised data vintage. Historical deviations are a
            retrospective benchmark, not a real-time verdict on individual
            decisions. See the <Hl>Methodology</Hl> page for full details.
          </P>
        </Section>

        {/* ── DATA SOURCES ──────────────────────────────────────────── */}
        <Section title="DATA SOURCES">
          <VintageCard />
          <P>
            The platform updates daily. The MPS dataset is replaced after each
            quarterly release (February, May, August, November). The B1 exchange
            rate file refreshes monthly. Core inflation measures and the neutral
            rate series are updated manually shortly after each MPS release.
          </P>
          <P>
            Because newer MPS vintages revise historical output gap and GDP
            estimates, previously published quarters may also update when a new
            vintage is incorporated. The vintage indicator above shows which MPS
            release the current database reflects.
          </P>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
              marginBottom: 18,
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["SOURCE", "SERIES", "COVERAGE", "NOTES"].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontSize: "9px",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                        padding: "10px 12px",
                        textAlign: "left",
                        borderBottom: "1px solid var(--border)",
                        fontWeight: 400,
                        background: "var(--bg-3)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DataRow
                  source="RBNZ Monetary Policy Statements"
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement/monetary-policy-statement-filtered-listing-page#sort=%40computedsortdate%20descending"
                  series="OCR, output gap, CPI headline, GDP, unemployment"
                  coverage="Q1 2000 – present"
                  notes="Quarterly projections sheet. Forward projections excluded. Output gap for the current quarter is included as the RBNZ uses it in their deliberations, but is labelled provisional."
                />
                <DataRow
                  source="RBNZ B1 Exchange Rates"
                  sourceUrl="https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index"
                  series="NZD/USD exchange rate"
                  coverage="Jan 1999 – prior month"
                  notes="Monthly B1 series (EXR.MS11.D06) averaged to quarterly frequency."
                />
                <DataRow
                  source="RBNZ MPS — Neutral Rate"
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement"
                  series="Nominal neutral OCR (r*)"
                  coverage="Q1 2000 – present"
                  notes="Manually compiled quarterly series from MPS neutral rate guidance. Pre-2010 values backfilled from the RBNZ's Finding Neutral bulletin and earlier MPS commentary."
                />
                <DataRow
                  source="Policy Targets Agreements & Remits"
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/history-of-the-remit-and-policy-targets-agreement"
                  series="Inflation target π*"
                  coverage="1990 – present"
                  notes="Three-step series: 1.0% (1990–1996), 1.5% (1996–2002), 2.0% (2002–present)."
                />
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── UPCOMING FEATURES ─────────────────────────────────────── */}
        <Section title="UPCOMING FEATURES">
          <P>The platform is under active development. Planned additions:</P>
          <UpcomingFeature
            status="planned"
            title="MPS vintage selection"
            description="Choose which MPS vintage to use for analysis. Compare how the Taylor Rule estimate shifts between the February 2026 and May 2026 vintage, for example — useful for understanding how data revisions affect the implied policy prescription."
          />
          <UpcomingFeature
            status="planned"
            title="Real-time data mode"
            description="Switch the platform into a mode that uses the data available at the time of each quarterly MPS release — the output gap, neutral rate, and inflation estimates the RBNZ actually had access to when setting the OCR. Coverage will vary by series and quarter depending on publication history. Where available, this removes the revised-data limitation and enables genuine real-time deviation analysis."
          />
          <UpcomingFeature
            status="planned"
            title="Output gap uncertainty band"
            description="Display a Taylor Rule uncertainty band driven by an output gap range rather than a single point, reflecting the genuine uncertainty in potential output estimation."
          />
          <UpcomingFeature
            status="planned"
            title="Additional rule specifications"
            description="First-difference rule and balanced-approach rule variants, consistent with specifications published by the Federal Reserve and other central banks."
          />
        </Section>

        {/* ── REFERENCES ────────────────────────────────────────────── */}
        <Section title="REFERENCES">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              {
                label:
                  "Taylor (1993) — Discretion Versus Policy Rules in Practice",
                href: "https://www.sciencedirect.com/science/article/pii/016722319390009L",
              },
              {
                label:
                  "Federal Reserve — Policy Rules and How Policymakers Use Them",
                href: "https://www.federalreserve.gov/monetarypolicy/policy-rules-and-how-policymakers-use-them.htm",
              },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "11px 14px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--text-2)" }}>
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono)",
                    flexShrink: 0,
                  }}
                >
                  OPEN →
                </span>
              </a>
            ))}
          </div>
        </Section>

        {/* ── CONTACT ───────────────────────────────────────────────── */}
        <Section title="CONTACT">
          <P>
            Independent personal project. Not affiliated with the Reserve Bank
            of New Zealand.
          </P>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href="https://github.com/shayan-taba/nz-taylor-rule-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: "12px",
                borderRadius: 8,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <SimpleIcon icon={siGithub} />
              <span>shayan-taba / nz-taylor-rule-dashboard</span>
            </a>
            <a
              href="mailto:s.taba.main@gmail.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: "12px",
                borderRadius: 8,
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <SimpleIcon icon={siGmail} />
              <span>s.taba.main@gmail.com</span>
            </a>
          </div>
        </Section>
      </main>
    </div>
  );
}
