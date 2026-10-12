import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { AnalysisContext } from '../context/AnalysisContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const BuildPlan = () => {
  const { currentProject } = useContext(ProjectContext);
  const { currentAnalysis, buildPlan, setBuildPlan } = useContext(AnalysisContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentAnalysis) {
      fetchBuildPlan();
    }
  }, [currentAnalysis]);

  const fetchBuildPlan = async () => {
    try {
      const { data } = await api.get(`/build-plan/analysis/${currentAnalysis._id}`);
      setBuildPlan(data);
    } catch (error) {
      if (error.response?.status === 404) {
        setBuildPlan(null); // No plan generated yet
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${currentProject._id}/build-plan`, {
        analysisId: currentAnalysis._id
      });
      
      const populated = await api.get(`/build-plan/analysis/${currentAnalysis._id}`);
      setBuildPlan(populated.data);
      toast.success('Build plan generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!currentProject) return <div>Please select a project first.</div>;
  if (!currentAnalysis) return <div>Please run an Impact Analysis first.</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Incremental Build Plan</h1>
        {!buildPlan && (
          <button 
            onClick={handleGenerate} 
            disabled={loading || currentAnalysis.cycleDetected}
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}
          >
            {loading ? 'Generating...' : 'Generate Build Order'}
          </button>
        )}
      </div>

      {currentAnalysis.cycleDetected && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <AlertTriangle color="var(--danger)" />
          <div>
            <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Cycle Detected</h3>
            <p style={{ color: 'var(--text-secondary)' }}>A valid topological build order cannot be generated due to circular dependencies.</p>
            {currentAnalysis.cycles.map((c, i) => (
              <div key={i} style={{ marginTop: '0.5rem', fontFamily: 'monospace', background: 'rgba(0,0,0,0.3)', padding: '0.5rem', borderRadius: '4px' }}>
                {c.map(node => node.name).join(' → ')}
              </div>
            ))}
          </div>
        </div>
      )}

      {buildPlan && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Strategy</div>
              <div style={{ fontWeight: 600, color: 'var(--accent)' }}>CodeScope Incremental</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Steps to Build</div>
              <div style={{ fontWeight: 600 }}>{buildPlan.totalSteps} / {buildPlan.totalModules}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Estimated Time</div>
              <div style={{ fontWeight: 600 }}>{buildPlan.estimatedBuildTimeMs / 1000}s</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {buildPlan.steps.map(step => (
              <div key={step._id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'var(--bg-surface-light)', borderRadius: '8px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', 
                  color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 
                }}>
                  {step.order}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{step.moduleId.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{step.moduleId.path}</div>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {step.reason}
                </div>
                <div>
                  {step.dependenciesSatisfied ? (
                    <CheckCircle size={20} color="var(--success)" />
                  ) : (
                    <AlertTriangle size={20} color="var(--warning)" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildPlan;
