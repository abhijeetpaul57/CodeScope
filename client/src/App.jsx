import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Projects from './pages/Projects';
import DependencyGraph from './pages/DependencyGraph';
import ImpactAnalysis from './pages/ImpactAnalysis';
import BuildPlan from './pages/BuildPlan';
import Benchmarks from './pages/Benchmarks';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="graph" element={<DependencyGraph />} />
          <Route path="analysis" element={<ImpactAnalysis />} />
          <Route path="build-plan" element={<BuildPlan />} />
          <Route path="benchmarks" element={<Benchmarks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
