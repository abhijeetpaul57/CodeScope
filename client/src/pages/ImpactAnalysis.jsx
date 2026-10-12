import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { AnalysisContext } from '../context/AnalysisContext';
import api from '../services/api';
import socket from '../services/socket';
import toast from 'react-hot-toast';

const ImpactAnalysis = () => {
  const { currentProject } = useContext(ProjectContext);
  const { currentAnalysis, setCurrentAnalysis } = useContext(AnalysisContext);
  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentProject) {
      api.get(`/projects/${currentProject._id}/modules`).then(res => setModules(res.data));
    }
  }, [currentProject]);

  const handleAnalyze = async () => {
    if (selectedModules.length === 0) {
      toast.error('Select at least one module');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${currentProject._id}/analysis`, {
        changedModules: selectedModules
      });
      
      // Fetch the fully populated analysis
      const populated = await api.get(`/analysis/${data._id}`);
      setCurrentAnalysis(populated.data);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id) => {
    setSelectedModules(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  if (!currentProject) return <div>Please select a project first.</div>;

  return (
    <div className="animate-fade-in">
      <h1>Impact Analysis</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Changed Modules</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {modules.map(m => (
            <button
              key={m._id}
              onClick={() => toggleModule(m._id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: `1px solid ${selectedModules.includes(m._id) ? 'var(--primary)' : 'var(--border)'}`,
                background: selectedModules.includes(m._id) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: selectedModules.includes(m._id) ? '#fff' : 'var(--text-secondary)'
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
        <button 
          onClick={handleAnalyze} 
          disabled={loading}
          style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600 }}
        >
          {loading ? 'Analyzing...' : 'RUN IMPACT ANALYSIS'}
        </button>
      </div>

      {currentAnalysis && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Changed Modules</div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--danger)' }}>{currentAnalysis.changedModules.length}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Affected</div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--warning)' }}>{currentAnalysis.affectedCount}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rebuild Reduction</div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--success)' }}>{currentAnalysis.rebuildReductionPercent.toFixed(1)}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', border: currentAnalysis.cycleDetected ? '1px solid var(--danger)' : '' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cycle Detected</div>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: currentAnalysis.cycleDetected ? 'var(--danger)' : 'var(--success)' }}>
                {currentAnalysis.cycleDetected ? 'YES' : 'NO'}
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Affected Modules Detail</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Module</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Path</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontWeight: 500 }}>Relationship</th>
                </tr>
              </thead>
              <tbody>
                {currentAnalysis.affectedModules.map(m => {
                  const isChanged = currentAnalysis.changedModules.some(cm => cm._id === m._id);
                  return (
                    <tr key={m._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0', fontWeight: isChanged ? 600 : 400, color: isChanged ? 'var(--danger)' : 'var(--warning)' }}>
                        {m.name}
                      </td>
                      <td style={{ padding: '1rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{m.path}</td>
                      <td style={{ padding: '1rem 0' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem',
                          background: isChanged ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: isChanged ? '#fca5a5' : '#fcd34d'
                        }}>
                          {isChanged ? 'Changed directly' : 'Affected (Transitive)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpactAnalysis;
