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

    if (!obj.userId) return response.status(401).json({ error: 'Unauthorized thee' });

    if (!basicUtils.isValidId(obj.userId)) return response.status(401).send({ error: 'Unauthorized here' });

    const user = await dbClient.usersCollection.findOne({ _id: ObjectId(obj.userId) });
    if (!user) return response.status(401).send({ error: 'Unauthorized get' });

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
}
module.exports = FilesController;
