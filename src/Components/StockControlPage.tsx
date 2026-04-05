import { useState, useEffect } from 'react';
import { useProductStore } from '../stores/productsStore';
import { useStockMovementStore } from '../stores/stockMovementStore';
import { useToastStore } from '../stores/toastStore';
import EmojiPicker from '../Components/EmojiPicker';
import type { Product, ProductCategory, StockMovement } from '../types';
import { convertUnit, areUnitsCompatible } from '../lib/unit-conversion';

const categoryList: (ProductCategory | 'all')[] = ['all', 'bases', 'meats', 'seafood', 'veggies', 'noodles', 'drinks', 'sauces'];
const movementTypes: { value: StockMovement['movement_type']; label: string; icon: string; color: string }[] = [
  { value: 'purchase', label: 'Purchase In', icon: '📥', color: 'bg-green-500' },
  { value: 'sale', label: 'Sale Out', icon: '📤', color: 'bg-blue-500' },
  { value: 'adjustment', label: 'Adjustment', icon: '🔧', color: 'bg-yellow-500' },
  { value: 'waste', label: 'Waste/Spoil', icon: '🗑️', color: 'bg-red-500' },
  { value: 'return', label: 'Return', icon: '↩️', color: 'bg-purple-500' },
];

const StockControlPage = () => {
  const { products, loading, error, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const { movements, fetchMovements } = useStockMovementStore();
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<string>('all');
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

  const [formData, setFormData] = useState({
    name: '', category: 'bases' as ProductCategory, stock_quantity: 0, unit: 'pcs',
    base_unit: '', conversion_factor: 1, reorder_point: 10, price: 0, cost_price: 0, emoji: '',
  });
  const [purchaseData, setPurchaseData] = useState({
    quantity: 0, unit: 'pcs', cost_per_unit: 0, notes: '',
  });

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { if (selectedProductId) fetchMovements(selectedProductId); }, [selectedProductId, fetchMovements]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const lowStockItems = products.filter(p => p.stock_quantity <= p.reorder_point);
  const totalInventoryValue = products.reduce((s, p) => s + p.stock_quantity * (p.cost_price || p.price), 0);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const productMovements = movements.filter(m => m.product_id === selectedProductId);

  const handleAdd = async () => {
    if (!formData.name) { addToast('Product name is required', 'warning'); return; }
    await addProduct(formData);
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
    await deleteProduct(id);
    setConfirmDelete(null);
    addToast('Product deleted', 'info');
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
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
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
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Products</p>
          <p className="text-3xl font-bold text-green-400">{loading ? '...' : products.length}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
          <p className="text-red-400 text-sm font-semibold">Low Stock</p>
          <p className="text-3xl font-bold text-red-400">{lowStockItems.length}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">In Stock</p>
          <p className="text-3xl font-bold text-yellow-400">{products.length - lowStockItems.length}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Inventory Value</p>
          <p className="text-3xl font-bold text-blue-400">${totalInventoryValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input type="text" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categoryList.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === cat ? 'bg-yellow-500 text-black ring-2 ring-yellow-500' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'}`}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No products found</td></tr>
              ) : filteredProducts.map(product => (
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
                    <button onClick={() => setConfirmDelete(product.id!)} className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">➕ Add Product</h2>

            {/* Emoji + Name */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setEmojiTarget('add'); setShowEmojiPicker(!showEmojiPicker); }}
                className="w-14 h-14 rounded-lg bg-[#1e2128] border border-gray-600 text-3xl flex items-center justify-center hover:border-yellow-500"
              >
                {formData.emoji || '📦'}
              </button>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="flex-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Product Name *" />
            </div>

            {showEmojiPicker && emojiTarget === 'add' && (
              <div className="mb-3">
                <EmojiPicker
                  onSelect={(emoji) => { setFormData({...formData, emoji}); setShowEmojiPicker(false); }}
                  currentEmoji={formData.emoji}
                />
              </div>
            )}

            <div className="space-y-3">
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as ProductCategory})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                <option value="bases">🍲 Bases</option>
                <option value="meats">🥩 Meats</option>
                <option value="seafood">🦐 Seafood</option>
                <option value="veggies">🥬 Vegetables</option>
                <option value="noodles">🍜 Noodles</option>
                <option value="drinks">🍹 Drinks</option>
                <option value="sauces">🧂 Sauces</option>
              </select>

              {/* Unit + Conversion */}
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Unit (e.g. kg)" />
                <input type="text" value={formData.base_unit} onChange={(e) => setFormData({...formData, base_unit: e.target.value})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Base unit" />
                <input type="number" step="0.01" value={formData.conversion_factor || 1} onChange={(e) => setFormData({...formData, conversion_factor: parseFloat(e.target.value) || 1})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Factor" />
              </div>
              <p className="text-gray-500 text-xs">Base unit = smallest unit. Factor = how many base units in 1 main unit (e.g., 1 kg = 1000 g → factor 1000)</p>

              <div className="grid grid-cols-3 gap-2">
                <input type="number" value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: parseFloat(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Stock" />
                <input type="number" value={formData.reorder_point} onChange={(e) => setFormData({...formData, reorder_point: parseFloat(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Reorder" />
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Price" />
              </div>
              <input type="number" step="0.01" value={formData.cost_price} onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Cost Price" />

              <div className="flex gap-3 pt-2">
                <button onClick={handleAdd} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Add Product</button>
                <button onClick={() => { setShowAddModal(false); setShowEmojiPicker(false); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
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

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-red-600 p-6 w-80 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white font-bold text-lg mb-2">Delete Product?</p>
            <p className="text-gray-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-500">Delete</button>
              <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockControlPage;
