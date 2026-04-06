import { useState, useEffect } from 'react';
import { useProductStore } from '../stores/productsStore';
import { useCategoryStore } from '../stores/categoryStore';
import { useStockMovementStore } from '../stores/stockMovementStore';
import { useToastStore } from '../stores/toastStore';
import EmojiPicker from '../Components/EmojiPicker';
import type { Product, StockMovement } from '../types';
import { convertUnit, areUnitsCompatible } from '../lib/unit-conversion';

const movementTypes: { value: StockMovement['movement_type']; label: string; icon: string; color: string }[] = [
  { value: 'purchase', label: 'Purchase In', icon: '📥', color: 'bg-green-500' },
  { value: 'sale', label: 'Sale Out', icon: '📤', color: 'bg-blue-500' },
  { value: 'adjustment', label: 'Adjustment', icon: '🔧', color: 'bg-yellow-500' },
  { value: 'waste', label: 'Waste/Spoil', icon: '🗑️', color: 'bg-red-500' },
  { value: 'return', label: 'Return', icon: '↩️', color: 'bg-purple-500' },
];

const StockControlPage = () => {
  const { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { movements, fetchMovements } = useStockMovementStore();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'ok'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTarget, setEmojiTarget] = useState<'add' | 'edit' | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [showMovements, setShowMovements] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Product usage info for deletion confirmation
  const [productUsage, setProductUsage] = useState<{ orders: number; recipes: number; stockMovements: number } | null>(null);
  const [checkingUsage, setCheckingUsage] = useState(false);

  const [formData, setFormData] = useState({
    name: '', category: 'bases', stock_quantity: 0, unit: 'pcs',
    base_unit: '', conversion_factor: 1, reorder_point: 10, price: 0, cost_price: 0, emoji: '',
  });
  const [addStep, setAddStep] = useState(1); // Multi-step: 1=Basic, 2=Pricing, 3=Stock
  const [purchaseData, setPurchaseData] = useState({
    quantity: 0, unit: 'pcs', cost_per_unit: 0, notes: '',
  });

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

  // Build dynamic category tabs
  const categoryTabs = [
    { id: 'all', name: 'All' },
    ...categories
      .filter(c => c.is_active && !c.parent_id)
      .map(c => ({
        id: c.name.toLowerCase().replace(/\s+/g, '_'),
        name: c.name,
      })),
  ];

  useEffect(() => { if (selectedProductId) fetchMovements(selectedProductId); }, [selectedProductId, fetchMovements]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const productCatId = p.category.toLowerCase().replace(/\s+/g, '_');
    const matchesTab = activeTab === 'all' || productCatId === activeTab;
    const matchesStock = stockFilter === 'all'
      ? true
      : stockFilter === 'low'
        ? p.stock_quantity <= p.reorder_point
        : p.stock_quantity > p.reorder_point;
    return matchesSearch && matchesTab && matchesStock;
  });

  // Reverse order (newest first) and paginate
  const reversedProducts = [...filteredProducts].reverse();
  const totalPages = Math.ceil(reversedProducts.length / rowsPerPage);
  const paginatedProducts = reversedProducts.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const lowStockItems = products.filter(p => p.stock_quantity <= p.reorder_point);
  const totalInventoryValue = products.reduce((s, p) => s + p.stock_quantity * (p.cost_price || p.price), 0);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const productMovements = movements.filter(m => m.product_id === selectedProductId);

  const handleAdd = async () => {
    if (!formData.name) { addToast('Product name is required', 'warning'); return; }
    await addProduct({ ...formData, category: formData.category } as Omit<Product, 'id'>);
    setShowAddModal(false);
    setFormData({ name: '', category: 'bases', stock_quantity: 0, unit: 'pcs', base_unit: '', conversion_factor: 1, reorder_point: 10, price: 0, cost_price: 0, emoji: '' });
    addToast('Product added!', 'success');
  };

  const handleEditSave = async () => {
    if (!editingProduct?.id) return;
    console.log(editingProduct)
    await updateProduct(editingProduct.id, editingProduct);
    setShowEditModal(false);
    setEditingProduct(null);
    addToast('Product updated!', 'success');
  };

  const handleDelete = async (id: number) => {
    setCheckingUsage(true);
    try {
      const usage = await useProductStore.getState().checkProductUsage(id);
      setProductUsage(usage);
      setConfirmDelete(id);
    } catch (err) {
      console.error('Failed to check product usage:', err);
      addToast('Failed to check product usage', 'error');
    } finally {
      setCheckingUsage(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    await deleteProduct(confirmDelete);
    setConfirmDelete(null);
    setProductUsage(null);
    addToast('Product archived (soft deleted)', 'info');
  };

  const handlePurchase = async () => {
    if (!selectedProductId || purchaseData.quantity <= 0) { addToast('Enter a valid quantity', 'warning'); return; }
    // Convert to product's base unit if needed
    let qty = purchaseData.quantity;
    if (selectedProduct && purchaseData.unit !== selectedProduct.unit) {
      if (areUnitsCompatible(purchaseData.unit, selectedProduct.unit)) {
        qty = convertUnit(purchaseData.quantity, purchaseData.unit, selectedProduct.unit);
      }
    }

    const success = await useStockMovementStore.getState().addMovement({
      product_id: selectedProductId,
      movement_type: 'purchase',
      quantity: qty,
      unit: selectedProduct?.unit || purchaseData.unit,
      cost_per_unit: purchaseData.cost_per_unit,
      total_cost: purchaseData.cost_per_unit * purchaseData.quantity,
      notes: purchaseData.notes,
      reference: `Manual purchase`,
    });

    if (success) {
      setShowPurchaseModal(false);
      setPurchaseData({ quantity: 0, unit: 'pcs', cost_per_unit: 0, notes: '' });
      await fetchProducts();
      if (selectedProductId) await fetchMovements(selectedProductId);
      addToast(`Stock updated: +${qty} ${selectedProduct?.unit}`, 'success');
    } else {
      const errMsg = useStockMovementStore.getState().error || 'Failed to update stock';
      addToast(errMsg, 'error');
    }
  };

  const handleStockChange = async (productId: number, delta: number, type: StockMovement['movement_type']) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const qty = Math.abs(delta);
    const success = await useStockMovementStore.getState().addMovement({
      product_id: productId,
      movement_type: type,
      quantity: qty,
      unit: product.unit,
      notes: `Stock ${type}`,
    });

    if (success) {
      await fetchProducts();
      if (selectedProductId) await fetchMovements(selectedProductId);
      addToast(`Stock updated: ${type} ${qty} ${product.unit}`, 'success');
    } else {
      const errMsg = useStockMovementStore.getState().error || `Failed to ${type}`;
      addToast(errMsg, 'error');
    }
  };

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📦 Stock Control</h1>
          <p className="text-gray-400 mt-1">Manage inventory, purchases, and stock levels</p>
        </div>
        <button onClick={() => { setShowEmojiPicker(false); setEmojiTarget('add'); setShowAddModal(true); }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold transition">+ Add Product</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
          className={`bg-green-500/20 border rounded-xl p-4 transition-all text-left cursor-pointer hover:brightness-125 ${stockFilter === 'all' ? 'border-green-400 ring-2 ring-green-500/50' : 'border-green-500'}`}
        >
          <p className="text-green-400 text-sm font-semibold">Total Products</p>
          <p className="text-3xl font-bold text-green-400">{loading ? '...' : products.length}</p>
          {stockFilter === 'all' && <p className="text-green-300 text-[10px] mt-1">✓ Showing all</p>}
        </button>
        <button
          onClick={() => { setStockFilter('low'); setCurrentPage(1); }}
          className={`bg-red-500/20 border rounded-xl p-4 transition-all text-left cursor-pointer hover:brightness-125 ${stockFilter === 'low' ? 'border-red-400 ring-2 ring-red-500/50' : 'border-red-500'}`}
        >
          <p className="text-red-400 text-sm font-semibold">Low Stock</p>
          <p className="text-3xl font-bold text-red-400">{lowStockItems.length}</p>
          {stockFilter === 'low' && <p className="text-red-300 text-[10px] mt-1">✓ Showing low stock</p>}
        </button>
        <button
          onClick={() => { setStockFilter('ok'); setCurrentPage(1); }}
          className={`bg-yellow-500/20 border rounded-xl p-4 transition-all text-left cursor-pointer hover:brightness-125 ${stockFilter === 'ok' ? 'border-yellow-400 ring-2 ring-yellow-500/50' : 'border-yellow-500'}`}
        >
          <p className="text-yellow-400 text-sm font-semibold">In Stock</p>
          <p className="text-3xl font-bold text-yellow-400">{products.length - lowStockItems.length}</p>
          {stockFilter === 'ok' && <p className="text-yellow-300 text-[10px] mt-1">✓ Showing in stock</p>}
        </button>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Inventory Value</p>
          <p className="text-3xl font-bold text-blue-400">${totalInventoryValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {stockFilter !== 'all' && (
        <div className="mb-4 flex items-center gap-3 bg-[#272a30] rounded-lg p-3 border border-gray-700">
          <span className={`text-sm font-semibold ${stockFilter === 'low' ? 'text-red-400' : 'text-yellow-400'}`}>
            {stockFilter === 'low' ? '⚠️ Showing Low Stock Only' : '✅ Showing In Stock Only'}
          </span>
          <span className="text-gray-500 text-sm">({filteredProducts.length} of {products.length} products)</span>
          <button
            onClick={() => { setStockFilter('all'); setCurrentPage(1); }}
            className="ml-auto text-gray-400 hover:text-white text-sm underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Search + Tabs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input type="text" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categoryTabs.map(cat => (
            <button key={cat.id} onClick={() => { setActiveTab(cat.id); setCurrentPage(1); }} className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === cat.id ? 'bg-yellow-500 text-black ring-2 ring-yellow-500' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'}`}>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading products...</div>
      ) : (
        <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-700 text-left text-gray-400">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Reorder</th>
                <th className="p-4">Status</th>
                <th className="p-4">Cost</th>
                <th className="p-4">Price</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No products found</td></tr>
              ) : paginatedProducts.map(product => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-[#2f333a] transition">
                  <td className="p-4 text-white font-semibold">{product.emoji || '📦'} {product.name}</td>
                  <td className="p-4 text-gray-300 capitalize">{product.category}</td>
                  <td className="p-4">
                    <span className="text-white font-bold">{product.stock_quantity}</span>
                    <span className="text-gray-400 text-sm ml-1">{product.unit}</span>
                    {product.base_unit && product.base_unit !== product.unit && (
                      <span className="text-gray-500 text-xs ml-1">({product.conversion_factor}x {product.base_unit})</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-300">{product.reorder_point} {product.unit}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock_quantity <= product.reorder_point ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-green-500/20 text-green-400 border border-green-500'}`}>
                      {product.stock_quantity <= product.reorder_point ? '⚠️ LOW' : '✅ OK'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">${(product.cost_price || 0).toFixed(2)}</td>
                  <td className="p-4 text-green-400 font-bold">${product.price.toFixed(2)}</td>
                  <td className="p-4 space-x-1 space-y-1">
                    <button onClick={() => { setSelectedProductId(product.id!); setShowMovements(true); fetchMovements(product.id!); }} className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs font-semibold">📋 History</button>
                    <button onClick={() => { setSelectedProductId(product.id!); setShowPurchaseModal(true); setPurchaseData({ quantity: 0, unit: product.unit, cost_per_unit: product.cost_price || 0, notes: '' }); }} className="bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">📥 Purchase</button>
                    <button onClick={() => { setEditingProduct({...product}); setShowEditModal(true); setShowEmojiPicker(false); }} className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">Edit</button>
                    <button onClick={() => handleDelete(product.id!)} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-700">
              <p className="text-gray-400 text-sm">
                Showing {(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, reversedProducts.length)} of {reversedProducts.length} products
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 rounded-md font-semibold text-sm transition ${
                    currentPage === 1
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-md font-semibold text-sm transition ${
                      currentPage === page
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 rounded-md font-semibold text-sm transition ${
                    currentPage === totalPages
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ADD PRODUCT MODAL - Multi-Step */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#272a30] rounded-2xl border border-gray-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#272a30] border-b border-gray-700 p-5 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">➕ Add New Product</h2>
                <p className="text-gray-400 text-sm mt-1">Step {addStep} of 3</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setShowEmojiPicker(false); setAddStep(1); setFormData({ name: '', category: 'bases', stock_quantity: 0, unit: 'pcs', base_unit: '', conversion_factor: 1, reorder_point: 10, price: 0, cost_price: 0, emoji: '' }); }}
                className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white flex items-center justify-center transition text-xl"
              >
                ✕
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map(step => (
                  <div key={step} className="flex-1 flex items-center">
                    <div className={`flex-1 h-2 rounded-full transition-all ${
                      step <= addStep ? 'bg-yellow-500' : 'bg-gray-700'
                    }`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={addStep === 1 ? 'text-yellow-400 font-semibold' : ''}>Basic Info</span>
                <span className={addStep === 2 ? 'text-yellow-400 font-semibold' : ''}>Pricing</span>
                <span className={addStep === 3 ? 'text-yellow-400 font-semibold' : ''}>Stock Setup</span>
              </div>
            </div>

            <div className="p-6">
              {/* STEP 1: Basic Information */}
              {addStep === 1 && (
                <div className="space-y-5">
                  {/* Emoji + Name */}
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Product Identity</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEmojiTarget('add'); setShowEmojiPicker(!showEmojiPicker); }}
                        className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center text-4xl transition-all hover:scale-105 ${
                          formData.emoji
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-gray-600 bg-[#1e2128] hover:border-yellow-500'
                        }`}
                      >
                        {formData.emoji || '📦'}
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white text-lg outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/30 transition"
                          placeholder="Enter product name *"
                          autoFocus
                        />
                        {formData.name && (
                          <p className="text-gray-500 text-xs mt-2">
                            Preview: {formData.emoji || '📦'} {formData.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && emojiTarget === 'add' && (
                    <div className="border border-gray-700 rounded-xl overflow-hidden">
                      <EmojiPicker
                        onSelect={(emoji) => { setFormData({...formData, emoji}); setShowEmojiPicker(false); }}
                        currentEmoji={formData.emoji}
                      />
                    </div>
                  )}

                  {/* Category */}
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">Category *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.filter(c => c.is_active && !c.parent_id).length > 0 ? (
                        categories.filter(c => c.is_active && !c.parent_id).map(c => (
                          <button
                            key={c.id}
                            onClick={() => setFormData({...formData, category: c.name.toLowerCase().replace(/\s+/g, '_')})}
                            className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                              formData.category === c.name.toLowerCase().replace(/\s+/g, '_')
                                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                : 'border-gray-700 bg-[#1e2128] text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            <span className="text-2xl block mb-1">{c.emoji || '📁'}</span>
                            <span className="text-xs font-semibold">{c.name}</span>
                          </button>
                        ))
                      ) : (
                        <>
                          {[
                            { id: 'bases', emoji: '🍲', name: 'Bases' },
                            { id: 'meats', emoji: '🥩', name: 'Meats' },
                            { id: 'seafood', emoji: '🦐', name: 'Seafood' },
                            { id: 'veggies', emoji: '🥬', name: 'Veggies' },
                            { id: 'noodles', emoji: '🍜', name: 'Noodles' },
                            { id: 'drinks', emoji: '🍹', name: 'Drinks' },
                            { id: 'sauces', emoji: '🧂', name: 'Sauces' },
                          ].map(cat => (
                            <button
                              key={cat.id}
                              onClick={() => setFormData({...formData, category: cat.id})}
                              className={`p-3 rounded-xl border-2 text-center transition-all hover:scale-105 ${
                                formData.category === cat.id
                                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                                  : 'border-gray-700 bg-[#1e2128] text-gray-400 hover:border-gray-500'
                              }`}
                            >
                              <span className="text-2xl block mb-1">{cat.emoji}</span>
                              <span className="text-xs font-semibold">{cat.name}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Pricing */}
              {addStep === 2 && (
                <div className="space-y-5">
                  {/* Price Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                      <label className="text-green-400 text-xs font-semibold mb-2 block">💰 Selling Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-lg font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          className="w-full pl-8 pr-3 py-3 rounded-xl bg-[#1e2128] border border-green-500/50 text-white text-2xl font-bold outline-none focus:border-green-400 focus:ring-2 focus:ring-green-500/30 transition"
                          placeholder="0.00"
                          autoFocus
                        />
                      </div>
                      <p className="text-green-500/70 text-[10px] mt-2">Price customers pay</p>
                    </div>

                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
                      <label className="text-red-400 text-xs font-semibold mb-2 block">📦 Cost Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400 text-lg font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.cost_price || ''}
                          onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})}
                          className="w-full pl-8 pr-3 py-3 rounded-xl bg-[#1e2128] border border-red-500/50 text-white text-2xl font-bold outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/30 transition"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="text-red-500/70 text-[10px] mt-2">Your cost per item</p>
                    </div>
                  </div>

                  {/* Profit Preview */}
                  {formData.price > 0 && formData.cost_price > 0 && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-blue-400 text-xs font-semibold mb-1">💎 Profit Per Item</p>
                          <p className="text-3xl font-bold text-blue-400">
                            ${(formData.price - formData.cost_price).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-400 text-xs font-semibold mb-1">📊 Margin</p>
                          <p className="text-3xl font-bold text-blue-400">
                            {formData.price > 0 ? (((formData.price - formData.cost_price) / formData.price) * 100).toFixed(0) : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: Stock Setup */}
              {addStep === 3 && (
                <div className="space-y-5">
                  {/* Unit Configuration */}
                  <div>
                    <label className="text-white text-sm font-semibold mb-2 block">📏 Unit Configuration</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Main Unit</label>
                        <input
                          type="text"
                          value={formData.unit}
                          onChange={(e) => setFormData({...formData, unit: e.target.value})}
                          className="w-full px-3 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
                          placeholder="e.g. kg"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Base Unit</label>
                        <input
                          type="text"
                          value={formData.base_unit}
                          onChange={(e) => setFormData({...formData, base_unit: e.target.value})}
                          className="w-full px-3 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
                          placeholder="e.g. g"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Conversion Factor</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.conversion_factor || ''}
                          onChange={(e) => setFormData({...formData, conversion_factor: parseFloat(e.target.value) || 1})}
                          className="w-full px-3 py-3 rounded-xl bg-[#1e2128] border border-gray-600 text-white outline-none focus:border-yellow-500 transition"
                          placeholder="e.g. 1000"
                        />
                      </div>
                    </div>
                    {formData.unit && formData.base_unit && formData.conversion_factor > 0 && (
                      <p className="text-gray-500 text-xs mt-2 bg-[#1e2128] rounded-lg p-2 border border-gray-700">
                        💡 1 {formData.unit} = {formData.conversion_factor} {formData.base_unit}
                      </p>
                    )}
                  </div>

                  {/* Stock & Reorder */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-5">
                      <label className="text-purple-400 text-xs font-semibold mb-2 block">📦 Initial Stock</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.stock_quantity || ''}
                          onChange={(e) => setFormData({...formData, stock_quantity: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-3 rounded-xl bg-[#1e2128] border border-purple-500/50 text-white text-2xl font-bold outline-none focus:border-purple-400 transition"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 text-sm font-semibold">
                          {formData.unit || 'pcs'}
                        </span>
                      </div>
                      <p className="text-purple-500/70 text-[10px] mt-2">Starting quantity</p>
                    </div>

                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
                      <label className="text-orange-400 text-xs font-semibold mb-2 block">⚠️ Reorder Point</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          value={formData.reorder_point || ''}
                          onChange={(e) => setFormData({...formData, reorder_point: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-3 rounded-xl bg-[#1e2128] border border-orange-500/50 text-white text-2xl font-bold outline-none focus:border-orange-400 transition"
                          placeholder="10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 text-sm font-semibold">
                          {formData.unit || 'pcs'}
                        </span>
                      </div>
                      <p className="text-orange-500/70 text-[10px] mt-2">Alert when stock drops below</p>
                    </div>
                  </div>

                  {/* Summary Preview */}
                  <div className="bg-[#1e2128] rounded-xl border border-gray-700 p-4">
                    <h3 className="text-white font-bold mb-2">📋 Product Summary</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Product</p>
                        <p className="text-white font-semibold">{formData.emoji || '📦'} {formData.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="text-white font-semibold capitalize">{formData.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <p className="text-green-400 font-bold">${formData.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Cost</p>
                        <p className="text-red-400 font-bold">${(formData.cost_price || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Initial Stock</p>
                        <p className="text-white font-bold">{formData.stock_quantity} {formData.unit}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reorder At</p>
                        <p className="text-orange-400 font-bold">{formData.reorder_point} {formData.unit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-700">
                {addStep > 1 && (
                  <button
                    onClick={() => setAddStep(addStep - 1)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition"
                  >
                    ← Back
                  </button>
                )}
                {addStep < 3 ? (
                  <button
                    onClick={() => {
                      if (addStep === 1 && !formData.name) {
                        useToastStore.getState().addToast('Please enter a product name', 'warning');
                        return;
                      }
                      setAddStep(addStep + 1);
                    }}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold transition"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-xl font-bold transition"
                  >
                    ✅ Add Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Product</h2>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setEmojiTarget('edit'); setShowEmojiPicker(!showEmojiPicker); }}
                className="w-14 h-14 rounded-lg bg-[#1e2128] border border-gray-600 text-3xl flex items-center justify-center hover:border-yellow-500"
              >
                {editingProduct.emoji || '📦'}
              </button>
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                className="flex-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white"
                placeholder="Product Name"
              />
            </div>

            {showEmojiPicker && emojiTarget === 'edit' && (
              <div className="mb-3">
                <EmojiPicker
                  onSelect={(emoji) => { setEditingProduct({...editingProduct, emoji}); setShowEmojiPicker(false); }}
                  currentEmoji={editingProduct.emoji}
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 text-xs">Stock</label>
                  <input type="number" step="0.01" value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct({...editingProduct, stock_quantity: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Reorder Pt</label>
                  <input type="number" step="0.01" value={editingProduct.reorder_point} onChange={(e) => setEditingProduct({...editingProduct, reorder_point: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 text-xs">Price</label>
                  <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Cost Price</label>
                  <input type="number" step="0.01" value={editingProduct.cost_price || 0} onChange={(e) => setEditingProduct({...editingProduct, cost_price: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-400 text-xs">Unit</label>
                  <input type="text" value={editingProduct.unit} onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Base Unit</label>
                  <input type="text" value={editingProduct.base_unit || ''} onChange={(e) => setEditingProduct({...editingProduct, base_unit: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Factor</label>
                  <input type="number" step="0.01" value={editingProduct.conversion_factor || 1} onChange={(e) => setEditingProduct({...editingProduct, conversion_factor: parseFloat(e.target.value) || 1})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditSave} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save</button>
                <button onClick={() => { setShowEditModal(false); setEditingProduct(null); setShowEmojiPicker(false); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE MODAL */}
      {showPurchaseModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-green-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-1">📥 Purchase Stock</h2>
            <p className="text-gray-400 text-sm mb-4">{selectedProduct.emoji} {selectedProduct.name} (Current: {selectedProduct.stock_quantity} {selectedProduct.unit})</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 text-xs">Quantity</label>
                  <input type="number" step="0.01" value={purchaseData.quantity} onChange={(e) => setPurchaseData({...purchaseData, quantity: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Qty" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs">Unit</label>
                  <input type="text" value={purchaseData.unit} onChange={(e) => setPurchaseData({...purchaseData, unit: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder={selectedProduct.unit} />
                </div>
              </div>

              {/* Unit conversion preview */}
              {purchaseData.unit !== selectedProduct.unit && areUnitsCompatible(purchaseData.unit, selectedProduct.unit) && (
                <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
                  🔄 {purchaseData.quantity} {purchaseData.unit} = {convertUnit(purchaseData.quantity, purchaseData.unit, selectedProduct.unit).toFixed(2)} {selectedProduct.unit}
                </div>
              )}

              <div>
                <label className="text-gray-400 text-xs">Cost per Unit ($)</label>
                <input type="number" step="0.01" value={purchaseData.cost_per_unit} onChange={(e) => setPurchaseData({...purchaseData, cost_per_unit: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="0.00" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Notes</label>
                <input type="text" value={purchaseData.notes} onChange={(e) => setPurchaseData({...purchaseData, notes: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Supplier, invoice ref..." />
              </div>

              {purchaseData.quantity > 0 && purchaseData.cost_per_unit > 0 && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm text-right">
                  Total: ${(purchaseData.quantity * purchaseData.cost_per_unit).toFixed(2)}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={handlePurchase} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">📥 Add Stock</button>
                <button onClick={() => setShowPurchaseModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT HISTORY */}
      {showMovements && selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">📋 Stock History</h2>
                <p className="text-gray-400 text-sm">{selectedProduct.emoji} {selectedProduct.name} — Current: <span className="text-white font-bold">{selectedProduct.stock_quantity} {selectedProduct.unit}</span></p>
              </div>
              <button onClick={() => setShowMovements(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            {/* Quick stock change buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {movementTypes.map(mt => (
                <button
                  key={mt.value}
                  onClick={() => {
                    const qty = prompt(`Enter quantity for ${mt.label}:`);
                    if (qty && parseFloat(qty) > 0) {
                      handleStockChange(selectedProduct.id!, mt.value === 'purchase' || mt.value === 'return' ? parseFloat(qty) : -parseFloat(qty), mt.value);
                    }
                  }}
                  className={`${mt.color} text-white px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition`}
                >
                  {mt.icon} {mt.label}
                </button>
              ))}
            </div>

            {/* Movement table */}
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700 text-left text-gray-400">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Qty</th>
                  <th className="p-2">Cost</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {productMovements.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-gray-500">No movements yet</td></tr>
                ) : productMovements.map(m => {
                  const mtDef = movementTypes.find(mt => mt.value === m.movement_type);
                  return (
                    <tr key={m.id} className="border-b border-gray-800">
                      <td className="p-2 text-gray-400 text-xs">{m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs text-white ${mtDef?.color || 'bg-gray-500'}`}>
                          {mtDef?.icon} {m.movement_type}
                        </span>
                      </td>
                      <td className={`p-2 font-bold ${m.movement_type === 'purchase' || m.movement_type === 'return' ? 'text-green-400' : 'text-red-400'}`}>
                        {m.movement_type === 'purchase' || m.movement_type === 'return' ? '+' : '-'}{m.quantity} {m.unit}
                      </td>
                      <td className="p-2 text-gray-300">${(m.total_cost || 0).toFixed(2)}</td>
                      <td className="p-2 text-gray-400 text-xs max-w-[150px] truncate">{m.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE WITH USAGE WARNING */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#272a30] rounded-2xl border border-red-600/50 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-700 text-center">
              <p className="text-5xl mb-3">⚠️</p>
              <h2 className="text-2xl font-bold text-white">Archive Product?</h2>
              <p className="text-gray-400 text-sm mt-2">This will hide the product but preserve historical data</p>
            </div>

            {/* Usage Warning */}
            {productUsage && (
              <div className="p-6 space-y-3">
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-400 text-xs font-bold uppercase mb-2">📊 Product Usage</p>
                  <div className="space-y-2 text-sm">
                    {productUsage.orders > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">📋 Orders</span>
                        <span className="text-red-400 font-bold">{productUsage.orders}</span>
                      </div>
                    )}
                    {productUsage.recipes > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">🍳 Recipes</span>
                        <span className="text-orange-400 font-bold">{productUsage.recipes}</span>
                      </div>
                    )}
                    {productUsage.stockMovements > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">📦 Stock Movements</span>
                        <span className="text-yellow-400 font-bold">{productUsage.stockMovements}</span>
                      </div>
                    )}
                    {productUsage.orders === 0 && productUsage.recipes === 0 && productUsage.stockMovements === 0 && (
                      <p className="text-green-400 text-center py-2">✅ Not used anywhere - Safe to archive</p>
                    )}
                  </div>
                </div>

                {productUsage.orders > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ <strong>Note:</strong> Historical orders will still reference this product. Archiving preserves data integrity.
                    </p>
                  </div>
                )}

                {productUsage.recipes > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <p className="text-orange-400 text-xs">
                      🔧 <strong>Warning:</strong> This product is used in recipes. Consider updating recipes first.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t border-gray-700 flex gap-3">
              <button
                onClick={() => { setConfirmDelete(null); setProductUsage(null); }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-bold transition"
                disabled={checkingUsage}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                disabled={checkingUsage}
              >
                {checkingUsage ? '⏳ Checking...' : '🗑️ Archive Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockControlPage;
