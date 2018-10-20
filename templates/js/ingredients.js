function fetchIngredients () {
  return fetch('http://0.0.0.0:3008/contest-backend/v1/ingredients', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  })
    .then(res => res.json());
}