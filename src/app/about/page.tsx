// src/app/about/page.tsx

"use client";

import { useEffect, useState } from "react";
import { siGithub } from "simple-icons/icons";
import { siGmail } from "simple-icons/icons";
import { SimpleIcon } from "../../components/ui/simpleIcon";
import { NavBar } from "../../components/ui/NavBar";

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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
// DATA SOURCE ROW
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
      <td style={{ ...cell, color: "var(--text-3)", whiteSpace: "nowrap" }}>{coverage}</td>
      <td style={{ ...cell, color: "var(--text-3)", maxWidth: 320, lineHeight: 1.6 }}>
        {notes}
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VINTAGE CARD (unchanged)
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
        const reversedRows = [...rows].reverse();

        const latestRow = reversedRows.find(
          (r) => r?.dataVintage !== null && r?.dataVintage !== undefined && r?.dataVintage !== ""
        );

        setVintage(latestRow?.dataVintage ?? null);
      })
      .catch((err) => {
        console.error("fetch error:", err);
        setVintage(null);
      })
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
          background: loading ? "var(--text-3)" : vintage ? "var(--accent)" : "var(--hawkish)",
        }}
      />
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
          CURRENT MPS VINTAGE
        </div>
        <div style={{ fontSize: "12px", color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          {loading ? "Loading..." : vintage ? formatVintage(vintage) : "Unknown"}
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

      <main style={{ padding: "40px 32px 90px", maxWidth: 920, margin: "0 auto" }}>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* OVERVIEW (NEW / IMPROVED) */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="OVERVIEW">

          <P>
            <Hl>Policy Tracker</Hl> is an analytical platform that compares New Zealand’s
            Official Cash Rate (OCR) set by the Reserve Bank of New Zealand (RBNZ) against
            a rule-based benchmark known as the <Hl>Taylor Rule</Hl>.
          </P>

          <P>
            The goal is not to judge policy decisions, but to provide a structured,
            data-driven way to understand how monetary policy evolved relative to
            a consistent theoretical framework over time.
          </P>

          <P>
            The platform combines official RBNZ datasets (OCR, inflation, output gap,
            neutral rate estimates) into a unified historical panel and recalculates
            policy benchmarks under different assumptions.
          </P>

          <P>
            For full mathematical definitions, assumptions, and regression methodology,
            see the <Hl>Methodology</Hl> page.
          </P>

        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* DATA SOURCES */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="DATA SOURCES">

          <VintageCard />

          <P>
            All datasets are sourced from official RBNZ and Stats NZ publications and
            updated on a rolling schedule aligned with each Monetary Policy Statement (MPS).
          </P>

          <P>
            Historical data may be revised when new MPS vintages are released, meaning
            past values can change as estimates are refined.
          </P>

          <div style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg-2)" }}>
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
                        background: "var(--bg-3)",
                        fontWeight: 400,
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
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement"
                  series="OCR, output gap, CPI, unemployment"
                  coverage="2000 – present"
                  notes="Primary source for monetary policy variables and forecasts."
                />

                <DataRow
                  source="RBNZ B1 Exchange Rates"
                  sourceUrl="https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index"
                  series="NZD/USD exchange rate"
                  coverage="1999 – present"
                  notes="Used for FX sensitivity analysis."
                />

                <DataRow
                  source="RBNZ Core Inflation Measures"
                  sourceUrl="https://www.rbnz.govt.nz/hub/publications/research/additional-research/measures-of-core-inflation-for-new-zealand"
                  series="Trimmed mean, sectoral factor model"
                  coverage="Varies"
                  notes="Used for alternative inflation specifications in Taylor Rule."
                />

                <DataRow
                  source="Policy Targets Agreements & Remits"
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/policy-targets-agreements-and-remits"
                  series="Inflation target π*"
                  coverage="1990 – present"
                  notes="Defines historical inflation target bands."
                />
              </tbody>
            </table>
          </div>

        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CONTACT */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="CONTACT">

          <P>
            Policy Tracker is an independent project and is not affiliated with the
            Reserve Bank of New Zealand.
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
              }}
            >
              <SimpleIcon icon={siGithub} />
              GitHub Repository
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
              }}
            >
              <SimpleIcon icon={siGmail} />
              Email
            </a>

          </div>
        </Section>

      </main>
    </div>
  );
}