import React, { useState, useEffect } from 'react';

/**
 * A specialized component for visualizing Bloom filters
 * This provides a more interactive and detailed representation of how Bloom filters work
 */
const BloomFilterVisualization = ({ data, width = 900, height = 500 }) => {
  const [bitArray, setBitArray] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [hashResults, setHashResults] = useState([]);
  const [checkResults, setCheckResults] = useState(null);
  const [filterSize, setFilterSize] = useState(20); // Default size for visualization
  
  // Initialize bit array
  useEffect(() => {
    setBitArray(new Array(filterSize).fill(0));
  }, [filterSize]);

  // Simple hash functions for demonstration
  const hashFunctions = [
    // Hash function 1
    (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % filterSize;
      }
      return hash;
    },
    // Hash function 2
    (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 37 + str.charCodeAt(i)) % filterSize;
      }
      return hash;
    },
    // Hash function 3
    (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 41 + str.charCodeAt(i)) % filterSize;
      }
      return hash;
    }
  ];

  // Add an element to the Bloom filter
  const addElement = () => {
    if (!inputValue.trim()) return;
    
    const newHashResults = hashFunctions.map(fn => fn(inputValue));
    setHashResults(newHashResults);
    
    const newBitArray = [...bitArray];
    newHashResults.forEach(index => {
      newBitArray[index] = 1;
    });
    
    setBitArray(newBitArray);
    setInputValue('');
    setCheckResults(null);
  };

  // Check if an element might be in the Bloom filter
  const checkElement = () => {
    if (!inputValue.trim()) return;
    
    const newHashResults = hashFunctions.map(fn => fn(inputValue));
    setHashResults(newHashResults);
    
    const mightExist = newHashResults.every(index => bitArray[index] === 1);
    setCheckResults({
      value: inputValue,
      mightExist,
      hashPositions: newHashResults
    });
  };

  // Reset the Bloom filter
  const resetFilter = () => {
    setBitArray(new Array(filterSize).fill(0));
    setHashResults([]);
    setCheckResults(null);
    setInputValue('');
  };

  // Render the bit array
  const renderBitArray = () => {
    const cellSize = Math.min(30, (width - 40) / filterSize);
    
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', marginBottom: '5px' }}>
            {bitArray.map((_, index) => (
              <div key={`index-${index}`} style={{ 
                width: cellSize, 
                height: 20, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontSize: '10px',
                color: 'var(--secondary-color)'
              }}>
                {index}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex' }}>
            {bitArray.map((bit, index) => (
              <div key={`bit-${index}`} style={{ 
                width: cellSize, 
                height: cellSize, 
                border: `1px solid var(--border-color)`,
                backgroundColor: bit ? 'var(--success-color)' : 'var(--card-bg)',
                color: bit ? 'white' : 'var(--text-color)',
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                fontWeight: 'bold',
                transition: 'background-color 0.3s',
                boxShadow: hashResults.includes(index) ? `0 0 5px var(--primary-color)` : 'none'
              }}>
                {bit}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render hash function results
  const renderHashResults = () => {
    if (hashResults.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Hash Results:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {hashResults.map((result, index) => (
            <div key={`hash-${index}`} style={{ 
              padding: '5px 10px', 
              backgroundColor: 'var(--card-bg)', 
              borderRadius: '4px',
              border: `1px solid var(--border-color)`,
              color: 'var(--text-color)'
            }}>
              Hash {index + 1}: {result}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render check results
  const renderCheckResults = () => {
    if (!checkResults) return null;
    
    return (
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: checkResults.mightExist ? 'var(--success-color)' : 'var(--danger-color)',
        opacity: 0.2,
        border: `1px solid ${checkResults.mightExist ? 'var(--success-color)' : 'var(--danger-color)'}`,
        borderRadius: '4px',
        color: 'var(--text-color)'
      }}>
        <h4>Check Result:</h4>
        <p>
          <strong>"{checkResults.value}"</strong> {checkResults.mightExist ? 'might exist' : 'definitely does not exist'} in the Bloom filter.
        </p>
        {checkResults.mightExist && (
          <p style={{ fontSize: '12px', color: 'var(--secondary-color)' }}>
            Note: This could be a false positive. Bloom filters can tell with certainty when an element is NOT in the set,
            but may give false positives.
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      border: `1px solid var(--border-color)`, 
      borderRadius: '5px', 
      padding: '20px',
      maxWidth: width,
      margin: '0 auto',
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-color)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Interactive Bloom Filter</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Filter Size:</label>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="range" 
            min="10" 
            max="50" 
            value={filterSize} 
            onChange={(e) => setFilterSize(parseInt(e.target.value))}
            style={{ flex: 1 }}
          />
          <span>{filterSize} bits</span>
        </div>
      </div>
      
      {renderBitArray()}
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input 
          type="text" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a string..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            borderRadius: '4px', 
            border: `1px solid var(--border-color)`,
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-color)'
          }}
        />
        <button 
          onClick={addElement}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'var(--success-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
        <button 
          onClick={checkElement}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check
        </button>
        <button 
          onClick={resetFilter}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: 'var(--secondary-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      {renderHashResults()}
      {renderCheckResults()}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: 'var(--text-color)' }}>
        <h4>How It Works:</h4>
        <p>
          A Bloom filter uses multiple hash functions to map elements to positions in a bit array.
          When adding an element, the bits at the positions determined by the hash functions are set to 1.
          When checking if an element exists, if any of the bits at the hash positions is 0, the element
          definitely doesn't exist. If all bits are 1, the element might exist (false positives are possible).
        </p>
        <p>
          Git uses Bloom filters to quickly check if a file path might exist in a repository,
          which helps optimize operations like path existence checking in large repositories.
        </p>
      </div>
    </div>
  );
};

export default BloomFilterVisualization;
