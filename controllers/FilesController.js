const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

async function postUpload(req, res) {
  try {
    const token = req.headers['x-token'];
    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    // Validate token
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const user = await dbClient.usersCollection.findOne({ token });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Validate input
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    // Validate parentId
    if (parentId !== '0') {
      const parent = await dbClient.filesCollection.findOne({ _id: new dbClient.ObjectID(parentId) });
      if (!parent) return res.status(400).json({ error: 'Parent not found' });
      if (parent.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    // Create new file document
    const fileDoc = {
      userId: user._id,
      name,
      type,
      isPublic,
      parentId,
    };

    if (type === 'folder') {
      await dbClient.filesCollection.insertOne(fileDoc);
      return res.status(201).json(fileDoc);
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(FOLDER_PATH)) {
      fs.mkdirSync(FOLDER_PATH, { recursive: true });
    }

    // Save file data to disk
    const filePath = path.join(FOLDER_PATH, uuidv4());
    fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

    // Add file path to document
    fileDoc.localPath = filePath;
    await dbClient.filesCollection.insertOne(fileDoc);

    res.status(201).json(fileDoc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  postUpload,
};
