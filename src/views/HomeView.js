import { getTipOfTheDay } from '../logic/tipLogic';
import React, { useState } from 'react';

const HomeView = ({ weather, cityName, rainTotal, updateDashboard, alert }) => {
// Filters out alerts that the user has dismissed
// Only alerts NOT in dismissedAlerts are shown on the dashboard
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const visibleAlerts = (alert || []).filter(
  a => !dismissedAlerts.includes(a.type)
);
// Extract the current hour forecast then generate contextual tip based on weather conditions
const currentHour = weather.hourly.properties.periods[0];
const tip = getTipOfTheDay(weather, rainTotal);


  // If no weather data exists yet (First visit)
  if (!weather) {
    return (
      <div className="home-content">
        <header className="header">
          <input 
            type="text" 
            placeholder="Search Zip Code..." 
            className="search-bar"
            onKeyDown={(e) => e.key === 'Enter' && updateDashboard(e.target.value)}
          />
        </header>
        <section className="weather-card empty-state">
          <div className="weather-info">
            <h1>Welcome to DewDiligence</h1>
            <p>Please enter your 5-digit Zip Code above to get started.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="home-content">
      <header className="header">
        <input 
          type="text" 
          placeholder="Search Zip Code..." 
          className="search-bar"
          onKeyDown={(e) => e.key === 'Enter' && updateDashboard(e.target.value)}
        />
      </header>

      <section className="weather-card">
        <div className="weather-info">
          <h1>{cityName}</h1>
          <p className="current-temp">{currentHour.temperature}°</p>
          <p className="short-forecast">{currentHour.shortForecast}</p>
        </div>
      </section>


      <div className="lower-row">
        <section className="hourly-forecast-card card">
          <h2>Hourly Forecast</h2>
          <div className="hourly-grid">
            {weather.hourly.properties.periods.slice(0, 6).map((period, index) => (
              <div key={index} className="hour-item">
                <p className="hour-time">
                  {index === 0 ? "Now" : new Date(period.startTime).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                </p>
                <p className="hour-temp">{period.temperature}°</p>
              </div>
            ))}
            <div className="rain-total-container">
              <div className="rain-label">
                 7-Day Rain Total
              </div>
              <div className="rain-value">
                {rainTotal} inches
              </div>
            </div>
          </div>
        </section>


        <section className="alerts-and-tips">
          {visibleAlerts.length > 0 ? (
            <div className="alert-container">
              {visibleAlerts.map((risk) => (
                <div
                  key={risk.type}
                  className={`alert-card card ${risk.color}`}
                >
                  <p>{risk.type} Warning</p>

                  <p className="alert-detail">
                    {risk.value}°F detected within 24 hours.
                  </p>



                  {/* DISMISS BUTTON
                  //Adds alert type to dismissedAlerts state.
                  // Prevents this alert from being rendered again during session*/}
                  <button
                    onClick={() =>
                      setDismissedAlerts((prev) =>
                        prev.includes(risk.type)
                          ? prev
                          : [...prev, risk.type]
                      )
                    }
                  >
                    Dismiss
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="alert-card card no-alert">
              <p>No weather risks detected.</p>
            </div>
          )}

          <div className="tip-card card">
            <p className="tip-title">Tip of the Day</p>
             {/* Displays generated gardening tip based on current weather conditions */}
            <p className="tip-text">{tip}</p>   
               </div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;