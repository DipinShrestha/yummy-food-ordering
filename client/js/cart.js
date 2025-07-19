// ==================== CART FUNCTIONALITY ====================

async function submitOrder() {

let cartItems = [];
let cartCount = 0;
let orderPlaced = false;

// Load cart from localStorage
function loadCartFromStorage() {
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
function saveCartToStorage() {
  try {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
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

// Group items by restaurant
function groupItemsByRestaurant() {
  const groups = {};
  
  cartItems.forEach(item => {
    if (!groups[item.restaurant]) {
      groups[item.restaurant] = [];
    }
    groups[item.restaurant].push(item);
  });
  
  return groups;
}

// Calculate subtotal for a restaurant's items
function calculateRestaurantSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Render the cart content
function renderCart() {
  const cartContent = document.getElementById('cart-content');
  const customerForm = document.getElementById('customer-info-form');

  if (orderPlaced) {
    customerForm.style.display = 'none';
    cartContent.style.display = 'block';
    cartContent.innerHTML = `
      <div class="order-confirmation">
        <h2>🎉 Order Placed Successfully!</h2>
        <p>Thank you for your order! Your delicious food is being prepared.</p>
        <div class="order-number">Order #${Math.floor(Math.random() * 10000) + 1000}</div>
        <p>Estimated delivery time: 25-35 minutes</p>
        <p>You will receive SMS updates about your order status.</p>
        <button class="continue-shopping" onclick="continueShopping()">Order More Food</button>
      </div>
    `;
    return;
  }

  if (cartItems.length === 0) {
    customerForm.style.display = 'none';
    cartContent.style.display = 'block';
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some delicious items from our restaurant partners!</p>
        <button class="continue-shopping" onclick="navigateToMenu()">Continue Shopping</button>
      </div>
    `;
    return;
  }

  const restaurantGroups = groupItemsByRestaurant();
  let totalForAllOrders = 0;
  const deliveryFeePerRestaurant = 2.99;
  const taxRate = 0.08;

  cartContent.innerHTML = Object.entries(restaurantGroups).map(([restaurantName, items]) => {
    const subtotal = calculateRestaurantSubtotal(items);
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFeePerRestaurant + tax;
    totalForAllOrders += total;

    return `
      <div class="restaurant-group">
        <div class="restaurant-header">
          <div class="restaurant-name">${restaurantName}</div>
          <div class="restaurant-status">OPEN</div>
        </div>
        
        <div class="cart-items">
          ${items.map(item => `
            <div class="cart-item">
              <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">$${item.price.toFixed(2)} each</div>
              </div>
              <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)" ${item.quantity <= 1 ? 'disabled' : ''}>−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
              </div>
              <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
            </div>
          `).join('')}
        </div>
        
        <div class="restaurant-summary">
          <h3 class="summary-title">Order Summary for ${restaurantName}</h3>
          <div class="summary-row">
            <span>Subtotal (${items.reduce((total, item) => total + item.quantity, 0)} items)</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Delivery Fee</span>
            <span>$${deliveryFeePerRestaurant.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total for ${restaurantName}</span>
            <span>$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('') + `
    <div class="checkout-section">
      <div class="delivery-info">
        <div class="delivery-title">🚚 Delivery Info</div>
        <div class="delivery-time">Estimated delivery: 25-35 minutes for each restaurant</div>
      </div>
      <div class="summary-row total" style="font-size: 1.3rem;">
        <span>Total for all orders</span>
        <span>$${totalForAllOrders.toFixed(2)}</span>
      </div>
      <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
      <button class="continue-shopping" onclick="navigateToMenu()" style="margin-top: 1rem;">Continue Shopping</button>
    </div>
  `;
}

// Update item quantity
function updateQuantity(itemId, change) {
  const item = cartItems.find(item => item.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(itemId);
      return;
    }
    saveCartToStorage();
    updateCartCount();
    renderCart();
    showNotification(`${item.name} quantity updated`, 'success');
  }
}

// Remove item from cart
function removeItem(itemId) {
  const index = cartItems.findIndex(item => item.id === itemId);
  if (index > -1) {
    const removed = cartItems[index];
    cartItems.splice(index, 1);
    saveCartToStorage();
    updateCartCount();
    renderCart();
    showNotification(`${removed.name} removed from cart`, 'success');
  }
}

// Save orders to localStorage
function saveOrders(orders) {
  try {
    // Get existing orders or initialize empty array
    const existingOrders = JSON.parse(localStorage.getItem('restaurantOrders') || '[]');
    
    // Add new orders
    const updatedOrders = [...existingOrders, ...orders];
    
    // Save back to localStorage
    localStorage.setItem('restaurantOrders', JSON.stringify(updatedOrders));
    
    // Trigger storage event to notify other tabs
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'restaurantOrders',
      newValue: JSON.stringify(updatedOrders)
    }));
  } catch (e) {
    console.error("Error saving orders:", e);
  }
}

// Proceed to checkout (show customer form)
function proceedToCheckout() {
  if (cartItems.length === 0) {
    showNotification('Your cart is empty!', 'error');
    return;
  }

  const customerForm = document.getElementById('customer-info-form');
  const cartContent = document.getElementById('cart-content');
  
  // Show customer form and hide cart
  customerForm.style.display = 'block';
  cartContent.style.display = 'none';
  
  // Scroll to the form
  customerForm.scrollIntoView({ behavior: 'smooth' });
}

// Submit order with customer info
function submitOrder() {
  // Validate customer info
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerAddress = document.getElementById('customer-address').value;
  
  if (!customerName || !customerPhone || !customerEmail || !customerAddress) {
    showNotification('Please fill all required customer information!', 'error');
    return;
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    showNotification('Please enter a valid email address!', 'error');
    return;
  }
  
  // Validate phone number (basic validation)
  const phoneRegex = /^[\d\s\-+]{8,}$/;
  if (!phoneRegex.test(customerPhone)) {
    showNotification('Please enter a valid phone number!', 'error');
    return;
  }

  showNotification('Processing your orders...', 'info');

  // Group items by restaurant
  const restaurantGroups = groupItemsByRestaurant();
  const orderId = Math.floor(Math.random() * 10000) + 1000;
  const orderTime = new Date().toISOString();
  
  // Create orders for each restaurant
  const allOrders = Object.entries(restaurantGroups).map(([restaurantName, items]) => {
    const subtotal = calculateRestaurantSubtotal(items);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;
    
    return {
      restaurantName,
      orderId,
      items: [...items], // clone items array
      subtotal,
      deliveryFee,
      tax,
      total,
      orderTime,
      status: 'received',
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        instructions: document.getElementById('delivery-instructions').value
      }
    };
  });

  // Save orders to localStorage
  saveOrders(allOrders);
  
  // Clear cart and form
  cartItems = [];
  document.getElementById('delivery-form').reset();
  orderPlaced = true;
  saveCartToStorage();
  updateCartCount();
  
  // Show confirmation and hide form
  document.getElementById('customer-info-form').style.display = 'none';
  document.getElementById('cart-content').style.display = 'block';
  renderCart();
  showNotification('Orders placed successfully!', 'success');
}

// Go back to cart from customer info form
function backToCart() {
  document.getElementById('customer-info-form').style.display = 'none';
  document.getElementById('cart-content').style.display = 'block';
}

// Continue shopping after order
function continueShopping() {
  orderPlaced = false;
  cartItems = [];
  updateCartCount();
  saveCartToStorage();
  document.getElementById('customer-info-form').style.display = 'none';
  document.getElementById('cart-content').style.display = 'block';
  renderCart();
  showNotification('Ready to add more items!', 'info');
}

// Show notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Navigate to menu page
function navigateToMenu() {
  window.location.href = 'menu.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  renderCart();

  // Listen for storage events (cart updates from other tabs)
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartItems') {
      loadCartFromStorage();
    }
  });
});

// Make functions available globally
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.proceedToCheckout = proceedToCheckout;
window.submitOrder = submitOrder;
window.backToCart = backToCart;
window.continueShopping = continueShopping;
window.navigateToMenu = navigateToMenu;

try {
  const response = await fetch('http://localhost:5000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        instructions: deliveryInstructions
      },
      items: cartItems,
      total: calculateTotal()
    })
  });

  if (!response.ok) throw new Error('Order failed');
  
  const order = await response.json();
  showNotification('Order placed successfully! Check your email.');
  clearCart();
} catch (err) {
  showNotification('Order failed: ' + err.message, 'error');
}
}