import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';

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
}

export default UsersController;
