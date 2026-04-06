import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomeView from '../views/HomeView';
import GardenView from '../views/GardenView';
import { getCoordinates, getWeatherData, getPastRainTotal } from '../services/WeatherService';
import './App.css';

function App() {
  const [zip, setZip] = useState('21532'); // Default to prefered location (erica this should be the spot for storage persistance)
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setCityName] = useState('Loading...');
  const [rainTotal, setRainTotal] = useState('0.00');

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

        // Fetch the rain total
        const total = await getPastRainTotal(coords.lat, coords.lon);
        setRainTotal(total);

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


  return (
    <Router>
      <div className="app-container">
        <aside className="sidebar">
          <div className="logo-container">
            <h2 className="logo-text">DewDiligence</h2>
          </div>
          
          <nav className="nav-list">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon home-icon"></div>
              <span>Home</span>
            </NavLink>

            <NavLink to="/garden" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon garden-icon"></div>
              <span>My Garden</span>
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/garden" element={<GardenView cityName={fullName} />} />
            <Route path="/" element={
              <HomeView 
                weather={weather} 
                cityName={fullName} 
                rainTotal={rainTotal}
                updateDashboard={updateDashboard} 
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

