/**
 * Set the id to query the order
 */
let urlParams = new URLSearchParams(window.location.search);
let orderId = urlParams.get('orderId');

/**
 * Fetchs de order detail and appends to the page.
 * 
 * ****************************
 * Please change '/json/order.json?id=${id}' 
 * with your service endpoint below
 * ****************************
 */
fetch(`http://0.0.0.0:3008/contest-backend/v1/orders/${orderId}`)
    .then(response => response.json())
    .then(order => {
        let template = createRowTemplate(order);
        $("#order").append(template);
    });

/**
 * Find the template tag and populate it with the data
 * @param order
 */
function createRowTemplate(order) {
    let template = $("#order-template")[0].innerHTML;
    return Mustache.render(template, order);
}
