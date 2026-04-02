import React from 'react';

const HomeView = ({ weather, cityName, updateDashboard }) => {
  const currentHour = weather.hourly.properties.periods[0];

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
          </div>
        </section>

        <section className="alerts-and-tips">
          <div className="alert-card card heat">Heat Warning Placeholder</div>
          <div className="tip-card card">Tip of the Day Placeholder</div>
        </section>
      </div>
    </div>
  );
};

export default HomeView;