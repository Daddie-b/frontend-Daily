import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './DailySummary.css';

const DailySummary = () => {
  // Set default date to today (YYYY-MM-DD)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(null);
  const [cumulativeUsage, setCumulativeUsage] = useState(null);

  // Fetch daily summary for the specified date.
  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(`https://dailybackend-nst1.onrender.com/api/production/summary/daily?date=${date}`);
      setSummary(res.data);
    } catch (error) {
      console.error('Error fetching daily summary:', error);
    }
  }, [date]);

  // Fetch cumulative raw material consumption from an early start date up to the selected date.
  const fetchCumulativeUsage = useCallback(async () => {
    try {
      // Assuming the endpoint returns cumulative usage under "rawMaterialUsage"
      const res = await axios.get(`https://dailybackend-nst1.onrender.com/api/production/summary/range?startDate=2000-01-01&endDate=${date}`);
      setCumulativeUsage(res.data.rawMaterialUsage);
    } catch (error) {
      console.error('Error fetching cumulative usage:', error);
    }
  }, [date]);

  useEffect(() => {
    fetchSummary();
    fetchCumulativeUsage();
  }, [date, fetchSummary, fetchCumulativeUsage]);

  // Calculate overall totals for cakes and bread from shift production.
  let overallCakes = 0;
  let overallBread = 0;
  if (summary && summary.shifts) {
    summary.shifts.forEach((shift) => {
      overallCakes += shift.cakesSold || 0;
      overallBread += shift.breadSold || 0;
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
              <p className="last-updated">Last Updated: {new Date(shift.lastUpdated).toLocaleString()}</p>
            </div>
          ))}
          <div className="overall-production">
            <h4>Overall Production Totals</h4>
            <p>Total Cakes Sold: {overallCakes}</p>
            <p>Total Bread Sold: {overallBread}</p>
          </div>

          {/* Raw Materials Used Today */}
          <h3>Raw Materials Used (Today)</h3>
          <ul className="raw-materials-today">
            {summary.rawMaterials && Object.entries(summary.rawMaterials).map(([material, data]) => (
              <li key={material}>
                {material}: Used {data.used}
              </li>
            ))}
          </ul>

          {/* Cumulative Raw Materials Consumption */}
          <h3>Cumulative Raw Materials Consumption (Up To {date})</h3>
          {cumulativeUsage ? (
            <ul className="cumulative-usage">
              {Object.entries(cumulativeUsage).map(([material, data]) => (
                <li key={material}>
                  {material}: Total Used {data.quantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading cumulative consumption...</p>
          )}

          <p className="overall-last-updated">Last Updated: {new Date(summary.lastUpdated).toLocaleString()}</p>
        </div>
      ) : (
        <p>Loading summary...</p>
      )}
    </div>
  );
};

export default DailySummary;
