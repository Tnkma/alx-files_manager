const redis = require('redis');

// create a redis class to handle all redis operations
class RedisClient {
  constructor() {
    // initialize the redis client server connection
    this.client = redis.createClient({
      host: '127.0.0.1',
      port: 6379,
    });

    // Trying to connect to the redis server
    // If we encounter an error, we will log it to the console
    this.client.on('error', (err) => {
      console.error('Error connecting to the redis server:', err);
    });

    // If the connection is successful, we will log a success message to the console
    this.client.on('connect', () => {
      // console.log('Connected to the redis server');
      this.connected = true;
    });
  }

  // method to check if the connection is successful
  isAlive() {
    const status = this.client.connected;
    if (status) {
      return true;
    }
    return false;
  }

  // takes a string key as argument and returns the Redis value stored for this key
  async get(key) {
    // stimulate a promise to return the value
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  // takes a string key, a value and a duration in second as arguments to store it in Redis
  async set(key, value, duration) {
    // stimulate a promise to save the value in Redis
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }

  // takes a string key as argument and deletes the value stored for this key in Redis
  async del(key) {
    // stimulate a promise to delete the value in Redis
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, value) => {
        if (err) reject(err);
        resolve(value);
      });
    });
  }
}

// create a new instance of the RedisClient class
const redisClient = new RedisClient();
// export the RedisClient class
module.exports = redisClient;
