const { MongoClient } = require('mongodb');

// Connection URL
class DBClient {
  constructor() {
    const url = 'mongodb://localhost:27017';
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = 'myProject';
    this.connected = false;
  }

  async connect() {
    await this.client.connect();
    this.connected = true;
    console.log('Connected successfully to server');
  }

  async main() {
    if (!this.connected) {
      await this.connect();
    }

    const db = this.client.db(this.dbName);
    const collection = db.collection('documents');

    // Insert documents
    const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
    console.log('Inserted documents =>', insertResult);

    // Find documents
    const findResult = await collection.find({}).toArray();
    console.log('Found documents =>', findResult);

    return 'done.';
  }

  async close() {
    await this.client.close();
    this.connected = false;
  }

  // Check if the connection is successful
  isAlive() {
    return this.connected;
  }
}

// Usage
const dbClient = new DBClient();

// Check if alive before and after connecting
console.log('Checking connection status before connecting:');
console.log(dbClient.isAlive() ? 'Connection is alive' : 'Connection is not alive');

console.log('Connecting and running main:');
const waitConnection = () => new Promise((resolve, reject) => {
  let i = 0;
  const repeatFct = async () => {
    await setTimeout(() => {
      i += 1;
      if (i >= 10) {
        reject(new Error('Failed to connect within the timeout period.'));
      } else if (!dbClient.isAlive()) {
        repeatFct();
      } else {
        resolve();
      }
    }, 1000);
  };
  repeatFct();
});

(async () => {
  try {
    await dbClient.main();
    console.log('Initial isAlive check:', dbClient.isAlive());
    await waitConnection();
    console.log('After waitConnection isAlive check:', dbClient.isAlive());
    await dbClient.close();
    console.log('After close isAlive check:', dbClient.isAlive());
  } catch (error) {
    console.error('Error:', error);
  }
})();
