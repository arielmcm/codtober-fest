const sizes = require('../../data/production/sizes');
const ObjectId = require('mongodb').ObjectID;

module.exports = app => {
  const Size = app.models.Size;

  sizes.forEach(size => {
    size.id = new ObjectId(size.id);
    Size
      .findOrCreate({where: {id: size.id}}, size)
      .catch(error => console.log(error));
  });
};
