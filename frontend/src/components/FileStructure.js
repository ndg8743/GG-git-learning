import React from 'react';

const FileStructure = ({ fileStructure }) => {
  // Helper function to render file or directory
  const renderFileOrDir = (path, item, isRoot = false) => {
    const pathParts = path.split('/');
    const name = pathParts[pathParts.length - 1];
    
    // Handle empty name (root directory)
    const displayName = name || (isRoot ? 'Project Root' : '/');
    
    // Determine if it's a directory based on path ending with '/'
    const isDirectory = path.endsWith('/') || item.type === 'directory';
    
    return (
      <div key={path} className={`file-item ${isDirectory ? 'directory' : 'file'}`}>
        <div className="file-name">
          {isDirectory ? (
            <span className="directory-icon">📁</span>
          ) : (
            <span className="file-icon">📄</span>
          )}
          <span>{displayName}</span>
        </div>
        
        {/* If it's a directory, render its children */}
        {isDirectory && item.children && (
          <div className="file-children">
            {Object.entries(item.children).map(([childPath, childItem]) => 
              renderFileOrDir(`${path}${childPath}`, childItem)
            )}
          </div>
        )}
      </div>
    );
  };

  // Process file structure to create a hierarchical structure
  const processFileStructure = () => {
    const root = { type: 'directory', children: {} };
    
    Object.entries(fileStructure).forEach(([path, item]) => {
      const parts = path.split('/').filter(Boolean);
      let current = root;
      
      // Build the directory structure
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current.children[part]) {
          current.children[part] = { type: 'directory', children: {} };
        }
        current = current.children[part];
      }
      
      // Add the file or directory
      const lastPart = parts[parts.length - 1] || path;
      if (path.endsWith('/')) {
        current.children[lastPart] = { type: 'directory', children: {} };
      } else {
        current.children[lastPart] = { type: 'file', content: item.content || '' };
      }
    });
    
    return root;
  };

  const rootStructure = processFileStructure();

  return (
    <div className="file-structure">
      <h3>File Structure</h3>
      <div className="file-tree">
        {renderFileOrDir('/', rootStructure, true)}
      </div>
    </div>
  );
};

export default FileStructure;
