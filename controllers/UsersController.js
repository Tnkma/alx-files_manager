const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // const checkdb = await dbClient.isAlive();
    // if (checkdb) {
    // console.log('DB is alive');
    // }

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists in DB
    const user = await (await dbClient.users()).findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Create new user object
    const newUser = {
      email,
      password: hashedPassword,
    };

    // Insert new user into DB
    const result = await (await dbClient.users()).insertOne(newUser);

    // Return the new user with only the email and id
    const userResponse = {
      id: result.insertedId.toString(),
      email,
    };

    return res.status(201).json(userResponse);
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve user ID from Redis based on token
    // i think redis stores this as a token and not user data
    // lets see if dbclient can provide the data
    const user = await redisClient.get(`auth_${token}`);
    console.log(user);
    return res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

module.exports = UsersController;
