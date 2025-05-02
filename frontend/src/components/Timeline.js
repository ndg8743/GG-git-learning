import React from 'react';

const Timeline = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="timeline-bar">
      <div className="timeline-label">Timesteps:</div>
      <div className="timeline-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`timeline-step ${index === currentStep ? 'active' : ''} ${index > currentStep ? 'disabled' : ''}`}
            onClick={() => index <= currentStep && onStepClick(index)}
            title={step.content ? `${step.title}: ${step.content.substring(0, 100)}${step.content.length > 100 ? '...' : ''}` : step.title}
            data-tooltip={step.content ? `${step.content.substring(0, 150)}${step.content.length > 150 ? '...' : ''}` : ''}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-title">
              {step.title.length > 20 ? `${step.title.substring(0, 20)}...` : step.title}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
