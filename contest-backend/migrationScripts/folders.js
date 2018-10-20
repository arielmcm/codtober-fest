const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const createOrUpdateFolder = async (folder, folderCollection) => {
  const {_id, name} = folder;
  const objectId = new ObjectID(_id);
  const newFolder = {
    title: name,
    parentFolderId: new ObjectID('f00000000000000000000001'),
    userId: new ObjectID(folder.userId),
  };
  const result = await folderCollection.findOneAndUpdate({_id: objectId}, newFolder, {upsert: true, new: true});
  if (result.value) {
    return result.value._id;
  }
  return result.lastErrorObject.upserted;
};
const exec = async () => {
  const oldDB = await MongoClient.connect('mongodb://172.17.0.2/frontier7-survey');
  const newDB = await MongoClient.connect('mongodb://172.17.0.2/f7-projects');
  const oldFolderCollection = oldDB.collection('folders');
  const folderCollection = newDB.collection('Folder');
  const folders = await oldFolderCollection.find().toArray();
  for (let i = 0; i < folders.length; i++) {
    if (folders[i].name === 'My Projects' || folders[i].name === 'Archive') {
      continue;
    }
    await createOrUpdateFolder(folders[i], folderCollection);
  }
  oldDB.close();
  console.log('close connection');
  process.exit(0);
};

exec();
