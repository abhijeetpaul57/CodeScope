import React, { useContext, useState } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { FolderPlus, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Projects = () => {
  const { projects, currentProject, selectProject, fetchProjects } = useContext(ProjectContext);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', language: 'javascript', buildSystem: 'npm' });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      toast.success('Project created');
      setShowModal(false);
      setNewProject({ name: '', description: '', language: 'javascript', buildSystem: 'npm' });
      fetchProjects();
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Projects</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={async () => {
              try {
                await api.post('/projects/seed');
                toast.success('E-commerce demo project seeded successfully!');
                fetchProjects();
              } catch (e) {
                toast.error('Failed to seed project');
              }
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'var(--accent)', color: '#fff', 
              padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none'
            }}
          >
            Seed E-commerce Demo
          </button>
          <button 
            onClick={async () => {
              try {
                await api.post('/projects/seed-finance');
                toast.success('Finance demo project seeded successfully!');
                fetchProjects();
              } catch (e) {
                toast.error('Failed to seed project');
              }
            }}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'var(--accent)', color: '#fff', 
              padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none'
            }}
          >
            Seed Finance Demo
          </button>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'var(--primary)', color: '#fff', 
              padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none'
            }}
          >
            <FolderPlus size={18} /> New Project
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {projects.map(project => (
          <div 
            key={project._id} 
            className="glass-panel"
            onClick={() => selectProject(project._id)}
            style={{ 
              padding: '1.5rem', 
              cursor: 'pointer', 
              border: currentProject?._id === project._id ? '2px solid var(--primary)' : '1px solid var(--border)',
              position: 'relative'
            }}
          >
            <h3 style={{ marginBottom: '0.5rem' }}>{project.name}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              {project.description || 'No description provided'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <span>Modules: {project.moduleCount}</span>
              <span>Deps: {project.dependencyCount}</span>
            </div>
            
            <button 
              onClick={(e) => handleDelete(project._id, e)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} className="flex-center">
          <div className="glass-panel" style={{ width: '500px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Project</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} required />
              <textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select value={newProject.language} onChange={e => setNewProject({...newProject, language: e.target.value})} style={{ flex: 1 }}>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
                <select value={newProject.buildSystem} onChange={e => setNewProject({...newProject, buildSystem: e.target.value})} style={{ flex: 1 }}>
                  <option value="npm">NPM</option>
                  <option value="yarn">Yarn</option>
                  <option value="maven">Maven</option>
                  <option value="pip">Pip</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--border)', color: '#fff', borderRadius: '4px' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', border: 'none', color: '#fff', borderRadius: '4px' }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
