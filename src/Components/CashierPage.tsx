import { useState } from 'react';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  emoji: string;
}

const categories = [
  { id: 'bases', name: 'Hotpot Bases', emoji: '🍲' },
  { id: 'meats', name: 'Meats', emoji: '🥩' },
  { id: 'seafood', name: 'Seafood', emoji: '🦐' },
  { id: 'veggies', name: 'Vegetables', emoji: '🥬' },
  { id: 'noodles', name: 'Noodles & Rice', emoji: '🍜' },
  { id: 'drinks', name: 'Drinks', emoji: '🍹' },
];

const allProducts = [
  { id: 1, name: 'Spicy Hotpot Base', category: 'bases', price: 12.00, emoji: '🌶️' },
  { id: 2, name: 'Herbal Hotpot Base', category: 'bases', price: 10.00, emoji: '🍲' },
  { id: 3, name: 'Tom Yum Hotpot Base', category: 'bases', price: 15.00, emoji: '🌿' },
  { id: 4, name: 'Mushroom Hotpot Base', category: 'bases', price: 10.00, emoji: '🍄' },
  { id: 5, name: 'Beef Slicer Platter', category: 'meats', price: 18.00, emoji: '🥩' },
  { id: 6, name: 'Lamb Rolls', category: 'meats', price: 16.00, emoji: '🐑' },
  { id: 7, name: 'Pork Belly', category: 'meats', price: 14.00, emoji: '🐷' },
  { id: 8, name: 'Chicken Slices', category: 'meats', price: 12.00, emoji: '🐔' },
  { id: 9, name: 'Fresh Shrimp x6', category: 'seafood', price: 12.00, emoji: '🦐' },
  { id: 10, name: 'Squid Tentacles', category: 'seafood', price: 10.00, emoji: '🦑' },
  { id: 11, name: 'Fish Fillet', category: 'seafood', price: 15.00, emoji: '🐟' },
  { id: 12, name: 'Crab Sticks x4', category: 'seafood', price: 8.00, emoji: '🦀' },
  { id: 13, name: 'Napa Cabbage', category: 'veggies', price: 4.00, emoji: '🥬' },
  { id: 14, name: 'Tofu Block', category: 'veggies', price: 3.00, emoji: '🧈' },
  { id: 15, name: 'Mushroom Mix', category: 'veggies', price: 6.00, emoji: '🍄' },
  { id: 16, name: 'Glass Noodles', category: 'noodles', price: 4.00, emoji: '🍜' },
  { id: 17, name: 'Udon Noodles', category: 'noodles', price: 5.00, emoji: '🍜' },
  { id: 18, name: 'Steamed Rice', category: 'noodles', price: 2.00, emoji: '🍚' },
  { id: 19, name: 'Iced Lemon Tea', category: 'drinks', price: 3.50, emoji: '🍋' },
  { id: 20, name: 'Plum Juice', category: 'drinks', price: 4.00, emoji: '🍹' },
  { id: 21, name: 'Beer (Can)', category: 'drinks', price: 5.00, emoji: '🍺' },
];

const CashierPage = () => {
  const [activeCategory, setActiveCategory] = useState('bases');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState(5);
  const [orderType, setOrderType] = useState<string>('dinein');
  const [showPayment, setShowPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = allProducts.filter(p => 
    p.category === activeCategory && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof allProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { id: product.id, name: product.name, quantity: 1, price: product.price, emoji: product.emoji }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev
      .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter(item => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="h-screen flex bg-[#1e2128] overflow-hidden">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">💰 Cashier / POS</h1>
            <p className="text-sm text-gray-400">
              {orderType === 'dinein' ? `Dine-in • Table ${selectedTable}` : 'Takeout'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#272a30] rounded-lg p-1">
              <button
                onClick={() => setOrderType('dinein')}
                className={`px-4 py-2 rounded-md transition ${orderType === 'dinein' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                Dine-in
              </button>
              <button
                onClick={() => setOrderType('takeout')}
                className={`px-4 py-2 rounded-md transition ${orderType === 'takeout' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                Takeout
              </button>
            </div>
            {orderType === 'dinein' && (
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(Number(e.target.value))}
                className="bg-[#272a30] border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {Array.from({ length: 15 }, (_, i) => (
                  <option key={i+1} value={i+1}>Table {i+1}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-3 px-4 py-2 rounded-lg bg-[#272a30] border border-gray-600 text-white"
        />

        {/* Categories */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${activeCategory === cat.id ? 'bg-yellow-500 text-black ring-2 ring-yellow-500' : 'bg-[#272a30] text-gray-300'}
                px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap`}
            >
              <span text-xl>{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-[#272a30] border border-gray-700 rounded-xl p-3 text-left hover:border-yellow-400
                  hover:shadow-lg hover:shadow-yellow-400/10 transition group"
              >
                <div className="text-4xl mb-2 text-center group-hover:scale-110 transition">{product.emoji}</div>
                <p className="font-semibold text-white text-sm">{product.name}</p>
                <p className="text-lg font-bold text-green-400 mt-1">${product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-96 bg-[#1f2329] flex flex-col border-l border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">Order #{String(Math.floor(Math.random()*900+100))}</h2>
          <p className="text-sm text-gray-400">
            {orderType === 'dinein' ? `Table ${selectedTable}` : 'Takeout'} • {cart.length} items
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">🛒</p>
              <p>Add items to start an order</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-[#272a30] p-3 rounded-lg border border-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold">{item.emoji} {item.name}</span>
                  <span className="text-green-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">${item.price.toFixed(2)} × {item.quantity}</span>
                  <div className="flex gap-1 ml-auto">
                    <button onClick={() => updateQty(item.id, -1)} className="bg-red-600 w-6 h-6 rounded font-bold hover:bg-red-500">-</button>
                    <button onClick={() => updateQty(item.id, 1)} className="bg-green-600 w-6 h-6 rounded font-bold hover:bg-green-500">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-gray-700">
              <span>Total</span><span className="text-green-400">${total.toFixed(2)}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowPayment(true)}
            disabled={cart.length === 0}
            className={`w-full py-3 rounded-lg text-lg font-bold mb-2 transition ${
              cart.length > 0 ? 'bg-green-500 hover:bg-green-400 text-black' : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            💳 Pay ${cart.length > 0 ? `$${total.toFixed(2)}` : ''}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg font-semibold">Hold</button>
            <button onClick={() => setCart([])} className="bg-red-600 hover:bg-red-500 py-2 rounded-lg text-white">Clear</button>
          </div>
        </div>

        {/* Payment Modal */}
        {showPayment && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-80">
              <h2 className="text-xl font-bold text-white mb-4">Payment</h2>
              <div className="text-center mb-6">
                <p className="text-gray-400">Total Amount</p>
                <p className="text-3xl font-bold text-green-400">${total.toFixed(2)}</p>
              </div>
              <div className="space-y-2 mb-4">
                <button className="w-full bg-blue-500 hover:bg-blue-400 py-3 rounded-lg text-white font-bold">💳 Card Payment</button>
                <button className="w-full bg-green-500 hover:bg-green-400 py-3 rounded-lg text-black font-bold">💵 Cash</button>
                <button className="w-full bg-purple-500 hover:bg-purple-400 py-3 rounded-lg text-white font-bold">📱 QR/Digital</button>
              </div>
              <button onClick={() => setShowPayment(false)} className="w-full bg-gray-600 hover:bg-gray-500 py-2 rounded-lg text-white">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierPage;
