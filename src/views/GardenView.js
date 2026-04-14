import React, { useState, useEffect } from 'react';
import { GARDENING_CONFIG } from '../logic/constants';
import '../components/App.css';
import { calculateMoisture } from '../logic/moistureLogic';

const WATER_NEEDS = GARDENING_CONFIG.WATER_NEEDS;
const WATER_CATEGORIES = Object.keys(WATER_NEEDS);


const GardenView = ({ cityName, rainTotal }) => {
  // Init State from LocalStorage
  const [plants, setPlants] = useState(() => {
    const saved = localStorage.getItem('dewDiligence_garden');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal Control
  const [activeModal, setActiveModal] = useState(null); // 'add' or 'remove'
  
  // Form State
  const [nickname, setNickname] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [waterCategory, setWaterCategory] = useState(WATER_CATEGORIES[0]);
  const [plantToRemoveId, setPlantToRemoveId] = useState(null);

  // Persist to LocalStorage whenever plants change
  useEffect(() => {
    localStorage.setItem('dewDiligence_garden', JSON.stringify(plants));
    // Keep remove selection in sync with plant list
    if (plants.length > 0 && !plantToRemoveId) {
      setPlantToRemoveId(plants[0].id);
    }
  }, [plants, plantToRemoveId]);

  // HANDELERS FOR ADDING/REMOVING PLANTS
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
      // Uses specific URL if provided, otherwise a default sprout icon
      image: imageUrl.trim() || 'https://cdn-icons-png.flaticon.com/512/628/628283.png'
    };

    setPlants([...plants, newPlant]);
    setNickname('');
    setImageUrl('');
    setActiveModal(null);
  };

  const handleConfirmRemove = () => {
    if (!plantToRemoveId) return;
    const updated = plants.filter(p => p.id !== plantToRemoveId);
    setPlants(updated);
    setPlantToRemoveId(updated[0]?.id || null);
    setActiveModal(null);
  };

  // helper to handle clicking a plant
  const [selectedPlant, setSelectedPlant] = useState(null);

  // FILTERS plants based on search query
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredPlants = plants.filter(plant => 
    plant.nickname.toLowerCase().startsWith(searchQuery.toLowerCase())
  );

  //Moisture logic
  const moisture = selectedPlant 
    ? calculateMoisture(rainTotal, WATER_NEEDS[selectedPlant.waterCategory])
    : null;

  return (
    <div className="garden-view">
      <header className="header">
        <input 
          type="text" 
          placeholder="Search Garden..." 
          className="search-bar" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Updates the filter as you type
        />
      </header>

      {/* PLANT LIST SECTION */}
      <section className="plant-list-card card">
        <div className="plant-list-header">
          <h2>Plant List</h2>
        </div>
        <div className="plant-grid">
          {/* Check if anything matched the search */}
          {filteredPlants.length === 0 && searchQuery !== '' ? (
            <p className="empty-msg">No plants match "{searchQuery}"</p>
          ) : filteredPlants.length === 0 && (
            <p className="empty-msg">No plants yet. Add one!</p>
          )}

          {/* RENDER FILTERED LIST */}
          
          {filteredPlants.map(plant => {
            const isDefault = plant.image.includes('628283.png');
            const needsWater = parseFloat(rainTotal) < WATER_NEEDS[plant.waterCategory];

            return (
              <div 
                key={plant.id} 
                className={`plant-item ${selectedPlant?.id === plant.id ? 'selected-highlight' : ''}`}
                onClick={() => setSelectedPlant(plant)}
              >
                <p className="plant-nickname-label">{plant.nickname}</p>
                
                {/* WRAPPER FOR OVERLAY */}
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
                  {/* DROPLIT OVERLAY */}
                  {needsWater && <span className="drop-overlay">💧</span>}
                </div>
              </div>
            );
          })}

          {/* Keep the ± button visible so you can still add plants during a search */}
          {plants.length < GARDENING_CONFIG.MAX_PLANTS && (
            <div className="add-plant-btn" onClick={() => setActiveModal('add')}>±</div>
          )}
        </div>
      </section>

      {/* ADD/REMOVE MODAL */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="styled-modal-card card" onClick={e => e.stopPropagation()}>
            
            {/* Modal Tabs */}
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
                {/* Remove Plant Selection */}
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
                  <button onClick={handleConfirmRemove} className="confirm-btn delete-btn">Confirm Remove</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOWER ROW PANELS */}
      <div className="lower-row">
        <section className="card garden-left">
          <h3>Soil Status</h3>
          {selectedPlant ? (
            <div className="details-content">
              <h4>{selectedPlant.nickname}</h4>

              {/* Show the specific need vs the actual rain */}
              <div className="water-stats">
                <p>Weekly Need: {WATER_NEEDS[selectedPlant.waterCategory]}"</p>
                <p>7-Day Rain: {rainTotal}"</p>
              </div>

              <div className="moisture-meter">
                <div className="meter-label">
                  <span>Moisture: {moisture.status}</span>
                  <span>{moisture.percent}%</span>
                </div>
                <div className="meter-bar-bg">
                  <div className={`meter-bar-fill ${moisture.status.toLowerCase()}`} style={{ width: `${moisture.percent}%` }}></div>
                </div>
              </div>
              <p className="recommendation">
                {moisture.percent < 25 
                  ? "Soil is very dry. Water immediately!" 
                  : moisture.percent < 60 
                  ? "Soil is damp, but could use a soak soon." 
                  : "Hydration is excellent!"}
              </p>
            </div>
          ) : (
            <p className="hint-text">Select a plant to check moisture levels.</p>
          )}
        </section>

        <section className="schedule-card card">
          <h3>Watering Schedule</h3>
          {/* Schedule mapping logic here */}
        </section>
      </div>
    </div>
  );
};

export default GardenView;