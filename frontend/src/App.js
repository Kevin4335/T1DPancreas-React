import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import FOV from './FOV';
import AIChat from './AIChat';
import Help from './Help';
import GeneExpression from './GeneExpression';
import Navbar from './components/NavBar';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/FOV" element={<FOV />} />
        <Route path="/AIChat" element={<AIChat />} />
        <Route path="/GeneExpression" element={<GeneExpression />} />
        <Route path="/Help" element={<Help />} />
      </Routes>
    </Router>
  );
}

export default App;
