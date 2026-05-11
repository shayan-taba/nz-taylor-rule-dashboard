// src/app/methodology/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { siGithub } from "simple-icons/icons";
import { siGmail } from "simple-icons/icons";
import { SimpleIcon } from "../../components/ui/simpleIcon";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type VintageMeta = {
  latestVintage: string;
  latestVintageLabel: string;
  vintageCount: number;
  lastUpdated?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatVintage(v: string) {
  // february2026 -> February 2026
  const month = v.replace(/[0-9]/g, "");
  const year = v.replace(/[a-z]/gi, "");

  return month.charAt(0).toUpperCase() + month.slice(1) + " " + year;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

function Header() {
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
          RBNZ
        </span>

        <span
          style={{
            fontSize: "11px",
            color: "var(--text-3)",
            letterSpacing: "0.1em",
          }}
        >
          POLICY TRACKER
        </span>

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
          METHODOLOGY
        </span>
      </div>

      <nav
        style={{
          display: "flex",
          gap: 24,
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        {[
          { label: "DASHBOARD", href: "/" },
          { label: "ANALYTICS", href: "/analytics" },
          { label: "METHODOLOGY", href: "/methodology" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            style={{
              color:
                label === "METHODOLOGY" ? "var(--accent)" : "var(--text-3)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
          >
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT PRIMITIVES
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
  return (
    <span
      style={{
        color: "var(--text)",
      }}
    >
      {children}
    </span>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "12px",
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: "1px 5px",
        color: "var(--accent)",
      }}
    >
      {children}
    </code>
  );
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: "13px",
        color: "var(--text)",
        background:
          "linear-gradient(to bottom, var(--bg-2), rgba(255,255,255,0.01))",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 18,
        lineHeight: 2,
        maxWidth: 700,
        overflowX: "auto",
      }}
    >
      {children}
    </div>
  );
}

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
      style={{
        transition: "background 0.15s",
      }}
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

      <td
        style={{
          ...cell,
          color: "var(--text-3)",
          whiteSpace: "nowrap",
        }}
      >
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
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function MethodologyPage() {

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />

      <main
        style={{
          padding: "40px 32px 90px",
          maxWidth: 920,
          margin: "0 auto",
        }}
      >
        {/* ───────────────────────────────────────────────────────────── */}
        {/* OVERVIEW */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="OVERVIEW">
          <P>
            This platform benchmarks the RBNZ's Official Cash Rate (OCR) against
            the <Hl>Taylor Rule</Hl> — a rule-based monetary policy framework
            that prescribes an interest rate using inflation and the output gap.
            The aim is not to claim the RBNZ should mechanically follow the
            rule, but to provide a structured way to analyse how actual policy
            differed from rule-based recommendations over time.
          </P>

          <P>
            All data is sourced from official RBNZ and Stats NZ publications.
            One important limitation applies throughout: the RBNZ made each OCR
            decision using the information available at that time. Historical
            Taylor estimates here use the{" "}
            <Hl>latest available database vintage</Hl>, which incorporates later
            revisions and updated estimates.
          </P>

    
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* DATA SOURCES */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="DATA SOURCES">
          <div
            style={{
              overflowX: "auto",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-2)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
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
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement"
                  series="OCR, output gap, CPI, unemployment, neutral OCR"
                  coverage="2000 – present"
                  notes={`Latest Moneatry Policy Statement shortly following the release of each Monetary Policy Statement`}
                />

                <DataRow
                  source="RBNZ B1 Exchange Rates"
                  sourceUrl="https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index"
                  series="NZD/USD exchange rate"
                  coverage="1999 – present"
                  notes="Monthly B1 series aggregated to quarterly frequency."
                />

                <DataRow
                  source="RBNZ Sectoral Factor Model"
                  sourceUrl="https://www.rbnz.govt.nz/hub/publications/research/additional-research/measures-of-core-inflation-for-new-zealand"
                  series="Core inflation measures"
                  coverage="Varies"
                  notes="Includes trimmed mean, sectoral factor model, and RBNZ core average measures."
                />

                <DataRow
                  source="Policy Targets Agreements / Remits"
                  sourceUrl="https://www.rbnz.govt.nz/monetary-policy/about-monetary-policy/policy-targets-agreements-and-remits"
                  series="Inflation target π*"
                  coverage="1990 – present"
                  notes="Historical midpoint inflation target series used in Taylor Rule calculations."
                />
              </tbody>
            </table>
          </div>

          <P>
            The platform checks for updated source vintages daily. Exchange-rate
            data refreshes automatically as new B1 releases become available.
            Monetary Policy Statement datasets are updated after each quarterly
            MPS release. Because newer MPS vintages sometimes revise historical
            estimates, previously published quarters may also update when a new
            vintage is incorporated.
          </P>
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* TAYLOR RULE */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="TAYLOR RULE FORMULA">
          <P>The platform implements a standard Taylor Rule specification:</P>

          <FormulaBlock>
            i<sub>t</sub> = r*<sub>t</sub> + α(π<sub>t</sub> − π*<sub>t</sub>) +
            β·gap<sub>t</sub>
          </FormulaBlock>

          <P>
            where <Code>i_t</Code> is the prescribed OCR, <Code>r*_t</Code> is
            the neutral rate, <Code>π_t</Code> is inflation, <Code>π*_t</Code>{" "}
            is the inflation target, and <Code>gap_t</Code> is the output gap.
          </P>

          <P>
            An optional <Hl>Inertial Taylor Rule</Hl> smooths changes using the
            previous OCR:
          </P>

          <FormulaBlock>
            i<sub>t</sub>
            <sup>inertial</sup> = ρ · i<sub>t−1</sub> + (1 − ρ) · i<sub>t</sub>
            <sup>Taylor</sup>
          </FormulaBlock>
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* PLAYGROUND */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="PARAMETER PLAYGROUND">
          <P>
            The Parameter Playground allows counterfactual analysis of monetary
            policy assumptions.
          </P>

          <P>
            <Hl>Historical mode</Hl> uses the RBNZ's published neutral-rate and
            inflation-target series. <Hl>Override mode</Hl> instead applies a
            constant value across all periods.
          </P>

          <P>
            The α and β sliders determine how strongly the rule responds to
            inflation gaps and output gaps. R² fit statistics update live as
            parameters change.
          </P>

          <P>
            <Hl>OLS estimation</Hl> regresses (OCR − r*) on the inflation gap
            and output gap, estimating the α and β values that best fit actual
            OCR decisions over the selected period and inflation measure.
          </P>
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* INFLATION */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="INFLATION MEASURES">
          <P>
            Four inflation measures are available across the platform. The
            default is the <Hl>RBNZ Core Inflation Average</Hl>, the RBNZ's
            preferred broad measure of underlying inflation pressure.
          </P>

          <P>
            Alternative measures include the <Hl>Trimmed Mean</Hl>,{" "}
            <Hl>Sectoral Factor Model</Hl>, and <Hl>CPI Headline</Hl>. Changing
            the inflation measure updates all Taylor calculations, charts, and
            OLS estimates simultaneously.
          </P>
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* LIMITATIONS */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="LIMITATIONS">
          <P>
            <Hl>Data vintage.</Hl> Historical estimates use revised data from
            the latest available MPS vintage, not necessarily the information
            available to policymakers in real time.
          </P>

          <P>
            <Hl>Output gap uncertainty.</Hl> Output-gap estimates are highly
            uncertain and sensitive to methodology. Different approaches would
            produce different Taylor paths.
          </P>

          <P>
            <Hl>Rule limitations.</Hl> The Taylor Rule cannot fully capture
            financial stability concerns, unconventional monetary policy, global
            shocks, or effective lower-bound dynamics.
          </P>

          <P>
            <Hl>OLS interpretation.</Hl> Estimated coefficients describe
            historical behaviour, not policymaker intent.
          </P>
        </Section>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* CONTACT */}
        {/* ───────────────────────────────────────────────────────────── */}

        <Section title="SOURCE">
          <P>
            This platform is an independent project and is not affiliated with
            the Reserve Bank of New Zealand.
          </P>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[
              {
                label: "Latest RBNZ MPS",
                href: "https://www.rbnz.govt.nz/monetary-policy/monetary-policy-statement",
              },

              {
                label: "RBNZ B1 Exchange Rates",
                href: "https://www.rbnz.govt.nz/statistics/series/exchange-and-interest-rates/exchange-rates-and-the-trade-weighted-index",
              },

              {
                label: "Neutral Interest Rates Bulletin",
                href: "https://www.rbnz.govt.nz/news-and-events/news/2024/04/finding-neutral",
              },

              {
                label: "Federal Reserve - Policy Rules",
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
                  padding: "12px 14px",
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--text)",
                  }}
                >
                  {label}
                </span>

                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--accent)",
                    fontFamily: "var(--font-mono, monospace)",
                  }}
                >
                  OPEN →
                </span>
              </a>
            ))}
          </div>
        </Section>

        {/* ── Contact ─────────────────────────────────────────────────── */}
        <Section title="CONTACT & SOURCE">
          <P>
            This platform is an independent personal project and is not
            affiliated with the Reserve Bank of New Zealand.
          </P>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* GitHub */}
            <a
              href="https://github.com/shayan-taba/nz-taylor-rule-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: "12px",
              }}
            >
              <SimpleIcon icon={siGithub} />
              GitHub Repository
            </a>

            {/* Email */}
            <a
              href="mailto:s.taba.main@gmail.com"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                border: "1px solid var(--border)",
                background: "var(--bg-2)",
                color: "var(--text)",
                textDecoration: "none",
                fontSize: "12px",
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
