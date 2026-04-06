/**
 * Gardening thresholds and application limits
 */
export const GARDENING_CONFIG = {
  MAX_PLANTS: 50,                // From your 'Capacity' requirement
  FROST_THRESHOLD: 32,          // Degrees Fahrenheit
  HEAT_THRESHOLD: 90,           // Degrees Fahrenheit
  DEFAULT_LAT: 39.5298,         // Rawlings, MD Latitude
  DEFAULT_LON: -78.8550,        // Rawlings, MD Longitude
  WATER_NEEDS: {
    MAX: 3.0,
    HIGH: 1.5,                  // Inches per week
    MEDIUM: 1.0,
    LOW: 0.5
  }
};

/**
 * Water category options for plant form dropdown
 * Values align with GARDENING_CONFIG.WATER_NEEDS keys
 */
export const WATER_CATEGORIES = [
  { value: 'LOW',    label: 'Low – 0.5 in/week' },
  { value: 'MEDIUM', label: 'Medium – 1.0 in/week' },
  { value: 'HIGH',   label: 'High – 1.5 in/week' },
  { value: 'MAX',    label: 'Max – 3.0 in/week' },
];
