import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const database = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
      if (!err) {
        // console.log('Connected successfully to server');
        this.db = client.db(database);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      } else {
        console.log(err.message);
        this.db = false;
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    const numberOfUsers = this.usersCollection.countDocuments();
    return numberOfUsers;
  }

  async nbFiles() {
    const numberOfFiles = this.filesCollection.countDocuments();
    return numberOfFiles;
  }
}

const dbClient = new DBClient();

export default dbClient;
