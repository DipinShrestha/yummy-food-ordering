
        // ==================== SHARED DATA STORAGE ====================
        // Initialize shared storage if it doesn't exist
        if (!window.restaurantData) {
          try {
            const storedData = localStorage.getItem('restaurantData');
            window.restaurantData = storedData ? JSON.parse(storedData) : [];
          } catch (e) {
            console.error("Error initializing restaurant data:", e);
            window.restaurantData = [];
          }
        }
      
        function saveRestaurantData(data) {
          try {
            window.restaurantData = data;
            localStorage.setItem('restaurantData', JSON.stringify(data));
            window.dispatchEvent(new CustomEvent('restaurantDataUpdated'));
          } catch (e) {
            console.error("Error saving restaurant data:", e);
          }
        }
      
        function loadRestaurantData() {
          try {
            const data = localStorage.getItem('restaurantData');
            return data ? JSON.parse(data) : [];
          } catch (e) {
            console.error("Error loading restaurant data:", e);
            return [];
          }
        }
      
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
                <button class="approve-btn" onclick="approveRestaurant(${restaurant.id})">
                  ✅ Approve
                </button>
                <button class="reject-btn" onclick="rejectRestaurant(${restaurant.id})">
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
        function approveRestaurant(restaurantId) {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          if (!restaurant) return;
      
          restaurant.approved = true;
          restaurant.rejected = false;
          restaurant.approvedAt = new Date().toISOString();
      
          saveRestaurantData(restaurants);
          updateDashboard();
          showNotification(`${restaurant.name} has been approved! 🎉`, 'success');
        }
      
        // Reject restaurant
        function rejectRestaurant(restaurantId) {
          const restaurant = restaurants.find(r => r.id === restaurantId);
          if (!restaurant) return;
      
          if (confirm(`Are you sure you want to reject ${restaurant.name}? This cannot be undone.`)) {
            restaurant.rejected = true;
            restaurant.approved = false;
            restaurant.rejectedAt = new Date().toISOString();
      
            saveRestaurantData(restaurants);
            updateDashboard();
            showNotification(`${restaurant.name} has been rejected.`, 'error');
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
        function checkForNewApplications() {
          const currentCount = restaurants.length;
          const pendingCount = restaurants.filter(r => !r.approved && !r.rejected).length;
          
          if (currentCount > lastRestaurantCount) {
            showNotification(`New restaurant application received! 🔔`, 'info');
            lastRestaurantCount = currentCount;
          }
        }
      
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
          restaurants = loadRestaurantData();
          lastRestaurantCount = restaurants.length;
          updateDashboard();
          
          // Set up periodic refresh
          const refreshInterval = setInterval(() => {
            const newData = loadRestaurantData();
            if (JSON.stringify(newData) !== JSON.stringify(restaurants)) {
              restaurants = newData;
              updateDashboard();
              checkForNewApplications();
            }
          }, 2000);
      
          // Clean up on page unload
          window.addEventListener('beforeunload', () => {
            clearInterval(refreshInterval);
          });
        });
      
        // Make functions available globally
        window.approveRestaurant = approveRestaurant;
        window.rejectRestaurant = rejectRestaurant;
      