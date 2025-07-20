const api = 'https://yummy-food-ordering.onrender.com/api';

async function loadRestaurants() {
  const res = await fetch(`${api}/admin/restaurants`);
  const data = await res.json();
  const table = document.getElementById('restaurantTable');
  table.innerHTML = data.map(r => `
    <tr><td>${r.name}</td><td>${r.email}</td><td>${r.approved ? '✅' : '❌'}</td>
    <td>
      <button onclick="approve('${r._id}', true)">Approve</button>
      <button onclick="approve('${r._id}', false)">Deny</button>
      <button onclick="remove('${r._id}')">Delete</button>
    </td></tr>`).join('');
}

async function approve(id, approved) {
  await fetch(`${api}/admin/restaurants/${id}/approve`, {
    method: 'PATCH', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({approved})
  });
  loadRestaurants();
}

async function remove(id) {
  await fetch(`${api}/admin/restaurants/${id}`, {method: 'DELETE'});
  loadRestaurants();
}

loadRestaurants();
