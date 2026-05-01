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

    // the timeout buffer
    const timeoutBuffer = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );
    try {
    // Race the coordinates fetch against the 5-second timeout
    const coords = await Promise.race([
      getCoordinates(searchZip),
      timeoutBuffer
    ]);

    if (coords) {
      // Rest of the weather data fetches against the timeout
      await Promise.race([
        (async () => {
          const pointsRes = await fetch(`https://api.weather.gov/points/${coords.lat},${coords.lon}`, {
            headers: { 'User-Agent': process.env.REACT_APP_NWS_USER_AGENT }
          });
          const pointsData = await pointsRes.json();
          
          const city = pointsData.properties.relativeLocation.properties.city;
          const state = pointsData.properties.relativeLocation.properties.state;
          setCityName(`${city}, ${state}`);

          const total = await getPastRainTotal(coords.lat, coords.lon);
          setRainTotal(total);

          const data = await getWeatherData(coords.lat, coords.lon);
          if (data) {
            setWeather(data);
            if (data.hourly) {
              const next24Hours = data.hourly.properties.periods.slice(0, 24);
              setWeatherAlert(checkExtremeTemps(next24Hours));
            }
            if (searchZip !== zip) {
              setZip(searchZip);
              localStorage.setItem('zip', searchZip);
            }
          }
        })(),
        timeoutBuffer // 5-second timer
      ]);
    } else {
      alert("Zip Code not found. Please try another area.");
    }
  } catch (error) {
    if (error.message === "Timeout") {
      alert("Connection is too slow. Please check your internet and try again.");
    } else {
      console.error("Fetch Error:", error);
      alert("Weather service is temporarily unavailable.");
    }
  } finally {
    setLoading(false);
  }
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

