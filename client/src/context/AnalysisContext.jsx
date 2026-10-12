import React, { createContext, useState } from 'react';

export const AnalysisContext = createContext();

export const AnalysisProvider = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [buildPlan, setBuildPlan] = useState(null);
  const [benchmark, setBenchmark] = useState(null);

  return (
    <AnalysisContext.Provider value={{ 
      currentAnalysis, setCurrentAnalysis,
      buildPlan, setBuildPlan,
      benchmark, setBenchmark
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};
