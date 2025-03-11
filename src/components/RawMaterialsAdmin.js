import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RawMaterialsAdmin.css';
import '../App.css';

// Helper: returns the latest price from the batch's prices array
const getLatestPrice = (batch) => {
  if (batch.prices && batch.prices.length > 0) {
    const sorted = [...batch.prices].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].price;
  }
  return batch.price || 0;
};

// Popup component for confirmation
const ConfirmationPopup = ({ material, onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Confirm Add Material</h3>
        <p>Are you sure you want to add the following material?</p>
        <p><strong>Name:</strong> {material.name}</p>
        <p><strong>Price:</strong> {material.price}</p>
        <p><strong>In Stock:</strong> {material.inStock}</p>
        <div className="popup-buttons">
          <button onClick={onConfirm}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Download Button component
const DownloadButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/raw-materials/download-pdf', null, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'batch_details.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Error generating PDF: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} disabled={isLoading}>
      {isLoading ? 'Downloading...' : 'Download PDF'}
    </button>
  );
};

// Archive Button component with date tracking
const ArchiveButton = ({ onArchiveSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive the current batches? Only items with remaining stock will be restocked.')) {
      return;
    }

    setIsLoading(true);
    const archiveDate = new Date();
    try {
      const response = await axios.post('http://localhost:5000/api/raw-materials/archive-batches', {
        archiveDate: archiveDate.toISOString()
      });
      alert(response.data.message);
      onArchiveSuccess(archiveDate);
    } catch (err) {
      console.error('Error archiving batches:', err);
      alert('Error archiving batches: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleArchive} disabled={isLoading}>
      {isLoading ? 'Archiving...' : 'Archive Batches'}
    </button>
  );
};

// View Archived Batches Button and Display component (simplified)
const ViewArchivedBatches = ({ fetchArchivedBatches }) => {
  const [showBatches, setShowBatches] = useState(false);
  const [archivedBatches, setArchivedBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewBatches = async () => {
    setIsLoading(true);
    try {
      const batches = await fetchArchivedBatches();
      setArchivedBatches(batches);
      setShowBatches(true);
    } catch (err) {
      console.error('Error fetching archived batches:', err);
      alert('Error fetching archived batches: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="archived-batches">
      <button onClick={handleViewBatches} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'View Archived Batches'}
      </button>
      {showBatches && (
        <div className="table-container">
          {archivedBatches.length === 0 ? (
            <p>No items used in this batch</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Material Name</th>
                  <th>Items Used</th>
                  <th>Price (Ksh)</th>
                  <th>Total Cost (Ksh)</th>
                </tr>
              </thead>
              <tbody>
                {archivedBatches.map((batch, index) => (
                  <tr key={`${batch.materialName}-${batch.archivedAt}-${index}`}>
                    <td>{batch.materialName}</td>
                    <td>{batch.itemsUsed}</td>
                    <td>{batch.price?.toFixed(2)}</td>
                    <td>{batch.totalCost?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

const RawMaterialsAdmin = () => {
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    price: '',
    inStock: '',
  });
  const [showPopup, setShowPopup] = useState(false);
  const [lastArchiveDate, setLastArchiveDate] = useState(null);

  // Fetch raw materials from the backend, filter out exhausted items
  const fetchMaterials = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/raw-materials');
      const data = Array.isArray(res.data) ? res.data.filter(material => material.currentStock > 0) : [];
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
      alert('Error fetching materials: ' + (error.response?.data?.message || error.message));
    }
  };

  // Fetch archived batches based on last archive date
  const fetchArchivedBatches = async () => {
    if (!lastArchiveDate) {
      return [];
    }
    try {
      const response = await axios.get('http://localhost:5000/api/raw-materials/batches', {
        params: { archiveDate: lastArchiveDate.toISOString() }
      });
      console.log('Archived batches response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching archived batches:', err);
      throw err;
    }
  };

  // Handle archive success
  const handleArchiveSuccess = (archiveDate) => {
    setLastArchiveDate(archiveDate);
    fetchMaterials();
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // When the form is submitted, show the confirmation popup
  const handleAddMaterial = (e) => {
    e.preventDefault();
    setShowPopup(true);
  };

  // Confirm addition: send the POST request, refresh list, then close popup
  const confirmAddMaterial = async () => {
    const { name, price, inStock } = newMaterial;
    try {
      await axios.post('http://localhost:5000/api/raw-materials', {
        name,
        price: parseFloat(price),
        inStock: parseInt(inStock, 10),
      });
      fetchMaterials();
      setNewMaterial({ name: '', price: '', inStock: '' });
    } catch (error) {
      console.error('Error adding raw material:', error);
      alert('Error adding material: ' + (error.response?.data?.message || error.message));
    } finally {
      setShowPopup(false);
    }
  };

  // Cancel addition: simply close the popup
  const cancelAddMaterial = () => {
    setShowPopup(false);
  };

  // Group batches by material name, only include non-exhausted items
  const groupedMaterials = materials.reduce((groups, material) => {
    if (material.currentStock > 0) { // Only include items with remaining stock
      const name = material.name;
      if (!groups[name]) {
        groups[name] = [];
      }
      groups[name].push(material);
    }
    return groups;
  }, {});

  // For each group, compute aggregated totals
  const groupAggregates = Object.entries(groupedMaterials).reduce((agg, [name, batches]) => {
    const totalInitialStock = batches.reduce((sum, batch) => sum + batch.initialStock, 0);
    const totalCurrentStock = batches.reduce((sum, batch) => sum + batch.currentStock, 0);
    const aggregatedInitialCost = batches.reduce(
      (sum, batch) => sum + getLatestPrice(batch) * batch.initialStock,
      0
    );
    const aggregatedCurrentCost = batches.reduce(
      (sum, batch) => sum + getLatestPrice(batch) * batch.currentStock,
      0
    );
    agg[name] = { totalInitialStock, totalCurrentStock, aggregatedInitialCost, aggregatedCurrentCost };
    return agg;
  }, {});

  // Overall totals across all groups
  const overallInitialCost = Object.values(groupAggregates).reduce(
    (acc, { aggregatedInitialCost }) => acc + aggregatedInitialCost,
    0
  );
  const overallCurrentCost = Object.values(groupAggregates).reduce(
    (acc, { aggregatedCurrentCost }) => acc + aggregatedCurrentCost,
    0
  );
  const overallUsedCost = overallInitialCost - overallCurrentCost;

  return (
    <div className="raw-materials-admin">
      <h2>Raw Materials Management</h2>

      {/* Add Material Form */}
      <form onSubmit={handleAddMaterial} className="add-material-form">
        <input
          type="text"
          placeholder="Material Name"
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

      {/* Download and Archive Buttons */}
      <div className="button-group">
        <DownloadButton />
        <ArchiveButton onArchiveSuccess={handleArchiveSuccess} />
      </div>

      {/* Responsive Table for Displaying Current Raw Materials */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Price</th>
              <th>Initial Stock</th>
              <th>Current Stock</th>
              <th>Batch Total (Initial)</th>
              <th>Batch Total (Current)</th>
              <th>Aggregated Totals</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedMaterials).map(([materialName, batches]) => {
              const aggregates = groupAggregates[materialName];
              return batches.map((batch, idx) => (
                <tr key={`${materialName}-${idx}`}>
                  <td>{idx === 0 ? materialName : ''}</td>
                  <td>{getLatestPrice(batch)}</td>
                  <td>{batch.initialStock}</td>
                  <td>{batch.currentStock}</td>
                  <td>Ksh {(getLatestPrice(batch) * batch.initialStock).toFixed(2)}</td>
                  <td>Ksh {(getLatestPrice(batch) * batch.currentStock).toFixed(2)}</td>
                  <td>
                    {idx === batches.length - 1
                      ? `Initial: ${aggregates.totalInitialStock} (Cost: Ksh ${aggregates.aggregatedInitialCost.toFixed(2)}), Current: ${aggregates.totalCurrentStock} (Cost: Ksh ${aggregates.aggregatedCurrentCost.toFixed(2)})`
                      : ''}
                  </td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>

      <div className="overall-totals">
        <div className="total-card">
          <h4>Total Initial Cost</h4>
          <p>
            Ksh{' '}
            {overallInitialCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="total-card">
          <h4>Total Current Stock Cost</h4>
          <p>
            Ksh{' '}
            {overallCurrentCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="total-card">
          <h4>Total Used Cost</h4>
          <p>
            Ksh{' '}
            {overallUsedCost.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      {/* View Archived Batches Section */}
      <ViewArchivedBatches fetchArchivedBatches={fetchArchivedBatches} />

      {/* Popup for confirmation */}
      {showPopup && (
        <ConfirmationPopup
          material={newMaterial}
          onConfirm={confirmAddMaterial}
          onCancel={cancelAddMaterial}
        />
      )}
    </div>
  );
};

export default RawMaterialsAdmin;