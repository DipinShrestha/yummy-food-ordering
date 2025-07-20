const API_BASE = 'http://localhost:5000/api'; // Change to your deployed URL

export const api = {
  // Restaurant endpoints
  getRestaurants: async () => {
    const response = await fetch(`${API_BASE}/restaurants`);
    return await response.json();
  },

  getRestaurantMenu: async (restaurantId) => {
    const response = await fetch(`${API_BASE}/restaurants/${restaurantId}/menu`);
    return await response.json();
  },

  // Order endpoints
  placeOrder: async (orderData) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return await response.json();
  },

  getRestaurantOrders: async (restaurantId) => {
    const response = await fetch(`${API_BASE}/orders/restaurant/${restaurantId}`);
    return await response.json();
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    return await response.json();
  }
};