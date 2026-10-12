import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    }
  };

  const selectProject = async (id) => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setCurrentProject(data);
    } catch (error) {
      console.error('Failed to fetch project details', error);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, currentProject, selectProject, fetchProjects }}>
      {children}
    </ProjectContext.Provider>
  );
};
