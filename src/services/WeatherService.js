const USER_AGENT = process.env.REACT_APP_NWS_USER_AGENT;

/** Zip Code Geocoding
 * Converts a 5-digit Zip Code into Lat/Lon using Zippopotam.us.
 */
export const getCoordinates = async (zip) => {
  try {
    // Fetch data from the Zippopotam.us API
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    
    // Handle invalid Zip Codes
    if (!response.ok) {
      console.error("Zip Code not found");
      return null;
    }

    const data = await response.json();

    // Get Lat and Lon from the places array
    // Convert results to floats
    return {
      lat: parseFloat(data.places[0].latitude),
      lon: parseFloat(data.places[0].longitude)
    };
  } catch (error) {
    console.error("Zip Search Failed:", error);
    return null;
  }
};

/**
 * NWS Data Integration
 * Logic for retrieving real-time weather and rainfall history from 
 * the National Weather Service (NWS) API
 */
export const getWeatherData = async (lat, lon) => {
  try {
    // Retrieve the User-Agent from the .env file for secure identification
    const headers = { 'User-Agent': process.env.REACT_APP_NWS_USER_AGENT };

    // Convert Lat/Lon into NWS-specific Grid Points
    const pointsResponse = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
    const pointsData = await pointsResponse.json();

    // Extract the unique URLs for the General Forecast and the Hourly Rain Data
    const forecastUrl = pointsData.properties.forecast; 
    const hourlyUrl = pointsData.properties.forecastHourly;

    // Fetch both data sets at the same time for improved performance
    const [forecastRes, hourlyRes] = await Promise.all([
      fetch(forecastUrl, { headers }),
      fetch(hourlyUrl, { headers })
    ]);

    // Return the parsed data for use in the Dashboard and Logic layers
    return {
      current: await forecastRes.json(),
      hourly: await hourlyRes.json()
    };
  } catch (error) {
    // Handles API timeouts or downtime
    console.error("NWS Fetch Error:", error);
    return null;
  }
};