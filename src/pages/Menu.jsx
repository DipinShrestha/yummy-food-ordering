import foodItems from '../data/foodItems';
import { useCart } from '../context/CartContext';

const Menu = () => {
  const { addToCart } = useCart();

  return (
    <div className="menu grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {foodItems.map((item) => (
        <div key={item.id} className="menu-item border p-4 rounded-xl shadow-md">
          <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-lg" />
          <h3 className="text-xl font-semibold mt-2">{item.name}</h3>
          <p className="text-gray-700">₹{item.price}</p>
          <button
            onClick={() => addToCart(item)}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

export default Menu;
