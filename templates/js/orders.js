let orderId;

/**
 * Fetch the orders and append to the table
 * 
 * ****************************
 * Please change 'json/orders.json' 
 * with your service endpoint below
 * ****************************
 */
fetch('http://0.0.0.0:3008/contest-backend/v1/orders')
    .then(response => response.json())
    .then(orders => {
        let rows = orders.map(element => createOrderTemplate(element));
        let table = $("#orders tbody");
        table.append(rows);
    });

/**
 * Find the template tag and populate it with the data
 * @param order 
 */
function createOrderTemplate(order) {
  console.log(order);
  let template = $("#order-item-template")[0].innerHTML;
    return Mustache.render(template, order);
}

function renderOrders () {
  fetchData('http://0.0.0.0:3008/contest-backend/v1/orders')
    .then(orders => {
      let inputId;
      orders.forEach((order, index) => {
        inputId = `ingredientsCheckbox${index}`;
        $("#ingredients").append([
          '<div class="form-check">',
          `<input value="${ingredient.name}" name="ingredients" class="form-check-input" type="checkbox" id="${inputId}">`,
          `<label class="form-check-label" for="${inputId}">`,
          `${ingredient.name} - $${ingredient.price}`,
          '</label></div>'
        ].join(''));
      });
    });
}
