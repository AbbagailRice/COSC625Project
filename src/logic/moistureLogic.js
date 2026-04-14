export const calculateMoisture = (rainTotal, weeklyNeed) => {
  // Convert strings to numbers just in case
  const rain = parseFloat(rainTotal);
  const need = parseFloat(weeklyNeed);

  if (need === 0) return { percent: 100, status: 'Stable' };

  // Calculate ratio
  const ratio = rain / need;
  let status = '';
  let percent = Math.min(Math.round(ratio * 100), 100);

  if (ratio >= 1) {
    status = 'Saturated';
    percent = 100;
  } else if (ratio > 0.5) {
    status = 'Moist';
  } else if (ratio > 0.2) {
    status = 'Damp';
  } else {
    status = 'Dry';
  }

  return { percent, status };
};