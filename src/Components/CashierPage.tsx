import { useState, useEffect } from 'react';
import { useProductStore } from '../stores/productsStore';
import { useTableStore } from '../stores/tableStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useOrderStore } from '../stores/orderStore';
import { useToastStore } from '../stores/toastStore';
import type { Product } from '../types';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  emoji: string;
}

const CashierPage = () => {
  const { products, fetchProducts } = useProductStore();
  const { tables, fetchTables } = useTableStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { addOrder } = useOrderStore();
  const addToast = useToastStore((s) => s.addToast);

  // Build dynamic category list from admin
  const dynamicCategories = [
    { id: 'all' as string, name: 'All', emoji: '📋' },
    ...categories
      .filter(c => c.is_active && !c.parent_id)
      .map(c => ({
        id: c.name.toLowerCase().replace(/\s+/g, '_'),
        name: c.name,
        emoji: c.emoji || '📁',
        originalName: c.name,
      })),
  ];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState(1);
  const [orderType, setOrderType] = useState<string>('dine-in');
  const [showPayment, setShowPayment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchTables();
    fetchCategories();
  }, [fetchProducts, fetchTables, fetchCategories]);

  // Set default table on load
  useEffect(() => {
    if (tables.length > 0 && selectedTable === 1) {
      const activeTable = tables.find(t => t.is_active);
      if (activeTable) setSelectedTable(activeTable.table_number);
    }
  }, [tables, selectedTable]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

   
  
  const addToCart = (product: Product) => {
    if (!product.id) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { id: product.id!, name: product.name, quantity: 1, price: product.price, emoji: product.emoji || '🍽️' }];
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

  const handlePayment = async (method: string) => {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const orderNumber = await addOrder(
        {
          order_type: orderType as 'dine-in' | 'takeout' | 'delivery',
          status: 'pending',
          table_number: orderType === 'dine-in' ? selectedTable : undefined,
          subtotal,
          tax_amount: tax,
          total,
          notes: `Payment: ${method}`,
          payment_method: method,
        },
        orderItems,
      );

      if (orderNumber) {
        setCart([]);
        setShowPayment(false);
        addToast(`Order ${orderNumber} created via ${method}!`, 'success');
      } else {
        addToast('Failed to create order.', 'error');
      }
    } catch {
      addToast('Failed to create order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#1e2128] overflow-hidden">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">💰 Cashier / POS</h1>
            <p className="text-sm text-gray-400">
              {orderType === 'dine-in' ? `Dine-in • Table ${selectedTable}` : 'Takeout'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#272a30] rounded-lg p-1">
              <button
                onClick={() => setOrderType('dine-in')}
                className={`px-4 py-2 rounded-md transition ${orderType === 'dine-in' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
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
            {orderType === 'dine-in' && (
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(Number(e.target.value))}
                className="bg-[#272a30] border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                {tables.filter(t => t.is_active).map(t => (
                  <option key={t.id} value={t.table_number}>Table {t.table_number} ({t.seats} seats)</option>
                ))}
                {tables.filter(t => t.is_active).length === 0 && (
                  <option value={1}>Table 1</option>
                )}
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
          {dynamicCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`${activeCategory === cat.id ? 'bg-yellow-500 text-black ring-2 ring-yellow-500' : 'bg-[#272a30] text-gray-300'}
                px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 whitespace-nowrap`}
            >
              <span className="text-xl">{cat.emoji}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto">
          {products.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="bg-[#272a30] border border-gray-700 rounded-xl p-3 text-left hover:border-yellow-400
                    hover:shadow-lg hover:shadow-yellow-400/10 transition group"
                >
                  <div className="text-4xl mb-2 text-center group-hover:scale-110 transition">{product.emoji || '🍽️'}</div>
                  <p className="font-semibold text-white text-sm">{product.name}</p>
                  <p className="text-lg font-bold text-green-400 mt-1">${product.price.toFixed(2)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-96 bg-[#1f2329] flex flex-col border-l border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">🛒 New Order</h2>
          <p className="text-sm text-gray-400">
            {orderType === 'dine-in' ? `Table ${selectedTable}` : 'Takeout'} • {cart.length} items
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
                <button
                  onClick={() => handlePayment('card')}
                  disabled={submitting}
                  className="w-full bg-blue-500 hover:bg-blue-400 py-3 rounded-lg text-white font-bold disabled:opacity-50"
                >
                  💳 Card Payment
                </button>
                <button
                  onClick={() => handlePayment('cash')}
                  disabled={submitting}
                  className="w-full bg-green-500 hover:bg-green-400 py-3 rounded-lg text-black font-bold disabled:opacity-50"
                >
                  💵 Cash
                </button>
                <button
                  onClick={() => handlePayment('qr')}
                  disabled={submitting}
                  className="w-full bg-purple-500 hover:bg-purple-400 py-3 rounded-lg text-white font-bold disabled:opacity-50"
                >
                  📱 QR/Digital
                </button>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                disabled={submitting}
                className="w-full bg-gray-600 hover:bg-gray-500 py-2 rounded-lg text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierPage;
