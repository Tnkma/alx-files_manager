const { promisify } = require('util');
const { createClient } = require('redis');

class RedisClient {
  // Creates an instance of redis
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (err) => {
      console.error('Redis client failed to connect:', err.message || err.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  // Checks if were connected
  isAlive() {
    return this.isClientConnected;
  }

  // method that gets a key
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  // method to set a key with duration
  async set(key, value, duration) {
    await promisify(this.client.SETEX)
      .bind(this.client)(key, duration, value);
  }

  // Method to del a key
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
