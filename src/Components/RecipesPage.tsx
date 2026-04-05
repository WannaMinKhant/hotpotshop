import { useState, useEffect } from 'react';
import { useRecipeStore } from '../stores/recipeStore';
import { useProductStore } from '../stores/productsStore';
import { useToastStore } from '../stores/toastStore';
import EmojiPicker from '../Components/EmojiPicker';
import type { Recipe, RecipeIngredient } from '../types';

const RecipesPage = () => {
  const { recipes, loading, error, fetchRecipes, addRecipe, updateRecipe, deleteRecipe } = useRecipeStore();
  const { products, fetchProducts } = useProductStore();
  const addToast = useToastStore((s) => s.addToast);

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [addIngredientProductId, setAddIngredientProductId] = useState<number | null>(null);

  useEffect(() => { fetchRecipes(); fetchProducts(); }, [fetchRecipes, fetchProducts]);

  const filteredRecipes = recipes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const computedCost = ingredients.reduce((sum, ing) => {
    const product = products.find(p => p.id === ing.product_id);
    return sum + (product?.cost_price || product?.price || 0) * ing.quantity;
  }, 0);

  const handleAdd = async () => {
    if (!formData.name.trim()) { addToast('Recipe name is required', 'warning'); return; }
    if (ingredients.length === 0) { addToast('Add at least one ingredient', 'warning'); return; }
    const success = await addRecipe(formData, ingredients.map(ing => ({
      product_id: ing.product_id,
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
    })));
    if (success) {
      setShowAddModal(false);
      setIngredients([]);
      setFormData({ name: '', category: 'curry', description: '', price: 0, cost_price: 0, emoji: '', is_active: true });
      addToast('Recipe created!', 'success');
    } else {
      addToast(error || 'Failed to create recipe', 'error');
    }
  };

  const handleEditSave = async () => {
    if (!editingRecipe?.id) return;
    if (ingredients.length === 0) { addToast('Add at least one ingredient', 'warning'); return; }
    const success = await updateRecipe(editingRecipe.id, {
      name: editingRecipe.name,
      category: editingRecipe.category,
      description: editingRecipe.description,
      price: editingRecipe.price,
      cost_price: editingRecipe.cost_price,
      emoji: editingRecipe.emoji,
    }, ingredients.map(ing => ({
      product_id: ing.product_id,
      quantity: ing.quantity,
      unit: ing.unit,
      notes: ing.notes,
    })));
    if (success) {
      setShowEditModal(false);
      setEditingRecipe(null);
      addToast('Recipe updated!', 'success');
    } else {
      addToast(error || 'Failed to update recipe', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteRecipe(id);
    if (success) {
      setConfirmDelete(null);
      addToast('Recipe deleted', 'info');
    } else {
      addToast(error || 'Failed to delete recipe', 'error');
    }
  };

  const addIngredient = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (!product || ingredients.find(ing => ing.product_id === productId)) return;
    setIngredients([...ingredients, {
      product_id: productId,
      product_name: product.name,
      product_emoji: product.emoji,
      quantity: 1,
      unit: product.unit,
    }]);
    setAddIngredientProductId(null);
  };

  const removeIngredient = (productId: number) => {
    setIngredients(ingredients.filter(ing => ing.product_id !== productId));
  };

  const updateIngredient = (productId: number, updates: Partial<RecipeIngredient>) => {
    setIngredients(ingredients.map(ing =>
      ing.product_id === productId ? { ...ing, ...updates } : ing
    ));
  };

  const [formData, setFormData] = useState({
    name: '', category: 'curry', description: '', price: 0, cost_price: 0, emoji: '', is_active: true,
  });

  const availableProducts = products.filter(p => !ingredients.find(ing => ing.product_id === p.id));

  return (
    <div className="p-6 bg-[#1e2128] h-screen overflow-y-auto">
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">{error}</div>}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">🍛 Recipes / Menu</h1>
          <p className="text-gray-400">Manage dishes and their ingredients</p>
        </div>
        <button onClick={() => { setIngredients([]); setFormData({ name: '', category: 'curry', description: '', price: 0, cost_price: 0, emoji: '', is_active: true }); setShowAddModal(true); }} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold">
          + Add Recipe
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/20 border border-green-500 rounded-xl p-4">
          <p className="text-green-400 text-sm font-semibold">Total Recipes</p>
          <p className="text-3xl font-bold text-green-400">{loading ? '...' : recipes.length}</p>
        </div>
        <div className="bg-blue-500/20 border border-blue-500 rounded-xl p-4">
          <p className="text-blue-400 text-sm font-semibold">Total Ingredients</p>
          <p className="text-3xl font-bold text-blue-400">{recipes.reduce((s, r) => s + (r.ingredients?.length || 0), 0)}</p>
        </div>
        <div className="bg-purple-500/20 border border-purple-500 rounded-xl p-4">
          <p className="text-purple-400 text-sm font-semibold">Avg Margin</p>
          <p className="text-3xl font-bold text-purple-400">
            {recipes.length ? Math.round(recipes.reduce((s, r) => {
              const cost = r.ingredients?.reduce((c, ing) => {
                const prod = products.find(p => p.id === ing.product_id);
                return c + (prod?.cost_price || prod?.price || 0) * ing.quantity;
              }, 0) || 0;
              return s + ((r.price - cost) / (r.price || 1)) * 100;
            }, 0) / recipes.length).toFixed(0) : 0}%
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="text" placeholder="🔍 Search recipes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-[#272a30] border border-gray-600 text-white outline-none" />
      </div>

      {/* Recipe Grid */}
      {loading && recipes.length === 0 ? (
        <div className="text-center text-gray-400 py-12">Loading recipes...</div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No recipes found. Add your first dish!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => {
            const ingredientCost = recipe.ingredients?.reduce((sum, ing) => {
              const product = products.find(p => p.id === ing.product_id);
              return sum + (product?.cost_price || product?.price || 0) * ing.quantity;
            }, 0) || 0;
            const margin = recipe.price > 0 ? ((recipe.price - ingredientCost) / recipe.price * 100).toFixed(0) : '0';

            return (
              <div key={recipe.id} className="bg-[#272a30] rounded-xl border border-gray-700 overflow-hidden hover:border-yellow-400 transition-all">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">{recipe.emoji || '🍽️'}</span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{recipe.name}</h3>
                      <p className="text-gray-400 text-sm capitalize">{recipe.category}</p>
                    </div>
                  </div>

                  {/* Ingredients preview */}
                  <div className="mb-3">
                    <p className="text-gray-500 text-xs mb-1">Ingredients ({recipe.ingredients?.length || 0}):</p>
                    <div className="flex flex-wrap gap-1">
                      {recipe.ingredients?.slice(0, 4).map(ing => (
                        <span key={ing.product_id} className="text-xs bg-[#1e2128] text-gray-300 px-2 py-1 rounded">
                          {ing.product_emoji} {ing.product_name} ×{ing.quantity}
                        </span>
                      ))}
                      {(recipe.ingredients?.length || 0) > 4 && (
                        <span className="text-xs text-gray-500">+{(recipe.ingredients?.length || 0) - 4} more</span>
                      )}
                    </div>
                  </div>

                  {/* Price / Cost / Margin */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#1e2128] p-2 rounded text-center">
                      <p className="text-gray-500 text-xs">Price</p>
                      <p className="text-green-400 font-bold">${recipe.price.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1e2128] p-2 rounded text-center">
                      <p className="text-gray-500 text-xs">Cost</p>
                      <p className="text-yellow-400 font-bold">${ingredientCost.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1e2128] p-2 rounded text-center">
                      <p className="text-gray-500 text-xs">Margin</p>
                      <p className="text-blue-400 font-bold">{margin}%</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingRecipe(recipe); setIngredients(recipe.ingredients || []); setShowEditModal(true); }} className="flex-1 bg-blue-500 hover:bg-blue-400 text-white py-2 rounded-lg font-semibold text-sm">✏️ Edit</button>
                    <button onClick={() => setConfirmDelete(recipe.id!)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg text-sm">🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD RECIPE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">➕ Add Recipe</h2>

            {/* Emoji + Name */}
            <div className="flex gap-2 mb-3">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-14 h-14 rounded-lg bg-[#1e2128] border border-gray-600 text-3xl flex items-center justify-center hover:border-yellow-500">
                {formData.emoji || '🍽️'}
              </button>
              <div className="flex-1 space-y-2">
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Recipe Name *" />
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Category (curry, soup, etc)" />
              </div>
            </div>

            {showEmojiPicker && (
              <div className="mb-3">
                <EmojiPicker onSelect={(emoji) => { setFormData({...formData, emoji}); setShowEmojiPicker(false); }} currentEmoji={formData.emoji} />
              </div>
            )}

            <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white mb-3" placeholder="Description" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-gray-400 text-xs">Selling Price ($)</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Computed Cost: ${computedCost.toFixed(2)}</label>
                <input type="text" disabled value={`${ingredients.length} ingredients`} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-gray-400" />
              </div>
            </div>

            {/* Ingredients Builder */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold text-sm">🥘 Ingredients</h3>
                {availableProducts.length > 0 && (
                  <button onClick={() => setAddIngredientProductId(availableProducts[0].id!)} className="text-green-400 text-xs hover:underline">+ Add</button>
                )}
              </div>

              {/* Add ingredient selector */}
              {addIngredientProductId && (
                <div className="mb-2 flex gap-2">
                  <select
                    value={addIngredientProductId}
                    onChange={(e) => setAddIngredientProductId(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white text-sm"
                  >
                    {availableProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.emoji} {p.name} ({p.stock_quantity} {p.unit})</option>
                    ))}
                  </select>
                  <button onClick={() => addIngredient(addIngredientProductId)} className="bg-green-500 text-white px-3 rounded text-sm font-bold">Add</button>
                  <button onClick={() => setAddIngredientProductId(null)} className="bg-gray-600 text-white px-3 rounded text-sm">✕</button>
                </div>
              )}

              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No ingredients yet</p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map(ing => (
                    <div key={ing.product_id} className="flex items-center gap-2 bg-[#1e2128] p-2 rounded">
                      <span className="text-xl">{ing.product_emoji}</span>
                      <span className="text-white text-sm flex-1 truncate">{ing.product_name}</span>
                      <input type="number" step="0.01" value={ing.quantity} onChange={(e) => updateIngredient(ing.product_id, { quantity: parseFloat(e.target.value) || 0 })} className="w-16 px-2 py-1 rounded bg-[#272a30] border border-gray-600 text-white text-center text-sm" />
                      <input type="text" value={ing.unit} onChange={(e) => updateIngredient(ing.product_id, { unit: e.target.value })} className="w-16 px-2 py-1 rounded bg-[#272a30] border border-gray-600 text-white text-center text-sm" />
                      <button onClick={() => removeIngredient(ing.product_id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleAdd} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Add Recipe</button>
              <button onClick={() => { setShowAddModal(false); setShowEmojiPicker(false); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECIPE MODAL */}
      {showEditModal && editingRecipe && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-gray-600 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">✏️ Edit Recipe</h2>

            <div className="flex gap-2 mb-3">
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-14 h-14 rounded-lg bg-[#1e2128] border border-gray-600 text-3xl flex items-center justify-center hover:border-yellow-500">
                {editingRecipe.emoji || '🍽️'}
              </button>
              <div className="flex-1 space-y-2">
                <input type="text" value={editingRecipe.name} onChange={(e) => setEditingRecipe({...editingRecipe, name: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Recipe Name *" />
                <input type="text" value={editingRecipe.category} onChange={(e) => setEditingRecipe({...editingRecipe, category: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" placeholder="Category" />
              </div>
            </div>

            {showEmojiPicker && (
              <div className="mb-3">
                <EmojiPicker onSelect={(emoji) => { setEditingRecipe({...editingRecipe, emoji}); setShowEmojiPicker(false); }} currentEmoji={editingRecipe.emoji} />
              </div>
            )}

            <input type="text" value={editingRecipe.description || ''} onChange={(e) => setEditingRecipe({...editingRecipe, description: e.target.value})} className="w-full px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white mb-3" placeholder="Description" />

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-gray-400 text-xs">Selling Price ($)</label>
                <input type="number" step="0.01" value={editingRecipe.price} onChange={(e) => setEditingRecipe({...editingRecipe, price: parseFloat(e.target.value) || 0})} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-gray-400 text-xs">Computed Cost: ${computedCost.toFixed(2)}</label>
                <input type="text" disabled value={`${ingredients.length} ingredients`} className="w-full mt-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-gray-400" />
              </div>
            </div>

            {/* Ingredients Builder */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold text-sm">🥘 Ingredients</h3>
                {availableProducts.length > 0 && (
                  <button onClick={() => setAddIngredientProductId(availableProducts[0].id!)} className="text-green-400 text-xs hover:underline">+ Add</button>
                )}
              </div>

              {addIngredientProductId && (
                <div className="mb-2 flex gap-2">
                  <select value={addIngredientProductId} onChange={(e) => setAddIngredientProductId(Number(e.target.value))} className="flex-1 px-3 py-2 rounded bg-[#1e2128] border border-gray-600 text-white text-sm">
                    {availableProducts.map(p => (<option key={p.id} value={p.id}>{p.emoji} {p.name} ({p.stock_quantity} {p.unit})</option>))}
                  </select>
                  <button onClick={() => addIngredient(addIngredientProductId)} className="bg-green-500 text-white px-3 rounded text-sm font-bold">Add</button>
                  <button onClick={() => setAddIngredientProductId(null)} className="bg-gray-600 text-white px-3 rounded text-sm">✕</button>
                </div>
              )}

              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No ingredients</p>
              ) : (
                <div className="space-y-2">
                  {ingredients.map(ing => (
                    <div key={ing.product_id} className="flex items-center gap-2 bg-[#1e2128] p-2 rounded">
                      <span className="text-xl">{ing.product_emoji}</span>
                      <span className="text-white text-sm flex-1 truncate">{ing.product_name}</span>
                      <input type="number" step="0.01" value={ing.quantity} onChange={(e) => updateIngredient(ing.product_id, { quantity: parseFloat(e.target.value) || 0 })} className="w-16 px-2 py-1 rounded bg-[#272a30] border border-gray-600 text-white text-center text-sm" />
                      <input type="text" value={ing.unit} onChange={(e) => updateIngredient(ing.product_id, { unit: e.target.value })} className="w-16 px-2 py-1 rounded bg-[#272a30] border border-gray-600 text-white text-center text-sm" />
                      <button onClick={() => removeIngredient(ing.product_id)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={handleEditSave} className="flex-1 bg-green-500 hover:bg-green-400 text-black py-3 rounded-lg font-bold">Save</button>
              <button onClick={() => { setShowEditModal(false); setEditingRecipe(null); }} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg font-bold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#272a30] rounded-xl border border-red-600 p-6 w-80 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-white font-bold text-lg mb-2">Delete Recipe?</p>
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

export default RecipesPage;
