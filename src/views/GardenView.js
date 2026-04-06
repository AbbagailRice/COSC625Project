import React, { useState } from 'react';
import { WATER_CATEGORIES } from '../logic/constants';

const GardenView = ({ cityName, plants, setPlants }) => {
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState('');
  const [waterCategory, setWaterCategory] = useState('');

  const handleAddPlant = () => {
    if (!nickname.trim()) {
      alert('Please enter a nickname for your plant.');
      return;
    }
    if (!waterCategory) {
      alert('Please select a water category.');
      return;
    }

    const newPlant = {
      id: Date.now(),
      nickname: nickname.trim(),
      waterCategory,
    };

    setPlants([...plants, newPlant]);
    setNickname('');
    setWaterCategory('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setNickname('');
    setWaterCategory('');
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
          {plants.map(plant => (
            <div key={plant.id} className="plant-item">
              <div className="img-placeholder"></div>
              <p>{plant.nickname}</p>
              <small>{WATER_CATEGORIES.find(c => c.value === plant.waterCategory)?.label}</small>
            </div>
          ))}

          <div className="add-plant-btn" onClick={() => setShowForm(true)}>+</div>
        </div>

        {showForm && (
          <div className="add-plant-form">
            <h3>Add a New Plant</h3>

            <label>
              Nickname
              <input
                type="text"
                placeholder="e.g. Sunny the Succulent"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </label>

            <label>
              Water Category
              <select
                value={waterCategory}
                onChange={(e) => setWaterCategory(e.target.value)}
              >
                <option value="">-- Select a category --</option>
                {WATER_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <button onClick={handleAddPlant}>Add Plant</button>
              <button onClick={handleCancel} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
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
