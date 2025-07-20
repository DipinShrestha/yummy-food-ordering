const api = 'https://yummy-food-ordering.onrender.com/api';

document.getElementById('signupForm').onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  await fetch(`${api}/restaurant/signup`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  alert('Signup complete. Wait for admin approval.');
};

document.getElementById('loginForm').onsubmit = async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const res = await fetch(`${api}/restaurant/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (json.token) {
    localStorage.setItem('token', json.token);
    window.location = 'restaurant_dashboard.html';
  } else {
    alert(json.message);
  }
};
