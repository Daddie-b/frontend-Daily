import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductionForm.css';
import '../App.css';

// Popup component for confirmation.
const ConfirmationPopup = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>{title}</h3>
        <pre className="popup-message">{message}</pre>
        <div className="popup-buttons">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const ProductionForm = () => {
  const [shift, setShift] = useState('Shift 1');
  const [production, setProduction] = useState({ standardCakes: 0, bread: 0 });
  const [rawMaterialsUsed, setRawMaterialsUsed] = useState([{ materialId: '', quantity: 0 }]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  const [showPopup, setShowPopup] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null); // "cakes" or "materials"

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get('https://dailybackend-nst1.onrender.com/api/raw-materials');
        setAvailableMaterials(res.data);
      } catch (error) {
        console.error('Error fetching raw materials:', error);
      }
    };
    fetchMaterials();
  }, []);

  // Create unique list of materials (only one record per material name)
  const uniqueMaterials = Array.from(
    new Map(availableMaterials.map((mat) => [mat.name, mat])).values()
  );

  // Submission functions
  const submitCakesProduction = async () => {
    try {
      const res = await axios.post('https://dailybackend-nst1.onrender.com/api/production/cakes', {
        shift,
        production,
      });
      console.log('Cakes production logged:', res.data);
    } catch (error) {
      console.error('Error logging cakes production:', error);
    }
  };

  const submitRawMaterialsUsage = async () => {
    try {
      const res = await axios.post('https://dailybackend-nst1.onrender.com/api/production/materials', {
        shift,
        rawMaterialsUsed,
      });
      console.log('Raw materials usage logged:', res.data);
    } catch (error) {
      console.error('Error logging raw materials usage:', error);
    }
  };

  // Handlers to show confirmation popups.
  const handleShowPopupCakes = (e) => {
    e.preventDefault();
    setPendingSubmission('cakes');
    setShowPopup(true);
  };

  const handleShowPopupMaterials = (e) => {
    e.preventDefault();
    setPendingSubmission('materials');
    setShowPopup(true);
  };

  // Confirm submission based on the pending type.
  const handleConfirmSubmission = async () => {
    if (pendingSubmission === 'cakes') {
      await submitCakesProduction();
    } else if (pendingSubmission === 'materials') {
      await submitRawMaterialsUsage();
    }
    setShowPopup(false);
    setPendingSubmission(null);
  };

  const handleCancelSubmission = () => {
    setShowPopup(false);
    setPendingSubmission(null);
  };

  // Prepare popup details based on submission type.
  let popupTitle = '';
  let popupMessage = '';

  if (pendingSubmission === 'cakes') {
    popupTitle = 'Confirm Cakes Production Submission';
    popupMessage = `Shift: ${shift}
Standard Cakes: ${production.standardCakes}
Bread: ${production.bread}`;
  } else if (pendingSubmission === 'materials') {
    popupTitle = 'Confirm Raw Materials Usage Submission';
    popupMessage =
      `Shift: ${shift}\nRaw Materials:\n` +
      rawMaterialsUsed
        .map((item, index) => {
          const material = uniqueMaterials.find((mat) => mat._id === item.materialId);
          return `Item ${index + 1}: ${material ? material.name : 'Not Selected'} - Quantity: ${item.quantity}`;
        })
        .join('\n');
  }

  return (
    <div className="production-form-container">
      <form className="production-form">
        <h2>Shift Production Entry</h2>
        <div className="form-group">
          <label>Shift:</label>
          <select value={shift} onChange={(e) => setShift(e.target.value)}>
            <option value="Shift 1">Shift 1</option>
            <option value="Shift 2">Shift 2</option>
          </select>
        </div>
        <div className="form-group">
          <label>Standard Cakes (45 each):</label>
          <input
            type="number"
            value={production.standardCakes}
            onChange={(e) =>
              setProduction({ ...production, standardCakes: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="form-group">
          <label>Bread (55 each):</label>
          <input
            type="number"
            value={production.bread}
            onChange={(e) =>
              setProduction({ ...production, bread: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <button type="button" onClick={handleShowPopupCakes}>
          Submit Cakes Production
        </button>
        <div className="form-group">
          <h3>Raw Materials Used</h3>
          {rawMaterialsUsed.map((item, index) => (
            <div key={index} className="raw-material-entry">
              <select
                value={item.materialId}
                onChange={(e) => {
                  const newMaterials = [...rawMaterialsUsed];
                  newMaterials[index].materialId = e.target.value;
                  setRawMaterialsUsed(newMaterials);
                }}
              >
                <option value="">Select Material</option>
                {uniqueMaterials.map((material) => (
                  <option key={material._id} value={material._id}>
                    {material.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => {
                  const newMaterials = [...rawMaterialsUsed];
                  newMaterials[index].quantity = parseInt(e.target.value) || 0;
                  setRawMaterialsUsed(newMaterials);
                }}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={handleShowPopupMaterials}>
          Submit Raw Materials Usage
        </button>
      </form>

      {showPopup && (
        <ConfirmationPopup
          title={popupTitle}
          message={popupMessage}
          onConfirm={handleConfirmSubmission}
          onCancel={handleCancelSubmission}
        />
      )}
    </div>
  );
};

export default ProductionForm;
