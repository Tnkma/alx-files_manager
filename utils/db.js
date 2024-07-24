const { MongoClient } = require('mongodb');
require('dotenv').config(); 

class DBClient {
  constructor() {
    // Set connection options for MongoDB
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // Set the connection string for MongoDB
    const url = `mongodb://${host}:${port}`;
    this.database = database;
    // Create a new MongoClient
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.connected = false;

    // Automatically connect upon instantiation
    this.connect().catch(console.error);
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
    }
  }

  // Method to check if the connection is successful
  isAlive() {
    return this.connected;
  }

  // Method to get the number of users in the database
  async nbUsers() {
    if (!this.connected) throw new Error('Not connected to the database');
    return this.client.db(this.database).collection('users').countDocuments();
  }

  // Method to get the number of files in the database
  async nbFiles() {
    if (!this.connected) throw new Error('Not connected to the database');
    return this.client.db(this.database).collection('files').countDocuments();
  }

  // Method to get reference of the user collection
  async users() {
    if (!this.connected) throw new Error('Not connected to the database');
    return this.client.db(this.database).collection('users');
  }

  // Method to get reference of the files collection
  async files() {
    if (!this.connected) throw new Error('Not connected to the database');
    return this.client.db(this.database).collection('files');
  }
}

// Create a new instance of the DBClient class
const dbClient = new DBClient();

// Export the instance
module.exports = dbClient;

