import React, { useContext, useState, useEffect } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { AnalysisContext } from '../context/AnalysisContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Benchmarks = () => {
  const { currentProject } = useContext(ProjectContext);
  const { currentAnalysis, benchmark, setBenchmark } = useContext(AnalysisContext);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (currentProject) {
      fetchHistory();
    }
  }, [currentProject]);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/projects/${currentProject._id}/benchmarks`);
      setHistory(data);
      if (data.length > 0 && !benchmark) {
        setBenchmark(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRunBenchmark = async () => {
    if (!currentAnalysis) {
      toast.error('Run an analysis first');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${currentProject._id}/benchmarks`, {
        analysisId: currentAnalysis._id
      });
      setBenchmark(data);
      toast.success('Benchmark completed');
      fetchHistory();
    } catch (error) {
      toast.error('Benchmark failed');
    } finally {
      setLoading(false);
    }
  };

  if (!currentProject) return <div>Please select a project first.</div>;

  const chartData = benchmark ? [
    {
      name: 'Modules Built',
      Full: benchmark.baseline.modulesBuilt,
      Incremental: benchmark.optimized.modulesBuilt,
    },
    {
      name: 'Build Time (ms)',
      Full: benchmark.baseline.buildTimeMs,
      Incremental: benchmark.optimized.buildTimeMs,
    }
  ] : [];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Benchmarks & Metrics</h1>
        <button 
          onClick={handleRunBenchmark} 
          disabled={loading || !currentAnalysis}
          style={{ 
            background: !currentAnalysis ? 'var(--bg-surface-light)' : 'var(--primary)', 
            color: !currentAnalysis ? 'var(--text-secondary)' : '#fff', 
            border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600,
            cursor: !currentAnalysis ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Running...' : 'Run Benchmark'}
        </button>
      </div>

      {!benchmark && !loading && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No benchmark data available. Run an impact analysis and then run a benchmark.</p>
        </div>
      )}

      {benchmark && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Comparison Table */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Strategy Comparison</h3>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>Metric</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>Full Build</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>CodeScope</th>
                  <th style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>Reduction</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1.25rem 0' }}>Modules Built</td>
                  <td style={{ padding: '1.25rem 0' }}>{benchmark.baseline.modulesBuilt}</td>
                  <td style={{ padding: '1.25rem 0', color: 'var(--success)', fontWeight: 600 }}>{benchmark.optimized.modulesBuilt}</td>
                  <td style={{ padding: '1.25rem 0', color: 'var(--success)' }}>
                    {benchmark.metrics.moduleReductionPercent.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '1.25rem 0' }}>Build Time</td>
                  <td style={{ padding: '1.25rem 0' }}>{(benchmark.baseline.buildTimeMs / 1000).toFixed(2)}s</td>
                  <td style={{ padding: '1.25rem 0', color: 'var(--success)', fontWeight: 600 }}>{(benchmark.optimized.buildTimeMs / 1000).toFixed(2)}s</td>
                  <td style={{ padding: '1.25rem 0', color: 'var(--success)' }}>
                    {benchmark.metrics.buildTimeReductionPercent.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Chart */}
          <div className="glass-panel" style={{ padding: '2rem', height: '350px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Visual Comparison</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#f3f4f6' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Full" fill="#4b5563" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Incremental" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default Benchmarks;
