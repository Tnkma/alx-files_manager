import express from 'express';
import redis from 'redis';
import routes from './routes';
import dbClient from './utils/db';

// Load environment variables
// Initialize Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Use routes defined in routes/index.js
app.use('/', routes);

// Redis client setup
const redisClient = redis.createClient({
  host: '127.0.0.1',
  port: 6379,
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Route to check MongoDB connection status
app.get('/status', (req, res) => {
  const isConnected = dbClient.isAlive();
  const response = {
    mongodb: isConnected ? 'Connected' : 'Disconnected',
  };
  res.json(response);
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
