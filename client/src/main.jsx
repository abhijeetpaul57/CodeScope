import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProjectProvider>
        <AnalysisProvider>
          <App />
          <Toaster position="bottom-right" toastOptions={{
            style: { background: '#1f2937', color: '#f3f4f6' }
          }}/>
        </AnalysisProvider>
      </ProjectProvider>
    </AuthProvider>
  </React.StrictMode>,
);
