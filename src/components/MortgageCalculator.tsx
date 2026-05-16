"use client";

import { useMemo, useState } from "react";

import { formatPrice } from "@/lib/format";
import {
  calculateMortgage,
  DEFAULT_ANNUAL_INTEREST_RATE,
  DEFAULT_DOWN_PAYMENT_PERCENT,
  DEFAULT_LOAN_TENURE_YEARS,
} from "@/lib/mortgage";

type MortgageCalculatorProps = {
  /** Pre-fill from listing price */
  initialPropertyPrice?: number;
  /** Compact layout for property detail sidebar */
  variant?: "standalone" | "embedded";
  className?: string;
};

function parseAmount(raw: string): number {
  const n = Number(raw.replace(/,/g, "").trim());
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function MortgageCalculator({
  initialPropertyPrice = 0,
  variant = "standalone",
  className,
}: MortgageCalculatorProps) {
  const [propertyPrice, setPropertyPrice] = useState(
    initialPropertyPrice > 0 ? String(initialPropertyPrice) : "",
  );
  const [downPaymentPercent, setDownPaymentPercent] = useState(
    String(DEFAULT_DOWN_PAYMENT_PERCENT),
  );
  const [annualRate, setAnnualRate] = useState(
    String(DEFAULT_ANNUAL_INTEREST_RATE),
  );
  const [tenureYears, setTenureYears] = useState(
    String(DEFAULT_LOAN_TENURE_YEARS),
  );

  const result = useMemo(
    () =>
      calculateMortgage({
        propertyPrice: parseAmount(propertyPrice),
        downPaymentPercent: parseAmount(downPaymentPercent),
        annualInterestRate: parseAmount(annualRate),
        tenureYears: parseAmount(tenureYears),
      }),
    [propertyPrice, downPaymentPercent, annualRate, tenureYears],
  );

  const rootClass = [
    "mortgage-calculator",
    variant === "embedded" ? "mortgage-calculator--embedded" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={rootClass} aria-labelledby="mortgage-calc-heading">
      <header className="mortgage-calculator-head">
        {variant === "embedded" ? (
          <h3 id="mortgage-calc-heading">Mortgage calculator</h3>
        ) : (
          <h2 id="mortgage-calc-heading">Mortgage calculator</h2>
        )}
        <p className="mortgage-calculator-lead">
          Estimate your monthly home loan EMI. Figures are indicative — check
          with your bank for exact rates.
        </p>
      </header>

      <div className="mortgage-calculator-grid">
        <div className="mortgage-calculator-fields">
          <label className="mortgage-field">
            <span>Property price (₹)</span>
            <input
              type="number"
              min={0}
              step={100000}
              inputMode="numeric"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              placeholder="e.g. 5000000"
            />
          </label>
          <label className="mortgage-field">
            <span>Down payment (%)</span>
            <input
              type="number"
              min={0}
              max={99}
              step={1}
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(e.target.value)}
            />
          </label>
          <label className="mortgage-field">
            <span>Interest rate (% p.a.)</span>
            <input
              type="number"
              min={0}
              max={30}
              step={0.1}
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
            />
          </label>
          <label className="mortgage-field">
            <span>Loan tenure (years)</span>
            <input
              type="number"
              min={1}
              max={40}
              step={1}
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
            />
          </label>
        </div>

        <div className="mortgage-calculator-results" aria-live="polite">
          <p className="mortgage-result-primary">
            <span className="mortgage-result-label">Monthly EMI</span>
            <strong className="mortgage-result-emi">
              {result.emi > 0 ? formatPrice(Math.round(result.emi)) : "—"}
            </strong>
          </p>
          <dl className="mortgage-result-breakdown">
            <div>
              <dt>Loan amount</dt>
              <dd>
                {result.principal > 0
                  ? formatPrice(result.principal)
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Total interest</dt>
              <dd>
                {result.totalInterest > 0
                  ? formatPrice(Math.round(result.totalInterest))
                  : "—"}
              </dd>
            </div>
            <div>
              <dt>Total payable</dt>
              <dd>
                {result.totalPayment > 0
                  ? formatPrice(Math.round(result.totalPayment))
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
