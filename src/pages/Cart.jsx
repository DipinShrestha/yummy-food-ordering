import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleChange = (id, value) => {
    const quantity = parseInt(value);
    if (quantity > 0) updateQuantity(id, quantity);
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                <span>{item.name} - ₹{item.price} × </span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  min="1"
                />
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
    </div>
  );
};

export default Cart;
