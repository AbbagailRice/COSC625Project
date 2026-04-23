/**
 * Gardening thresholds and application limits
 */
export const GARDENING_CONFIG = {
  MAX_PLANTS: 50,                // From your 'Capacity' requirement
  FROST_THRESHOLD: 72,          // Degrees Fahrenheit
  HEAT_THRESHOLD: 70,           // Degrees Fahrenheit
  HEAT_WARNING_MARGIN: 5,
  WATER_NEEDS: {
    MAX: 3.0,
    HIGH: 1.5,                  // Inches per week
    MEDIUM: 1.0,
    LOW: 0.5
  },
  ZONES: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  RESISTANCE_TYPES: {
    FROST_RESISTANT: "Frost Resistant",
    NOT_RESISTANT: "Not Frost Resistant"
  },
  ZONE_TEMP_MAP: {
    1: -50, 2: -40, 3: -30, 4: -20, 5: -10,
    6: 0,   7: 10,  8: 20,  9: 30,  10: 40,
    11: 50, 12: 60, 13: 70
  }

};
