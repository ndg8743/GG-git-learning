import React from 'react';
import ReactMarkdown from 'react-markdown';
import DiagramVisualization from './DiagramVisualization';

const TabContent = ({ activeTab, currentStep, module, fileStructure }) => {
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
                  <code>{cmd.command}</code>
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
              <span className={`change-type ${change.type}`}>{change.type}</span>
              <span className="file-path">{change.path}</span>
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
    if (!currentStepData.behindTheCommand) {
      return (
        <div className="behind-command-tab">
          <p>No behind-the-command information available for this step.</p>
        </div>
      );
    }

    const { title, content, visualization } = currentStepData.behindTheCommand;

    return (
      <div className="behind-command-tab">
        <h3>{title}</h3>
        <div className="behind-command-content">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {visualization && (
          <div className="visualization">
            {visualization.type === 'diagram' && (
              <div className="diagram">
                <DiagramVisualization data={visualization.data} />
              </div>
            )}
            
            {visualization.type === 'image' && (
              <div className="image-visualization">
                <img 
                  src={visualization.url} 
                  alt={title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'placeholder-image.png';
                  }}
                />
              </div>
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
      return renderBehindCommandTab();
    default:
      return <div>Select a tab to view content</div>;
  }
};

export default TabContent;
