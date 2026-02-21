const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const roundTo2 = (value) => Number(value.toFixed(2));

export const calculateIncomeTax = (req, res) => {
  try {
    const income = toNumber(req.body?.income);
    let tax = 0;

    // Basic Indian tax slabs for NRI estimate
    if (income <= 250000) tax = 0;
    else if (income <= 500000) tax = (income - 250000) * 0.05;
    else if (income <= 1000000) tax = 12500 + (income - 500000) * 0.2;
    else tax = 112500 + (income - 1000000) * 0.3;

    return res.status(200).json({
      success: true,
      result: {
        income: roundTo2(income),
        tax: roundTo2(tax),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate income tax",
      error: error.message,
    });
  }
};

export const calculateCapitalGainsTax = (req, res) => {
  try {
    const purchasePrice = toNumber(req.body?.purchasePrice);
    const salePrice = toNumber(req.body?.salePrice);
    const period = req.body?.period === "short-term" ? "short-term" : "long-term";
    const gain = salePrice - purchasePrice;

    const rate = period === "long-term" ? 0.125 : 0.2;
    const tax = gain > 0 ? gain * rate : 0;

    return res.status(200).json({
      success: true,
      result: {
        purchasePrice: roundTo2(purchasePrice),
        salePrice: roundTo2(salePrice),
        gain: roundTo2(gain),
        rate,
        tax: roundTo2(tax),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate capital gains tax",
      error: error.message,
    });
  }
};

export const calculateRentalIncomeTax = (req, res) => {
  try {
    const monthlyRent = toNumber(req.body?.monthlyRent);
    const expenses = toNumber(req.body?.expenses);
    const annualRent = monthlyRent * 12;
    const netIncome = annualRent - expenses;
    const tax = netIncome > 0 ? netIncome * 0.3 : 0;

    return res.status(200).json({
      success: true,
      result: {
        monthlyRent: roundTo2(monthlyRent),
        expenses: roundTo2(expenses),
        annualRent: roundTo2(annualRent),
        netIncome: roundTo2(Math.max(netIncome, 0)),
        tax: roundTo2(tax),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate rental income tax",
      error: error.message,
    });
  }
};
