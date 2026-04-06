import React from 'react';

const GardenView = ({ fullName }) => {
  return (
    <div className="garden-view">
      <header className="header">
        <input type="text" placeholder="Search Garden..." className="search-bar" />
      </header>

      <section className="plant-list-card card">
        <h2>Plant List</h2>
        <div className="plant-grid">
          {['plant1', 'plant2', 'plant3'].map(plant => (
            <div key={plant} className="plant-item">
              <div className="img-placeholder"></div>
              <p>{plant}</p>
            </div>
          ))}
          <div className="add-plant-btn">+</div>
        </div>
      </section>

      <div className="lower-row">
        <section className="card garden-left">
          <h3>Watering Needed...</h3>
        </section>

        <section className="schedule-card card">
          <h3>Watering Schedule</h3>
        </section>
      </div>
    </div>
  );
};

export default GardenView;