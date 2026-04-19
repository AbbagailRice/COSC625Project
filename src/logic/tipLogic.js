import { GARDENING_CONFIG } from './constants';

/**
 * Tip of the Day Logic
 * Extracts relevant forecast data and returns a contextual gardening tip
 * based on current weather conditions.
 *
 * Pre-condition:  Forecast data has been retrieved (weather object is not null)
 * Post-condition: Relevant forecast information is extracted and a tip is returned
 */

/**
 * Extracts key weather signals from the forecast data.
 * @param {Object} weather - The weather object from getWeatherData()
 * @param {string} rainTotal - Weekly rain total in inches from getPastRainTotal()
 * @returns {Object} Extracted weather signals used for tip selection
 */
export const extractForecastSignals = (weather, rainTotal) => {
  const currentHour = weather.hourly.properties.periods[0];
  const next24Hours = weather.hourly.properties.periods.slice(0, 24);

  // Get min/max temps over the next 24 hours
  const temps = next24Hours.map((p) => p.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  // Check for rain in short forecast descriptions
  const rainKeywords = ['rain', 'shower', 'drizzle', 'precipitation', 'storm', 'thunderstorm'];
  const willRain = next24Hours.some((p) =>
    rainKeywords.some((kw) => p.shortForecast.toLowerCase().includes(kw))
  );

  // Check for wind
  const windKeywords = ['windy', 'breezy', 'gusty'];
  const isWindy = next24Hours.some((p) =>
    windKeywords.some((kw) => p.shortForecast.toLowerCase().includes(kw))
  );

  // Check for sunny/clear conditions
  const sunKeywords = ['sunny', 'clear', 'mostly sunny'];
  const isSunny = sunKeywords.some((kw) =>
    currentHour.shortForecast.toLowerCase().includes(kw)
  );

  const rain = parseFloat(rainTotal);

  return {
    currentTemp: currentHour.temperature,
    minTemp,
    maxTemp,
    willRain,
    isWindy,
    isSunny,
    rainTotal: rain,
  };
};

/**
 * Selects a gardening tip based on extracted weather signals.
 * Priority order: Frost > Heat > Rain (incoming) > Dry soil > Wind > Sunny > Default
 *
 * @param {Object} signals - Output from extractForecastSignals()
 * @returns {string} A contextual gardening tip
 */
export const selectTip = (signals) => {
  const { currentTemp, minTemp, maxTemp, willRain, isWindy, isSunny, rainTotal } = signals;
  const { FROST_THRESHOLD, HEAT_THRESHOLD, HEAT_WARNING_MARGIN, WATER_NEEDS } = GARDENING_CONFIG;

  // Frost risk — highest priority
  if (minTemp <= FROST_THRESHOLD) {
    return `Frost risk tonight (${minTemp}°F). Cover frost-sensitive plants or bring containers indoors before sundown.`;
  }

  // Extreme heat risk
  if (maxTemp >= HEAT_THRESHOLD + HEAT_WARNING_MARGIN) {
    return `High heat expected (${maxTemp}°F). Water deeply in the early morning and add mulch to retain soil moisture.`;
  }

  // Rain incoming — skip watering
  if (willRain) {
    return `Rain is in the forecast. Hold off on watering today and check soil moisture again tomorrow.`;
  }

  // Soil is dry based on 7-day rain total
  if (rainTotal < WATER_NEEDS.LOW) {
    return `Only ${rainTotal}" of rain in the past week. Most plants need at least ${WATER_NEEDS.LOW}" — consider watering today.`;
  }

  // Soil is well-saturated — risk of overwatering
  if (rainTotal >= WATER_NEEDS.HIGH) {
    return `Soil is well-saturated after ${rainTotal}" of rain this week. Skip watering and check for drainage issues in low spots.`;
  }

  // Windy conditions
  if (isWindy) {
    return `Windy conditions today. Stake tall or top-heavy plants to prevent stem damage.`;
  }

  // Great day to be outside
  if (isSunny && currentTemp >= 50 && currentTemp <= 85) {
    return `Great gardening weather! A perfect day to weed, deadhead, or divide overcrowded perennials.`;
  }

  // Generic fallback
  return `Check soil moisture before watering — stick your finger 1–2 inches deep. If it's still damp, wait another day.`;
};

/**
 * Main entry point. Returns a Tip of the Day string based on current forecast.
 * @param {Object} weather - The weather object from getWeatherData()
 * @param {string} rainTotal - Weekly rain total in inches
 * @returns {string} Tip of the Day text
 */
export const getTipOfTheDay = (weather, rainTotal) => {
  if (!weather || !weather.hourly) return 'Fetch your local forecast to get a personalized gardening tip.';
  const signals = extractForecastSignals(weather, rainTotal);
  return selectTip(signals);
};
