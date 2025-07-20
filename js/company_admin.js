const API_URL = 'https://yummy-food-ordering.onrender.com/api';

async function loadRestaurants() {
  const res = await fetch(`${API_URL}/restaurants/admin/list`);
  const data = await res.json();

  const container = document.getElementById('restaurantList');
  container.innerHTML = '';

  data.forEach(r => {
    const div = document.createElement('div');
    div.className = 'restaurant';

    div.innerHTML = `
      <strong>${r.name}</strong><br>
      Email: ${r.email}<br>
      Phone: ${r.phone}<br>
      Address: ${r.address}<br>
      Status: 
        ${r.approved ? '✅ Approved' : r.rejected ? '❌ Rejected' : '⏳ Pending'}
      <br>
      <button onclick="approve('${r._id}')">Approve</button>
      <button onclick="reject('${r._id}')">Reject</button>
      <button onclick="remove('${r._id}')">Delete</button>
    `;

    container.appendChild(div);
  });
}

async function approve(id) {
  await fetch(`${API_URL}/restaurants/admin/${id}/approve`, { method: 'PATCH' });
  loadRestaurants();
}

async function reject(id) {
  await fetch(`${API_URL}/restaurants/admin/${id}/reject`, { method: 'PATCH' });
  loadRestaurants();
}

async function remove(id) {
  await fetch(`${API_URL}/restaurants/admin/${id}`, { method: 'DELETE' });
  loadRestaurants();
}

loadRestaurants();
