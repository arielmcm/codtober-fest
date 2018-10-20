const customers = require('../../data/production/customers');
const ObjectId = require('mongodb').ObjectID;

module.exports = app => {
  const Customer = app.models.Customer;

  customers.forEach(customer => {
    customer.id = new ObjectId(customer.id);
    Customer
      .findOrCreate({where: {id: customer.id}}, customer)
      .catch(error => console.log(error));
  });
};
