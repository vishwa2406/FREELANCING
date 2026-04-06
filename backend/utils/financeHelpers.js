const monthBounds = (month) => {
  const [year, mm] = String(month).split('-').map(Number);
  const start = new Date(Date.UTC(year, mm - 1, 1));
  const end = new Date(Date.UTC(year, mm, 1));
  return { start, end };
};

const calculateEmi = ({ principal, annualRate, months }) => {
  const p = Number(principal);
  const r = Number(annualRate) / 12 / 100;
  const n = Number(months);
  if (!p || !n) return { emi: 0, totalPayable: 0, totalInterest: 0 };
  if (r === 0) {
    const emi = p / n;
    return { emi, totalPayable: p, totalInterest: 0 };
  }
  const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
  return { emi, totalPayable: emi * n, totalInterest: emi * n - p };
};

const calculateSip = ({ monthlyInvestment, annualRate, years }) => {
  const p = Number(monthlyInvestment);
  const r = Number(annualRate) / 12 / 100;
  const n = Number(years) * 12;
  if (!p || !n) return { investedAmount: 0, estimatedReturns: 0, maturityValue: 0 };
  if (r === 0) {
    const investedAmount = p * n;
    return { investedAmount, estimatedReturns: 0, maturityValue: investedAmount };
  }
  const maturityValue = p * (((1 + r) ** n - 1) / r) * (1 + r);
  const investedAmount = p * n;
  return { investedAmount, estimatedReturns: maturityValue - investedAmount, maturityValue };
};

const calculateInflation = ({ currentAmount, annualRate, years }) => {
  const amount = Number(currentAmount);
  const r = Number(annualRate) / 100;
  const y = Number(years);
  if (!amount || Number.isNaN(r) || Number.isNaN(y)) return { futureCost: 0, presentPower: 0 };
  const futureCost = amount * (1 + r) ** y;
  const presentPower = amount / (1 + r) ** y;
  return { futureCost, presentPower };
};

module.exports = { monthBounds, calculateEmi, calculateSip, calculateInflation };
