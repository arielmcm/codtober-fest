const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcryptjs');

const createOrUpdateCompany = async (name, companyCollection) => {
  const result = await companyCollection.findOneAndUpdate({name}, {name}, {upsert: true, new: true});
  if (result.value) {
    return result.value._id;
  }
  return result.lastErrorObject.upserted;
};
const createOrUpdateUser = async (user, companyId, userCollection, roleMappingCollection) => {
  const {_id, updatedAt, createAt, firstName, lastName, username, phoneNumber} = user;
  const objectId = new ObjectID(_id);
  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    updatedAt,
    createAt,
    name: `${firstName} ${lastName}`.toUpperCase(),
    isActive: true,
    emailVerified: true,
    email: username,
    companyId,
    phone: phoneNumber,
    password: bcrypt.hashSync('123456', salt),
  };
  let result = await userCollection.findOneAndUpdate({_id: objectId}, Object.assign({}, newUser), {upsert: true});
  result = await roleMappingCollection.findOneAndUpdate(
    {principalId: _id.toString()},
    {
      principalType: 'USER',
      principalId: _id.toString(),
      roleId: new ObjectID('d00000000000000000000002'),
    },
    {upsert: true}
  );
  return _id;
};
const exec = async () => {
  const oldDB = await MongoClient.connect('mongodb://172.17.0.2/frontier7-users');
  const newDB = await MongoClient.connect('mongodb://172.17.0.2/f7_users');
  const oldUserCollection = oldDB.collection('users');
  const userCollection = newDB.collection('FrontierUser');
  const roleMappingCollection = newDB.collection('RoleMapping');
  const companyCollection = newDB.collection('Company');
  const users = await oldUserCollection.find().toArray();
  const migrateUsers = ['586bc654e118080d583fcf4d', '5894ab0e9861f3447e2bbb81', '5894ab449861f3447e2bbb82', '58bd99467b532658644b0ba5', '58bd99c57b532658644b0ba7', '58bd99fb7b532658644b0ba8', '58bd9a357b532658644b0ba9', '58da7442a92f456ac8aabcb9', '58da7537a92f456ac8aabcbd', '58bd98cf7b532658644b0ba4', '590352ee65e87c16b569479c', '597f42e130c66b17b332c25a'];
  const companies = {};
  for (let i = 0; i < users.length; i++) {
    if (migrateUsers.indexOf(`${users[i]._id}`) === -1) {
      continue;
    }
    console.log(users[i]._id);
    const name = `${users[i].firstName} ${users[i].lastName}`.trim();
    const companyName = users[i].companyName ? users[i].companyName : name;
    if (companies[companyName.toUpperCase()] === undefined) {
      companies[companyName.toUpperCase()] = await createOrUpdateCompany(companyName, companyCollection);
    }
    const companyId = companies[companyName.toUpperCase()];
    const userId = await createOrUpdateUser(users[i], companyId, userCollection, roleMappingCollection);
  }
  oldDB.close();
  newDB.close();
  console.log('close connection');
  process.exit(0);
};

exec();
