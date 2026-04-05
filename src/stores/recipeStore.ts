// CRUD for Recipes + Ingredients
import { create } from 'zustand';
import type { Recipe, RecipeIngredient } from '../types';
import { supabase } from '../lib/supabase';

interface RecipeState {
  recipes: (Recipe & { ingredients?: RecipeIngredient[] })[];
  loading: boolean;
  error: string | null;

  fetchRecipes: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>, ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[]) => Promise<boolean>;
  updateRecipe: (id: number, recipe: Partial<Recipe>, ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[]) => Promise<boolean>;
  deleteRecipe: (id: number) => Promise<boolean>;
  deductIngredients: (recipeId: number, quantity: number) => Promise<{ success: boolean; errors: string[] }>;
}

export const useRecipeStore = create<RecipeState>((set, get) => ({
  recipes: [],
  loading: false,
  error: null,

  fetchRecipes: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*, recipe_ingredients(*, products(name, emoji))')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;

      // Enrich with product details
      const enriched = (data || []).map((r: Record<string, unknown>) => {
        const rawIngredients = r.recipe_ingredients as unknown[] | undefined;
        const ingredients: RecipeIngredient[] = (rawIngredients || []).map((ing: unknown) => {
          const row = ing as Record<string, unknown>;
          const product = row.products as Record<string, unknown> | undefined;
          return {
            id: row.id as number | undefined,
            recipe_id: row.recipe_id as number | undefined,
            product_id: row.product_id as number,
            product_name: product?.name as string | undefined,
            product_emoji: product?.emoji as string | undefined,
            quantity: row.quantity as number,
            unit: row.unit as string,
            notes: row.notes as string | undefined,
          };
        });

        return {
          id: r.id as number | undefined,
          name: r.name as string,
          category: r.category as string,
          description: r.description as string | undefined,
          price: r.price as number,
          cost_price: r.cost_price as number | undefined,
          emoji: r.emoji as string | undefined,
          is_active: r.is_active as boolean,
          ingredients,
          created_at: r.created_at as string | undefined,
        };
      });

      set({ recipes: enriched });
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to fetch recipes' });
    } finally {
      set({ loading: false });
    }
  },

  addRecipe: async (recipe, ingredients) => {
    set({ loading: true, error: null });
    try {
      // 1. Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([{ ...recipe }])
        .select()
        .single();
      if (recipeError) throw recipeError;

      // 2. Insert ingredients
      if (ingredients.length > 0) {
        const ingredientRows = ingredients.map((ing) => ({
          recipe_id: recipeData.id,
          product_id: ing.product_id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        }));
        const { error: ingError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientRows);
        if (ingError) throw ingError;
      }

      // 3. Refresh
      await get().fetchRecipes();
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to add recipe' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  updateRecipe: async (id, recipe, ingredients) => {
    set({ loading: true, error: null });
    try {
      // 1. Update recipe
      const { error: recipeError } = await supabase
        .from('recipes')
        .update(recipe)
        .eq('id', id);
      if (recipeError) throw recipeError;

      // 2. Delete old ingredients and insert new ones
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

      if (ingredients.length > 0) {
        const ingredientRows = ingredients.map((ing) => ({
          recipe_id: id,
          product_id: ing.product_id,
          quantity: ing.quantity,
          unit: ing.unit,
          notes: ing.notes,
        }));
        const { error: ingError } = await supabase
          .from('recipe_ingredients')
          .insert(ingredientRows);
        if (ingError) throw ingError;
      }

      // 3. Refresh
      await get().fetchRecipes();
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to update recipe' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteRecipe: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) throw error;
      set((state) => ({ recipes: state.recipes.filter((r) => r.id !== id) }));
      return true;
    } catch (e: unknown) {
      set({ error: e instanceof Error ? e.message : 'Failed to delete recipe' });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Deduct all ingredients for a recipe from product stock.
   * Called when an order containing a recipe is completed.
   */
  deductIngredients: async (recipeId: number, quantity: number) => {
    const errors: string[] = [];
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe || !recipe.ingredients) {
      return { success: false, errors: ['Recipe not found or has no ingredients'] };
    }

    for (const ing of recipe.ingredients) {
      const totalDeduct = ing.quantity * quantity;

      // Get current stock
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('stock_quantity, name, unit')
        .eq('id', ing.product_id)
        .single();

      if (fetchErr) {
        errors.push(`Could not find product ${ing.product_id}`);
        continue;
      }

      const newStock = Math.max(0, product.stock_quantity - totalDeduct);

      // Update stock
      const { error: updateErr } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', ing.product_id);

      if (updateErr) {
        errors.push(`Failed to update ${product.name}: ${updateErr.message}`);
        continue;
      }

      // Record movement
      await supabase.from('stock_movements').insert([{
        product_id: ing.product_id,
        movement_type: 'sale',
        quantity: totalDeduct,
        unit: ing.unit,
        reference: `Recipe: ${recipe.name} x${quantity}`,
        notes: `Ingredient for ${recipe.name}`,
      }]);
    }

    return { success: errors.length === 0, errors };
  },
}));
