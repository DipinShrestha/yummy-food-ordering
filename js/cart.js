const api = 'https://yummy-food-ordering.onrender.com/api';
const cartIds = JSON.parse(localStorage.getItem('cart') || '[]');
let cartItems = [];
let totalPrice = 0;

async function loadCart() {
  const res = await fetch(`${api}/menu`);
  const data = await res.json();
  cartItems = data.filter(i => cartIds.includes(i._id));
  totalPrice = cartItems.reduce((sum, i) => sum + i.price, 0);
  document.getElementById('cart').innerHTML =
    cartItems.map(i => `<div>${i.itemName} - ₹${i.price}</div>`).join('') +
    `<h3>Total: ₹${totalPrice}</h3>`;
}

document.getElementById('orderForm').onsubmit = async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const items = cartItems.map(i => ({
    restaurantId: i.restaurantId._id,
    itemId: i._id,
    quantity: 1,
    price: i.price
  }));
  const order = { ...formData, items, totalPrice };
  await fetch(`${api}/order`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(order)
  });
  alert('Order placed!');
  localStorage.removeItem('cart');
  window.location = 'index.html';
};

loadCart();
