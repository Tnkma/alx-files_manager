import enventLoader from './env';

const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
      enventLoader();
      // Set connection options for MongoDB
      const host = process.env.DB_HOST || 'localhost';
      const port = process.env.DB_PORT || '27017';
      const database = process.env.DB_DATABASE || 'files_manager';
  
      // Set the connection string for MongoDB
      const url = `mongodb://${host}:${port}/${database}`;
      // console.log(url);
  
      // Create a new MongoClient
      this.client = new MongoClient(url);
  }
  
  async connect() {
      try {
          await this.client.connect(); // Connect asynchronously
          console.log('Connected to MongoDB');
      } catch (error) {
          console.error('Error connecting to MongoDB:', error);
          throw error; // Re-throw the error to handle it where connect() is called
      }
  }

  // Method to check if the connection is successful
  async isAlive() {
    try {
      // Check if the connection is successful
      await this.client.connected;
      return true;
    } catch (err) {
      return false;
    }
  }

  // Method to get the number of users in the database
  async nbUsers() {
    try {
      const users = this.client.db(this.database).collection('users');
      const count = await users.countDocuments();
      return count;
    } catch (err) {
      console.error('Error getting the number of users:', err);
      return 0;
    }
  }

  // Method to get the number of files in the database
  async nbFiles() {
    try {
      const files = this.client.db(this.database).collection('files');
      const count = await files.countDocuments();
      return count;
    } catch (err) {
      console.error('Error getting the number of files:', err);
      return 0;
    }
  }

  // Method to close the connection
  async close() {
    if (this.client) {
      await this.client.close();
      this.connected = false;
    }
  }
}

// Create a new instance of the DBClient class
const dbClient = new DBClient();

// Export the instance
module.exports = dbClient;