function fetchData (url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  })
    .then(res => res.json());
}

/**
 * POST the order on /pizza
 * @param order 
 * 
 * ****************************
 * Please change '/pizza' with
 * your service endpoint below
 * ****************************
 */
function postOrder(order) {
  fetch('http://0.0.0.0:3008/contest-backend/v1/orders', {
        method: 'POST',
        body: JSON.stringify(order),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    })
        .then(res => res.json())
        .then(res => showNotification());
}

/**
 * Get the form and submit it with fetch API
 */
let orderForm = $("#order-form");
orderForm.submit((event) => {

    let order = getOrderData();
    postOrder(order);

    event.preventDefault();
    event.currentTarget.reset();
});

/**
 * Gets the order data with JQuery
 */
function getOrderData() {
    let ingredients = [];
    $.each($("input[name='ingredients']:checked"), function (el) {
        ingredients.push($(this).val());
    });

    return {
        name: $("input[name='name']").val(),
        address: $("input[name='address']").val(),
        phone: $("input[name='phone']").val(),
        size: $("input[name='size']:checked").val(),
        ingredients
    }
}

/**
 * Shows a notification when the order is accepted
 */
function showNotification() {
    let orderAlert = $("#order-alert");
    orderAlert.toggle()
    setTimeout(() => orderAlert.toggle(), 5000);
}


function renderSizes () {
  fetchData('http://0.0.0.0:3008/contest-backend/v1/sizes')
    .then(sizes => {
        let inputId;
      sizes.forEach((size, index) => {
        inputId = `sizesRadio${index}`;
        $("#sizes").append([
          '<div class="form-check">',
          `<input value="${size.name}" required name="size" class="form-check-input" type="radio" id="${inputId}">`,
          `<label class="form-check-label" for="${inputId}">`,
          `${size.name} - $${size.price}`,
          '</label></div>'
        ].join(''));
      });
    });
}

function renderIngredients () {
  fetchData('http://0.0.0.0:3008/contest-backend/v1/ingredients')
    .then(ingredients => {
      let inputId;
      ingredients.forEach((ingredient, index) => {
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

renderSizes();
renderIngredients();