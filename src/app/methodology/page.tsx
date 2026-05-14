// src/app/methodology/page.tsx

"use client";

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
        <span className="font-display" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)" }}>RBNZ</span>
        <span style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.1em" }}>POLICY TRACKER</span>
        <span style={{ fontSize: "10px", padding: "2px 6px", background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)", borderRadius: 4, letterSpacing: "0.06em" }}>METHODOLOGY</span>
      </div>
      <nav style={{ display: "flex", gap: 24, fontSize: "11px", letterSpacing: "0.08em" }}>
        {[
          { label: "DASHBOARD", href: "/" },
          { label: "ANALYTICS", href: "/analytics" },
          { label: "METHODOLOGY", href: "/methodology" },
          { label: "ABOUT", href: "/about" },
        ].map(({ label, href }) => (
          <a key={label} href={href} style={{ color: label === "METHODOLOGY" ? "var(--accent)" : "var(--text-3)", textDecoration: "none", transition: "color 0.15s" }}>{label}</a>
        ))}
      </nav>
    </header>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <div style={{ fontSize: "9px", letterSpacing: "0.14em", color: "var(--text-3)", marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{title}</div>
      {children}
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.8, marginBottom: 14, maxWidth: 760 }}>{children}</p>;
}

function Hl({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "var(--text)" }}>{children}</span>;
}

function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 5px", color: "var(--accent)" }}>{children}</code>;
}

function FormulaBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "13px", color: "var(--text)", background: "linear-gradient(to bottom, var(--bg-2), rgba(255,255,255,0.01))", border: "1px solid var(--border)", borderRadius: 8, padding: "16px 20px", marginBottom: 18, lineHeight: 2.2, maxWidth: 700, overflowX: "auto" }}>
      {children}
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <main style={{ padding: "40px 32px 90px", maxWidth: 920, margin: "0 auto" }}>

        <Section title="OVERVIEW">
          <P>
            This platform benchmarks the RBNZ's Official Cash Rate (OCR) against the{" "}
            <Hl>Taylor Rule</Hl> — a rule-based framework prescribing an interest rate
            from inflation and the output gap. The aim is not to argue the RBNZ should
            follow any rule mechanically, but to provide a structured lens for analysing
            how actual policy differed from rule-based recommendations over time.
          </P>
          <P>
            All data comes from official RBNZ publications. One fundamental caveat applies:
            the RBNZ set each OCR using information available at that time.{" "}
            <Hl>Taylor estimates here use the latest revised data vintage</Hl>, which may
            differ from real-time estimates — particularly for the output gap and neutral
            rate. Historical deviations are therefore a retrospective benchmark, not a
            real-time verdict on individual OCR decisions.
          </P>
        </Section>

        <Section title="TAYLOR RULE FORMULA">
          <P>The core formula used throughout the platform:</P>
          <FormulaBlock>
            i<sub>t</sub> = r*<sub>t</sub> + α(π<sub>t</sub> − π*<sub>t</sub>) + β · gap<sub>t</sub>
          </FormulaBlock>
          <P>
            <Code>i_t</Code> — prescribed OCR.{"  "}
            <Code>r*_t</Code> — nominal neutral rate (see below).{"  "}
            <Code>π_t</Code> — year-on-year inflation.{"  "}
            <Code>π*_t</Code> — inflation target midpoint at time t.{"  "}
            <Code>gap_t</Code> — output gap as % of potential.{"  "}
            <Code>α, β</Code> — policy response coefficients (Taylor's original: α = β = 0.5).
          </P>
          <P>The optional <Hl>Inertial Taylor Rule</Hl> spreads adjustments over time:</P>
          <FormulaBlock>
            i<sub>t</sub><sup>inertial</sup> = ρ · i<sub>t−1</sub><sup>actual</sup> + (1 − ρ) · i<sub>t</sub><sup>Taylor</sup>{"   "}(ρ = 0.85)
          </FormulaBlock>
          <P>
            The lag term uses the <Hl>previous actual OCR</Hl>, not the previous inertial
            rate. This anchors the inertial path to where the OCR actually was rather
            than where the rule said it should be, producing a smoother but history-grounded
            prescription.
          </P>
        </Section>

        <Section title="NEUTRAL RATE — WHY NOMINAL">
          <P>
            The RBNZ's MPS publishes a <Hl>nominal</Hl> neutral OCR directly. Using this
            avoids the need to estimate a real neutral rate and add an inflation expectation,
            which would compound uncertainty.
          </P>
          <P>
            Because r* is nominal, the formula has no separate inflation passthrough term.
            In the classical real-r* formulation, current inflation π<sub>t</sub> appears
            explicitly to convert to a nominal rate — with a nominal r* that conversion
            is already embedded. The decomposition chart reflects this directly: the neutral
            rate bar is r* itself, with the inflation gap and output gap contributions
            stacked on top.
          </P>
          <P>
            The neutral rate series is manually compiled from RBNZ MPS statements. For
            quarters before the RBNZ began publishing explicit estimates, values are
            backfilled from the RBNZ's <Hl>Finding Neutral</Hl> research bulletin and
            earlier MPS commentary. Coverage extends to Q1 2000 but is denser from
            around 2010.
          </P>
          <P>
            The <Hl>real r* override</Hl> in the Parameter Playground accepts a real
            value and adds current inflation internally to convert to nominal before
            applying the formula — consistent with the nominal framework throughout.
          </P>
        </Section>

        <Section title="INFLATION TARGET π*">
          <P>
            The platform uses the historical midpoint of the RBNZ's inflation target band:
          </P>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden", maxWidth: 500, marginBottom: 18 }}>
            {[
              { period: "Mar 1990 – Dec 1996", value: "1.0%", note: "0–2% band" },
              { period: "Dec 1996 – Sep 2002", value: "1.5%", note: "1–3% band" },
              { period: "Sep 2002 – present",  value: "2.0%", note: "1–3% band, focus on 2%" },
            ].map(({ period, value, note }) => (
              <div key={period} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "10px 14px", background: "var(--bg-2)", borderBottom: "1px solid var(--border)", fontSize: "11px" }}>
                <span style={{ color: "var(--text-3)", width: 170, flexShrink: 0 }}>{period}</span>
                <span style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", width: 40 }}>{value}</span>
                <span style={{ color: "var(--text-3)" }}>{note}</span>
              </div>
            ))}
          </div>
          <P>
            The π* override holds the target fixed at any value across all periods —
            useful for counterfactual analysis such as asking what the rule would have
            prescribed if the target had always been 2%.
          </P>
        </Section>

        <Section title="OUTPUT GAP">
          <P>
            The output gap is sourced from RBNZ MPS projections as a percentage of
            potential output. Using the RBNZ's own estimate is preferable to computing
            one independently (e.g. via HP filter) because the Taylor Rule is then
            benchmarked against the RBNZ's own assessment of economic slack — the same
            view that informed their decisions.
          </P>
          <P>
            The MPS output gap for the <Hl>current quarter</Hl> is technically an RBNZ
            projection rather than a finalised estimate. It is included because the RBNZ
            uses it in their own deliberations, and is labelled provisional where relevant.
          </P>
          <P>
            Core inflation measures for the current quarter are not published in the MPS.
            When a core measure is selected, the Taylor estimate shown is from the most
            recent quarter for which that measure is available, with a data-pending note.
            CPI Headline is the only measure where the current quarter is always available
            via the MPS.
          </P>
        </Section>

        <Section title="INFLATION MEASURES">
          <P>
            Four measures are available. The default is the{" "}
            <Hl>RBNZ Core Inflation Average</Hl> — the RBNZ's preferred summary of
            underlying inflation, averaging the sectoral factor model, factor model,
            trimmed mean (30%), weighted median, and CPI ex food and energy. Using the
            measure the RBNZ actually monitors is the most defensible baseline.
          </P>
          <P>
            <Hl>Trimmed Mean (30%)</Hl> removes the largest price increases and decreases
            from the CPI basket before averaging, reducing sensitivity to one-off movements.{" "}
            <Hl>Sectoral Factor Model</Hl> estimates the common inflation component
            separately across tradable and non-tradable sectors.{" "}
            <Hl>CPI Headline</Hl> is included for completeness but is the noisiest measure
            and least suited for Taylor Rule analysis.
          </P>
          <P>
            Changing the inflation measure updates all Taylor calculations, charts, scatter
            plots, and regime comparison OLS estimates simultaneously. Historical coverage
            varies — older quarters may be null for some core measures.
          </P>
        </Section>

        <Section title="PARAMETER PLAYGROUND">
          <P>
            <Hl>Historical mode (default)</Hl> uses the RBNZ's published neutral rate
            path and the historical π* step series — the most realistic setting, reflecting
            the frameworks the RBNZ was working with at each point.
          </P>
          <P>
            <Hl>Override mode</Hl> fixes r* or π* at a constant value across all periods,
            enabling counterfactual analysis. What would the Taylor Rule have prescribed
            throughout the 2000s under a neutral rate of 4%? How sensitive is the
            deviation series to the inflation target assumption? Overrides answer these
            questions directly.
          </P>
          <P>
            <Hl>α and β sliders</Hl> control the rule's sensitivity to the inflation gap
            and output gap. Default 0.5/0.5 follows Taylor's original specification.
            R² fit statistics update live as parameters change, showing how well the
            current specification tracks the actual OCR.
          </P>
          <P>
            <Hl>OLS estimation</Hl> regresses (OCR − r*) on the inflation gap and output
            gap with no intercept, estimating the α and β that best describe actual OCR
            decisions over the selected window. The no-intercept specification is correct
            because subtracting r* from the left-hand side already accounts for the
            baseline — an intercept would redundantly re-estimate it. The R² reported is
            uncentered, which is appropriate for a no-intercept model and will generally
            read higher than a standard centred R².
          </P>
        </Section>

        <Section title="ANALYTICS PAGE">
          <P>
            <Hl>Deviation statistics</Hl> summarise quarterly deviations (OCR − Taylor Rate)
            over the selected window. Positive = RBNZ more hawkish than the rule; negative = more dovish.
          </P>
          <P>
            <Hl>Rolling statistics</Hl> show the four-quarter rolling mean and standard
            deviation of deviations — useful for distinguishing sustained policy stances
            from transient departures.
          </P>
          <P>
            <Hl>Scatter plots</Hl> show contemporaneous correlations between deviations and
            three indicators: inflation, unemployment, and NZD/USD. Pearson r and an OLS
            trend line are shown. These relationships are descriptive, not causal.
          </P>
          <P>
            <Hl>Governor regime comparison</Hl> runs separate OLS regressions for each
            governor's full term. α, β, R², and RMSE are computed over the complete regime
            and do not respond to the date range selector. Mean deviation is the only column
            that adjusts to the currently selected window.
          </P>
        </Section>

        <Section title="LIMITATIONS">
          <P>
            <Hl>Revised data.</Hl> Historical estimates use the latest available vintage.
            The RBNZ set rates with real-time data, which for the output gap and neutral
            rate can differ materially from revised figures.
          </P>
          <P>
            <Hl>Output gap uncertainty.</Hl> Even the RBNZ's own output gap estimates
            carry substantial uncertainty. Different methodologies would produce different
            Taylor paths.
          </P>
          <P>
            <Hl>Rule scope.</Hl> The Taylor Rule cannot capture financial stability
            concerns, unconventional tools, effective lower bound dynamics, or global
            spillovers. Large deviations during COVID and the GFC partly reflect these
            constraints rather than pure discretion.
          </P>
          <P>
            <Hl>OLS coefficients.</Hl> Estimated α and β describe historical co-movement,
            not intent. A low α may mean a governor was less inflation-reactive, or simply
            that inflation was near target throughout and offered little variation for the
            regression to detect.
          </P>
        </Section>

      </main>
    </div>
  );
}