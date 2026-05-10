export interface QuarterlyData {
  date:              string;
  gdp:               number | null;
  gdpQpc:            number | null;
  gdpApc:            number | null;
  outputGap:         number | null;
  urate:             number | null;
  cpiIndex:          number | null;
  cpiQpc:            number | null;
  cpiApc:            number | null;
  ocr:               number | null;
  nzdUsd:            number | null;
  rStar:             number | null;
  piStar:            number | null;
  inflationTrimmed:  number | null;
  inflationSectoral: number | null;
  inflationCoreAvg:  number | null;
  dataVintage:       string | null;
}

export interface ComputedRow {
  date:          string;
  taylorRate:    number | null;
  inertialRate:  number | null;
  deviation:     number | null;
  compNeutral:   number | null;
  compInfGap:    number | null;
  compOutputGap: number | null;
  rollingMean4q: number | null;
  rollingStd4q:  number | null;
}

export interface RegimeDefinition {
  id:          string;
  type:        "governor" | "episode";
  label:       string;
  startDate:   string;
  endDate:     string | null;
  description: string | null;
}

export type InflationMeasure =
  | "cpiApc"
  | "inflationTrimmed"
  | "inflationSectoral"
  | "inflationCoreAvg";

export interface TaylorParams {
  alpha:           number;
  beta:            number;
  rStarOverride?:  number;
  piStarOverride?: number;
}

export interface OlsResult {
  alpha:     number;
  beta:      number;
  intercept: number;
  rSquared:  number;
  rmse:      number;
}

export interface DescriptiveStats {
  mean:     number;
  std:      number;
  skewness: number;
  max:      number;
  min:      number;
  pctAbove: number;
  pctBelow: number;
}

export interface ComputeResponse {
  series:      ComputedRow[];
  ols:         OlsResult | null;
  descriptive: DescriptiveStats | null;
}

export type ExportFormat = "csv" | "json";

export interface ExportRow {
  date:              string;
  ocr:               number | null;
  taylorRate:        number | null;
  inertialRate:      number | null;
  deviation:         number | null;
  compNeutral:       number | null;
  compInfGap:        number | null;
  compOutputGap:     number | null;
  outputGap:         number | null;
  inflation:         number | null;
  inflationMeasure:  string;
  rStar:             number | null;
  piStar:            number | null;
  urate:             number | null;
  nzdUsd:            number | null;
  gdpApc:            number | null;
}