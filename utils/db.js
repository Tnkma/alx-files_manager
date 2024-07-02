import enventLoader from './env';
import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    enventLoader();
    // Set connection options for MongoDB
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    // Set the connection string for MongoDB
    const url = `mongodb://${host}:${port}`;
    this.database = database;
    // Create a new MongoClient
    this.client = new MongoClient(url);
    this.connected = false;

    // Automatically connect upon instantiation
    this.connect().catch(console.error);
  }

  async connect() {
    await this.client.connect();
    this.connected = true;
  }

  // Method to check if the connection is successful
  isAlive() {
    return this.connected;
  }

  // Method to get the number of users in the database
  async nbUsers() {
    return this.client.db(this.database).collection('users').countDocuments();
  }

  // Method to get the number of files in the database
  async nbFiles() {
    return this.client.db(this.database).collection('files').countDocuments();
  }
}

// Create a new instance of the DBClient class
const dbClient = new DBClient();

// Export the instance
export default dbClient;
