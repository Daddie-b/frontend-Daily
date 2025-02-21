import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductionForm.css';

const ProductionForm = () => {
  const [shift, setShift] = useState('Shift 1');
  const [production, setProduction] = useState({ standardCakes: 0, bread: 0 });
  const [rawMaterialsUsed, setRawMaterialsUsed] = useState([{ materialId: '', quantity: 0 }]);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/raw-materials');
        setAvailableMaterials(res.data);
      } catch (error) {
        console.error('Error fetching raw materials:', error);
      }
    };
    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/production', {
        shift,
        production,
        rawMaterialsUsed,
      });
      console.log('Production logged:', res.data);
    } catch (error) {
      console.error('Error logging production:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="production-form">
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
          onChange={(e) => setProduction({ ...production, standardCakes: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="form-group">
        <label>Bread (55 each):</label>
        <input
          type="number"
          value={production.bread}
          onChange={(e) => setProduction({ ...production, bread: parseInt(e.target.value) || 0 })}
        />
      </div>
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
              {availableMaterials.map((material) => (
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
      <button type="submit">Submit Production</button>
    </form>
  );
};

export default ProductionForm;
