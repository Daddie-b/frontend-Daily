import React from 'react';
import axios from 'axios';

const DailyReset = () => {
  const handleReset = async () => {
    if (window.confirm('Are you sure you want to perform daily reset? This will:')) {
      try {
        await axios.post('http://localhost:5000/api/production/daily-reset');
        alert('Daily reset completed successfully');
      } catch (error) {
        alert('Error performing reset: ' + error.message);
      }
    }
  };

  return (
    <div className="daily-reset">
      <h3>End of Day Operations</h3>
      <button onClick={handleReset}>
        Perform Daily Reset
      </button>
      <p className="warning-text">
        This will:
        - Finalize worker wages
        - Update flour stock
        - Archive daily records
      </p>
    </div>
  );
};

export default DailyReset;