import { useState } from 'react';
import { useProductStore } from '../stores/productStore';

const categories = ['all', 'bases', 'meats', 'seafood', 'veggies', 'noodles', 'drinks'];

const StockControlPage = () => {
  const { products, search, addProduct, updateProduct, updateStock, updateReorderPoint, deleteProduct, setSearch } = useProductStore();

  const [activeTab, setActiveTab] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{ id: number; name: string; category: string; stock: number; unit: string; reorderPoint: number; price: number; emoji: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [formData, setFormData] = useState({ name: '', category: 'bases', stock: 0, unit: 'packs', reorderPoint: 10, price: 0, emoji: '' });

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === 'all' || p.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const lowStockItems = products.filter(p => p.stock <= p.reorderPoint);

  const handleAdd = () => { if (!formData.name) return; addProduct(formData); setShowAddModal(false); setFormData({ name: '', category: 'bases', stock: 0, unit: 'packs', reorderPoint: 10, price: 0, emoji: '' }); };
  const handleEditSave = () => { if (!editingProduct) return; updateProduct(editingProduct.id, editingProduct); setShowEditModal(false); setEditingProduct(null); };
  const handleDelete = (id: number) => { deleteProduct(id); setConfirmDelete(null); };

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">📦 Stock Control</h1>
          <p className="text-gray-400 mt-1">Manage inventory and track stock levels</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold transition">+ Add Stock</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Products</p>
          <p className="text-3xl font-bold text-green-400">{products.length}</p>
        </div>
        <div className="bg-red-500/20 border border-red-500 rounded-xl p-4">
          <p className="text-red-400 text-sm font-semibold">Low Stock Alert</p>
          <p className="text-3xl font-bold text-red-400">{lowStockItems.length}</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <p className="text-yellow-400 text-sm font-semibold">In Stock</p>
          <p className="text-3xl font-bold text-yellow-400">{products.length - lowStockItems.length}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input type="text" placeholder="🔍 Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)} className={`px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${activeTab === cat ? 'bg-yellow-500 text-black ring-2 ring-yellow-500' : 'bg-[#272a30] text-gray-300 hover:bg-[#2f333a]'}`}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-gray-700 text-left text-gray-400">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Reorder Pt</th>
              <th className="p-4">Status</th>
              <th className="p-4">Price</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-400">No products found</td></tr>
            ) : filteredProducts.map(product => (
              <tr key={product.id} className="border-b border-gray-800 hover:bg-[#2f333a] transition">
                <td className="p-4 text-white font-semibold">{product.emoji} {product.name}</td>
                <td className="p-4 text-gray-300 capitalize">{product.category}</td>
                <td className="p-4">
                  <input type="number" value={product.stock} onChange={(e) => updateStock(product.id, parseInt(e.target.value) || 0)} className="w-20 bg-[#1e2128] border border-gray-600 rounded px-2 py-1 text-white text-center outline-none" />
                  <span className="ml-2 text-gray-400 text-sm">{product.unit}</span>
                </td>
                <td className="p-4">
                  <input type="number" value={product.reorderPoint} onChange={(e) => updateReorderPoint(product.id, parseInt(e.target.value) || 0)} className="w-20 bg-[#1e2128] border border-gray-600 rounded px-2 py-1 text-white text-center outline-none" />
                  <span className="ml-2 text-gray-400 text-sm">{product.unit}</span>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock <= product.reorderPoint ? 'bg-red-500/20 text-red-400 border border-red-500' : 'bg-green-500/20 text-green-400 border border-green-500'}`}>
                    {product.stock <= product.reorderPoint ? '⚠️ LOW' : '✅ OK'}
                  </span>
                </td>
                <td className="p-4 text-green-400 font-bold">${product.price.toFixed(2)}</td>
                <td className="p-4 space-x-2">
                  <button onClick={() => { setEditingProduct({...product}); setShowEditModal(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">Edit</button>
                  <button onClick={() => setConfirmDelete(product.id)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">➕ Add Product</h2>
            <div className="space-y-3">
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Product Name" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white">
                <option value="bases">🍲 Bases</option>
                <option value="meats">🥩 Meats</option>
                <option value="seafood">🦐 Seafood</option>
                <option value="veggies">🥬 Vegetables</option>
                <option value="noodles">🍜 Noodles</option>
                <option value="drinks">🍹 Drinks</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={formData.emoji} onChange={(e) => setFormData({...formData, emoji: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white text-center text-xl" placeholder="🔥" />
                <input type="text" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Unit" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Stock" />
                <input type="number" value={formData.reorderPoint} onChange={(e) => setFormData({...formData, reorderPoint: parseInt(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Reorder" />
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Price" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleAdd} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Add Product</button>
                <button onClick={() => setShowAddModal(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Product</h2>
            <div className="space-y-3">
              <p className="text-yellow-400 text-lg font-bold">{editingProduct.emoji} {editingProduct.name}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 text-sm">Stock</label>
                  <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Reorder Pt</label>
                  <input type="number" value={editingProduct.reorderPoint} onChange={(e) => setEditingProduct({...editingProduct, reorderPoint: parseInt(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 text-sm">Price</label>
                  <input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Unit</label>
                  <input type="text" value={editingProduct.unit} onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditSave} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save</button>
                <button onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
              </div>
            </div>
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