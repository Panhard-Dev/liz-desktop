import React, { useState } from 'react';

const PersonalizationPanel = () => {
  const [bgColor, setBgColor] = useState('#09090f');

  const handleBgColorChange = (event) => {
    setBgColor(event.target.value);
    document.documentElement.style.setProperty('--bg', event.target.value);
  };

  return (
    <div>
      <h2>Personalization Panel</h2>
      <label htmlFor="bg">Background Color:</label>
      <input
        type="color"
        id="bg"
        name="bg"
        value={bgColor}
        onChange={handleBgColorChange}
      />
    </div>
  );
};

export default PersonalizationPanel;
