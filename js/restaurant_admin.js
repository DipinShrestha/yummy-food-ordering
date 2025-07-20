const API_URL = 'https://yummy-food-ordering.onrender.com/api';

document.getElementById('signupBtn').addEventListener('click', async () => {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const phone = document.getElementById('signupPhone').value;
  const address = document.getElementById('signupAddress').value;

  const res = await fetch(`${API_URL}/restaurants/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, address })
  });

  const data = await res.json();
  alert(data.message || 'Signup complete. Wait for approval.');
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch(`${API_URL}/restaurants/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    alert(data.message || 'Login failed or not approved yet');
    return;
  }

  localStorage.setItem('restaurantToken', data.token);
  localStorage.setItem('restaurantId', data._id);
  document.getElementById('menuSection').style.display = 'block';
  loadMenu();
});

document.getElementById('addItemBtn').addEventListener('click', async () => {
  const name = document.getElementById('itemName').value;
  const description = document.getElementById('itemDesc').value;
  const price = document.getElementById('itemPrice').value;
  const token = localStorage.getItem('restaurantToken');

  if (!token) return alert('Please log in');

  const res = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name, description, price })
  });

  const data = await res.json();
  if (res.ok) {
    loadMenu();
  } else {
    alert(data.message || 'Error adding item');
  }
});

async function loadMenu() {
  const restaurantId = localStorage.getItem('restaurantId');
  const token = localStorage.getItem('restaurantToken');

  if (!restaurantId || !token) return;

  const res = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const items = await res.json();

  const list = document.getElementById('menuList');
  list.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `
      <strong>${item.name}</strong><br/>
      ${item.description} - $${item.price}<br/>
      <button onclick="deleteItem('${item._id}')">Delete</button>
    `;
    list.appendChild(div);
  });
}

async function deleteItem(id) {
  const token = localStorage.getItem('restaurantToken');
  const res = await fetch(`${API_URL}/menu/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) loadMenu();
  else alert('Failed to delete');
}

// Auto-show menu if already logged in
if (localStorage.getItem('restaurantToken')) {
  document.getElementById('menuSection').style.display = 'block';
  loadMenu();
}
