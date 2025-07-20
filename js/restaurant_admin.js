// ==================== RESTAURANT ADMIN FUNCTIONALITY ====================

let currentUser = null;
let restaurants = [];
let orders = [];
let orderNotificationCount = 0;

// Load orders
function loadOrders() {
    try {
        const savedOrders = localStorage.getItem('restaurantOrders');
        orders = savedOrders ? JSON.parse(savedOrders) : [];
        if (currentUser) {
            return orders.filter(order => order.restaurantName === currentUser.name);
        }
        return [];
    } catch (e) {
        console.error("Error loading orders:", e);
        return [];
    }
}

// Switch tabs
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tab + '-form').classList.add('active');
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Play notification sound
function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

// Handle signup - send to backend
document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;
    const address = document.getElementById('signup-address').value;

    const newRestaurant = {
        name,
        email,
        password,
        phone,
        address
    };

    try {
        const response = await fetch('https://yummy-food-ordering.onrender.com/api/restaurants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newRestaurant)
        });

        if (!response.ok) throw new Error('Registration failed');

        showNotification('Registration successful! Waiting for admin approval.');
        this.reset();
        switchTab('login');
    } catch (error) {
        console.error(error);
        showNotification('Registration error!', 'error');
    }
});

// Handle login
document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`https://yummy-food-ordering.onrender.com/api/restaurants/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) throw new Error('Login failed');

        const restaurant = await res.json();
        currentUser = restaurant;
        localStorage.setItem('currentUserId', currentUser._id); // backend ID
        showDashboard();
        showNotification('Login successful!');
    } catch (err) {
        showNotification('Invalid credentials or unapproved account', 'error');
    }
});

// Show dashboard
function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('logout-btn').style.display = 'block';
    updateDashboard();
}

// Update dashboard
function updateDashboard() {
    if (!currentUser) return;

    document.getElementById('restaurant-name').textContent = currentUser.name;

    const statusElement = document.getElementById('restaurant-status');
    if (currentUser.approved) {
        statusElement.textContent = 'APPROVED ✓';
        statusElement.className = 'restaurant-status status-approved';
    } else if (currentUser.rejected) {
        statusElement.textContent = 'REJECTED ✗';
        statusElement.className = 'restaurant-status status-rejected';
    } else {
        statusElement.textContent = 'PENDING APPROVAL';
        statusElement.className = 'restaurant-status status-pending';
    }

    renderMenuItems();
    renderOrders();
    checkForNewOrders();
}

// Render menu items
function renderMenuItems() {
    const container = document.getElementById('menu-items-list');
    if (!container || !currentUser?.menuItems) return;

    if (currentUser.menuItems.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No menu items yet.</p>';
        return;
    }

    container.innerHTML = currentUser.menuItems.map(item => `
        <div class="menu-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <span class="item-price">$${item.price.toFixed(2)}</span>
                <span style="margin-left: 1rem; color: #666; font-size: 0.8rem;">${item.category}</span>
            </div>
            <button class="delete-btn" onclick="deleteMenuItem(${item.id})">Delete</button>
        </div>
    `).join('');
}

// Render orders
function renderOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;

    const restaurantOrders = loadOrders().filter(order =>
        order.status !== 'delivered' && order.restaurantName === currentUser.name
    );

    if (restaurantOrders.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No current orders</p>';
        return;
    }

    container.innerHTML = restaurantOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <span class="order-id">Order #${order.orderId}</span>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-details">
                <div><strong>Order Time:</strong> ${new Date(order.orderTime).toLocaleString()}</div>
                <div class="order-item-list">
                    ${order.items.map(item => `
                        <div>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total:</strong> $${order.total.toFixed(2)}
                </div>
                <hr>
                <div class="customer-info">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.customerInfo.name}</p>
                    <p><strong>Phone:</strong> ${order.customerInfo.phone}</p>
                    <p><strong>Email:</strong> ${order.customerInfo.email}</p>
                    <p><strong>Address:</strong> ${order.customerInfo.address}</p>
                    <p><strong>Instructions:</strong> ${order.customerInfo.instructions || 'None'}</p>
                </div>
            </div>
            <div class="order-actions">
                ${order.status === 'received' ? 
                    `<button class="action-btn prepare-btn" onclick="updateOrderStatus(${order.orderId}, 'preparing')">Start Preparing</button>` : ''}
                ${order.status === 'preparing' ? 
                    `<button class="action-btn ready-btn" onclick="updateOrderStatus(${order.orderId}, 'ready')">Mark as Ready</button>` : ''}
                ${order.status === 'ready' ? 
                    `<button class="action-btn complete-btn" onclick="updateOrderStatus(${order.orderId}, 'delivered')">Mark as Delivered</button>` : ''}
            </div>
        </div>
    `).join('');
}

// New order detection
function checkForNewOrders() {
    if (!currentUser) return;

    const restaurantOrders = loadOrders();
    const newOrderCount = restaurantOrders.filter(order =>
        order.restaurantName === currentUser.name &&
        order.status === 'received'
    ).length;

    if (newOrderCount > orderNotificationCount) {
        const diff = newOrderCount - orderNotificationCount;
        showNotification(`You have ${diff} new order${diff > 1 ? 's' : ''}!`, 'success');
        playNotificationSound();
    }

    orderNotificationCount = newOrderCount;
    renderOrders();
}

// Menu item handling
document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!currentUser?.approved) {
        showNotification('You can only add items after approval!', 'error');
        return;
    }

    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;

    const newItem = {
        id: Date.now(),
        name,
        description,
        price,
        category
    };

    currentUser.menuItems = currentUser.menuItems || [];
    currentUser.menuItems.push(newItem);
    renderMenuItems();
    showNotification('Item added successfully!');
    this.reset();
});

function deleteMenuItem(itemId) {
    currentUser.menuItems = currentUser.menuItems.filter(item => item.id !== itemId);
    renderMenuItems();
    showNotification('Item deleted.');
}

// Order status update
function updateOrderStatus(orderId, newStatus) {
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        try {
            localStorage.setItem('restaurantOrders', JSON.stringify(orders));
            renderOrders();
            showNotification(`Order #${orderId} marked as ${newStatus}`);
        } catch (e) {
            console.error("Failed to update order", e);
        }
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUserId');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard').classList.remove('active');
    document.getElementById('logout-btn').style.display = 'none';
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
    // Auto-login if previously stored
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        // You may need to fetch current user by ID here
        // For now: skip auto-login
    }

    setInterval(checkForNewOrders, 2000);
});

// Expose globals
window.switchTab = switchTab;
window.logout = logout;
window.deleteMenuItem = deleteMenuItem;
window.updateOrderStatus = updateOrderStatus;
