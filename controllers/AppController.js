import dbClient from "../utils/db";
import redisClient from "../utils/redis";

class AppController {
    static async getStatus(req, res) {
      const  redis = redisClient.isAlive();
      const db = dbClient.isAlive();

      res.status(200).json({ redis: redisAlive, db: dbAlive });
    }

    static async getStats(req, res) {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      res.status(200).json({ users: usersCount, files: filesCount });
    }
}

export default AppController;
