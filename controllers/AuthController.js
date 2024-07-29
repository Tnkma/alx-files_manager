/* eslint-disable import/no-named-as-default */
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');

class AuthController {
  // Sign-in user and generate token
  static async getConnect(request, response) {
    const Authorization = request.header('Authorization') || '';

    const credentials = Authorization.split(' ')[1];

    if (!credentials) { return response.status(401).send({ error: 'Unauthorized' }); }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf-8',
    );

    const [email, password] = decodedCredentials.split(':');

    if (!email || !password) { return response.status(401).send({ error: 'Unauthorized' }); }

    const hashedPassword = sha1(password);
    // console.log(email, hashedPassword);

    const user = {
      email,
      password: hashedPassword,
    };

    const users = (await dbClient.usersCollection.findOne(user));

    if (!users) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    // If user is not found, generate token
    const token = uuidv4();

    // Store user ID in Redis with token as key (expire in 24 hours)
    await redisClient.set(`auth_${token}`, users._id.toString(), 24 * 3600);

    // Return token to client
    return response.status(200).json({ token });
  }

  // Sign-out user and delete token
  static async getDisconnect(req, res) {
    try {
      const token = req.header('X-Token');

      if (!token) return res.status(401).json({ error: 'Unauthorized' });

      const key = `auth_${token}`;
      // Check if token exits in Redis
      if (!(await redisClient.get(key))) return res.status(401).json({ error: 'Unauthorized' });
      // Delete token in Redis
      await redisClient.del(key);

      // Return success response
      return res.status(204).end();
    } catch (error) {
      console.error('Error in getDisconnect:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
