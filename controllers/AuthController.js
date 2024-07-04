/* eslint-disable import/no-named-as-default */
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  // Sign-in user and generate token
  static async getConnect(req, res) {
    try {
      // Extract Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Extract base64 credentials and decode
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      // Hash the password (assuming stored as SHA1)
      // const hashedPassword = sha1(password);

      const users = await (await dbClient.users()).findOne({ email });
      // const user = users.find(u => u.email === email && u.password === hashedPassword);

      if (!users) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token
      const token = uuidv4();

      // Store user ID in Redis with token as key (expire in 24 hours)
      await redisClient.set(`auth_${token}`, users._id.toString(), 24 * 60 * 60);

      // Return token to client
      return res.status(200).json({ token });
    } catch (error) {
      console.error('Error in getConnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  // Sign-out user and delete token
  static async getDisconnect(req, res) {
    try {
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve user ID from Redis based on token
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete token in Redis
      await redisClient.del(`auth_${token}`);

      // Return success response
      return res.status(204).end();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
