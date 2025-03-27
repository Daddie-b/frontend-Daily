import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DailySummary.css';

const DailySummary = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(null);
  const [cumulativeData, setCumulativeData] = useState(null);

  // Fetch daily summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/production/summary/daily?date=${date}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  }, [date]);

  // Fetch cumulative data
  const fetchCumulativeData = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/production/summary/range?startDate=2000-01-01&endDate=${date}`
      );
      setCumulativeData(res.data);
    } catch (error) {
      console.error('Error fetching cumulative data:', error);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
    fetchCumulativeData();
  }, [date, fetchSummary, fetchCumulativeData]);

  // Calculate daily totals
  let dailyCakes = 0;
  let dailyBread = 0;
  if (summary?.shifts) {
    summary.shifts.forEach((shift) => {
      dailyCakes += shift.cakesSold || 0;
      dailyBread += shift.breadSold || 0;
    });
  }

  return (
    <div className="daily-summary">
      <h2>Daily Summary for {date}</h2>
      <input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
        className="date-input"
      />

      {summary ? (
        <div>
          {/* Shift-wise Production */}
          <h3>Shift-wise Production</h3>
          {summary.shifts.map((shift, index) => (
            <div key={index} className="shift-summary">
              <h4>{shift.name} Shift</h4>
              <p>Cakes Sold: {shift.cakesSold}</p>
              <p>Bread Sold: {shift.breadSold}</p>
              <p>Flour Used: {shift.flourUsed} bags</p>
              <p className="wages"><strong>Worker Wages: Ksh {shift.workerWages}</strong></p>
              <p className="last-updated">
                Last Updated: {new Date(shift.lastUpdated).toLocaleString()}
              </p>
            </div>
          ))}

          {/* Daily Totals */}
          <div className="overall-production">
            <h4>Daily Production Totals</h4>
            <p>Total Cakes Sold: {dailyCakes}</p>
            <p>Total Bread Sold: {dailyBread}</p>
          </div>

          {/* Cumulative Totals */}
          {cumulativeData && (
            <div className="cumulative-production">
              <h4>Cumulative Totals (Up To {date})</h4>
              <p>Total Cakes: {cumulativeData.totalCakes}</p>
              <p>Total Bread: {cumulativeData.totalBread}</p>
            </div>
          )}

          {/* Raw Materials Used Today */}
          <div className="raw-materials-section">
            <h3>Raw Materials Used Today</h3>
            <div className="materials-grid">
              <div className="material-row material-header">
                <span className="material-name">Material</span>
                <span className="material-quantity">Quantity Used</span>
              </div>
              {summary.rawMaterials && Object.entries(summary.rawMaterials).map(([material, data]) => (
                <div className="material-row" key={material}>
                  <span className="material-name">{material}</span>
                  <span className="material-quantity">{data.used}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative Raw Materials Consumption */}
          <div className="cumulative-materials-section">
            <h3>Cumulative Raw Materials Consumption</h3>
            <div className="materials-grid cumulative-materials-grid">
              {/* Header Row */}
              <div className="material-row material-header cumulative-header">
                <span className="material-name">Material</span>
                <span className="material-quantity">Total Used</span>
              </div>

              {/* Data Rows */}
              {cumulativeData?.rawMaterialUsage ? (
                Object.entries(cumulativeData.rawMaterialUsage).map(([material, data]) => (
                  <div className="material-row" key={material}>
                    <span className="material-name">{material}</span>
                    <span className="material-quantity">{data.quantity}</span>
                  </div>
                ))
              ) : (
                // Placeholder when data is still loading
                <div className="material-row">
                  <span className="material-name">Loading...</span>
                  <span className="material-quantity">-</span>
                </div>
              )}
            </div>
          </div>

          <p className="overall-last-updated">
            Last Updated: {new Date(summary.lastUpdated).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>Loading summary...</p>
      )}
    </div>
  );
};

export default DailySummary;