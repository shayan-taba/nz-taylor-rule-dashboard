# Policy Tracker (NZ Taylor Rule Dashboard)

Policy Tracker is a data-driven web application that compares New Zealand’s Official Cash Rate (OCR), set by the Reserve Bank of New Zealand (RBNZ), against a rule-based benchmark known as the Taylor Rule.

The goal is to provide a structured, transparent framework for analysing monetary policy decisions over time using consistent macroeconomic inputs.

---

## Overview

The platform brings together historical macroeconomic data from official sources and computes:

- Taylor Rule implied interest rates
- Inertial Taylor Rule paths
- Deviations between OCR and rule-based benchmarks
- Regression-based estimates of policy response coefficients (α, β)

It is designed as an analytical tool rather than a prescriptive policy system.

---

## Key Features

### Dashboard
- Time series comparison of OCR vs Taylor Rule estimates
- Deviation tracking (OCR − Taylor Rule)
- Regime and period analysis

### Analytics
- Rolling deviation statistics
- Correlation analysis (inflation, output gap, FX)
- Governor/regime-based comparisons
- OLS estimation of Taylor Rule coefficients

### Methodology Explorer
- Full specification of Taylor Rule and inertial variant
- Definition of all macroeconomic inputs
- Explanation of regression assumptions and limitations

---

## Data Sources

All data is sourced from official public institutions:

- Reserve Bank of New Zealand (RBNZ)
  - Monetary Policy Statements (OCR, output gap, neutral rate, forecasts)
  - B1 Exchange Rate series
  - Inflation targeting framework
  - Core inflation research series

- Stats NZ
  - Macroeconomic aggregates used in output gap and inflation measures

Data is compiled into a quarterly panel dataset with vintage tracking where available.

---

## Model Specification

### Taylor Rule

\[
i_t = r^*_t + \alpha(\pi_t - \pi^*_t) + \beta \cdot gap_t
\]

Where:
- \( i_t \): implied policy rate
- \( r^*_t \): neutral nominal interest rate
- \( \pi_t \): inflation rate
- \( \pi^*_t \): inflation target
- \( gap_t \): output gap

### Inertial Taylor Rule

\[
i_t^{inertial} = \rho \cdot i_{t-1} + (1 - \rho)\cdot i_t^{Taylor}
\]

Default \( \rho = 0.85 \)

---

## Estimation

The platform optionally estimates Taylor Rule parameters using OLS:

\[
(OCR_t - r^*_t) = \alpha(\pi_t - \pi^*_t) + \beta \cdot gap_t
\]

- No intercept is included due to explicit neutral rate subtraction
- Reported R² is uncentered and should be interpreted accordingly

---

## Limitations

- Data is revised: historical values reflect latest available vintages, not real-time information
- Output gap estimates are model-dependent and uncertain
- Taylor Rule does not capture financial stability, crisis policy, or unconventional monetary tools
- Coefficients reflect statistical relationships, not policy intent

---

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Vercel deployment
- Custom API layer for data aggregation and processing

---

## Purpose

This project is intended for:
- Macroeconomic analysis and education
- Monetary policy research exploration
- Data visualization of policy rules vs actual decisions

It is not affiliated with the Reserve Bank of New Zealand.

---

## License

This project is licensed under the MIT License.
