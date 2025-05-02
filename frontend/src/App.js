import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import config from './config';
import LearningJourney from './components/LearningJourney';
import ModuleContent from './components/ModuleContent';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const [modules, setModules] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/modules`);
        setModules(response.data.modules);
        setConnections(response.data.connections);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch modules. Please try again later.');
        setLoading(false);
        console.error('Error fetching modules:', err);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Router basename="/git">
      <div className="App">
        <header className="App-header">
          <div className="header-content">
            <h1>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                Git Learning Journey!
              </Link>
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <main>
          <Routes>
            <Route 
              path="/" 
              element={<LearningJourney modules={modules} connections={connections} />} 
            />
            <Route 
              path="/module/:moduleId" 
              element={<ModuleContent />} 
            />
          </Routes>
        </main>
        <footer>
          <p>Git Learning Journey - A modular approach to learning Git</p>
          <p>Created by Nathan Gopee and Mostafa Ibrahim for FOCS</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
