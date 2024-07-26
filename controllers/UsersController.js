import sha1 from 'sha1';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const queue = new Queue('queue');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is not provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is not provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists in DB
    const user = await dbClient.usersCollection.findOne({ email });
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
    let result;
    try {
      result = await dbClient.usersCollection.insertOne(newUser);
      // const newman = (await dbClient.usersCollection.findOne({ email, password: hashedPassword }));
      // console.log(newman);
    } catch (err) {
      await queue.add({});
      return res.status(500).send({ error: 'Error creating user.' });
    }
    // const result = await dbClient.usersCollection.insertOne(newUser);

    // Return the new user with only the email and id
    const userResponse = {
      id: result.insertedId.toString(),
      email,
    };

    await queue.add({
      userId: result.insertedId.toString(),
    });

    return res.status(201).send(userResponse);
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    // console.log(token);

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userKey = `auth_${token}`;
    // console.log(userKey);

    const userId = await redisClient.get(userKey);
    // console.log(userId);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Assuming _db.usersCollection is a MongoDB collection
    const user = await dbClient.usersCollection.findOne({ _id: userId});

    // console.log(user);

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // console.log(user);

    // return res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}

module.exports = UsersController;
