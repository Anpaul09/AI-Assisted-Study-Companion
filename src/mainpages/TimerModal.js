import React, { useState } from "react";
import { FaTimes, FaPlay } from "react-icons/fa";
import "./TimerModal.css";

function TimerModal({ onClose, onStartTimer }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // Validate number inputs
  const handleTimeChange = (setter) => (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setter(0);
    } else if (setter === setHours) {
      setter(Math.min(99, Math.max(0, value)));
    } else {
      setter(Math.min(59, Math.max(0, value)));
    }
  };

  // Handle preset buttons
  const setPreset = (h, m, s) => {
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hours === 0 && minutes === 0 && seconds === 0) return;
    onStartTimer(hours, minutes, seconds);
  };

  return (
    <div className="timer-modal-overlay">
      <div className="timer-modal">
        <div className="timer-modal-header">
          <h3>Set Study Timer</h3>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="timer-form">
          <div className="time-inputs">
            <div className="time-input-group">
              <input
                type="number"
                value={hours}
                onChange={handleTimeChange(setHours)}
                min="0"
                max="99"
              />
              <label>Hours</label>
            </div>
            <div className="time-separator">:</div>
            <div className="time-input-group">
              <input
                type="number"
                value={minutes}
                onChange={handleTimeChange(setMinutes)}
                min="0"
                max="59"
              />
              <label>Minutes</label>
            </div>
            <div className="time-separator">:</div>
            <div className="time-input-group">
              <input
                type="number"
                value={seconds}
                onChange={handleTimeChange(setSeconds)}
                min="0"
                max="59"
              />
              <label>Seconds</label>
            </div>
          </div>
          
          <div className="preset-buttons">
            <button type="button" onClick={() => setPreset(0, 25, 0)}>
              25 min
            </button>
            <button type="button" onClick={() => setPreset(0, 45, 0)}>
              45 min
            </button>
            <button type="button" onClick={() => setPreset(1, 0, 0)}>
              1 hour
            </button>
            <button type="button" onClick={() => setPreset(2, 0, 0)}>
              2 hours
            </button>
          </div>
          
          <div className="timer-controls">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="start-button">
              <FaPlay /> Start Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TimerModal;