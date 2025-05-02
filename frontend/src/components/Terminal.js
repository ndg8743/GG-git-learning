import React, { useState, useRef, useEffect } from 'react';

const Terminal = ({ commandHistory, onCommandSubmit }) => {
  const [command, setCommand] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom of terminal when command history changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    // Debug: Log command history
    console.log('Command History:', commandHistory);
  }, [commandHistory]);

  // Focus input when terminal is clicked
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCommandChange = (e) => {
    setCommand(e.target.value);
  };

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    if (command.trim()) {
      onCommandSubmit(command.trim());
      setCommand('');
    }
  };

  return (
    <div className="terminal-container">
      <div className="terminal" ref={terminalRef} onClick={handleTerminalClick}>
        {commandHistory.map((item, index) => (
          <div key={index} className="terminal-line">
            <div className="terminal-command-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-command-text">{item.command}</span>
            </div>
            {item.output && (
              <div className="terminal-output" style={{ 
                color: '#00ff00', 
                fontWeight: 'bold',
                backgroundColor: '#333',
                padding: '5px',
                margin: '5px 0',
                borderRadius: '3px'
              }}>
                <div>Output:</div>
                {item.output.split('\n').map((line, i) => (
                  <div key={i}>{line || '(empty line)'}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <form className="terminal-input" onSubmit={handleCommandSubmit}>
        <span className="terminal-prompt">$</span>
        <input
          type="text"
          className="terminal-command"
          value={command}
          onChange={handleCommandChange}
          ref={inputRef}
          autoFocus
          placeholder="Type your command here..."
        />
      </form>
    </div>
  );
};

export default Terminal;
