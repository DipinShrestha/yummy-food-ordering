
       // ==================== RESTAURANT ADMIN FUNCTIONALITY ====================
let currentUser = null;
let restaurants = [];
let orders = [];
let orderNotificationCount = 0;

// Initialize restaurant data
if (!window.restaurantData) {
    try {
        const storedData = localStorage.getItem('restaurantData');
        window.restaurantData = storedData ? JSON.parse(storedData) : [];
    } catch (e) {
        console.error("Error initializing restaurant data:", e);
        window.restaurantData = [];
    }
}

// Load restaurant data
function loadRestaurantData() {
    try {
        const data = localStorage.getItem('restaurantData');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error loading restaurant data:", e);
        return [];
    }
}

// Save restaurant data
function saveRestaurantData(data) {
    try {
        window.restaurantData = data;
        localStorage.setItem('restaurantData', JSON.stringify(data));
        window.dispatchEvent(new Event('restaurantDataUpdated'));
    } catch (e) {
        console.error("Error saving restaurant data:", e);
    }
}

// Load orders
function loadOrders() {
    try {
        const savedOrders = localStorage.getItem('restaurantOrders');
        orders = savedOrders ? JSON.parse(savedOrders) : [];
        
        // Filter orders for this restaurant only
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

// Handle signup
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone').value;
    const address = document.getElementById('signup-address').value;

    // Check if restaurant already exists
    if (restaurants.find(r => r.email === email)) {
        showNotification('Restaurant with this email already exists!', 'error');
        return;
    }

    // Create new restaurant
    const newRestaurant = {
        id: Date.now(),
        name,
        email,
        password,
        phone,
        address,
        approved: false,
        rejected: false,
        menuItems: [],
        createdAt: new Date().toISOString()
    };

    restaurants.push(newRestaurant);
    saveRestaurantData(restaurants);
    
    showNotification('Registration successful! Waiting for admin approval.');
    this.reset();
    switchTab('login');
});

// Handle login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const restaurant = restaurants.find(r => r.email === email && r.password === password);
    
    if (!restaurant) {
        showNotification('Invalid email or password!', 'error');
        return;
    }

    if (restaurant.rejected) {
        showNotification('Your restaurant application was rejected. Please contact support.', 'error');
        return;
    }

    currentUser = restaurant;
    localStorage.setItem('currentUserId', currentUser.id);
    showDashboard();
    showNotification('Login successful!');
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
    if (!container) return;
    
    if (!currentUser.menuItems || currentUser.menuItems.length === 0) {
        container.innerHTML = '<p style="color: #666; text-align: center; padding: 2rem;">No menu items yet. Add your first item!</p>';
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

// Render orders with customer info displayed
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
                    <p><strong>Instructions:</strong> ${order.customerInfo.instructions ? order.customerInfo.instructions : 'None'}</p>
                </div>
            </div>
            <div class="order-actions">
                ${order.status === 'received' ? 
                    `<button class="action-btn prepare-btn" onclick="updateOrderStatus(${order.orderId}, 'preparing')">
                        Start Preparing
                    </button>` : ''}
                ${order.status === 'preparing' ? 
                    `<button class="action-btn ready-btn" onclick="updateOrderStatus(${order.orderId}, 'ready')">
                        Mark as Ready
                    </button>` : ''}
                ${order.status === 'ready' ? 
                    `<button class="action-btn complete-btn" onclick="updateOrderStatus(${order.orderId}, 'delivered')">
                        Mark as Delivered
                    </button>` : ''}
            </div>
        </div>
    `).join('');
}

// Check for new orders
function checkForNewOrders() {
    if (!currentUser) return;
    
    const restaurantOrders = loadOrders();
    const newOrderCount = restaurantOrders.filter(order => 
        order.restaurantName === currentUser.name && 
        order.status === 'received'
    ).length;
    
    if (newOrderCount > orderNotificationCount) {
        // New orders arrived
        const diff = newOrderCount - orderNotificationCount;
        showNotification(`You have ${diff} new order${diff > 1 ? 's' : ''}!`, 'success');
        
        // Play notification sound
        playNotificationSound();
    }
    
    orderNotificationCount = newOrderCount;
    renderOrders();
}

// Add menu item
document.getElementById('add-item-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!currentUser?.approved) {
        showNotification('You can only add menu items after approval!', 'error');
        return;
    }

    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const category = document.getElementById('item-category').value;

    if (!name || !description || isNaN(price) || !category) {
        showNotification('Please fill all fields correctly!', 'error');
        return;
    }

    const newItem = {
        id: Date.now(),
        name,
        description,
        price,
        category,
        createdAt: new Date().toISOString()
    };

    currentUser.menuItems = currentUser.menuItems || [];
    currentUser.menuItems.push(newItem);
    
    // Update in global array
    const index = restaurants.findIndex(r => r.id === currentUser.id);
    if (index !== -1) {
        restaurants[index] = currentUser;
        saveRestaurantData(restaurants);
    }

    renderMenuItems();
    showNotification('Menu item added successfully!');
    this.reset();
});

// Delete menu item
function deleteMenuItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    currentUser.menuItems = currentUser.menuItems.filter(item => item.id !== itemId);
    
    const index = restaurants.findIndex(r => r.id === currentUser.id);
    if (index !== -1) {
        restaurants[index] = currentUser;
        saveRestaurantData(restaurants);
    }

    renderMenuItems();
    showNotification('Menu item deleted successfully!');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    const orderIndex = orders.findIndex(o => o.orderId === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        try {
            localStorage.setItem('restaurantOrders', JSON.stringify(orders));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'restaurantOrders',
                newValue: JSON.stringify(orders)
            }));
            renderOrders();
            showNotification(`Order #${orderId} status updated to ${newStatus}`);
        } catch (e) {
            console.error("Error updating order status:", e);
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
    document.getElementById('login-form').reset();
}

// Refresh data
function refreshData() {
    const updatedRestaurants = loadRestaurantData();
    if (JSON.stringify(updatedRestaurants) !== JSON.stringify(restaurants)) {
        restaurants = updatedRestaurants;
        if (currentUser) {
            const updatedUser = restaurants.find(r => r.id === currentUser.id);
            if (updatedUser) currentUser = updatedUser;
            updateDashboard();
        }
    }
    
    // Check for new orders
    checkForNewOrders();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    restaurants = loadRestaurantData();
    // Check if user is already logged in (for page refresh)
    const userId = localStorage.getItem('currentUserId');
    if (userId) {
        currentUser = restaurants.find(r => r.id === Number(userId));
        if (currentUser) showDashboard();
    }
    
    // Refresh data every 2 seconds
    setInterval(refreshData, 2000);
});

// Listen for storage events
window.addEventListener('storage', (e) => {
    if (e.key === 'restaurantOrders') {
        try {
            orders = e.newValue ? JSON.parse(e.newValue) : [];
            checkForNewOrders();
        } catch (e) {
            console.error("Error processing order update:", e);
        }
    }
});

// Make functions available globally
window.switchTab = switchTab;
window.deleteMenuItem = deleteMenuItem;
window.updateOrderStatus = updateOrderStatus;
window.logout = logout;
    