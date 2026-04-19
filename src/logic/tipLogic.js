import { GARDENING_CONFIG } from './constants';

/**
 * Tip of the Day Logic
 * Extracts relevant forecast data and returns a contextual gardening tip
 * based on current weather conditions. Tips rotate daily within each condition.
 *
 * Pre-condition:  Parsed forecast data is available
 * Post-condition: Forecast is displayed to the user via a rotated tip
 */

/**
 * Returns a daily index (0, 1, 2...) that changes every calendar day.
 * Same day = same index. Different day = different index.
 * Used to rotate tips without randomness so the tip is stable all day.
 * @returns {number} Day-of-year integer (0–364)
 */
const getDailyIndex = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Picks one tip from an array using the daily index.
 * @param {string[]} tips - Array of tip strings for a condition
 * @returns {string} The selected tip for today
 */
const pickTip = (tips) => tips[getDailyIndex() % tips.length];

/**
 * Tip pool organized by weather condition.
 * Each condition has multiple tips that rotate daily.
 */
const TIP_POOL = {
  frost: [
    (min) => `Frost risk tonight (${min}°F). Cover frost-sensitive plants or bring containers indoors before sundown.`,
    (min) => `Temperatures dropping to ${min}°F. Mulch around the base of perennials to insulate roots overnight.`,
    (min) => `Frost expected at ${min}°F. Water plants lightly before sunset — moist soil holds heat better than dry soil.`,
    (min) => `Cold night ahead (${min}°F). Move tropical and citrus containers to a sheltered spot or garage.`,
  ],
  heat: [
    (max) => `High heat expected (${max}°F). Water deeply in the early morning and add mulch to retain soil moisture.`,
    (max) => `${max}°F forecast today. Avoid working in the garden during peak sun (11am–3pm) to protect yourself and your plants.`,
    (max) => `Heat incoming at ${max}°F. Shade cloth can reduce plant stress on the hottest days — consider draping sensitive beds.`,
    (max) => `Temperatures hitting ${max}°F. Check container plants twice — pots dry out much faster than ground soil in the heat.`,
  ],
  rain: [
    `Rain is in the forecast. Hold off on watering today and check soil moisture again tomorrow.`,
    `Rain coming — a great day to plan what to plant next or catch up on garden journaling indoors.`,
    `Incoming rain will do the watering for you. Use the time to sharpen tools or prep new planting areas.`,
    `Rainy day ahead. Check that garden beds have good drainage so roots don't sit in standing water.`,
  ],
  dry: [
    (total) => `Only ${total}" of rain in the past week. Most plants need at least ${GARDENING_CONFIG.WATER_NEEDS.LOW}" — consider watering today.`,
    (total) => `Dry week with just ${total}" of rain. Water at the base of plants in the early morning to reduce evaporation.`,
    (total) => `Low rainfall this week (${total}"). Check soil 2 inches deep — if it's dry, it's time to water.`,
    (total) => `Only ${total}" recorded this week. Prioritize recently transplanted seedlings — their shallow roots dry out first.`,
  ],
  saturated: [
    (total) => `Soil is well-saturated after ${total}" of rain this week. Skip watering and check for drainage issues in low spots.`,
    (total) => `${total}" of rain this week — plenty for most plants. Watch for yellowing leaves, a sign of overwatering.`,
    (total) => `Great rainfall this week (${total}"). Hold off watering and pull any weeds that popped up after the rain.`,
    (total) => `Soil is saturated at ${total}" this week. A good time to aerate compacted areas to improve drainage.`,
  ],
  windy: [
    `Windy conditions today. Stake tall or top-heavy plants to prevent stem damage.`,
    `Strong winds expected. Check that trellises and supports are secured before heading out.`,
    `It's breezy today — avoid spraying pesticides or fertilizers, as wind carries them off target.`,
    `Wind advisory: newly transplanted seedlings are vulnerable. Add a windbreak or temporary shelter if possible.`,
  ],
  sunny: [
    `Great gardening weather! A perfect day to weed, deadhead, or divide overcrowded perennials.`,
    `Clear skies today — ideal conditions to plant, transplant, or start a new bed.`,
    `Sunny day ahead. Apply compost or slow-release fertilizer so it can work into the soil over the week.`,
    `Beautiful day for the garden. Take a few minutes to walk your beds and spot any early signs of pests or disease.`,
  ],
  default: [
    `Check soil moisture before watering — stick your finger 1–2 inches deep. If it's still damp, wait another day.`,
    `Rotate your crops each season to prevent soil depletion and reduce pest buildup in the same beds.`,
    `Add a layer of compost to your beds this week — it improves drainage, feeds plants, and builds soil health.`,
    `Keep a simple garden journal. Noting what you plant and when helps you improve every season.`,
  ],
};

/**
 * Extracts key weather signals from the forecast data.
 * @param {Object} weather - The weather object from getWeatherData()
 * @param {string} rainTotal - Weekly rain total in inches from getPastRainTotal()
 * @returns {Object} Extracted weather signals used for tip selection
 */
export const extractForecastSignals = (weather, rainTotal) => {
  const currentHour = weather.hourly.properties.periods[0];
  const next24Hours = weather.hourly.properties.periods.slice(0, 24);

  const temps = next24Hours.map((p) => p.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);

  const rainKeywords = ['rain', 'shower', 'drizzle', 'precipitation', 'storm', 'thunderstorm'];
  const willRain = next24Hours.some((p) =>
    rainKeywords.some((kw) => p.shortForecast.toLowerCase().includes(kw))
  );

  const windKeywords = ['windy', 'breezy', 'gusty'];
  const isWindy = next24Hours.some((p) =>
    windKeywords.some((kw) => p.shortForecast.toLowerCase().includes(kw))
  );

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
 * Selects and rotates a gardening tip based on extracted weather signals.
 * Priority: Frost > Heat > Rain > Dry soil > Saturated soil > Wind > Sunny > Default
 * Rotation is date-based — same condition yields a different tip each day.
 *
 * @param {Object} signals - Output from extractForecastSignals()
 * @returns {string} A contextual gardening tip for today
 */
export const selectTip = (signals) => {
  const { minTemp, maxTemp, willRain, isWindy, isSunny, rainTotal } = signals;
  const { FROST_THRESHOLD, HEAT_THRESHOLD, HEAT_WARNING_MARGIN, WATER_NEEDS } = GARDENING_CONFIG;

  if (minTemp <= FROST_THRESHOLD) {
    return pickTip(TIP_POOL.frost.map((fn) => fn(minTemp)));
  }

  if (maxTemp >= HEAT_THRESHOLD + HEAT_WARNING_MARGIN) {
    return pickTip(TIP_POOL.heat.map((fn) => fn(maxTemp)));
  }

  if (willRain) {
    return pickTip(TIP_POOL.rain);
  }

  if (rainTotal < WATER_NEEDS.LOW) {
    return pickTip(TIP_POOL.dry.map((fn) => fn(rainTotal)));
  }

  if (rainTotal >= WATER_NEEDS.HIGH) {
    return pickTip(TIP_POOL.saturated.map((fn) => fn(rainTotal)));
  }

  if (isWindy) {
    return pickTip(TIP_POOL.windy);
  }

  if (isSunny && signals.currentTemp >= 50 && signals.currentTemp <= 85) {
    return pickTip(TIP_POOL.sunny);
  }

  return pickTip(TIP_POOL.default);
};

/**
 * Main entry point. Returns a Tip of the Day string based on current forecast.
 * @param {Object} weather - The weather object from getWeatherData()
 * @param {string} rainTotal - Weekly rain total in inches
 * @returns {string} Tip of the Day text
 */
export const getTipOfTheDay = (weather, rainTotal) => {
  if (!weather || !weather.hourly) {
    return 'Fetch your local forecast to get a personalized gardening tip.';
  }
  const signals = extractForecastSignals(weather, rainTotal);
  return selectTip(signals);
};
