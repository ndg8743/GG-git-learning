# Git Learning Journey

A modular Git learning platform with interactive modules that teach Git concepts through practical examples.

## Project Overview

This application provides an interactive learning experience for Git, with a focus on modularity and practical examples. The learning journey is visualized as a graph, where each node represents a module that teaches a specific Git concept.

### Key Features

- **Interactive Learning Journey Graph**: Visual representation of all learning modules with prerequisites and connections
- **Modular Content Structure**: Each module focuses on a narrow Git concept
- **Terminal Emulation**: Practice Git commands directly in the browser
- **File Structure Visualization**: See how Git commands affect the file structure
- **Behind the Command Explanations**: Understand what happens under the hood when you run Git commands
- **Timeline Navigation**: Navigate between different states in the learning sequence
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Draggable Diagrams**: Interactive diagrams that can be moved around for better visualization
- **Debug Information Toggle**: Show or hide visualization data and debug information

## Project Structure

The project is divided into two main parts:

### Backend (Node.js)

- Serves module data and content
- Modular design allows easy addition of new modules
- Data-driven approach for flexible content management

### Frontend (React)

- Interactive learning journey graph using ReactFlow
- Terminal emulation for practicing Git commands
- File structure visualization
- Tabbed interface for instructions, file view, and behind-the-command explanations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm run install:all
```

This will install dependencies for the root project, backend, and frontend.

### Running the Application

#### Development Mode

To run both the backend and frontend concurrently in development mode:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:38765
- Frontend development server on http://localhost:3000/git
- Access the application at http://localhost:38765/git

#### Production Mode

To run the application in production mode:

```bash
npm run build
npm start
```

This will build the frontend and start the backend server which serves the frontend at http://localhost:38765/git

#### Using Docker

The application can also be run using Docker:

1. Build the Docker image:

```bash
npm run docker:build
```

2. Start the Docker container:

```bash
npm run docker:up
```

3. Access the application at http://localhost:38765/git

4. View logs:

```bash
npm run docker:logs
```

5. Stop the Docker container:

```bash
npm run docker:down
```

## Adding New Modules

The system is designed to be modular and data-driven. To add a new module:

1. Create a new JSON file in `backend/src/data/modules/` following the existing module format
2. Add the module metadata to `backend/src/data/modules.json`, including:
   - Module ID
   - Title
   - Description
   - Position in the graph
   - Prerequisites
   - Next modules
3. Add any connections to `backend/src/data/modules.json`

No changes to the React code are needed to add new modules.

## Module Structure

Each module consists of:

- **Metadata**: ID, title, description
- **Content**: Overview and step-by-step instructions
- **Commands**: Git commands to practice with expected outputs
- **File Changes**: How commands affect the file structure
- **Behind the Command**: Explanations of what happens under the hood

## Current Modules

1. **Introduction to Git**: Learn the basics of Git and version control
2. **Git Branching**: Learn how to create and manage branches in Git
3. **Git Commits**: Learn how to make and manage commits in Git

## Credits

Created by Nathan Gopee and Mostafa Ibrahim for FOCS.

## License

MIT
