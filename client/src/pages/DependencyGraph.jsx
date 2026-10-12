import React, { useContext, useEffect, useState, useCallback } from 'react';
import { ProjectContext } from '../context/ProjectContext';
import { AnalysisContext } from '../context/AnalysisContext';
import api from '../services/api';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Dagre from '@dagrejs/dagre';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new Dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 172;
  const nodeHeight = 36;

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  Dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: direction === 'TB' ? 'top' : 'left',
      sourcePosition: direction === 'TB' ? 'bottom' : 'right',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

const DependencyGraph = () => {
  const { currentProject } = useContext(ProjectContext);
  const { currentAnalysis } = useContext(AnalysisContext);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);

  const loadGraph = useCallback(async () => {
    if (!currentProject) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${currentProject._id}/graph`);
      
      const initialNodes = data.nodes.map(n => {
        let bgColor = '#1f2937';
        let borderColor = '#374151';
        
        // Highlight logic based on analysis
        if (currentAnalysis) {
          if (currentAnalysis.changedModules.includes(n.id)) {
            bgColor = '#7f1d1d'; // dark red
            borderColor = '#ef4444';
          } else if (currentAnalysis.affectedModules.includes(n.id)) {
            bgColor = '#78350f'; // dark orange
            borderColor = '#f59e0b';
          }
        }

        return {
          id: n.id,
          data: { label: n.label },
          position: { x: 0, y: 0 },
          style: {
            background: bgColor,
            color: '#f3f4f6',
            border: `1px solid ${borderColor}`,
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            width: 150
          }
        };
      });

      const initialEdges = data.edges.map(e => ({
        id: `e${e.source}-${e.target}`,
        source: e.source,
        target: e.target,
        animated: currentAnalysis?.affectedModules?.includes(e.source) && currentAnalysis?.affectedModules?.includes(e.target),
        style: { stroke: '#4f46e5', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#4f46e5' },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges,
        'TB'
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentProject, currentAnalysis]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  if (!currentProject) return <div>Please select a project first.</div>;
  if (loading) return <div>Loading graph...</div>;

  return (
    <div className="glass-panel animate-fade-in" style={{ height: 'calc(100vh - 120px)', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
      >
        <Background color="#374151" gap={16} />
        <Controls />
        <MiniMap nodeColor="#4f46e5" maskColor="rgba(10, 14, 26, 0.8)" />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
