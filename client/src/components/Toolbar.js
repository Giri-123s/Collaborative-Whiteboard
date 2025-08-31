import React from 'react';
import './Toolbar.css';

const Toolbar = ({ settings, onSettingsChange, onClearCanvas }) => {
  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Green', value: '#00FF00' }
  ];

  const handleColorChange = (color) => {
    onSettingsChange({ color });
  };

  const handleWidthChange = (width) => {
    onSettingsChange({ width: parseInt(width) });
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Colors</h3>
        <div className="color-palette">
          {colors.map((color) => (
            <button
              key={color.value}
              className={`color-btn ${settings.color === color.value ? 'active' : ''}`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorChange(color.value)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Stroke Width</h3>
        <div className="width-control">
          <input
            type="range"
            min="1"
            max="20"
            value={settings.width}
            onChange={(e) => handleWidthChange(e.target.value)}
            className="width-slider"
          />
          <span className="width-value">{settings.width}px</span>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <button
          onClick={onClearCanvas}
          className="clear-btn"
          title="Clear Canvas"
        >
          Clear Canvas
        </button>
      </div>

      <div className="toolbar-info">
        <p>Use your mouse or touch to draw</p>
        <p>Real-time collaboration enabled</p>
      </div>
    </div>
  );
};

export default Toolbar;
