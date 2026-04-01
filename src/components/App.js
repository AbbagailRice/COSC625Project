import React, { useState, useEffect } from 'react';
import './App.css';
import { getCoordinates, getWeatherData } from '../services/WeatherService';

function App() {
  const [zip, setZip] = useState('21532'); // Default to Frostburg
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setCityName] = useState('Loading...');

  // Funct to handel API sequence
  const updateDashboard = async (searchZip) => {

    // Validate Zip Code format before making API calls
    const zipRegex = /^[0-9]{5}$/;
    if (!zipRegex.test(searchZip)) {
      alert("Please enter a valid 5-digit Zip Code.");
      return;
    }

    setLoading(true);
    const coords = await getCoordinates(searchZip);
    
    if (coords) {
      try {
        // Fetch NWS Points to get the real City/State name
        const pointsRes = await fetch(`https://api.weather.gov/points/${coords.lat},${coords.lon}`, {
          headers: { 'User-Agent': process.env.REACT_APP_NWS_USER_AGENT }
        });
        const pointsData = await pointsRes.json();
        
        // Get the city and state from the NWS response to display
        const city = pointsData.properties.relativeLocation.properties.city;
        const state = pointsData.properties.relativeLocation.properties.state;
        setCityName(`${city}, ${state}`);

        // Fetch Weather Data
        const data = await getWeatherData(coords.lat, coords.lon);
        if (data) {
          setWeather(data);
          setZip(searchZip);
        }
      } catch (error) {
        console.error("NWS Fetch Error:", error); // Handles API timeouts or downtime
        alert("Weather service is temporarily unavailable.");
      }
    } else {
      alert("Zip Code not found. Please try another area.");
    }
    setLoading(false);
  };

  useEffect(() => {
  // Init Load
  const loadInitialWeather = async () => {
    await updateDashboard(zip);
  };
  loadInitialWeather();

  // Timer for 30 minute refeshes 
  const refreshInterval = setInterval(() => {
    console.log("Auto-refreshing weather data...");
    updateDashboard(zip);
  }, 1800000); 

  // stops the timer if the user closes the page or switches tabs.
  return () => clearInterval(refreshInterval);
  
}, [zip]);

  // While data loads, show a simple message
  if (loading || !weather) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
  );
  }

  const currentHour = weather.hourly.properties.periods[0];

  return (
    <div className="app-container">
      {/* Sidebar/Navigation Panel */}
      <aside className="sidebar">
        <div className="logo">DewDiligence</div>
        <nav>
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">My Garden</button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Search Bar with standard input */}
        <header className="header">
          <input 
            type="text" 
            placeholder="Search Zip Code..." 
            className="search-bar"
            onKeyDown={(e) => e.key === 'Enter' && updateDashboard(e.target.value)}
          />
        </header>

        {/* The Weather Box (Placeholder for images) */}
        <section className="weather-card">
          <div className="weather-info">
            {/* Display the Location directly from the state */}
            <h1> {fullName}</h1>
            
            {/* Weather data mapped from the NWS response */}
            <p className="current-temp">{currentHour.temperature}°</p>
            <p className="short-forecast">{currentHour.shortForecast}</p>
          </div>
        </section>

        {/* Hourly and Alerts Row */}
        <div className="lower-row">
          <section className="hourly-forecast-card card">
            <h2>Hourly Forecast</h2>
            <div className="hourly-grid">
              {/* Map through the first 6 hours of the hourly data */}
              {weather.hourly.properties.periods.slice(0, 6).map((period, index) => {
                // Convert '2026-03-31T14:00:00-04:00' to '2 PM'
                const timeLabel = new Date(period.startTime).toLocaleTimeString([], { 
                  hour: 'numeric', 
                  hour12: true 
                });

                return (
                  <div key={index} className="hour-item">
                    {/* Time sits above the temperature */}
                    <p className="hour-time">{index === 0 ? "Now" : timeLabel}</p>
                    <p className="hour-temp">{period.temperature}°</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Placeholder for Alerts (heat/frost) and Gardening Tips */}
          <section className="alerts-and-tips">
            <div className="alert-card card heat">Heat Warning Placeholder</div>
            <div className="tip-card card">Tip of the Day Placeholder</div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;