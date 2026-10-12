import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Folder, Network, Activity, ListChecks, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/projects', icon: <Folder size={20} />, label: 'Projects' },
    { to: '/graph', icon: <Network size={20} />, label: 'Dependency Graph' },
    { to: '/analysis', icon: <Activity size={20} />, label: 'Impact Analysis' },
    { to: '/build-plan', icon: <ListChecks size={20} />, label: 'Build Plan' },
    { to: '/benchmarks', icon: <BarChart2 size={20} />, label: 'Benchmarks' },
  ];

  return (
    <div style={{ 
      width: '250px', 
      background: 'var(--bg-surface)', 
      borderRight: '1px solid var(--border)', 
      height: '100vh', 
      padding: '2rem 1rem',
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h2 className="gradient-text" style={{ marginBottom: '2.5rem', paddingLeft: '1rem' }}>CodeScope</h2>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `flex-center ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              justifyContent: 'flex-start',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              color: isActive ? '#fff' : 'var(--text-secondary)',
              background: isActive ? 'var(--primary)' : 'transparent',
              gap: '0.75rem',
              textDecoration: 'none',
              transition: 'all 0.2s'
            })}
          >
            {link.icon}
            <span style={{ fontWeight: 500 }}>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
