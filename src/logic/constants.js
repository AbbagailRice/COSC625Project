/**
 * Gardening thresholds and application limits
 */
export const GARDENING_CONFIG = {
  MAX_PLANTS: 50,                // From your 'Capacity' requirement
  FROST_THRESHOLD: 70,          // Degrees Fahrenheit
  HEAT_THRESHOLD: 80,           // Degrees Fahrenheit
  HEAT_WARNING_MARGIN: 5,
  DEFAULT_LAT: 39.5298,         // Rawlings, MD Latitude
  DEFAULT_LON: -78.8550,        // Rawlings, MD Longitude
  WATER_NEEDS: {
    MAX: 3.0,
    HIGH: 1.5,                  // Inches per week
    MEDIUM: 1.0,
    LOW: 0.5
  }
};