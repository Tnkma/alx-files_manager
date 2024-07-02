import dotenv from 'dotenv';
import { existsSync } from 'fs';

/**
 * Loads the appropriate environment variables for an event.
 */
const enventLoader = () => {
  const env = process.env.npm_lifecycle_event || 'dev';
  const path = env.includes('test') || env.includes('cover') ? '.env.test' : '.env';

  if (existsSync(path)) {
    dotenv.config({ path });
  }
};

export default enventLoader;
