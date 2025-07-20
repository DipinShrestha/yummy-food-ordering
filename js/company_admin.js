// ==================== COMPANY ADMIN API SERVICE ====================
const adminApi = {
  // Get all restaurants
  getRestaurants: async () => {
    try {
      const response = await fetch('/api/admin/restaurants', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      return await response.json();
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  // Approve restaurant
  approveRestaurant: async (restaurantId) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to approve restaurant');
      return await response.json();
    } catch (error) {
      console.error('Error approving restaurant:', error);
      throw error;
    }
  },

  // Reject restaurant
  rejectRestaurant: async (restaurantId) => {
    try {
      const response = await fetch(`/api/admin/restaurants/${restaurantId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to reject restaurant');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting restaurant:', error);
      throw error;
    }
  }
};

// ==================== COMPANY ADMIN LOGIC ====================
let restaurants = [];
let lastRestaurantCount = 0;

// Update dashboard statistics and content
function updateDashboard() {
  const pending = restaurants.filter(r => !r.approved && !r.rejected);
  const approved = restaurants.filter(r => r.approved);
  const rejected = restaurants.filter(r => r.rejected);

  // Update statistics
  document.getElementById('pending-count').textContent = pending.length;
  document.getElementById('approved-count').textContent = approved.length;
  document.getElementById('rejected-count').textContent = rejected.length;
  document.getElementById('total-count').textContent = restaurants.length;
  document.getElementById('notification-count').textContent = pending.length;

  // Update notifications and restaurants list
  renderNotifications(pending);
  renderRestaurants();
}

// Render pending notifications
function renderNotifications(pendingRestaurants) {
  const container = document.getElementById('notifications-container');
  if (!container) return;
  
  if (pendingRestaurants.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No pending approvals</h3>
        <p>All restaurant applications have been reviewed</p>
      </div>
    `;
    return;
  }

  container.innerHTML = pendingRestaurants.map(restaurant => `
    <div class="notification-item">
      <div class="notification-header">
        <div class="restaurant-info">
          <h3>🏪 ${restaurant.name}</h3>
          <p><strong>Email:</strong> ${restaurant.email}</p>
          <p><strong>Phone:</strong> ${restaurant.phone}</p>
          <p><strong>Address:</strong> ${restaurant.address}</p>
        </div>
        <div class="notification-time">
          Applied: ${new Date(restaurant.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div class="action-buttons">
        <button class="approve-btn" onclick="approveRestaurant('${restaurant._id}')">
          ✅ Approve
        </button>
        <button class="reject-btn" onclick="rejectRestaurant('${restaurant._id}')">
          ❌ Reject
        </button>
      </div>
    </div>
  `).join('');
}

// Render all restaurants
function renderRestaurants() {
  const container = document.getElementById('restaurants-container');
  if (!container) return;
  
  if (restaurants.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏪</div>
        <h3>No restaurants registered yet</h3>
        <p>Restaurants will appear here once they sign up</p>
      </div>
    `;
    return;
  }

  container.innerHTML = restaurants.map(restaurant => {
    let statusClass = 'pending';
    let statusText = 'Pending';
    
    if (restaurant.approved) {
      statusClass = 'approved';
      statusText = 'Approved';
    } else if (restaurant.rejected) {
      statusClass = 'rejected';
      statusText = 'Rejected';
    }

    const menuCount = restaurant.menuItems ? restaurant.menuItems.length : 0;
    const appliedDate = new Date(restaurant.createdAt).toLocaleDateString();
    const approvedRejectedDate = restaurant.approvedAt || restaurant.rejectedAt 
      ? new Date(restaurant.approvedAt || restaurant.rejectedAt).toLocaleDateString() 
      : '';

    return `
      <div class="restaurant-card ${statusClass}">
        <div class="restaurant-card-header">
          <div class="restaurant-name">${restaurant.name}</div>
          <div class="restaurant-status status-${statusClass}">${statusText}</div>
        </div>
        <div class="restaurant-details">
          <div><strong>Email:</strong> ${restaurant.email}</div>
          <div><strong>Phone:</strong> ${restaurant.phone}</div>
          <div><strong>Applied:</strong> ${appliedDate}</div>
          ${approvedRejectedDate ? `<div><strong>${statusText}:</strong> ${approvedRejectedDate}</div>` : ''}
          <div><strong>Address:</strong> ${restaurant.address}</div>
        </div>
        <div class="menu-count">📋 ${menuCount} Menu Items</div>
      </div>
    `;
  }).join('');
}

// Approve restaurant
async function approveRestaurant(restaurantId) {
  try {
    const restaurant = restaurants.find(r => r._id === restaurantId);
    if (!restaurant) return;

    const updatedRestaurant = await adminApi.approveRestaurant(restaurantId);
    
    // Update local state
    const index = restaurants.findIndex(r => r._id === restaurantId);
    if (index !== -1) {
      restaurants[index] = updatedRestaurant;
    }
    
    updateDashboard();
    showNotification(`${restaurant.name} has been approved! 🎉`, 'success');
  } catch (error) {
    console.error('Error approving restaurant:', error);
    showNotification('Failed to approve restaurant', 'error');
  }
}

// Reject restaurant
async function rejectRestaurant(restaurantId) {
  try {
    const restaurant = restaurants.find(r => r._id === restaurantId);
    if (!restaurant) return;

    if (confirm(`Are you sure you want to reject ${restaurant.name}? This cannot be undone.`)) {
      const updatedRestaurant = await adminApi.rejectRestaurant(restaurantId);
      
      // Update local state
      const index = restaurants.findIndex(r => r._id === restaurantId);
      if (index !== -1) {
        restaurants[index] = updatedRestaurant;
      }
      
      updateDashboard();
      showNotification(`${restaurant.name} has been rejected.`, 'error');
    }
  } catch (error) {
    console.error('Error rejecting restaurant:', error);
    showNotification('Failed to reject restaurant', 'error');
  }
}

// Show notification badge
function showNotification(message, type = 'success') {
  const badge = document.getElementById('notification-badge');
  if (!badge) return;
  
  badge.textContent = message;
  badge.className = `notification-badge ${type}`;
  badge.classList.add('show');

  setTimeout(() => {
    badge.classList.remove('show');
  }, 4000);
}

// Check for new applications
async function checkForNewApplications() {
  try {
    const currentCount = restaurants.length;
    const newData = await adminApi.getRestaurants();
    
    if (newData.length > currentCount) {
      const pendingCount = newData.filter(r => !r.approved && !r.rejected).length;
      if (pendingCount > 0) {
        showNotification(`New restaurant application received! 🔔`, 'info');
      }
      restaurants = newData;
      lastRestaurantCount = newData.length;
      updateDashboard();
    }
  } catch (error) {
    console.error('Error checking for new applications:', error);
  }
}

// Initialize admin dashboard
async function initializeAdminDashboard() {
  try {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/company_admin-login.html';
      return;
    }

    // Load initial data
    restaurants = await adminApi.getRestaurants();
    lastRestaurantCount = restaurants.length;
    updateDashboard();
    
    // Set up periodic refresh (every 5 seconds)
    const refreshInterval = setInterval(checkForNewApplications, 5000);
    
    window.addEventListener('beforeunload', () => {
      clearInterval(refreshInterval);
    });
  } catch (error) {
    console.error('Error initializing admin dashboard:', error);
    showNotification('Failed to load admin data', 'error');
  }
}

// Make functions available globally
window.approveRestaurant = approveRestaurant;
window.rejectRestaurant = rejectRestaurant;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeAdminDashboard);