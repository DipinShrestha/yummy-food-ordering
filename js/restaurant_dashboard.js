const api = 'https://yummy-food-ordering.onrender.com/api';
const token = localStorage.getItem('token');
let restaurantId;

if (token) {
  restaurantId = JSON.parse(atob(token.split('.')[1])).id;
}

async function loadMenu() {
  const res = await fetch(`${api}/menu`);
  const data = await res.json();
  const list = document.getElementById('menuList');
  list.innerHTML = data
    .filter(i => i.restaurantId._id === restaurantId)
    .map(i => `<li>${i.itemName} - ${i.price} <button onclick="deleteItem('${i._id}')">Delete</button></li>`)
    .join('');
}

document.getElementById('menuForm').onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  data.restaurantId = restaurantId;
  await fetch(`${api}/menu`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  e.target.reset();
  loadMenu();
};

async function deleteItem(id) {
  await fetch(`${api}/menu/${id}`, {method: 'DELETE'});
  loadMenu();
}

loadMenu();
