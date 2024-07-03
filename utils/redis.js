import { createClient } from "redis";

// create a redis class to handle all redis operations
class RedisClient {
  constructor() {
    // initialize the redis client server connection
    this.client = createClient({
      url: 'redis://127.0.0.1:6379'
    });
    this.isconnected = true;
    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
      this.isconnected = false;
    });
    const getsta = this.client.connect();
    if (getsta) {
      this.isconnected = true;
    }
  }

  // method to check if the connection is successful
  isAlive() {
    const status = this.client.isOpen;
    if (status) {
      return true;
    } else {
      return false;
    }
  }

  // takes a string key as argument and returns the Redis value stored for this key
  async get(key) {
    return (await this.client).get(key);
  }

  // takes a string key, a value and a duration in second as arguments to store it in Redis
  async set(key, value, duration) {
    return (await this.client).set(key, value, 'EX', duration)
  }

  // takes a string key as argument and deletes the value stored for this key in Redis
  async del(key) {
    return (await this.client).del(key);
  }
}

// create a new instance of the RedisClient class
const redisClient = new RedisClient();
// export the RedisClient class
module.exports = redisClient;
