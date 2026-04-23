export const calculateMoisture = (rainTotal, weeklyNeed, waterHistory = []) => {
  const now = new Date();
  const rain = parseFloat(rainTotal) || 0;

  // check against old format of waterHistory (array of strings) and new format (array of objects)
  const historyArray = Array.isArray(waterHistory) ? waterHistory : [];

  // Sum manual water from the last 7 days
  const manualTotal = historyArray.reduce((sum, entry) => {
      // Check if entry is an object with an amount (skips old string-only entries)
      if (entry && typeof entry === 'object' && entry.amount) {
        const entryDate = new Date(entry.date);
        const daysOld = (now - entryDate) / (1000 * 60 * 60 * 24);
        return daysOld <= 7 ? sum + entry.amount : sum;
      }
      return sum;
    }, 0);

  const totalWaterInches = rain + manualTotal;

  // Base Percentage (Volume Based)
  let percent = (totalWaterInches / weeklyNeed) * 100;

  // Recency of watering changes moister amount
  // If the last watering was very recent, boost the percent to reflect wet soil
  if (waterHistory.length > 0) {
    const lastEntry = new Date(waterHistory[0].date);
    const hoursSince = (now - lastEntry) / (1000 * 60 * 60);

    if (hoursSince < 12) percent += 40; // Soil is physically wet
    else if (hoursSince < 24) percent += 20; // Soil is damp
  }

  percent = Math.min(Math.round(percent), 100);

  return { 
    percent, 
    totalReceived: totalWaterInches.toFixed(2),
    status: percent > 80 ? "Hydrated" : percent > 40 ? "Damp" : "Dry"
  };
};