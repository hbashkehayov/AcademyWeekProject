'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import type { Recipe } from '@/types';

export default function RecipeBuilder() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedRecipes();
  }, []);

  const fetchFeaturedRecipes = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFeaturedRecipes();
      setRecipes(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError('Failed to load recipes');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRecipe = async (recipe: Recipe) => {
    try {
      await apiService.incrementRecipeUses(recipe.id);
      // Update local state to reflect usage increment
      setRecipes(prev => prev.map(r => 
        r.id === recipe.id 
          ? { ...r, uses_count: r.uses_count + 1 }
          : r
      ));
      
      // Here you could navigate to a recipe execution page or open a modal
      console.log('Starting recipe:', recipe.name);
    } catch (error) {
      console.error('Failed to start recipe:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-300 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-300 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getStepIcon = (stepIndex: number) => {
    const icons = ['✍️', '📱', '🎨', '⏰', '🚀', '📊', '💡', '🔧'];
    return icons[stepIndex % icons.length];
  };

  const getStepGradient = (stepIndex: number) => {
    const gradients = [
      'from-purple-500/20 to-purple-600/20',
      'from-green-500/20 to-green-600/20',
      'from-blue-500/20 to-blue-600/20',
      'from-orange-500/20 to-orange-600/20',
      'from-pink-500/20 to-pink-600/20',
      'from-indigo-500/20 to-indigo-600/20',
      'from-teal-500/20 to-teal-600/20',
      'from-red-500/20 to-red-600/20'
    ];
    return gradients[stepIndex % gradients.length];
  };

  if (loading) {
    return (
      <div className="glass-morphism p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white opacity-80 mb-2">
              AI Tool Recipes
            </h3>
            <p className="text-sm text-white opacity-60">
              Complete workflows using multiple AI tools
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
          <span className="ml-3 text-white/60">Loading recipes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-morphism p-6 rounded-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white opacity-80 mb-2">
              AI Tool Recipes
            </h3>
            <p className="text-sm text-white opacity-60">
              Complete workflows using multiple AI tools
            </p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="text-red-300 mb-2">⚠️</div>
          <p className="text-white/60">{error}</p>
          <button 
            onClick={fetchFeaturedRecipes}
            className="mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-morphism p-6 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white opacity-80 mb-2">
            AI Tool Recipes
          </h3>
          <p className="text-sm text-white opacity-60">
            Complete workflows using multiple AI tools
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recipes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/60 mb-2">📝</div>
            <p className="text-white/60">No recipes available yet</p>
          </div>
        ) : (
          recipes.slice(0, 1).map((recipe) => (
            <div key={recipe.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white opacity-90 mb-2">
                    {recipe.name}
                  </h4>
                  <p className="text-sm text-white opacity-70 mb-3">
                    {recipe.description}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              </div>
              
              {/* Recipe Stats */}
              <div className="flex items-center gap-4 text-xs text-white opacity-60 mb-4">
                <span className="flex items-center gap-1">
                  ⏰ {recipe.estimated_time ? `${recipe.estimated_time} mins` : 'Unknown'}
                </span>
                <span className="flex items-center gap-1">
                  👥 {recipe.uses_count} uses
                </span>
                <span className="flex items-center gap-1">
                  ✅ {Math.round(recipe.success_rate)}% success
                </span>
              </div>

              {/* Recipe Steps */}
              <div className="space-y-2">
                {recipe.steps.slice(0, 4).map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg border border-white/5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getStepGradient(index)} backdrop-blur-sm flex items-center justify-center border border-white/20`}>
                      <span className="text-sm">{getStepIcon(index)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white opacity-90">
                          {step.step}. {step.instruction.split(' ').slice(0, 4).join(' ')}...
                        </span>
                        <span className="text-xs text-white opacity-60">
                          using {step.tool_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recipe.steps.length > 4 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-white opacity-60">
                      +{recipe.steps.length - 4} more steps
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {recipe.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-white/10 text-white/70 text-xs px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                  {recipe.tags.length > 3 && (
                    <span className="text-white/50 text-xs px-2 py-1">
                      +{recipe.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleStartRecipe(recipe)}
                  className="flex-1 bg-gradient-to-r from-purple-500/30 to-purple-600/30 hover:from-purple-500/40 hover:to-purple-600/40 text-purple-200 border border-purple-500/30 rounded-xl py-3 px-4 font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>🚀</span>
                  <span>Start Recipe</span>
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 text-white opacity-80 transition-colors duration-200">
                  ❤️
                </button>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl py-3 px-4 text-white opacity-80 transition-colors duration-200">
                  📤
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Browse More Footer */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full py-2 text-sm font-medium text-white opacity-80 transition-colors duration-200 flex items-center justify-center space-x-2">
          <span>Browse Recipe Library</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}