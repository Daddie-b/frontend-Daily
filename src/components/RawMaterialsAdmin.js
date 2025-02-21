// src/components/RawMaterialsAdmin.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RawMaterialsAdmin = () => {
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    inStock: ''
  });

  const fetchMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/raw-materials');
      setMaterials(res.data);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/raw-materials', {
        ...newMaterial,
        price: parseFloat(newMaterial.price),
        inStock: parseInt(newMaterial.inStock)
      });
      setMaterials([...materials, res.data]);
      setNewMaterial({ name: '', price: '', inStock: '' });
    } catch (error) {
      console.error('Error adding raw material:', error);
    }
  };

  return (
    <div>
      <h2>Raw Materials Management</h2>
      <form onSubmit={handleAddMaterial}>
        <input
          type="text"
          placeholder="Name"
          value={newMaterial.name}
          onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newMaterial.price}
          onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="In Stock"
          value={newMaterial.inStock}
          onChange={(e) => setNewMaterial({ ...newMaterial, inStock: e.target.value })}
          required
        />
        <button type="submit">Add Material</button>
      </form>
      <h3>Current Raw Materials</h3>
      <ul>
        {materials.map((material) => (
          <li key={material._id} style={{ color: material.outOfStock ? 'red' : 'black' }}>
            {material.name} - Price: {material.price} - In Stock: {material.inStock} - 
            Used: {material.used} - Remaining: {material.remaining} - 
            {material.outOfStock ? "Out of Stock" : "Available"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RawMaterialsAdmin;
