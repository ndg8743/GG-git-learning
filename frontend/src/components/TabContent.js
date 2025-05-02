import React from 'react';
import ReactMarkdown from 'react-markdown';
import DiagramVisualization from './DiagramVisualization';

const TabContent = ({ activeTab, currentStep, module, fileStructure, showDebugInfo = true }) => {
  if (!module || !module.content || !module.content.steps || !module.content.steps[currentStep]) {
    return <div>No content available</div>;
  }

  const currentStepData = module.content.steps[currentStep];

  const renderInstructionsTab = () => {
    return (
      <div className="instructions-tab">
        <h3>{currentStepData.title}</h3>
        <div className="step-content">
          <ReactMarkdown>{currentStepData.content}</ReactMarkdown>
        </div>
        
        {currentStepData.commands && (
          <div className="commands-section">
            <h4>Commands to Try:</h4>
            <ul className="command-list">
              {currentStepData.commands.map((cmd, index) => (
                <li key={index} className="command-item">
                  <code title={cmd.description}>{cmd.command}</code>
                  <p>{cmd.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderFileViewTab = () => {
    // If there are no file changes in this step, show a message
    if (!currentStepData.fileChanges || currentStepData.fileChanges.length === 0) {
      return (
        <div className="file-view-tab">
          <p>No file changes in this step.</p>
        </div>
      );
    }

    return (
      <div className="file-view-tab">
        <h3>File Changes</h3>
        {currentStepData.fileChanges.map((change, index) => (
          <div key={index} className="file-change">
            <div className="file-change-header">
              <span className={`change-type ${change.type}`} title={`${change.type} operation`}>{change.type}</span>
              <span className="file-path" title={`Path: ${change.path}`}>{change.path}</span>
            </div>
            <p className="file-change-description">{change.description}</p>
            
            {change.type === 'modify' && change.content && (
              <div className="file-diff">
                <pre className="file-content">{change.content}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderBehindCommandTab = () => {
    // If there's no behind the command data in this step, show a message
    console.log('Current step data:', currentStepData);
    
    if (!currentStepData.behindTheCommand) {
      console.log('No behindTheCommand data available for this step');
      return (
        <div className="behind-command-tab">
          <p>No behind-the-command information available for this step.</p>
        </div>
      );
    }

    console.log('behindTheCommand data:', currentStepData.behindTheCommand);
    const { title, content, visualization } = currentStepData.behindTheCommand;
    console.log('Visualization data:', visualization);

    return (
      <div className="behind-command-tab">
        <h3 title={`Explanation: ${title}`}>{title}</h3>
        <div className="behind-command-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {visualization && (
          <div className="visualization">
            {visualization.type === 'diagram' && (
              <div className="diagram" title="Interactive diagram: Hover over nodes for more information">
                <h4 className="visualization-title">Interactive Diagram</h4>
                <p className="visualization-description">This diagram illustrates the concepts explained above. Hover over elements for more details.</p>
                {showDebugInfo && (
                  <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #ddd' }}>
                    <h5 style={{ marginTop: '0', color: '#0366d6' }}>Visualization Data:</h5>
                    <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                      <pre style={{ margin: '0' }}>
                        {JSON.stringify(visualization.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                <DiagramVisualization data={visualization.data} showDebugInfo={showDebugInfo} />
              </div>
            )}
            
            {visualization.type === 'image' && (
              <div className="image-visualization">
                <h4 className="visualization-title">Visual Representation</h4>
                <img 
                  src={visualization.url} 
                  alt={title} 
                  title={title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'placeholder-image.png';
                  }}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Debug information */}
        {showDebugInfo && (
          <div className="debug-info" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px' }}>
            <h4>Debug Information</h4>
            <p>Current step: {currentStep}</p>
            <p>Active tab: {activeTab}</p>
            <p>Module ID: {module.id}</p>
            <p>Step title: {currentStepData.title}</p>
            <p>Behind the Command available: {currentStepData.behindTheCommand ? 'Yes' : 'No'}</p>
            <p>Visualization data available: {visualization ? 'Yes' : 'No'}</p>
            {visualization && (
              <>
                <p>Visualization type: {visualization.type}</p>
                <p>Data nodes: {visualization.data?.nodes?.length || 0}</p>
                <p>Data edges: {visualization.data?.edges?.length || 0}</p>
                <p>Nodes: {JSON.stringify(visualization.data?.nodes)}</p>
                <p>Edges: {JSON.stringify(visualization.data?.edges)}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render the appropriate tab content based on activeTab
  switch (activeTab) {
    case 'instructions':
      return renderInstructionsTab();
    case 'file-view':
      return renderFileViewTab();
    case 'behind-command':
      // If the current step doesn't have behindTheCommand data, default to instructions
      if (!currentStepData.behindTheCommand) {
        return renderInstructionsTab();
      }
      return renderBehindCommandTab();
    default:
      return <div>Select a tab to view content</div>;
  }
};

export default TabContent;
