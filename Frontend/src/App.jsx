import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Calendar from './pages/Calendar'
import Competitors from './pages/Competitors'
import Strategies from './pages/Strategies' // <-- Import the new page
import { ThemeProvider } from './contexts/ThemeContext'

const App = () => {
  const [generatedStrategy, setGeneratedStrategy] = useState(null);
  const [strategyStartDate, setStrategyStartDate] = useState(null);
  const navigate = useNavigate();

  const handleStrategyGenerated = (strategy) => {
    setGeneratedStrategy(strategy);
    setStrategyStartDate(new Date());
    // Navigate to the newly created strategy's calendar view
    navigate(`/calendar/${strategy._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-roboto">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard onStrategyGenerated={handleStrategyGenerated} />} />
          <Route path="/analytics" element={<Analytics />} />
          
          {/* NEW: Route for the list of strategies */}
          <Route path="/strategies" element={<Strategies />} />
          
          {/* UPDATED: Calendar route is now dynamic */}
          <Route path="/calendar/:strategyId" element={<Calendar />} />

          <Route path="/competitors" element={<Competitors />} />
        </Routes>
      </div>
    </div>
  );
};

// We need to wrap App in Router for navigate to work in the handler
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

function RootApp() {
  return (
    <ThemeProvider>
      <AppWrapper />
    </ThemeProvider>
  );
}

export default RootApp;