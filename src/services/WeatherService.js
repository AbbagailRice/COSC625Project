import React from 'react';

const GardenView = ({ fullName, plants, setPlants }) => {
  // Local state for the form
  const [nickname, setNickname] = React.useState('');
  const [waterCategory, setWaterCategory] = React.useState('Moderate');

  // Handle form submission
  const handleAddPlant = (e) => {
    e.preventDefault();
    setPlants([...plants, { nickname, waterCategory }]);
    setNickname('');
    setWaterCategory('Moderate');
  };

  return (
    <div className="garden-view">
      <header className="header">
        <input type="text" placeholder="Search Garden..." className="search-bar" />
      </header>

      <section className="plant-list-card card">
        <h2>Plant List</h2>
        <div className="plant-grid">
          {/* Render the list of plants */}
          {plants.map((plant, index) => (
            <div key={index} className="plant-item card">
              <div className="img-placeholder"></div>
              <p>{plant.nickname} - {plant.waterCategory}</p>
            </div>
          ))}

          {/* Form to add a new plant */}
          <div className="add-plant-form card">
            <form onSubmit={handleAddPlant}>
              <input
                type="text"
                placeholder="Plant Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <select
                value={waterCategory}
                onChange={(e) => setWaterCategory(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
              <button type="submit">Add Plant</button>
            </form>
          </div>
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
