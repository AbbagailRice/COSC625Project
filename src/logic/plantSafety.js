import { GARDENING_CONFIG } from './constants';

export const getSensitivePlants = (plants, activeRisks) => {
  if (!activeRisks || activeRisks.length === 0 || !plants) return [];

  const sensitiveReport = [];

  plants.forEach(plant => {
    activeRisks.forEach(risk => {
      // Frost Logic: Flag if risk is Frost AND plant is NOT resistant
      if (risk.type === 'Frost' && !plant.frostResistant) {
        sensitiveReport.push({ name: plant.nickname, reason: 'Not frost hardy' });
      }

      // Heat Logic: Flag if risk is Heat AND temp exceeds their Max Zone's tolerance
      // Zone 1-8 plants struggle once it hits the 90°F threshold
      if (risk.type === 'Extreme Heat' && plant.maxZone <= 8) {
        sensitiveReport.push({ name: plant.nickname, reason: 'Heat sensitive' });
      }

      // Zone Logic: If it's colder than the plant's specific Min Zone
      // (Even if it's not a Frost event yet, like a Tropical plant in 45°F)
      if (risk.value <= GARDENING_CONFIG.ZONE_TEMP_MAP[plant.minZone]) {
        // Avoid duplicates if already flagged for Frost
        if (!sensitiveReport.some(r => r.name === plant.nickname)) {
          sensitiveReport.push({ name: plant.nickname, reason: 'Below min zone temp' });
        }
      }
    });
  });

  return sensitiveReport;
};