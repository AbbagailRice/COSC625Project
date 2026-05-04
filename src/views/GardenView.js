import React, { useState, useEffect } from 'react';
import { GARDENING_CONFIG } from '../logic/constants';
import '../components/App.css';
import { calculateMoisture } from '../logic/moistureLogic';

const WATER_NEEDS = GARDENING_CONFIG.WATER_NEEDS;
const WATER_CATEGORIES = Object.keys(WATER_NEEDS);

// Max plants visible before "Show All" button appears
const PLANTS_PREVIEW_LIMIT = 8;

const GardenView = ({ cityName, rainTotal, weatherAlert = [], weather }) => {
  // Init State from LocalStorage
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('dewDiligence_garden');
    return saved ? JSON.parse(saved) : [];
  });

  // Controls whether all plants are visible or just the first PLANTS_PREVIEW_LIMIT
  const [showAllPlants, setShowAllPlants] = useState(false);

  // Modal Control
  const [activeModal, setActiveModal] = useState(null); // 'add' or 'remove'

  // Form State
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [waterCategory, setWaterCategory] = useState(WATER_CATEGORIES[0]);
  const [plantToRemoveId, setPlantToRemoveId] = useState(null);

  // Sensitive plant filters
  const [minZone, setMinZone] = useState('');
  const [maxZone, setMaxZone] = useState('');
  const [frostResistant, setFrostResistant] = useState(false);

  // Persist to LocalStorage whenever plants change
  useEffect(() => {
    localStorage.setItem('dewDiligence_garden', JSON.stringify(plants));
    if (plants.length > 0 && !plantToRemoveId) {
      setPlantToRemoveId(plants[0].id);
    }
  }, [plants, plantToRemoveId]);

  // HANDLERS FOR ADDING/REMOVING PLANTS
  const handleAddPlant = () => {
    if (!nickname.trim()) return;

    if (plants.length >= GARDENING_CONFIG.MAX_PLANTS) {
      alert(`Max of ${GARDENING_CONFIG.MAX_PLANTS} plants reached.`);
      setActiveModal(null);
      return;
    }

    const newPlant = {
      id: Date.now(),
      nickname: nickname.trim(),
      waterCategory,
      minZone: Number(minZone),
      maxZone: Number(maxZone),
      frostResistant,
      image: imageUrl.trim() || 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
      waterHistory: []
    };

    setPlants([...plants, newPlant]);

    // Reset form fields
    setNickname('');
    setImageUrl('');
    setMinZone('');
    setMaxZone('');
    setFrostResistant(false);
    setActiveModal(null);
  };

  const handleManualWater = (plantId, amount) => {
    const now = new Date().toISOString();
    const updatedPlants = plants.map(plant => {
      if (plant.id === plantId) {
        const history = plant.waterHistory || [];
        return {
          ...plant,
          waterHistory: [{ date: now, amount: parseFloat(amount) }, ...history].slice(0, 10)
        };
      }
      return plant;
    });
    setPlants(updatedPlants);
    setSelectedPlant(updatedPlants.find(p => p.id === plantId));
  };

  const handleConfirmRemove = () => {
    if (!plantToRemoveId) return;
    const updated = plants.filter(p => p.id !== plantToRemoveId);
    setPlants(updated);
    setPlantToRemoveId(updated[0]?.id || null);
    setActiveModal(null);
  };

  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = plants.filter(plant =>
    plant.nickname.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  // Slice plants based on showAllPlants toggle
  const visiblePlants = showAllPlants
    ? filteredPlants
    : filteredPlants.slice(0, PLANTS_PREVIEW_LIMIT);

  const hasMorePlants = filteredPlants.length > PLANTS_PREVIEW_LIMIT;

  const moisture = selectedPlant
    ? calculateMoisture(rainTotal, WATER_NEEDS[selectedPlant.waterCategory], selectedPlant.waterHistory)
    : null;

  return (
    <div className="garden-view">
      <header className="header">
        <input
          type="text"
          placeholder="Search Garden..."
          className="search-bar"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      {/* PLANT LIST SECTION */}
      <section className="plant-list-card card">
        <div className="plant-list-header">
          <h2>Plant List</h2>
          {/* Show count when there are many plants */}
          {plants.length > 0 && (
            <span className="plant-count">{plants.length} / {GARDENING_CONFIG.MAX_PLANTS} plants</span>
          )}
        </div>

        <div className="plant-grid">
          {/* Empty / no results states */}
          {filteredPlants.length === 0 && searchQuery !== '' ? (
            <p className="empty-msg">No plants match "{searchQuery}"</p>
          ) : filteredPlants.length === 0 && (
            <p className="empty-msg">No plants yet. Add one!</p>
          )}

          {/* Visible plant cards */}
          {visiblePlants.map(plant => {
            const isDefault = plant.image.includes('628283.png');
            const plantMoisture = calculateMoisture(
              rainTotal,
              WATER_NEEDS[plant.waterCategory],
              plant.waterHistory
            );

            const needsWater = plantMoisture.percent < 60;
            const hasFrostRisk = weatherAlert.some(r => r.type === 'Frost') && !plant.frostResistant;
            const hasHeatRisk = weatherAlert.some(r => r.type === 'Extreme Heat') && plant.maxZone <= 8;
            const currentTemp = weather?.hourly?.properties?.periods[0]?.temperature;
            const isBelowMinZone = currentTemp <= GARDENING_CONFIG.ZONE_TEMP_MAP[plant.minZone];

            return (
              <div
                key={plant.id}
                className={`plant-item ${selectedPlant?.id === plant.id ? 'selected-highlight' : ''}`}
                onClick={() => setSelectedPlant(plant)}
              >
                <p className="plant-nickname-label">{plant.nickname}</p>
                <div className="plant-img-wrapper">
                  <img
                    src={plant.image}
                    alt={plant.nickname}
                    className={`plant-img ${isDefault ? 'placeholder-icon' : ''}`}
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/628/628283.png';
                      e.target.classList.add('placeholder-icon');
                    }}
                  />
                  <div className="status-icon-stack">
                    {needsWater && <span className="status-icon drop">💧</span>}
                    {(hasFrostRisk || isBelowMinZone) && <span className="status-icon snow">❄️</span>}
                    {hasHeatRisk && <span className="status-icon flame">🔥</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Show More / Show Less button — only when there are more than the limit */}
          {hasMorePlants && (
            <div
              className="show-more-btn"
              onClick={() => setShowAllPlants(!showAllPlants)}
            >
              <span className="show-more-icon">{showAllPlants ? '−' : '+'}</span>
              <span className="show-more-label">
                {showAllPlants
                  ? 'Show Less'
                  : `+${filteredPlants.length - PLANTS_PREVIEW_LIMIT} More`}
              </span>
            </div>
          )}

          {/* Add plant button — only visible when not at max */}
          {plants.length < GARDENING_CONFIG.MAX_PLANTS && (
            <div className="add-plant-btn" onClick={() => setActiveModal('add')}>±</div>
          )}
        </div>
      </section>

      {/* ADD/REMOVE MODAL */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="styled-modal-card card" onClick={e => e.stopPropagation()}>
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeModal === 'remove' ? 'active' : ''}`}
                onClick={() => setActiveModal('remove')}
              >
                Remove Plant
              </button>
              <div className="tab-separator">/</div>
              <button
                className={`tab-btn ${activeModal === 'add' ? 'active' : ''}`}
                onClick={() => setActiveModal('add')}
              >
                Add Plant
              </button>
            </div>

            {activeModal === 'add' ? (
              <div className="modal-body">
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="Nickname"
                  className="capsule-input"
                />
                <div className="styled-select-container">
                  <select
                    className="capsule-input"
                    value={waterCategory}
                    onChange={e => setWaterCategory(e.target.value)}
                  >
                    {WATER_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat} — {WATER_NEEDS[cat]} in/week
                      </option>
                    ))}
                  </select>
                </div>
                <div className="zone-input-row">
                  <input
                    type="number"
                    value={minZone}
                    onChange={e => setMinZone(e.target.value)}
                    placeholder="Min Zone"
                    className="capsule-input"
                  />
                  <input
                    type="number"
                    value={maxZone}
                    onChange={e => setMaxZone(e.target.value)}
                    placeholder="Max Zone"
                    className="capsule-input"
                  />
                </div>
                <div className="checkbox-row">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={frostResistant}
                      onChange={e => setFrostResistant(e.target.checked)}
                    />
                    Frost Resistant?
                  </label>
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="Image URL (Optional)"
                  className="capsule-input"
                />
                <div className="modal-actions-centered">
                  <button onClick={handleAddPlant} className="confirm-btn">Confirm Add</button>
                </div>
              </div>
            ) : (
              <div className="modal-body">
                <div className="capsule-input readonly">
                  {plants.find(p => p.id === plantToRemoveId)?.nickname || 'Select Plant'}
                </div>
                <div className="styled-select-container">
                  <select
                    className="capsule-input"
                    value={plantToRemoveId}
                    onChange={e => setPlantToRemoveId(Number(e.target.value))}
                  >
                    {plants.map(plant => (
                      <option key={plant.id} value={plant.id}>
                        {plant.nickname}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="modal-actions-centered">
                  <button onClick={handleConfirmRemove} className="confirm-btn delete-btn">
                    Confirm Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOWER ROW PANELS */}
      <div className="lower-row">
        <section className="card garden-left">
          <h3>Status {selectedPlant ? `of ${selectedPlant.nickname}` : ""}</h3>
          {selectedPlant ? (
            <div className="details-content">
              <div className="zone-range-display">
                <p className="zone-text">Hardiness Zones: {selectedPlant.minZone} - {selectedPlant.maxZone}</p>
              </div>
              <div className="water-stats">
                <div className="stat-row">
                  <span>Weekly Need: {WATER_NEEDS[selectedPlant.waterCategory]}"</span>
                  <span>7-Day Rain: {rainTotal}"</span>
                </div>
                <div className="stat-row total-highlight">
                  <span>Overall Total: {moisture.totalReceived}"</span>
                </div>
              </div>
              <div className="moisture-meter">
                <div className="meter-label">
                  <span>Moisture: {moisture.status}</span>
                  <span>{moisture.percent}%</span>
                </div>
                <div className="meter-bar-bg">
                  <div
                    className={`meter-bar-fill ${moisture.status.toLowerCase()}`}
                    style={{ width: `${moisture.percent}%` }}
                  ></div>
                </div>
              </div>
              <p className="recommendation">
                {moisture.percent < 25
                  ? "Soil is very dry. Water immediately!"
                  : moisture.percent < 60
                  ? "Soil is damp, but could use a soak soon."
                  : "Hydration is excellent!"}
              </p>
              {selectedPlant && weatherAlert.length > 0 && (
                <ul className="alert-actions">
                  {weatherAlert
                    .filter(alert => {
                      if (alert.type === 'Frost') return !selectedPlant.frostResistant;
                      if (alert.type === 'Extreme Heat') return selectedPlant.maxZone <= 8;
                      return true;
                    })
                    .flatMap(alert =>
                      alert.action.map((step, i) => (
                        <li key={alert.type + i}>
                          {step.replace("your plant", selectedPlant.nickname)}
                        </li>
                      ))
                    )}
                </ul>
              )}
            </div>
          ) : (
            <p className="hint-text">Select a plant to check moisture levels.</p>
          )}
        </section>

        <section className="schedule-card card">
          <h3>Watering</h3>
          {selectedPlant ? (
            <div className="schedule-content">
              <p className="schedule-hint">
                Based on <strong>{selectedPlant.waterCategory}</strong> water needs.
              </p>
              <div className="manual-add-container">
                <div className="amount-selector">
                  {[0.25, 0.5, 1.0].map(amt => (
                    <button
                      key={amt}
                      className="amt-btn"
                      onClick={() => handleManualWater(selectedPlant.id, amt)}
                    >
                      +{amt}"
                    </button>
                  ))}
                </div>
                <p className="small-label">Quick Log (Inches)</p>
              </div>
              <div className="recent-log">
                <h4>Recent Activity</h4>
                {selectedPlant.waterHistory?.length > 0 ? (
                  <ul className="log-list">
                    {selectedPlant.waterHistory.map((entry, index) => {
                      const dateValue = (entry && typeof entry === 'object') ? entry.date : entry;
                      const amountValue = (entry && typeof entry === 'object') ? entry.amount : null;
                      return (
                        <li key={index} className="log-item">
                          {new Date(dateValue).toLocaleTimeString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {amountValue && ` — Added ${amountValue}"`}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="no-log-text">No manual watering recorded yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="hint-text">Select a plant to manage its schedule.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default GardenView;
