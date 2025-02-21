import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DailySummary = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/production/summary/daily?date=${date}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  };
  useEffect(() => {

    fetchSummary();
  }, [date]);

  return (
    <div>
      <h2>Daily Summary for {date}</h2>

      {summary ? (
        <div>
          <h3>Shift-wise Production</h3>
          {summary.shifts.map((shift, index) => (
            <div key={index} style={{ border: '1px solid #ddd', padding: '10px', marginBottom: '10px' }}>
              <h4>{shift.name} Shift</h4>
              <p>Cakes Sold: {shift.cakesSold} | Bread Sold: {shift.breadSold}</p>
              <p>Flour Used: {shift.flourUsed} bags</p>
              <p><strong>Worker Wages: Ksh{shift.workerWages}</strong></p>
            </div>
          ))}

          <h3>Raw Materials Used</h3>
          <ul>
            {Object.entries(summary.rawMaterials).map(([material, data]) => (
              <li key={material}>
                {material}: Used {data.used} | Remaining {data.remaining} | Price: Ksh{data.price}
              </li>
            ))}
          </ul>

          <h3>Total Cost Summary</h3>
          <p>💰 <strong>Total Cost of Raw Materials in Stock: Ksh{summary.totalStockCost.toFixed(2)}</strong></p>
          <p>🕒 Last Updated: {new Date(summary.lastUpdated).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading summary...</p>
      )}

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
    </div>
  );
};

export default DailySummary;
