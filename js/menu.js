const api = 'https://yummy-food-ordering.onrender.com/api';
let allItems = [];

async function loadMenu() {
  const res = await fetch(`${api}/menu`);
  allItems = await res.json();
  renderMenu(allItems);
}

function renderMenu(items) {
  const container = document.getElementById('menu');
  container.innerHTML = items.map(i => `
    <div>
      <h3>${i.restaurantId.name}: ${i.itemName}</h3>
      <p>${i.description}</p>
      <p>₹${i.price}</p>
      <button onclick="addToCart('${i._id}')">Add to Cart</button>
      <button onclick="buyNow('${i._id}')">Buy Now</button>
    </div>`).join('');
}

document.getElementById('search').oninput = e => {
  const q = e.target.value.toLowerCase();
  renderMenu(allItems.filter(i =>
    i.itemName.toLowerCase().includes(q) ||
    i.restaurantId.name.toLowerCase().includes(q)));
};

function addToCart(id) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.push(id);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Added to cart');
}

function buyNow(id) {
  localStorage.setItem('cart', JSON.stringify([id]));
  window.location = 'cart.html';
}

loadMenu();
