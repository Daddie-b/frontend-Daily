import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductionForm from './components/ProductionForm';
import RawMaterialsAdmin from './components/RawMaterialsAdmin';
import DailySummary from './components/DailySummary';
import './App.css';

// ProtectedRoute component: prompts for a password (hardcoded as "admin123") before granting access.
const ProtectedRoute = ({ children, password }) => {
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState('');

  if (!authorized) {
    return (
      <div className="password-container">
        <h2>Password Required</h2>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter password"
        />
        <button
          onClick={() => {
            if (input === password) {
              setAuthorized(true);
            } else {
              alert("Incorrect password");
            }
          }}
        >
          Submit
        </button>
      </div>
    );
  }
  return children;
};

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
          <div className="nav-wrapper">
            <ul className="nav-links">
              <NavLink to="/">Production Entry</NavLink>
              <NavLink to="/raw-materials">Raw Materials Admin</NavLink>
              <NavLink to="/daily-summary">Daily Summary</NavLink>
            </ul>
          </div>
        </nav>
      </header>
        <main>
          <Routes>
            <Route path="/" element={<ProductionForm />} />
            <Route
              path="/raw-materials"
              element={
                <ProtectedRoute password="admin123">
                  <RawMaterialsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-summary"
              element={
                <ProtectedRoute password="admin123">
                  <DailySummary />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
