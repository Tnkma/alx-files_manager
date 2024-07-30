import { ObjectId } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import basicUtils from '../utils/basics';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

const fileQueue = new Queue('fileQueue');

class FilesController {
  static async postUpload(request, response) {
    const obj = { userId: null, key: null };
    const token = request.header('X-Token');
    // console.log(token);
    if (!token) return response.status(401).json({ error: 'Unauthorized' });

    obj.key = `auth_${token}`;
    obj.userId = await redisClient.get(obj.key);

    if (!obj.userId) return response.status(401).json({ error: 'Unauthorized' });

    if (!basicUtils.isValidId(obj.userId)) return response.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(obj.userId) });
    if (!user) return response.status(401).send({ error: 'Unauthorized' });

    const { error: validationError, fileParams } = await basicUtils.validateBody(request);
    if (validationError) return response.status(400).send({ error: validationError });

    if (fileParams.parentId !== 0 && !basicUtils.isValidId(fileParams.parentId)) {
      return response.status(400).send({ error: 'Parent not found' });
    }

    const { error, code, newFile } = await basicUtils.saveFile(obj.userId, fileParams, FOLDER_PATH);
    if (error) {
      if (request.body.type === 'image') await fileQueue.add({ userId: obj.userId });
      return response.status(code).send({ error });
    }

    if (fileParams.type === 'image') {
      await fileQueue.add({
        fileId: newFile.id.toString(),
        userId: newFile.userId.toString(),
      });
    }

    return response.status(201).send(newFile);
  }

  static async getShow(request, response) {
    try {
    // Get user based on token
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });
      // Get user ID from Redis
      const user = await redisClient.get(`auth_${token}`);
      if (!user) return response.status(401).json({ error: 'Unauthorized' });
      // Get file by ID
      const fileId = request.params.id;
      if (!basicUtils.isValidId(fileId)) return response.status(404).json({ error: 'Not found' });
      const file = await dbClient.filesCollection.findOne({ _id: ObjectId(fileId) });
      if (!file) return response.status(404).json({ error: 'Not found' });
      // Check if file belongs to user
      if (file.userId.toString() !== user) return response.status(404).json({ error: 'Not found' });
      // Return file
      return response.status(200).send(file);
    } catch (error) {
      return response.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async getIndex(request, response) {
    try {
      // Get user based on token
      const token = request.header('X-Token');
      if (!token) return response.status(401).json({ error: 'Unauthorized' });

      // Get user ID from Redis
      const user = await redisClient.get(`auth_${token}`);
      if (!user) return response.status(401).json({ error: 'Unauthorized' });

      // Get parentId and page from request
      const parentId = request.query.parentId || '0';
      const page = parseInt(request.query.page, 10) || 0;

      if (!parentId) return response.status(200).send([]);
      if (!page) return response.status(200).send([]);

      if (!basicUtils.isValidId(parentId) || !basicUtils.isValidId(user)) {
        return response.status(200).send([]);
      }
      if (basicUtils.isValidId(parentId || !page)) {
        return response.status(200).send([]);
      }

      // Pagination logic
      const pageSize = 20;
      const skip = page * pageSize;

      // Prepare the match query
      const matchQuery = {
        userId: ObjectId(user),
      };

      if (parentId !== '0') {
        // Check if parentId is a valid ObjectId
        if (!ObjectId.isValid(parentId)) {
          return response.status(200).send([]); // Return empty list if invalid
        }
        matchQuery.parentId = ObjectId(parentId);
      }

      // Use aggregation to get files by user ID and parent ID with pagination
      const files = await dbClient.filesCollection.aggregate([
        { $match: matchQuery },
        { $skip: skip }, // Skip the number of items based on the page number
        { $limit: pageSize }, // Limit to 20 items per page
      ]).toArray();

      // Return files
      return response.status(200).send(files);
    } catch (error) {
      return response.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
module.exports = FilesController;
