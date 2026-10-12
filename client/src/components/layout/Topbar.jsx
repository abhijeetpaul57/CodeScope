import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ProjectContext } from '../../context/ProjectContext';
import { LogOut } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { currentProject } = useContext(ProjectContext);

  return (
    <div style={{
      height: '70px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: 'var(--bg-dark)'
    }}>
      <div>
        <h3 style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>
          {currentProject ? (
            <span>Project: <span style={{ color: '#fff', fontWeight: 600 }}>{currentProject.name}</span></span>
          ) : (
            'Select a project to begin'
          )}
        </h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ color: 'var(--text-primary)' }}>{user?.name}</span>
        <button 
          onClick={logout}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Topbar;
