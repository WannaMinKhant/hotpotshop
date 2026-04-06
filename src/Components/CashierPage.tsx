import { useState, useEffect } from 'react';
import { useProductStore } from '../stores/productsStore';
import { useTableStore } from '../stores/tableStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useOrderStore } from '../stores/orderStore';
import { useToastStore } from '../stores/toastStore';
import { useRecipeStore } from '../stores/recipeStore';
import type { Product } from '../types';
import type { Category } from '../stores/categoryStore';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  emoji: string;
}

interface HeldOrder {
  id: string;
  cart: CartItem[];
  orderType: string;
  tableNumber: number;
  timestamp: number;
}

interface RecipeCartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  emoji: string;
  isRecipe: boolean;
}

type ProductTab = 'stock' | 'recipes';

const CashierPage = () => {
  const { products, fetchProducts } = useProductStore();
  const { tables, fetchTables } = useTableStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { recipes, fetchRecipes } = useRecipeStore();
  const addToast = useToastStore((s) => s.addToast);

  // Product tab (Stock vs Recipes)
  const [productTab, setProductTab] = useState<ProductTab>('stock');

  // Category navigation: parent → subcategory → products
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null); // null = All
  const [selectedSubId, setSelectedSubId] = useState<number | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [recipeCart, setRecipeCart] = useState<RecipeCartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState(1);
  const [orderType, setOrderType] = useState<string>('dine-in');
  const [showHeldOrders, setShowHeldOrders] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Held orders from localStorage
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    try {
      const saved = localStorage.getItem('b2m_held_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist held orders
  useEffect(() => {
    localStorage.setItem('b2m_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    fetchProducts();
    fetchTables();
    fetchCategories();
    fetchRecipes();
  }, [fetchProducts, fetchTables, fetchCategories, fetchRecipes]);

  // Set default table on load
  useEffect(() => {
    if (tables.length > 0 && selectedTable === 1) {
      const activeTable = tables.find(t => t.is_active);
      if (activeTable) setSelectedTable(activeTable.table_number);
    }
  }, [tables, selectedTable]);

  // Get parent categories (top-level from tree)
  const parentCategories = categories; // Already tree structure from store

  // Get subcategories for selected parent (from children array)
  const selectedParentCategory = selectedParentId
    ? categories.find((c: Category) => c.id === selectedParentId)
    : null;
  const subCategories = selectedParentCategory?.children?.filter((c: Category) => c.is_active) || [];

  // Determine the active category name for filtering products
  const activeCategoryName = selectedSubId
    ? subCategories.find((c: Category) => c.id === selectedSubId)?.name.toLowerCase().replace(/\s+/g, '_')
    : selectedParentId
      ? selectedParentCategory?.name.toLowerCase().replace(/\s+/g, '_')
      : null;

  // Filter products based on selected category
  const filteredProducts = products.filter(p => {
    const matchesCategory = !activeCategoryName || p.category === activeCategoryName;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return r.is_active && matchesSearch;
  });

  // Add product to cart
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

  const holdOrder = () => {
    if (allCartItems.length === 0) {
      addToast('Cart is empty. Add items before holding.', 'warning');
      return;
    }
    const newOrder: HeldOrder = {
      id: Date.now().toString(),
      cart: [...cart, ...recipeCart],
      orderType,
      tableNumber: selectedTable,
      timestamp: Date.now(),
    };
    setHeldOrders(prev => [...prev, newOrder]);
    setCart([]);
    setRecipeCart([]);
    addToast(`Order held! (${newOrder.cart.length} items)`, 'info');
  };

  const restoreOrder = (orderId: string) => {
    const order = heldOrders.find(o => o.id === orderId);
    if (!order) return;
    // If current cart has items, hold them first
    if (allCartItems.length > 0) {
      const currentHold: HeldOrder = {
        id: Date.now().toString(),
        cart: [...cart, ...recipeCart],
        orderType,
        tableNumber: selectedTable,
        timestamp: Date.now(),
      };
      setHeldOrders(prev => [...prev, currentHold]);
    }
    // Separate stock items and recipe items
    const stockItems: CartItem[] = order.cart.filter((item: CartItem & { isRecipe?: boolean }) => !item.isRecipe) as CartItem[];
    const recipeItems: RecipeCartItem[] = order.cart.filter((item: CartItem & { isRecipe?: boolean }) => item.isRecipe) as RecipeCartItem[];
    setCart(stockItems);
    setRecipeCart(recipeItems);
    setOrderType(order.orderType);
    if (order.orderType === 'dine-in') setSelectedTable(order.tableNumber);
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    setShowHeldOrders(false);
    addToast('Order restored to cart!', 'success');
  };

  const clearHeldOrder = (orderId: string) => {
    setHeldOrders(prev => prev.filter(o => o.id !== orderId));
    addToast('Held order cleared', 'info');
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  const allCartItems = [...cart, ...recipeCart];
  const subtotal = allCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (allCartItems.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const orderItems = allCartItems.map(item => {
        const isRecipe = (item as RecipeCartItem).isRecipe;
        const productId = isRecipe ? item.id + 100000 : item.id;
        return {
          product_id: productId,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
        };
      });

      // For dine-in: check if this table has an existing active order
      let existingOrderId: number | null = null;
      if (orderType === 'dine-in' && selectedTable) {
        const existingOrder = useOrderStore.getState().orders.find(o =>
          o.table_number === selectedTable &&
          ['pending', 'preparing', 'ready', 'served'].includes(o.status)
        );
        existingOrderId = existingOrder?.id || null;
      }

      let orderNumber: string;

      if (existingOrderId) {
        // Add items to existing order (same table, active)
        const added = await useOrderStore.getState().addItemsToOrder(existingOrderId, orderItems);
        if (added) {
          const existingOrder = useOrderStore.getState().orders.find(o => o.id === existingOrderId);
          orderNumber = existingOrder?.order_number || '';
          addToast(`${allCartItems.length} item(s) added to ${orderNumber} (Table ${selectedTable})!`, 'success');
        } else {
          addToast('Failed to add items to existing order.', 'error');
          setSubmitting(false);
          return;
        }
      } else {
        // Create new order
        orderNumber = await useOrderStore.getState().addOrder(
          {
            order_type: orderType as 'dine-in' | 'takeout' | 'delivery',
            status: 'pending',
            table_number: orderType === 'dine-in' ? selectedTable : undefined,
            subtotal,
            tax_amount: tax,
            total,
            notes: '',
            payment_method: undefined,
          },
          orderItems,
        );

        if (orderNumber) {
          addToast(`Order ${orderNumber} placed!`, 'success');
        } else {
          addToast('Failed to place order.', 'error');
        }
      }

      if (orderNumber) {
        setCart([]);
        setRecipeCart([]);
      }
    } catch {
      addToast('Failed to place order. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full flex bg-[#1e2128] overflow-hidden">
      {/* LEFT: Products */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">💰 Cashier / POS</h1>
            <p className="text-sm text-gray-400">
              {orderType === 'dine-in' ? `🍽️ Dine-in • Table ${selectedTable}` : orderType === 'takeout' ? '🥡 Takeout' : '🚚 Delivery'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-[#272a30] rounded-lg p-1">
              <button
                onClick={() => setOrderType('dine-in')}
                className={`px-3 py-2 rounded-md text-sm transition ${orderType === 'dine-in' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                🍽️ Dine-in
              </button>
              <button
                onClick={() => setOrderType('takeout')}
                className={`px-3 py-2 rounded-md text-sm transition ${orderType === 'takeout' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                🥡 Takeout
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-3 py-2 rounded-md text-sm transition ${orderType === 'delivery' ? 'bg-yellow-500 text-black font-bold' : 'text-gray-400 hover:text-white'}`}
              >
                🚚 Delivery
              </button>
            </div>
            {orderType === 'dine-in' && (
              <select
                value={selectedTable}
                onChange={e => setSelectedTable(Number(e.target.value))}
                className="bg-[#272a30] border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                {tables.filter(t => t.is_active).map(t => (
                  <option key={t.id} value={t.table_number}>T{t.table_number} ({t.seats} seats)</option>
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
          placeholder={productTab === 'stock' ? '🔍 Search products...' : '🔍 Search recipes...'}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-3 px-4 py-2 rounded-lg bg-[#272a30] border border-gray-600 text-white shrink-0"
        />

        {/* Stock / Recipes Tabs */}
        <div className="flex gap-2 mb-3 shrink-0">
          <button
            onClick={() => { setProductTab('stock'); setSelectedParentId(null); setSelectedSubId(null); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              productTab === 'stock' ? 'bg-green-500 text-black font-bold' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'
            }`}
          >
            📦 Stock
          </button>
          <button
            onClick={() => { setProductTab('recipes'); setSelectedParentId(null); setSelectedSubId(null); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              productTab === 'recipes' ? 'bg-purple-500 text-white font-bold' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'
            }`}
          >
            📖 Recipes
          </button>
        </div>

        {productTab === 'stock' && (
          <>
            {/* Parent Categories */}
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2 shrink-0">
              <button
                onClick={() => { setSelectedParentId(null); setSelectedSubId(null); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                  !selectedParentId ? 'bg-yellow-500 text-black ring-1 ring-yellow-500' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'
                }`}
              >
                📋 All
              </button>
              {parentCategories.map((cat: Category) => {
                const hasSubs = (cat.children && cat.children.length > 0);
                const isSelected = selectedParentId === cat.id && !selectedSubId;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedParentId(cat.id!); setSelectedSubId(null); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1 whitespace-nowrap ${
                      isSelected ? 'bg-yellow-500 text-black ring-1 ring-yellow-500' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'
                    }`}
                  >
                    <span>{cat.emoji || '📁'}</span>
                    {cat.name}
                    {hasSubs && <span className="text-[10px] text-gray-500">▸</span>}
                  </button>
                );
              })}
            </div>

            {/* Subcategories (shown when parent has subs) */}
            {subCategories.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 shrink-0 pl-4 border-l-2 border-yellow-500/30">
                <button
                  onClick={() => setSelectedSubId(null)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    !selectedSubId ? 'bg-yellow-400 text-black' : 'bg-[#272a30] text-gray-400 hover:bg-[#2f333a]'
                  }`}
                >
                  All
                </button>
                {subCategories.map((sub: Category) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id!)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      selectedSubId === sub.id ? 'bg-yellow-400 text-black' : 'bg-[#272a30] text-gray-400 hover:bg-[#2f333a]'
                    }`}
                  >
                    {sub.emoji || '📁'} {sub.name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {productTab === 'recipes' && (
          <div className="mb-2 shrink-0">
            <p className="text-gray-500 text-xs">📖 Menu items — select to add to order</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {productTab === 'stock' && products.length === 0 ? (
            <div className="text-center text-gray-400 py-12">Loading products...</div>
          ) : productTab === 'stock' ? (
            filteredProducts.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No products found</div>
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
            )
          ) : null}

          {/* Recipes Grid */}
          {productTab === 'recipes' && (
            recipes.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No recipes available</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No recipes found</div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    onClick={() => {
                      if (!recipe.id) return;
                      setRecipeCart(prev => {
                        const existing = prev.find(item => item.id === recipe.id);
                        if (existing) {
                          return prev.map(item =>
                            item.id === recipe.id ? { ...item, quantity: item.quantity + 1 } : item
                          );
                        }
                        return [...prev, { id: recipe.id!, name: recipe.name, quantity: 1, price: recipe.price, emoji: recipe.emoji || '🍲', isRecipe: true }];
                      });
                    }}
                    className="bg-[#272a30] border border-purple-500/30 rounded-xl p-3 text-left hover:border-purple-400
                      hover:shadow-lg hover:shadow-purple-400/10 transition group"
                  >
                    <div className="text-4xl mb-2 text-center group-hover:scale-110 transition">{recipe.emoji || '🍲'}</div>
                    <p className="font-semibold text-white text-sm">{recipe.name}</p>
                    {recipe.description && <p className="text-gray-500 text-[10px] truncate">{recipe.description}</p>}
                    <p className="text-lg font-bold text-purple-400 mt-1">${recipe.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* RIGHT: Cart */}
      <div className="w-96 bg-[#1f2329] flex flex-col border-l border-gray-700 shrink-0">
        <div className="p-4 border-b border-gray-700 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-yellow-400">🛒 New Order</h2>
            <p className="text-sm text-gray-400">
              {orderType === 'dine-in' ? `🍽️ T${selectedTable}` : orderType === 'takeout' ? '🥡 Takeout' : '🚚 Delivery'} • {allCartItems.length} items
            </p>
          </div>
          {heldOrders.length > 0 && (
            <button
              onClick={() => setShowHeldOrders(true)}
              className="relative p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition"
            >
              <span className="text-lg">📌</span>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                {heldOrders.length}
              </span>
            </button>
          )}
        </div>

        {/* Cart Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin min-h-0">
          {allCartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-4xl mb-2">🛒</p>
              <p>Add items to start an order</p>
            </div>
          ) : (
            allCartItems.map(item => (
              <div key={item.id} className={`bg-[#272a30] p-3 rounded-lg border ${(item as RecipeCartItem).isRecipe ? 'border-purple-500/30' : 'border-gray-600'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold text-sm">
                    {item.emoji} {item.name}
                    {(item as RecipeCartItem).isRecipe && <span className="ml-1 text-[9px] bg-purple-500/30 text-purple-300 px-1 rounded">Recipe</span>}
                  </span>
                  <span className="text-green-400 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">${item.price.toFixed(2)} × {item.quantity}</span>
                  <div className="flex gap-1 ml-auto">
                    <button
                      onClick={() => {
                        if ((item as RecipeCartItem).isRecipe) {
                          setRecipeCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i).filter(i => i.quantity > 0));
                        } else {
                          updateQty(item.id, -1);
                        }
                      }}
                      className="bg-red-600 w-6 h-6 rounded text-xs font-bold hover:bg-red-500"
                    >-</button>
                    <button
                      onClick={() => {
                        if ((item as RecipeCartItem).isRecipe) {
                          setRecipeCart(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                        } else {
                          updateQty(item.id, 1);
                        }
                      }}
                      className="bg-green-600 w-6 h-6 rounded text-xs font-bold hover:bg-green-500"
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer - Fixed at bottom */}
        <div className="p-4 border-t border-gray-700 shrink-0">
          <div className="space-y-1 mb-3">
            <div className="flex justify-between text-gray-400 text-sm"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-400 text-sm"><span>Tax (10%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-gray-700">
              <span>Total</span><span className="text-green-400">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={allCartItems.length === 0 || submitting}
            className={`w-full py-3 rounded-lg text-lg font-bold mb-2 transition flex items-center justify-center gap-2 ${
              allCartItems.length > 0 && !submitting
                ? 'bg-green-500 hover:bg-green-400 text-black'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Placing...
              </>
            ) : (
              <>📋 Place Order — ${total.toFixed(2)}</>
            )}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={holdOrder}
              className="bg-yellow-500 hover:bg-yellow-400 text-black py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-1"
            >
              📌 Hold
            </button>
            <button onClick={() => { setCart([]); setRecipeCart([]); }} className="bg-red-600 hover:bg-red-500 py-2 rounded-lg text-white text-sm">Clear</button>
          </div>
        </div>

        {/* Held Orders Modal */}
        {showHeldOrders && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#272a30] rounded-xl border border-gray-600 w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-white">📌 Held Orders ({heldOrders.length})</h2>
                <button onClick={() => setShowHeldOrders(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin min-h-0">
                {heldOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No held orders</p>
                ) : (
                  heldOrders.map(order => (
                    <div key={order.id} className="bg-[#1f2329] rounded-lg border border-gray-700 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-semibold text-sm">
                            {order.orderType === 'dine-in' ? `🍽️ Table ${order.tableNumber}` : order.orderType === 'takeout' ? '🥡 Takeout' : '🚚 Delivery'}
                          </p>
                          <p className="text-gray-500 text-xs">{formatTime(order.timestamp)}</p>
                        </div>
                        <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full font-semibold">
                          {order.cart.length} items
                        </span>
                      </div>
                      <div className="space-y-1 mb-3">
                        {order.cart.map(item => (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="text-gray-400">{item.emoji} {item.name} ×{item.quantity}</span>
                            <span className="text-green-400">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => restoreOrder(order.id)}
                          className="flex-1 bg-green-500 hover:bg-green-400 text-black py-1.5 rounded text-sm font-semibold"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => clearHeldOrder(order.id)}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white py-1.5 rounded text-sm font-semibold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashierPage;
