const app = require('../../../server/server');

module.exports = {
  beforeRemote: {
    create: calculateOrderTotalPrice,
  },
  afterRemote: {
    create: incrementUserAmount,
  },
};

async function getIngredientsTotalPrice (selectedIngredientNames) {
  const Ingredient = app.models.Ingredient;
  const ingredients = await Ingredient.find({where: {name: {inq: selectedIngredientNames}}});
  return ingredients.reduce((total, {price}) => price + total, 0);
}

async function getSizePrice (selectedSizeName) {
  const Size = app.models.Size;
  const size = await Size.findOne({where: {name: selectedSizeName}});
  return size.price;
}

async function calculateOrderTotalPrice (context) {
  const data = context.args.data;
  const selectedIngredientNames = data.ingredients;
  const totalIngredientsPrize = await getIngredientsTotalPrice(selectedIngredientNames);
  const sizePrize = await getSizePrice(data.size);
  data.total = totalIngredientsPrize + sizePrize;
}

async function incrementUserAmount (context) {
  const data = context.args.data;
  const Customer = app.models.Customer;
  const customer = await Customer.findOne({where: {name: data.name}});
  customer.amount += data.total;
  await customer.save();

  const Ingredient = app.models.Ingredient;
  const ingredients = await Ingredient.find({where: {name: {inq: data.ingredients}}});
  for (let i = 0; i < ingredients.length; ++i) {
    await Ingredient.updateAll({id: ingredients[i].id}, {'$inc': {'timesUsed': 1}});
  }
}
