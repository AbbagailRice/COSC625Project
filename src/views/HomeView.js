import { getTipOfTheDay } from '../logic/tipLogic';
import React, { useState } from 'react';

const HomeView = ({ weather, cityName, rainTotal, updateDashboard, alert }) => {
  // Filters out alerts that the user has dismissed
  // Only alerts NOT in dismissedAlerts are shown on the dashboard
    const [dismissedAlerts, setDismissedAlerts] = useState([]);
    const [tipDismissed, setTipDismissed] = useState(false);
    const visibleAlerts = (alert || []).filter(
    a => !dismissedAlerts.includes(a.type)
  );

  const [tipOffset, setTipOffset] = useState(0);
  // Extract the current hour forecast then generate contextual tip based on weather conditions
  const currentHour = weather.hourly.properties.periods[0];
  const tip = weather ? getTipOfTheDay(weather, rainTotal, tipOffset) : '';

  const handleRefreshTip = (e) => {
      e.stopPropagation(); // Prevent card clicks if necessary
      setTipOffset(prev => prev + 1);
    };
  
  // Map forecast text to JPG filenames
  const getWeatherClassInfo = (forecast) => {
    const lower = forecast?.toLowerCase() || '';
    if (lower.includes('thunderstorm')) return { class: 'weather-stormy', file: 'Stormy.jpg' };
    if (lower.includes('snow') || lower.includes('sleet')) return { class: 'weather-snowy', file: 'Snowy.jpg' };
    if (lower.includes('rain') || lower.includes('showers') || lower.includes('drizzle')) return { class: 'weather-rainy', file: 'Rainy.jpg' };
    if (lower.includes('fog') || lower.includes('mist')) return { class: 'weather-foggy', file: 'Foggy.jpg' };
    if (lower.includes('windy') || lower.includes('breezy')) return { class: 'weather-windy', file: 'Windy.jpg' };
    if (lower.includes('mostly cloudy') || lower.includes('overcast')) return { class: 'weather-cloudy', file: 'Cloudy.jpg' };
    if (lower.includes('partly') || lower.includes('mostly sunny')) return { class: 'weather-partly-cloudy', file: 'Partly Cloudy.jpg' };
    if (lower.includes('sunny') || lower.includes('clear')) return { class: 'weather-sunny', file: 'Sunny.jpg' };
    return { class: 'no-alert', file: null };
  };
  const weatherStyle = currentHour ? getWeatherClassInfo(currentHour.shortForecast) : null;

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

      <section 
        className={`weather-card ${weatherStyle?.class}`}
        style={weatherStyle?.file ? { backgroundImage: `url("/assets/${weatherStyle.file}")` } : {}}
      >
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
          {visibleAlerts.length === 0 && tipDismissed ? (
            <div className="alert-card card no-alert">
              <p>No Weather Notifications.</p>
            </div>
          ) : (
            <>
              {/* Map Alerts */}
              {visibleAlerts.map((risk) => (
                <div key={risk.type} className={`alert-card card ${risk.color}`}>
                  <button
                    className="dismiss-btn"
                    onClick={() =>
                      setDismissedAlerts((prev) =>
                        prev.includes(risk.type) ? prev : [...prev, risk.type]
                      )
                    }
                  >
                    &times;
                  </button>
                  <p className="alert-type">{risk.type} Warning</p>
                  <p className="alert-detail">
                    {risk.value}°F detected within 24 hours.
                  </p>
                </div>
              ))}

              {/* show Tip (if not dismissed) */}
              {!tipDismissed && (
                <div className="tip-card card">
                  <button className="dismiss-btn" onClick={() => setTipDismissed(true)}>
                    &times;
                  </button>
                  <div className="tip-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p className="tip-title">Tip of the Day</p>
                    <button 
                      className="refresh-tip-btn" 
                      onClick={handleRefreshTip}
                      title="Get another tip"
                    >
                      ⟳
                    </button>
                  </div>
                  <p className="tip-text">{tip}</p>   
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomeView;