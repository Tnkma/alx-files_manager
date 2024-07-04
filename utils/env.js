const dotenv = require('dotenv');
const { existsSync } = require('fs');

/**
 * Loads the appropriate environment variables for an event.
 */
const eventLoader = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    dotenv.config({ path }); // Load environment variables from .env file
  }
};

module.exports = eventLoader;
