// Restaurant and menu data
let restaurants = [];
let cartItems = [];
let cartCount = 0;
let allRestaurants = []; // To store all restaurants for search functionality

// Load cart from localStorage
function loadCart() {
    try {
        const savedCart = localStorage.getItem('cartItems');
        cartItems = savedCart ? JSON.parse(savedCart) : [];
        updateCartCount();
    } catch (e) {
        console.error("Error loading cart:", e);
        cartItems = [];
        updateCartCount();
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        // Trigger storage event for other tabs
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'cartItems',
            newValue: JSON.stringify(cartItems)
        }));
    } catch (e) {
        console.error("Error saving cart:", e);
    }
}

// Update cart count in navigation
function updateCartCount() {
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Load restaurant data from localStorage
function loadData() {
    try {
        const data = localStorage.getItem('restaurantData');
        allRestaurants = data ? JSON.parse(data) : [];
        restaurants = allRestaurants.filter(r => r.approved && r.menuItems?.length > 0);
        renderRestaurants();
    } catch (e) {
        console.error("Error loading restaurant data:", e);
        showEmptyState("Error loading data", "Please refresh the page or try again later");
    }
}

// Render restaurants and their menus
function renderRestaurants() {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    
    if (restaurants.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏪</div>
                <h3>No restaurants available</h3>
                <p>Approved restaurants will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = restaurants.map(restaurant => `
        <div class="restaurant-card">
            <div class="restaurant-header">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <span class="restaurant-status">OPEN</span>
            </div>
            <div class="menu-items">
                ${restaurant.menuItems?.length > 0 ? 
                    restaurant.menuItems.map((item, index) => `
                        <div class="menu-item">
                            ${item.image ? `
                            <div class="item-image">
                                <img src="${item.image}" alt="${item.name}">
                            </div>
                            ` : ''}
                            <div class="item-content">
                                <h4 class="item-name">${item.name}</h4>
                                <p class="item-description">${item.description}</p>
                                <div class="item-footer">
                                    <span class="item-price">$${item.price.toFixed(2)}</span>
                                    <button class="add-to-cart" 
                                            onclick="addToCart('${item.name.replace(/'/g, "\\'")}', 
                                            ${item.price || 0}, 
                                            '${restaurant.name.replace(/'/g, "\\'")}', 
                                            '${restaurant.name}-${index}', this)">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('') : `
                    <div class="empty-state">
                        <p>No menu items available</p>
                    </div>
                `}
            </div>
        </div>
    `).join('');
}

// Show empty state message
function showEmptyState(title, message) {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">🏪</div>
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

// Add item to cart
function addToCart(itemName, price, restaurantName, itemId, button) {
    try {
        // Check if item already exists in cart
        const existingItem = cartItems.find(item => item.id === itemId);
        
        if (existingItem) {
            // Increase quantity if item already exists
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            cartItems.push({
                id: itemId,
                name: itemName,
                price: price,
                quantity: 1,
                restaurant: restaurantName
            });
        }
        
        // Save cart and update count
        saveCart();
        updateCartCount();
        
        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Added! ✓';
        button.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'linear-gradient(45deg, #ff6b6b, #ff8e8e)';
        }, 1500);

        // Show notification
        showNotification(`${itemName} added to cart!`, 'success');
        
    } catch (e) {
        console.error("Error adding to cart:", e);
        showNotification('Error adding item to cart', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff4757' : '#ff6b6b'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Search functionality
document.getElementById('search-input')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        restaurants = allRestaurants.filter(r => r.approved && r.menuItems?.length > 0);
        renderRestaurants();
        return;
    }

    restaurants = allRestaurants.filter(restaurant => 
        restaurant.approved &&
        (
            restaurant.name?.toLowerCase().includes(searchTerm) ||
            (restaurant.menuItems?.some(item => 
                item.name?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm)
            ))
        )
    );

    renderRestaurants();
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCart(); // Load existing cart items
    loadData(); // Load restaurant data
    
    // Listen for storage events (cart updates from other tabs)
    window.addEventListener('storage', (e) => {
        if (e.key === 'cartItems') {
            loadCart();
        }
    });

    // Listen for restaurant data updates
    window.addEventListener('storage', (e) => {
        if (e.key === 'restaurantData') {
            loadData();
        }
    });

    // Optional: Refresh restaurant data every 5 seconds
    const refreshInterval = setInterval(loadData, 5000);
    
    window.addEventListener('beforeunload', () => {
        clearInterval(refreshInterval);
    });
});

// Make functions available globally
window.addToCart = addToCart;