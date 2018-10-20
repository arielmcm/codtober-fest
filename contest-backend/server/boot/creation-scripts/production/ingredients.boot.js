const ingredients = require('../../data/production/ingredients');
const ObjectId = require('mongodb').ObjectID;

module.exports = app => {
  const Ingredient = app.models.Ingredient;

  ingredients.forEach(ingredient => {
    ingredient.id = new ObjectId(ingredient.id);
    Ingredient
      .findOrCreate({where: {id: ingredient.id}}, ingredient)
      .catch(error => console.log(error));
  });
};
