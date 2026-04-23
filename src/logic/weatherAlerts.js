import { GARDENING_CONFIG } from './constants';

/**
 * Scans a forecast array and identifies temperature risks 
 * based on hard-coded gardening thresholds.
 * @param {Array} forecastArray - The slice of hourly forecast periods 
 * @returns {Array} An array of risk objects found in the data
 */
export const checkExtremeTemps = (forecastArray, plantName = "your plant",  frostResistant = false) => {
   const risks = [];  
  if (!forecastArray || forecastArray.length === 0) return risks;

  // Use a Set to ensure we only flag each risk type once 
  // (if 5 hours are below freezing, we only want one Frost Warning)
  const foundTypes = new Set();

  for (let period of forecastArray) {
    const temp = period.temperature;

    // Check for Frost Risk
    if (temp <= GARDENING_CONFIG.FROST_THRESHOLD && !foundTypes.has('Frost')) {
      risks.push({ 
        type: 'Frost', 
        value: temp, 
        color: 'frost' ,
        action: [
          `Protect ${plantName} from frost overnight.`,
          `Bring ${plantName} indoors or cover it before nightfall.`
        ]

      });
      foundTypes.add('Frost');
    }
    
    // Check for Extreme Heat Risk
    if (temp >= GARDENING_CONFIG.HEAT_THRESHOLD && !foundTypes.has('Extreme Heat')) {
      risks.push({ 
        type: 'Extreme Heat', 
        value: temp, 
        color: 'extreme-heat' ,
        action: [
            `Cover ${plantName} to protect it from heat stress.`,
          `Provide afternoon shade for ${plantName} to reduce heat stress.`
        ]
      });
      foundTypes.add('Extreme Heat');
    }

    // If found both types, stop looping
    if (foundTypes.size === 2) break;
  }
  

  return risks; 
};