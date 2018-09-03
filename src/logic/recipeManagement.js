import Configuration from '../utils/configuration';

export default class RecipeManagement {
  constructor(recipeRepository) {
    this.recipeRepository = recipeRepository;
  }

  getRecipes(offsetRecipe = undefined) {
    return this.recipeRepository.getRecipes(offsetRecipe, Configuration.QUERY_LIMIT);
  }
}