// ==================== CART FUNCTIONALITY ====================
import { api } from './api.js';

let cartItems = [];
let cartCount = 0;
let orderPlaced = false;

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

function updateCartCount() {
  cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').textContent = cartCount;
}

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

function calculateRestaurantSubtotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

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

async function submitOrder() {
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerEmail = document.getElementById('customer-email').value;
  const customerAddress = document.getElementById('customer-address').value;

  if (!customerName || !customerPhone || !customerEmail || !customerAddress) {
    showNotification('Please fill all required customer information!', 'error');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    showNotification('Please enter a valid email address!', 'error');
    return;
  }

  const phoneRegex = /^[\d\s\-+]{8,}$/;
  if (!phoneRegex.test(customerPhone)) {
    showNotification('Please enter a valid phone number!', 'error');
    return;
  }

  showNotification('Processing your orders...', 'info');

  const restaurantGroups = groupItemsByRestaurant();

  const allOrders = Object.entries(restaurantGroups).map(([restaurantName, items]) => {
    const subtotal = calculateRestaurantSubtotal(items);
    const deliveryFee = 2.99;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    return {
      restaurant: restaurantName,
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal,
      deliveryFee,
      tax,
      total,
      customerInfo: {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        address: customerAddress,
        instructions: document.getElementById('delivery-instructions').value
      }
    };
  });

  try {
    await Promise.all(allOrders.map(order => api.placeOrder(order)));
    cartItems = [];
    orderPlaced = true;
    updateCartCount();
    renderCart();
    showNotification('Orders placed successfully!', 'success');
  } catch (e) {
    console.error("Error placing orders:", e);
    showNotification('Error placing orders. Please try again.', 'error');
  }
}

function proceedToCheckout() {
  if (cartItems.length === 0) {
    showNotification('Your cart is empty!', 'error');
    return;
  }

  const customerForm = document.getElementById('customer-info-form');
  const cartContent = document.getElementById('cart-content');
  customerForm.style.display = 'block';
  cartContent.style.display = 'none';
  customerForm.scrollIntoView({ behavior: 'smooth' });
}

function backToCart() {
  document.getElementById('customer-info-form').style.display = 'none';
  document.getElementById('cart-content').style.display = 'block';
}

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

function navigateToMenu() {
  window.location.href = 'menu.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadCartFromStorage();
  renderCart();
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartItems') {
      loadCartFromStorage();
    }
  });
});

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.proceedToCheckout = proceedToCheckout;
window.submitOrder = submitOrder;
window.backToCart = backToCart;
window.continueShopping = continueShopping;
window.navigateToMenu = navigateToMenu;