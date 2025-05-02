import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Terminal from './Terminal';
import Timeline from './Timeline';
import FileStructure from './FileStructure';
import TabContent from './TabContent';

const ModuleContent = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('instructions');
  const [commandHistory, setCommandHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [fileStructure, setFileStructure] = useState({});

  useEffect(() => {
    const fetchModule = async () => {
      try {
        console.log('Fetching module with ID:', moduleId);
        const response = await axios.get(`http://localhost:5001/api/modules/${moduleId}`);
        console.log('Module data received:', response.data);
        setModule(response.data);
        setLoading(false);
        
        // Initialize file structure based on module
        if (response.data.content.steps[0].fileChanges) {
          const initialFileStructure = {};
          response.data.content.steps[0].fileChanges.forEach(change => {
            if (change.type === 'create') {
              initialFileStructure[change.path] = { type: 'file', content: '' };
            }
          });
          setFileStructure(initialFileStructure);
        }
        
        // Debug: Check if module has visualizations
        const hasVisualizations = response.data.content.steps.some(step => 
          step.visualizations || (step.behindTheCommand && step.behindTheCommand.visualization)
        );
        console.log('Module has visualizations:', hasVisualizations);
        
        if (hasVisualizations) {
          console.log('Visualization data found in module:');
          response.data.content.steps.forEach((step, index) => {
            if (step.visualizations) {
              console.log(`Step ${index} visualizations:`, step.visualizations);
            }
            if (step.behindTheCommand && step.behindTheCommand.visualization) {
              console.log(`Step ${index} behindTheCommand visualization:`, step.behindTheCommand.visualization);
            }
          });
        }
      } catch (err) {
        setError('Failed to fetch module. Please try again later.');
        setLoading(false);
        console.error('Error fetching module:', err);
      }
    };

    fetchModule();
  }, [moduleId]);

  const handleCommandSubmit = (command) => {
    console.log('Command submitted:', command);
    
    // Add command to history
    const newHistory = [...commandHistory, { command, output: '' }];
    setCommandHistory(newHistory);

    // Check if command matches expected command for current step
    const currentStepData = module.content.steps[currentStep];
    console.log('Current step data:', currentStepData);
    
    if (currentStepData.commands) {
      const expectedCommand = currentStepData.commands.find(cmd => cmd.command === command);
      console.log('Expected command found:', expectedCommand);
      
      if (expectedCommand) {
        // Update command output
        const updatedHistory = [...newHistory];
        const output = expectedCommand.expectedOutput || 'Command executed successfully';
        console.log('Setting output to:', output);
        updatedHistory[updatedHistory.length - 1].output = output;
        console.log('Updating command history with output:', updatedHistory);
        
        // Force a re-render by creating a new array
        setTimeout(() => {
          console.log('Setting command history with timeout');
          setCommandHistory([...updatedHistory]);
        }, 100);

        // Update file structure if there are file changes
        if (currentStepData.fileChanges) {
          const updatedFileStructure = { ...fileStructure };
          currentStepData.fileChanges.forEach(change => {
            if (change.type === 'create') {
              updatedFileStructure[change.path] = { type: 'file', content: '' };
            } else if (change.type === 'modify') {
              if (updatedFileStructure[change.path]) {
                updatedFileStructure[change.path].content = change.content || '';
              }
            } else if (change.type === 'delete') {
              delete updatedFileStructure[change.path];
            }
          });
          setFileStructure(updatedFileStructure);
        }

        // Move to next step if this is the last command in the current step
        const isLastCommand = currentStepData.commands.indexOf(expectedCommand) === currentStepData.commands.length - 1;
        if (isLastCommand && currentStep < module.content.steps.length - 1) {
          setCurrentStep(currentStep + 1);
        }
      } else {
        // Command doesn't match expected command
        const updatedHistory = [...newHistory];
        updatedHistory[updatedHistory.length - 1].output = "Command not recognized for this step. Try again.";
        setCommandHistory(updatedHistory);
      }
    }
  };

  const handleTimelineClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const handleNextStep = () => {
    if (currentStep < module.content.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBackToJourney = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="loading">Loading module content...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!module) {
    return <div className="error">Module not found</div>;
  }

  return (
    <div className="module-content">
      <button className="back-button" onClick={handleBackToJourney}>
        &larr; Back to Learning Journey
      </button>
      
      <h2>{module.title}</h2>
      <p className="module-description">{module.description}</p>
      
      <div className="content-container">
        <FileStructure fileStructure={fileStructure} />
        
        <div className="guidance-interface">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'instructions' ? 'active' : ''}`}
              onClick={() => setActiveTab('instructions')}
            >
              Instructions
            </div>
            <div 
              className={`tab ${activeTab === 'file-view' ? 'active' : ''}`}
              onClick={() => setActiveTab('file-view')}
            >
              File View
            </div>
            <div 
              className={`tab ${activeTab === 'behind-command' ? 'active' : ''}`}
              onClick={() => setActiveTab('behind-command')}
            >
              Behind the Command
            </div>
          </div>
          
          <TabContent 
            activeTab={activeTab} 
            currentStep={currentStep} 
            module={module} 
            fileStructure={fileStructure}
          />
          
          {/* Add Next Step button if current step has no commands */}
          {(!module.content.steps[currentStep].commands || module.content.steps[currentStep].commands.length === 0) && 
            currentStep < module.content.steps.length - 1 && (
            <div className="next-step-container">
              <button className="next-step-button" onClick={handleNextStep}>
                Next Step: {module.content.steps[currentStep + 1].title} &rarr;
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Terminal 
        commandHistory={commandHistory} 
        onCommandSubmit={handleCommandSubmit} 
      />
      
      <Timeline 
        steps={module.content.steps} 
        currentStep={currentStep} 
        onStepClick={handleTimelineClick} 
      />
    </div>
  );
};

export default ModuleContent;
