import React, { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { Activity, Network, Box, Zap } from 'lucide-react';

const Dashboard = () => {
  const { currentProject } = useContext(ProjectContext);

  if (!currentProject) {
    return (
      <div className="flex-center animate-fade-in" style={{ height: '60vh' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>Welcome to CodeScope</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Please select a project from the Projects tab to view its dashboard.</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Modules', value: currentProject.moduleCount || 0, icon: <Box size={24} color="var(--primary)" /> },
    { label: 'Dependencies', value: currentProject.dependencyCount || 0, icon: <Network size={24} color="var(--accent)" /> },
    { label: 'System Health', value: 'Good', icon: <Activity size={24} color="var(--success)" /> },
    { label: 'Avg Build Time', value: '1.2s', icon: <Zap size={24} color="var(--warning)" /> },
  ];

  return (
    <div className="animate-fade-in">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {kpis.map((kpi, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface-light)', borderRadius: '12px' }}>
              {kpi.icon}
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{kpi.label}</p>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>{kpi.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel" style={{ padding: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1rem' }}>Recent Analysis Activity</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Go to the Impact Analysis tab to run a new simulation.</p>
      </div>
    </div>
  );
};

export default Dashboard;
