// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductionForm from './components/ProductionForm';
import RawMaterialsAdmin from './components/RawMaterialsAdmin';
import DailySummary from './components/DailySummary';
import './App.css';

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <li>
      <Link to={to} className={isActive ? 'active' : ''}>
        {children}
      </Link>
    </li>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <h1>Cake Production & Sales Tracker</h1>
          <nav>
            <ul>
              <NavLink to="/">Production Entry</NavLink>
              <NavLink to="/raw-materials">Raw Materials Admin</NavLink>
              <NavLink to="/daily-summary">Daily Summary</NavLink>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<ProductionForm />} />
            <Route path="/raw-materials" element={<RawMaterialsAdmin />} />
            <Route path="/daily-summary" element={<DailySummary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
