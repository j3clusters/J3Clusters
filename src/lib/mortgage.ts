export const DEFAULT_ANNUAL_INTEREST_RATE = 8.5;
export const DEFAULT_LOAN_TENURE_YEARS = 20;
export const DEFAULT_DOWN_PAYMENT_PERCENT = 20;

export type MortgageInput = {
  propertyPrice: number;
  downPaymentPercent: number;
  annualInterestRate: number;
  tenureYears: number;
};

export type MortgageResult = {
  principal: number;
  emi: number;
  totalInterest: number;
  totalPayment: number;
};

export function calculateMortgage(input: MortgageInput): MortgageResult {
  const propertyPrice = Math.max(0, input.propertyPrice);
  const downPaymentPercent = Math.min(99, Math.max(0, input.downPaymentPercent));
  const annualInterestRate = Math.max(0, input.annualInterestRate);
  const tenureYears = Math.max(0, input.tenureYears);

  const principal = Math.round(propertyPrice * (1 - downPaymentPercent / 100));
  const months = Math.round(tenureYears * 12);

  if (principal <= 0 || months <= 0) {
    return { principal: 0, emi: 0, totalInterest: 0, totalPayment: 0 };
  }

  const monthlyRate = annualInterestRate / 12 / 100;

  if (monthlyRate === 0) {
    const emi = principal / months;
    return {
      principal,
      emi,
      totalInterest: 0,
      totalPayment: principal,
    };
  }

  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  const totalPayment = emi * months;

  return {
    principal,
    emi,
    totalInterest: totalPayment - principal,
    totalPayment,
  };
}

/** Quick EMI hint for cards and headers (default rate & tenure). */
export function estimateMonthlyEmi(propertyPrice: number): number {
  const { emi } = calculateMortgage({
    propertyPrice,
    downPaymentPercent: DEFAULT_DOWN_PAYMENT_PERCENT,
    annualInterestRate: DEFAULT_ANNUAL_INTEREST_RATE,
    tenureYears: DEFAULT_LOAN_TENURE_YEARS,
  });
  return Math.round(emi / 1000) * 1000;
}
