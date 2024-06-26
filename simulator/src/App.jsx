import React, { useState, useRef, useEffect } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';

const App = () => {
  const [nodes, setNodes] = useState([{ id: '', label: '' }]);
  const [edges, setEdges] = useState([{ from: '', to: '' }]);
  const [graphData, setGraphData] = useState(null); 
  const [stepIndex, setStepIndex] = useState(0); 
  const [animationInterval, setAnimationInterval] = useState(null); 
  const [chromaticNumber, setChromaticNumber] = useState(3); 
  const networkContainer = useRef(null);
  const network = useRef(null);

  useEffect(() => {
    if (graphData) {
      const options = {
        nodes: {
          shape: 'dot',
          size: 20,
          font: {
            size: 16,
            color: 'black',
          },
        },
        edges: {
          width: 2,
          color: '#000',
        },
        physics: {
          enabled: false,
        },
      };

      // Initialize or update the Vis.js network
      if (network.current) {
        network.current.setData(graphData);
      } else {
        network.current = new Network(networkContainer.current, graphData, options);
      }
    }
  }, [graphData]);

  const handleNodeInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedNodes = [...nodes];
    updatedNodes[index][name] = value;
    setNodes(updatedNodes);
  };

  const handleAddNode = () => {
    setNodes([...nodes, { id: '', label: '' }]);
  };

  const handleRemoveNode = (index) => {
    const updatedNodes = nodes.filter((_, i) => i !== index);
    setNodes(updatedNodes);
  };

  const handleEdgeInputChange = (index, event) => {
    const { name, value } = event.target;
    const updatedEdges = [...edges];
    updatedEdges[index][name] = value;
    setEdges(updatedEdges);
  };

  const handleAddEdge = () => {
    setEdges([...edges, { from: '', to: '' }]);
  };

  const handleRemoveEdge = (index) => {
    const updatedEdges = edges.filter((_, i) => i !== index);
    setEdges(updatedEdges);
  };

  const graphColoringBacktracking = (nodes, edges, m) => {
    const adjacencyList = new Map();
    const nodeColors = {};

    nodes.forEach(node => {
      adjacencyList.set(node.id, []);
    });

    edges.forEach(edge => {
      adjacencyList.get(edge.from).push(edge.to);
      adjacencyList.get(edge.to).push(edge.from);
    });

    const colorNodes = (nodeId) => {
      if (nodeId === nodes.length) {
        return true; 
      }

      const currentNodeId = nodes[nodeId].id;
      const colorsSet= ['yellow','blue','red','green','gray','pink']
      for (let i = 0; i < m; i++) { 
        const color = colorsSet[i]; 
        if (isSafe(currentNodeId, color)) {
          nodeColors[currentNodeId] = color;
          if (colorNodes(nodeId + 1)) {
            return true;
          }
          nodeColors[currentNodeId] = ''; 
        }
      }

      return false;
    };

    
    const isSafe = (nodeId, color) => {
      const neighbors = adjacencyList.get(nodeId);
      for (const neighborId of neighbors) {
        if (nodeColors[neighborId] === color) {
          return false; 
        }
      }
      return true;
    };

    if (!colorNodes(0)) {
      return false; 
    }

    return nodes.map(node => ({
      ...node,
      color: nodeColors[node.id]
    }));
  };

  
  const animateGraphColoring = () => {
    // Reset step index and clear any existing animation interval
    setStepIndex(0);
    clearInterval(animationInterval);

    // Generate steps for animation
    const steps = [];
    const coloredNodes = graphColoringBacktracking(nodes, edges, chromaticNumber);
    if (coloredNodes) {
      steps.push(coloredNodes); // Initial state

      // Generate intermediate steps
      for (let i = 0; i < nodes.length; i++) {
        const intermediateNodes = nodes.map((node, index) => ({
          ...node,
          color: index <= i ? coloredNodes[index].color : '', // Show colors step by step
        }));
        steps.push(intermediateNodes);
      }

      // Set up animation interval
      let index = 0;
      const intervalId = setInterval(() => {
        if (index < steps.length) {
          const updatedGraphData = {
            nodes: steps[index].map(node => ({
              id: node.id,
              label: node.label,
              color: node.color ? node.color : '#000000' 
            })),
            edges: edges.map(edge => ({ ...edge }))
          };
          
          setGraphData(updatedGraphData);
          setStepIndex(index);
          index++;
        } else {
          clearInterval(intervalId);
        }
      }, 1000); 

      setAnimationInterval(intervalId);
    } else {
      alert(`Graph cannot be colored using ${chromaticNumber} colors.`);
    }
  };

  // Stop the animation
  const stopAnimation = () => {
    clearInterval(animationInterval);
    setAnimationInterval(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Set graph data for Vis.js with initial node colors reset
    setGraphData({
      nodes: nodes.map(node => ({
        id: node.id,
        label: node.label,
        color: '' // Initialize with no color
      })),
      edges: edges.map(edge => ({ ...edge }))
    });

    
    animateGraphColoring();
  };

  return (
    <div className=' p-5 ' >
      <h1 className=' mb-2 text-2xl font-bold' >Graph Coloring Algorithm Simulator</h1>
      <h1 className='mb-2 text-lg  font-serif font-semibold' >Enter Nodes and Edges of the Graph</h1>
      <form onSubmit={handleSubmit}>
        <h2 className=' text-lg  font-medium'>Nodes</h2>
        {nodes.map((node, index) => (
          <div key={index} className='mb-2.5'>
            <input
              type="text"
              name="id"
              placeholder="ID"
              value={node.id}
              onChange={(e) => handleNodeInputChange(index, e)}
              required
              style={{ marginRight: '5px' }}
            />
            <input
              type="text"
              name="label"
              placeholder="Label"
              value={node.label}
              onChange={(e) => handleNodeInputChange(index, e)}
              required
              style={{ marginRight: '5px' }}
            />
            <button className=' p-2 rounded-lg text-white bg-red-500' type="button" onClick={() => handleRemoveNode(index)}>Remove</button>
          </div>
        ))}
        <button className=' p-2 rounded-lg text-white bg-green-500' type="button" onClick={handleAddNode}>Add Node</button>

        <h2 className=' text-lg  font-medium'>Edges</h2>
        {edges.map((edge, index) => (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              type="text"
              name="from"
              placeholder="From Node ID"
              value={edge.from}
              onChange={(e) => handleEdgeInputChange(index, e)}
              required
              style={{ marginRight: '5px' }}
            />
            <input
              type="text"
              name="to"
              placeholder="To Node ID"
              value={edge.to}
              onChange={(e) => handleEdgeInputChange(index, e)}
              required
              style={{ marginRight: '5px' }}
            />
            <button className=' p-2 rounded-lg text-white bg-red-500' type="button" onClick={() => handleRemoveEdge(index)}>Remove</button>
          </div>
        ))}
        <button className=' p-2 rounded-lg text-white bg-green-500' type="button" onClick={handleAddEdge}>Add Edge</button>

        <div style={{ marginTop: '20px' }}>
          <label>
            Chromatic Number (m):
            <input
              type="number"
              value={chromaticNumber}
              onChange={(e) => setChromaticNumber(parseInt(e.target.value))}
              min="1"
              style={{ marginLeft: '5px' }}
            />
          </label>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button className=' p-2 rounded-lg text-white bg-green-700' type="submit">Submit</button>
          {!animationInterval ? (
            <button className=' p-2 rounded-lg text-white bg-red-700' type="button" onClick={animateGraphColoring} style={{ marginLeft: '10px' }}>Animate Coloring</button>
          ) : (
            <button className=' p-2 rounded-lg text-white bg-red-700' type="button" onClick={stopAnimation} style={{ marginLeft: '10px' }}>Stop Animation</button>
          )}
        </div>
      </form>

      <div ref={networkContainer} style={{ height: '500px', border: '1px solid #ddd', marginTop: '20px' }} />

      {graphData && (
        <div style={{ marginTop: '20px' }}>
          <h3>Graph Coloring Algorithm Simulation</h3>
          <p>Step {stepIndex + 1} / {nodes.length + 1}</p>
        </div>
      )}
    </div>
  );
};
export default App;