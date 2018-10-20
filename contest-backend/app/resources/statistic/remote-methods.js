const app = require('../../../server/server');

module.exports = {
  getStatistics,
};

async function getMostValuableCustomer () {
  const Customer = app.models.Customer;
  const customerFound = await Customer.find({"order": "amount DESC", "limit": 1});
  return customerFound.length && customerFound[0].amount !== 0 ? customerFound[0].name : 'Nobody :(';
}

async function getTop3Ingredients () {
  const Ingredient = app.models.Ingredient;
  return await Ingredient.find({"order": "timesUsed DESC", "limit": 3});
}

async function getAverageOrderAmount () {
  return new Promise((resolve, reject) => {
    const aggregateGroupQuery = {
      '$group': {
        '_id': null,
        'total': {'$avg': '$total'},
      },
    };
    const connector = app.dataSources.mongodb.connector;
    connector.collection('Order').aggregate([aggregateGroupQuery], (aggregateError, data) => {
      if (aggregateError) {
        return reject(aggregateError);
      }
      resolve(data[0].total);
    });
  });
}

async function getStatistics () {
  return {
    most_valuable_customer: await getMostValuableCustomer(),
    average_order_total: await getAverageOrderAmount(),
    popular_ingredients: await getTop3Ingredients(),
  };
}
