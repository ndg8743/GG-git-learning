// Configuration for the application
const config = {
  // API URL - will be used for all API requests

  apiUrl: process.env.REACT_APP_API_URL || '/git/api',

  // Version of the application
  version: '1.0.0',
  
  // Default port for the application
  port: process.env.PORT || 38765
};

export default config;
