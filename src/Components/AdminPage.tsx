import { useState, useEffect, type FormEvent } from 'react';
import { useTableStore, type TableItem } from '../stores/tableStore';
import { useCategoryStore, type Category } from '../stores/categoryStore';
import { useToastStore } from '../stores/toastStore';
import EmojiPicker from '../Components/EmojiPicker';

const AdminPage = () => {
  const addToast = useToastStore((s) => s.addToast);

  // Tables
  const { tables, loading: tablesLoading, fetchTables, addTable, updateTable, deleteTable } = useTableStore();
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [tableForm, setTableForm] = useState({ table_number: 1, seats: 4 });

  // Categories
  const { categories, loading: catsLoading, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const [showCatForm, setShowCatForm] = useState(false);
  const [showCatEmojiPicker, setShowCatEmojiPicker] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', parent_id: null as number | null, emoji: '', sort_order: 0 });

  useEffect(() => { fetchTables(); fetchCategories(); }, [fetchTables, fetchCategories]);

  const allCategories = categories.flatMap(cat => [cat, ...(cat.children || [])]);

  // Table handlers
  const handleTableSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      const ok = await updateTable(editingTable.id!, tableForm);
      if (ok) { addToast('Table updated', 'success'); setEditingTable(null); setShowTableForm(false); }
      else addToast('Failed to update', 'error');
    } else {
      const ok = await addTable({ ...tableForm, is_active: true });
      if (ok) { addToast(`Table ${tableForm.table_number} added`, 'success'); setTableForm({ table_number: tables.length + 1, seats: 4 }); setShowTableForm(false); }
      else addToast('Failed to add', 'error');
    }
  };

  const handleDeleteTable = async (id: number) => {
    const ok = await deleteTable(id);
    if (ok) addToast('Table deleted', 'info');
    else addToast('Failed to delete', 'error');
  };

  // Category handlers
  const handleCatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!catForm.name.trim()) return;
    if (editingCat) {
      const ok = await updateCategory(editingCat.id!, catForm);
      if (ok) { addToast('Category updated', 'success'); setEditingCat(null); setShowCatForm(false); }
      else addToast('Failed to update', 'error');
    } else {
      const ok = await addCategory({ ...catForm, is_active: true });
      if (ok) { addToast(`Category "${catForm.name}" added`, 'success'); setCatForm({ name: '', parent_id: null, emoji: '', sort_order: 0 }); setShowCatForm(false); }
      else addToast('Failed to add', 'error');
    }
  };

  const handleDeleteCat = async (id: number) => {
    const ok = await deleteCategory(id);
    if (ok) addToast('Category deleted', 'info');
    else addToast('Failed to delete', 'error');
  };

  return (
    <div className="p-6 bg-[#1e2128] min-h-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-white mb-6">⚙️ Admin Settings</h1>

      {/* Tables */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">🪑 Tables</h2>
            <p className="text-gray-400 text-sm">{tables.length} tables configured</p>
          </div>
          <button onClick={() => { setEditingTable(null); setTableForm({ table_number: tables.length + 1, seats: 4 }); setShowTableForm(!showTableForm); }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
            {showTableForm ? '✕ Cancel' : '+ Add Table'}
          </button>
        </div>

        {tablesLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tables.map(t => (
              <div key={t.id} className={`rounded-lg border p-3 text-center group transition ${t.is_active ? 'bg-[#1e2128] border-gray-600' : 'bg-gray-800/50 border-gray-700 opacity-60'}`}>
                <p className="text-2xl mb-1">🪑</p>
                <p className="text-white font-bold">Table {t.table_number}</p>
                <p className="text-gray-500 text-xs">{t.seats} seats</p>
                <div className="flex gap-1 mt-2 justify-center opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => { setEditingTable(t); setTableForm({ table_number: t.table_number, seats: t.seats }); setShowTableForm(true); }} className="text-blue-400 text-xs hover:underline">Edit</button>
                  <button onClick={() => handleDeleteTable(t.id!)} className="text-red-400 text-xs hover:underline">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showTableForm && (
          <form onSubmit={handleTableSubmit} className="mt-4 p-4 bg-[#1e2128] rounded-lg border border-gray-600">
            <div className="flex gap-3 items-end">
              <div>
                <label className="text-gray-400 text-xs">Table Number</label>
                <input type="number" value={tableForm.table_number} onChange={(e) => setTableForm({...tableForm, table_number: parseInt(e.target.value) || 1})} className="w-24 mt-1 px-3 py-2 rounded bg-[#272a30] border border-gray-600 text-white text-sm" required />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Seats</label>
                <input type="number" value={tableForm.seats} onChange={(e) => setTableForm({...tableForm, seats: parseInt(e.target.value) || 4})} className="w-20 mt-1 px-3 py-2 rounded bg-[#272a30] border border-gray-600 text-white text-sm" required />
              </div>
              <button type="submit" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
                {editingTable ? 'Update' : 'Add'}
              </button>
              {editingTable && <button type="button" onClick={() => { setEditingTable(null); setShowTableForm(false); }} className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">Cancel</button>}
            </div>
          </form>
        )}
      </div>

      {/* Categories */}
      <div className="bg-[#272a30] rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">📂 Product Categories</h2>
            <p className="text-gray-400 text-sm">{allCategories.length} categories</p>
          </div>
          <button onClick={() => { setEditingCat(null); setCatForm({ name: '', parent_id: null, emoji: '', sort_order: 0 }); setShowCatForm(!showCatForm); }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm">
            {showCatForm ? '✕ Cancel' : '+ Add Category'}
          </button>
        </div>

        {catsLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-sm">No categories yet. Add your first one!</p>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="bg-[#1e2128] rounded-lg border border-gray-600 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.emoji || '📁'}</span>
                    <span className="text-white font-semibold">{cat.name}</span>
                    <span className="text-gray-500 text-xs">Order: {cat.sort_order}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingCat(cat); setCatForm({ name: cat.name, parent_id: cat.parent_id ?? null, emoji: cat.emoji || '', sort_order: cat.sort_order }); setShowCatForm(true); setShowCatEmojiPicker(false); }} className="text-blue-400 text-xs hover:underline">Edit</button>
                    <button onClick={() => handleDeleteCat(cat.id!)} className="text-red-400 text-xs hover:underline">Del</button>
                  </div>
                </div>
                {cat.children && cat.children.length > 0 && (
                  <div className="ml-8 mt-2 flex flex-wrap gap-2">
                    {cat.children.map(sub => (
                      <div key={sub.id} className="bg-[#272a30] rounded px-2 py-1 flex items-center gap-2 text-sm">
                        <span>{sub.emoji || '📎'}</span>
                        <span className="text-gray-300">{sub.name}</span>
                        <button onClick={() => { setEditingCat(sub); setCatForm({ name: sub.name, parent_id: sub.parent_id ?? null, emoji: sub.emoji || '', sort_order: sub.sort_order }); setShowCatForm(true); setShowCatEmojiPicker(false); }} className="text-blue-400 text-xs hover:underline ml-1">Edit</button>
                        <button onClick={() => handleDeleteCat(sub.id!)} className="text-red-400 text-xs hover:underline">Del</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showCatForm && (
          <form onSubmit={handleCatSubmit} className="mt-4 p-4 bg-[#1e2128] rounded-lg border border-gray-600">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-gray-400 text-xs">Name</label>
                <input type="text" value={catForm.name} onChange={(e) => setCatForm({...catForm, name: e.target.value})} className="mt-1 px-3 py-2 rounded bg-[#272a30] border border-gray-600 text-white text-sm" placeholder="Category name" required />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Emoji</label>
                <div className="flex items-center gap-2 mt-1">
                  <button type="button" onClick={() => setShowCatEmojiPicker(!showCatEmojiPicker)} className="w-10 h-10 rounded bg-[#272a30] border border-gray-600 text-xl flex items-center justify-center hover:border-yellow-500">{catForm.emoji || '😀'}</button>
                </div>
                {showCatEmojiPicker && (
                  <div className="absolute z-50 mt-2">
                    <EmojiPicker onSelect={(emoji) => { setCatForm({...catForm, emoji}); setShowCatEmojiPicker(false); }} currentEmoji={catForm.emoji} />
                  </div>
                )}
              </div>
              <div>
                <label className="text-gray-400 text-xs">Parent (optional)</label>
                <select value={catForm.parent_id || ''} onChange={(e) => setCatForm({...catForm, parent_id: e.target.value ? Number(e.target.value) : null})} className="mt-1 px-3 py-2 rounded bg-[#272a30] border border-gray-600 text-white text-sm">
                  <option value="">None (top-level)</option>
                  {categories.filter(c => c.id !== (editingCat?.id || null)).map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs">Sort Order</label>
                <input type="number" value={catForm.sort_order} onChange={(e) => setCatForm({...catForm, sort_order: parseInt(e.target.value) || 0})} className="w-20 mt-1 px-3 py-2 rounded bg-[#272a30] border border-gray-600 text-white text-sm" />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded-lg font-bold text-sm">{editingCat ? 'Update' : 'Add'}</button>
                <button type="button" onClick={() => { setShowCatForm(false); setEditingCat(null); }} className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
