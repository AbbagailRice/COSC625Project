import React, { useState, useEffect, useCallback} from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import HomeView from '../views/HomeView';
import GardenView from '../views/GardenView';
import { getCoordinates, getWeatherData, getPastRainTotal } from '../services/WeatherService';
import './App.css';
import { checkExtremeTemps } from '../logic/weatherAlerts';

function App() {
  const [zip, setZip] = useState(() => localStorage.getItem('zip') || '');
  const [weather, setWeather] = useState(null);
  const [weatherAlert, setWeatherAlert] = useState({ hasRisk: false });
  const [loading, setLoading] = useState(zip ? true : false); 
  const [fullName, setCityName] = useState('');
  const [rainTotal, setRainTotal] = useState('0.00');

  const updateDashboard = useCallback(async (searchZip) => {
    const zipRegex = /^[0-9]{5}$/;
    if (!zipRegex.test(searchZip)) {
      alert("Please enter a valid 5-digit Zip Code.");
      return;
    }

    setLoading(true);

    const timeoutBuffer = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 5000)
    );
    try {
      const coords = await Promise.race([
        getCoordinates(searchZip),
        timeoutBuffer
      ]);

      if (coords) {
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
          timeoutBuffer
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
    if (zip) {
      const loadInitialWeather = async () => {
        await updateDashboard(zip);
      };
      loadInitialWeather();

      const refreshInterval = setInterval(() => {
        console.log("Auto-refreshing weather data for:", zip);
        updateDashboard(zip);
      }, 1800000); 

      return () => clearInterval(refreshInterval);
    } else {
      setLoading(false);
    }
  }, [zip, updateDashboard]);

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
              <div className="nav-icon">
                {/* House icon */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
                    stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M9 21V15H15V21" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Home</span>
            </NavLink>

            <NavLink to="/garden" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <div className="nav-icon">
                {/* Plant/leaf icon */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                  <path d="M12 22V12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 12C12 12 7 10 5 5C9 4 14 6 14 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M12 16C12 16 16 13 19 15C17 19 13 19 12 16Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </div>
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
