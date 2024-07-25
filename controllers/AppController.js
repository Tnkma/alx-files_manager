// controllers/AppController.js
const routes = require('../routes/index');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AppController {
  static async getStatus(req, res) {
    const dbAlive = dbClient.isAlive();
    const redisAlive = redisClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    const usersCount = await dbClient.nbUsers();
    const filesCount = await dbClient.nbFiles();

    res.status(200).json({ users: usersCount, files: filesCount });
  }
}

module.exports = AppController;
