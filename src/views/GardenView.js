import React, { useState, useEffect } from 'react';
import { GARDENING_CONFIG } from '../logic/constants';

const WATER_CATEGORIES = Object.keys(GARDENING_CONFIG.WATER_NEEDS);

const GardenView = ({ cityName }) => {
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('plants');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [waterCategory, setWaterCategory] = useState(WATER_CATEGORIES[2]);

  useEffect(() => {
    localStorage.setItem('plants', JSON.stringify(plants));
  }, [plants]);

  const handleAddPlant = () => {
    if (!nickname.trim()) {
      alert('Please enter a plant nickname.');
      return;
    }
    if (plants.length >= GARDENING_CONFIG.MAX_PLANTS) {
      alert(`You have reached the maximum of ${GARDENING_CONFIG.MAX_PLANTS} plants.`);
      return;
    }

    const newPlant = {
      id: Date.now(),
      nickname: nickname.trim(),
      waterCategory,
    };

    setPlants([...plants, newPlant]);
    setNickname('');
    setWaterCategory(WATER_CATEGORIES[2]);
    setShowForm(false);
  };

  return (
    <div className="garden-view">
      <header className="header">
        <input type="text" placeholder="Search Garden..." className="search-bar" />
      </header>

      <section className="plant-list-card card">
        <h2>Plant List</h2>
        <div className="plant-grid">
          {plants.length === 0 && (
            <p style={{ color: '#888' }}>No plants yet. Add one!</p>
          )}
          {plants.map(plant => (
            <div key={plant.id} className="plant-item">
              <div className="img-placeholder"></div>
              <p>{plant.nickname}</p>
              <small>{plant.waterCategory}</small>
            </div>
          ))}
          <div className="add-plant-btn" onClick={() => setShowForm(true)}>+</div>
        </div>
      </section>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-card card">
            <h3>Add a Plant</h3>

            <label>
              Nickname
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="e.g. My Basil"
                className="modal-input"
              />
            </label>

            <label>
              Water Category
              <select
                value={waterCategory}
                onChange={e => setWaterCategory(e.target.value)}
                className="modal-input"
              >
                {WATER_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat} — {GARDENING_CONFIG.WATER_NEEDS[cat]} in/week
                  </option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button onClick={handleAddPlant}>Add Plant</button>
              <button onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
