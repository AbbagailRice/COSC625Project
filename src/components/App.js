import React, { useState, useEffect, useCallback} from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomeView from '../views/HomeView';
import GardenView from '../views/GardenView';
import { getCoordinates, getWeatherData, getPastRainTotal } from '../services/WeatherService';
import './App.css';
import { checkExtremeTemps } from '../logic/weatherAlerts';

function App() {
  // Check localStorage immediately. If empty, zip is an empty string.
  const [zip, setZip] = useState(() => localStorage.getItem('zip') || '');
  const [weather, setWeather] = useState(null);

  // Weather Alert State to track any extreme conditions
  const [weatherAlert, setWeatherAlert] = useState({ hasRisk: false });

  // Start loading as FALSE if there is no zip to fetch
  const [loading, setLoading] = useState(zip ? true : false); 
  const [fullName, setCityName] = useState('');
  const [rainTotal, setRainTotal] = useState('0.00');

  // Funct to handel API sequence
  const updateDashboard =  useCallback( async (searchZip) => {

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

        // Check for any extreme temperature risks in the forecast and update alert state
        if (data.hourly) {
          const allPeriods = data.hourly.properties.periods;
          
          // Slice to only check the first 24 hours
          const next24Hours = allPeriods.slice(0, 24); 
          
          const riskInfo = checkExtremeTemps(next24Hours);
          setWeatherAlert(riskInfo);
        }

        if (searchZip !== zip) {
            setZip(searchZip);
            localStorage.setItem('zip', searchZip);
          }
      }
      } catch (error) {
        console.error("NWS Fetch Error:", error); // Handles API timeouts or downtime
        alert("Weather service is temporarily unavailable.");
      }
    } else {
      alert("Zip Code not found. Please try another area.");
    }

    setLoading(false);
  }, [zip]); 

  useEffect(() => {
    // Only trigger logic if we actually have a zip code
    if (zip) {
      // Init load for the current zip
      const loadInitialWeather = async () => {
        await updateDashboard(zip);
      };
      loadInitialWeather();

      // Set up the 30-minute refresh interval
      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing weather data for:", zip);
        updateDashboard(zip);
      }, 1800000); 

      // stops the timer if the component unmounts or zip changes
      return () => clearInterval(refreshInterval);
    } else {
      // If no zip exists, loading is off so HomeView shows the search prompt
      setLoading(false);
    }

}, [zip, updateDashboard]); // updateDashboard added for dependency best practices

  // While data loads, show a simple message
  if (loading) {
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
            <Route path="/garden" element={
              <GardenView 
                cityName={fullName} 
                rainTotal={rainTotal} 
                weatherAlert={weatherAlert}
                weather={weather}/>}
                />
            <Route path="/" element={
              <HomeView 
                weather={weather} 
                cityName={fullName} 
                rainTotal={rainTotal}
                updateDashboard={updateDashboard} 
                alert={weatherAlert}
              />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

